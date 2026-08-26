import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Text has to be readable.
 *
 * The faint tier once shipped as `#59637480` — a colour with a 50% alpha
 * channel, which silently halved its contrast and made every caption and
 * breadcrumb blend into the near-black background. Nothing caught it because
 * it still *looked* like a valid token. So the tokens are parsed out of the
 * stylesheet and checked against WCAG here.
 */

const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

type Rgb = { r: number; g: number; b: number };

const parseHex = (hex: string): Rgb => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
});

const channel = (value: number): number => {
  const scaled = value / 255;
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
};

const luminance = ({ r, g, b }: Rgb): number =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

const contrast = (a: string, b: string): number => {
  const [light, dark] = [luminance(parseHex(a)), luminance(parseHex(b))].sort(
    (x, y) => y - x,
  );
  return (light + 0.05) / (dark + 0.05);
};

/** Read a token out of a `:root { ... }` block, nth occurrence = nth theme. */
const token = (name: string, occurrence: number): string => {
  const matches = [
    ...css.matchAll(new RegExp(`--${name}:\\s*(#[0-9a-f]{3,8});`, 'gi')),
  ];
  const value = matches[occurrence]?.[1];
  if (!value) throw new Error(`token --${name} #${occurrence} not found`);
  return value;
};

const TEXT_TOKENS = ['ink', 'ink-dim', 'ink-faint'];
const THEMES = [
  { name: 'dark', index: 0 },
  { name: 'light', index: 1 },
];

describe('text tokens stay readable', () => {
  it.each(
    THEMES.flatMap((theme) =>
      TEXT_TOKENS.map(
        (name) => [`${theme.name} --${name}`, name, theme.index] as const,
      ),
    ),
  )('%s is an opaque colour', (_label, name, index) => {
    // An 8-digit hex is transparency, and transparency over a dark ground is
    // how the faint tier became unreadable in the first place.
    expect(token(name, index)).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it.each(
    THEMES.flatMap((theme) =>
      TEXT_TOKENS.flatMap((name) =>
        ['surface', 'surface-raised'].map(
          (ground) =>
            [
              `${theme.name} --${name} on --${ground}`,
              name,
              ground,
              theme.index,
            ] as const,
        ),
      ),
    ),
  )('%s meets WCAG AA (4.5:1)', (_label, name, ground, index) => {
    const ratio = contrast(token(name, index), token(ground, index));
    expect(Number(ratio.toFixed(2))).toBeGreaterThanOrEqual(4.5);
  });
});
