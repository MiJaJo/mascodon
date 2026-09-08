import { useMemo } from 'react';

import type { CustomEmojiMapArg } from '@/mastodon/features/emoji/types';
import type {
  OnAttributeHandler,
  OnElementHandler,
} from '@/mastodon/utils/html';
import { htmlStringToComponents } from '@/mastodon/utils/html';
import { polymorphicForwardRef } from '@/types/polymorphic';

import { AnimateEmojiProvider, CustomEmojiProvider } from './context';
import { textToEmojis } from './index';

export interface EmojiHTMLProps {
  htmlString: string;
  extraEmojis?: CustomEmojiMapArg;
  className?: string;
  emojiClassName?: string;
  onElement?: OnElementHandler;
  onAttribute?: OnAttributeHandler;
}

export const EmojiHTML = polymorphicForwardRef<'div', EmojiHTMLProps>(
  (
    {
      extraEmojis,
      htmlString,
      emojiClassName,
      onElement,
      onAttribute,
      ...props
    },
    ref,
  ) => {
    const contents = useMemo(
      () =>
        htmlStringToComponents(htmlString, {
          onText: (text) => textToEmojis(text, emojiClassName),
          onElement,
          onAttribute,
        }),
      [emojiClassName, htmlString, onAttribute, onElement],
    );

    return (
      <CustomEmojiProvider emojis={extraEmojis}>
        <AnimateEmojiProvider {...props} ref={ref}>
          {contents}
        </AnimateEmojiProvider>
      </CustomEmojiProvider>
    );
  },
);
EmojiHTML.displayName = 'EmojiHTML';
