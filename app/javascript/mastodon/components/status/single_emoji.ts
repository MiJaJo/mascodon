import { anyEmojiRegex } from '@/mastodon/features/emoji/utils';

function getSingleEmojiText(text: string): string | null {
  const normalized = text.replace(/^[\s\u200B\u2060]+|[\s\u200B\u2060]+$/g, '');
  const matches = [...normalized.matchAll(anyEmojiRegex())];
  const match = matches[0];

  return matches.length === 1 &&
    match?.index === 0 &&
    match[0].length === normalized.length
    ? match[0]
    : null;
}

function getMentionEmojiParagraph(
  content: string,
): HTMLParagraphElement | null {
  if (!content.includes('mention')) {
    return null;
  }

  const template = document.createElement('template');
  template.innerHTML = content;

  const nodes = template.content.childNodes;
  const paragraph = nodes.length === 1 ? nodes[0] : null;
  if (
    !(paragraph instanceof HTMLParagraphElement) ||
    paragraph.childNodes.length !== 2
  ) {
    return null;
  }

  const mentionContainer = paragraph.childNodes[0];
  const emojiNode = paragraph.childNodes[1];
  if (
    !(mentionContainer instanceof HTMLElement) ||
    emojiNode?.nodeType !== Node.TEXT_NODE
  ) {
    return null;
  }

  const mentions = mentionContainer.matches('a.mention')
    ? [mentionContainer]
    : Array.from(mentionContainer.querySelectorAll('a.mention'));
  if (
    mentions.length !== 1 ||
    mentionContainer.textContent !== mentions[0]?.textContent ||
    !getSingleEmojiText(emojiNode.textContent ?? '')
  ) {
    return null;
  }

  return paragraph;
}

export function isSingleEmojiContent(content: string): boolean {
  const match = /^<p>([\s\S]*)<\/p>$/.exec(content);
  return !!match && getSingleEmojiText(match[1] ?? '') !== null;
}

export function isSingleEmojiOrMentionEmojiContent(content: string): boolean {
  return (
    isSingleEmojiContent(content) || getMentionEmojiParagraph(content) !== null
  );
}

export function prepareSingleEmojiContent(content: string): string {
  const paragraph = getMentionEmojiParagraph(content);
  const emojiNode = paragraph?.lastChild;
  if (!paragraph || !emojiNode) {
    return content;
  }

  emojiNode.textContent = getSingleEmojiText(emojiNode.textContent ?? '');
  paragraph.insertBefore(document.createElement('br'), emojiNode);
  return paragraph.outerHTML;
}
