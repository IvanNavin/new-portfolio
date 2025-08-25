export const BOT_USER_AGENT_PATTERNS = [
  'vercel-screenshot', // Vercel screenshot service
  'bot', // Generic bot pattern
  'crawler', // Web crawlers
  'spider', // Web spiders
  'preview', // Preview generators
  'prerender', // Prerendering services
  'headless', // Headless browsers
  'lighthouse', // Google Lighthouse
  'pagespeed', // PageSpeed Insights
  'slackbot', // Slack link previews
  'facebookexternalhit', // Facebook link previews
  'telegrambot', // Telegram bot
  'whatsapp', // WhatsApp previews
  'discordbot', // Discord bot
] as const;

export const BOT_USER_AGENT_REGEX = new RegExp(
  `(${BOT_USER_AGENT_PATTERNS.join('|')})`,
  'i',
);

// Return true if UA matches bot patterns
export const isBotUserAgent = (
  userAgent: string | null | undefined,
  extra?: string[],
): boolean => {
  if (!userAgent) return false;
  if (extra?.length) {
    const rx = new RegExp(
      `(${[...BOT_USER_AGENT_PATTERNS, ...extra].join('|')})`,
      'i',
    );
    return rx.test(userAgent);
  }
  return BOT_USER_AGENT_REGEX.test(userAgent);
};

// Browser-only helper for client code
export const isLikelyBotClient = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  // Detect automation
  if (navigator.webdriver) return true;
  const ua = navigator.userAgent || '';
  return BOT_USER_AGENT_REGEX.test(ua);
};
