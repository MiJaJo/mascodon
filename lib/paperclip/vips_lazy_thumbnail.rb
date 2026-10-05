# frozen_string_literal: true

module Paperclip
  class LazyThumbnail < Paperclip::Processor
    GIF_MAX_FPS = 60
    GIF_MAX_FRAMES = 3000
    GIF_PALETTE_COLORS = 32
    PNG_COMPRESSION = ENV.fetch('PNG_COMPRESSION_LEVEL', 6).to_i.clamp(0, 9)
    RECOMPRESS_REMOTE_PNG = ENV['RECOMPRESS_REMOTE_PNG'] == 'true'
    PNG_SIGNATURE_LENGTH = 8
    RECOMPRESS_REMOTE_WEBP = ENV['RECOMPRESS_REMOTE_WEBP'] == 'true'
    WEBP_EFFORT = ENV.fetch('WEBP_LOSSLESS_EFFORT', 4).to_i.clamp(0, 6)

    ALLOWED_FIELDS = %w(
      icc-profile-data
    ).freeze

    class PixelGeometryParser
      def self.parse(current_geometry, pixels)
        width  = Math.sqrt(pixels * (current_geometry.width.to_f / current_geometry.height)).round.to_i
        height = Math.sqrt(pixels * (current_geometry.height.to_f / current_geometry.width)).round.to_i

        Paperclip::Geometry.new(width, height)
      end
    end

    def initialize(file, options = {}, attachment = nil)
      super

      @crop = options[:geometry].to_s[-1, 1] == '#'
      @current_geometry = options.fetch(:file_geometry_parser, Geometry).from_file(@file)
      @target_geometry = options[:pixels] ? PixelGeometryParser.parse(@current_geometry, options[:pixels]) : options.fetch(:string_geometry_parser, Geometry).parse(options[:geometry].to_s)
      @format = options[:format]
      @current_format = File.extname(@file.path)
      @basename = File.basename(@file.path, @current_format)

      correct_current_format!
    end

    def make
      return File.open(@file.path) unless needs_convert?

      dst = TempfileFactory.new.generate([@basename, @format ? ".#{@format}" : @current_format].join)

      if preserve_animation?
        if @target_geometry.nil? || (@current_geometry.width <= @target_geometry.width && @current_geometry.height <= @target_geometry.height)
          target_width = 'iw'
          target_height = 'ih'
        else
          scale = [@target_geometry.width.to_f / @current_geometry.width, @target_geometry.height.to_f / @current_geometry.height].min
          target_width = (@current_geometry.width * scale).round
          target_height = (@current_geometry.height * scale).round
        end

        # The only situation where we use crop on GIFs is cropping them to a square
        # aspect ratio, such as for avatars, so this is the only special case we
        # implement. If cropping ever becomes necessary for other situations, this will
        # need to be expanded.
        crop_width = crop_height = [target_width, target_height].min if @target_geometry&.square?
        crop_width = crop_height = "'min(iw,ih)'" if crop_width == 'ih'

        filter = begin
          if @crop
            "scale=#{target_width}:#{target_height}:force_original_aspect_ratio=increase,crop=#{crop_width}:#{crop_height}"
          else
            "scale=#{target_width}:#{target_height}:force_original_aspect_ratio=decrease"
          end
        end

        command = Terrapin::CommandLine.new(Rails.configuration.x.ffmpeg_binary, '-nostdin -i :source -map_metadata -1 -fpsmax :max_fps -frames:v :max_frames -filter_complex :filter -y :destination', logger: Paperclip.logger)
        command.run({ source: @file.path, filter: "#{filter},split[a][b];[a]palettegen=max_colors=#{GIF_PALETTE_COLORS}[p];[b][p]paletteuse=dither=bayer", max_fps: GIF_MAX_FPS, max_frames: GIF_MAX_FRAMES, destination: dst.path })
      else
        transformed_image.write_to_file(dst.path, **save_options)
      end

      dst
    rescue Vips::Error, Terrapin::ExitStatusError => e
      raise Paperclip::Error, "Error while optimizing #{@basename}: #{e}"
    rescue Terrapin::CommandNotFoundError
      raise Paperclip::Errors::CommandNotFoundError, 'Could not run the `ffmpeg` command. Please install ffmpeg.'
    end

    private

    def correct_current_format!
      # If the attachment was uploaded through a base64 payload, the tempfile
      # will not have a file extension. It could also have the wrong file extension,
      # depending on what the uploaded file was named. We correct for this in the final
      # file name, which is however not yet physically in place on the temp file, so we
      # need to use it here. Mind that this only reliably works if this processor is
      # the first in line and we're working with the original, unmodified file.
      @current_format = File.extname(attachment.instance_read(:file_name))
    end

    def transformed_image
      # libvips has some optimizations for resizing an image on load. If we don't need to
      # resize the image, we have to load it a different way.
      if @target_geometry.nil?
        Vips::Image.new_from_file(preserve_animation? ? "#{@file.path}[n=-1]" : @file.path, access: :sequential).copy.mutate do |mutable|
          (mutable.get_fields - ALLOWED_FIELDS).each do |field|
            mutable.remove!(field)
          end
        end
      else
        Vips::Image.thumbnail(@file.path, @target_geometry.width, height: @target_geometry.height, **thumbnail_options).mutate do |mutable|
          (mutable.get_fields - ALLOWED_FIELDS).each do |field|
            mutable.remove!(field)
          end
        end
      end
    end

    def thumbnail_options
      @crop ? { crop: :centre } : { size: :down }
    end

    def save_options
      case @format.presence || @current_format.delete_prefix('.')
      when 'jpg', 'jpeg'
        { Q: 90, interlace: true }
      when 'webp'
        webp_kind == :lossless ? { lossless: true, effort: WEBP_EFFORT } : { Q: 80, effort: 4 }
      when 'png'
        { compression: PNG_COMPRESSION }
      else
        {}
      end
    end

    def preserve_animation?
      @format == 'gif' || (@format.blank? && @current_format == '.gif')
    end

    def needs_convert?
      strip_animations? || needs_different_geometry? || needs_different_format? || needs_metadata_stripping? || needs_png_recompression? || needs_webp_recompression?
    end

    def needs_webp_recompression?
      RECOMPRESS_REMOTE_WEBP &&
        @format.blank? &&
        @current_format.casecmp?('.webp') &&
        @attachment.instance.respond_to?(:local?) &&
        !@attachment.instance.local? &&
        webp_kind == :lossless
    end

    # Only lossless WebP is re-encoded, so no quality is lost. Lossy and animated files are left untouched.
    def webp_kind
      @webp_kind ||= detect_webp_kind
    end

    def detect_webp_kind
      File.open(@file.path, 'rb') do |file|
        return :other unless file.read(12)&.then { |head| head.bytesize == 12 && head.start_with?('RIFF') && head.end_with?('WEBP') }

        while (header = file.read(8))&.bytesize == 8
          type, length = header.unpack('a4V')

          case type
          when 'ANIM', 'ANMF' then return :animated
          when 'VP8L' then return :lossless
          when 'VP8 ' then return :lossy
          end

          file.seek(length + (length & 1), IO::SEEK_CUR)
        end
      end

      :other
    rescue SystemCallError, IOError
      :other
    end

    def needs_png_recompression?
      RECOMPRESS_REMOTE_PNG &&
        @format.blank? &&
        @current_format.casecmp?('.png') &&
        @attachment.instance.respond_to?(:local?) &&
        !@attachment.instance.local? &&
        !animated_png?
    end

    # libvips cannot write APNG, so animated files must be left untouched
    def animated_png?
      File.open(@file.path, 'rb') do |file|
        file.seek(PNG_SIGNATURE_LENGTH)

        while (header = file.read(8))&.bytesize == 8
          length, type = header.unpack('Na4')
          return true if type == 'acTL'
          return false if type == 'IDAT'

          file.seek(length + 4, IO::SEEK_CUR)
        end
      end

      false
    end

    def strip_animations?
      # Detecting whether the source image is animated across all our supported
      # input file formats is not trivial, and converting unconditionally is just
      # as simple for now
      options[:style] == :static
    end

    def needs_different_geometry?
      (options[:geometry] && @current_geometry.width != @target_geometry.width && @current_geometry.height != @target_geometry.height) ||
        (options[:pixels] && @current_geometry.width * @current_geometry.height > options[:pixels])
    end

    def needs_different_format?
      @format.present? && @current_format != ".#{@format}"
    end

    def needs_metadata_stripping?
      @attachment.instance.respond_to?(:local?) && @attachment.instance.local?
    end
  end
end
