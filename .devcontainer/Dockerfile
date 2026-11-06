# For details, see https://github.com/devcontainers/images/tree/main/src/ruby
FROM mcr.microsoft.com/devcontainers/ruby:4.0-trixie

# Install the exact Ruby version required by the project.
ENV RUBY_VERSION=4.0.9 \
    RUBY_DOWNLOAD_URL=https://cache.ruby-lang.org/pub/ruby/4.0/ruby-4.0.9.tar.gz \
    RUBY_DOWNLOAD_SHA256=c35350682ff050b79702d57ade4516e7336063f510155d19fb2fb5b3f3909511 \
    PATH=/usr/local/rubies/current/bin:${PATH}
COPY .ruby-version /tmp/mastodon-ruby-version
RUN test "$(cat /tmp/mastodon-ruby-version)" = "$RUBY_VERSION" || \
      { echo "Update the Dev Container Ruby version and checksum to match .ruby-version" >&2; exit 1; }
RUN \
    printf 'install_package "ruby-%s" "%s#%s" enable_shared standard\n' \
      "$RUBY_VERSION" "$RUBY_DOWNLOAD_URL" "$RUBY_DOWNLOAD_SHA256" > /tmp/mastodon-ruby-build && \
    ruby-build /tmp/mastodon-ruby-build /usr/local/rubies/current && \
    test "$(ruby -e 'print RUBY_VERSION')" = "$RUBY_VERSION" && \
    rm /tmp/mastodon-ruby-build /tmp/mastodon-ruby-version

# Install node version from .nvmrc
WORKDIR /app
COPY .nvmrc .
RUN /bin/bash --login -i -c "nvm install"

# Install additional OS packages
RUN apt-get update && \
    export DEBIAN_FRONTEND=noninteractive && \
    apt-get -y install --no-install-recommends libicu-dev libidn11-dev ffmpeg libvips42 libpam-dev

# Disable download prompt for Corepack
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Move welcome message to where VS Code expects it
COPY .devcontainer/welcome-message.txt /usr/local/etc/vscode-dev-containers/first-run-notice.txt
