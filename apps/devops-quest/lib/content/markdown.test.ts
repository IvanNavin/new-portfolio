import { describe, expect, it } from 'vitest';

import { ALL_MISSIONS, LEVELS } from '../content/registry';
import type { TheoryBlock } from '../content/types';

const prose = (b: TheoryBlock[]): string[] =>
  b
    .filter((x) => x.kind === 'text' || x.kind === 'note')
    .map((x) => (x as { text: string }).text);

/**
 * The theory is rendered as light markdown, so an unclosed marker does not
 * fail loudly — it just shows the player a stray `**` or swallows half a
 * paragraph into a code span. Nothing else in the suite reads the prose.
 */
describe('markdown integrity', () => {
  it('every marker the player sees is closed', () => {
    const bad: string[] = [];
    const check = (where: string, text: string) => {
      const bold = (text.match(/\*\*/g) ?? []).length;
      if (bold % 2 !== 0) bad.push(`${where}: odd number of ** (${bold})`);
      const ticks = (text.match(/`/g) ?? []).length;
      if (ticks % 2 !== 0)
        bad.push(`${where}: odd number of backticks (${ticks})`);
      // an OPENING ** is one at a word boundary; a space right after it is broken
      if (/(^|\s)\*\*\s/.test(text))
        bad.push(`${where}: opening ** followed by a space`);
      if (/\s\*\*(\s|$)/.test(text))
        bad.push(`${where}: ** floating on its own`);
      if (/`\s+`/.test(text)) bad.push(`${where}: empty code span`);
      if (/``/.test(text)) bad.push(`${where}: double backtick`);
    };
    for (const level of LEVELS) {
      check(`${level.id} brief`, level.brief);
      check(`${level.id} subtitle`, level.subtitle);
    }
    for (const m of ALL_MISSIONS) {
      check(`${m.id} goal`, m.goal);
      prose(m.theory).forEach((t, i) => check(`${m.id} theory[${i}]`, t));
      m.hints.forEach((h, i) => check(`${m.id} hint${i + 1}`, h));
      const t = m.task;
      if (t.kind === 'terminal' || t.kind === 'editor')
        for (const g of t.goals) {
          check(`${m.id}·${g.id} label`, g.label);
          if (g.hintOnFail) check(`${m.id}·${g.id} hint`, g.hintOnFail);
        }
      if (t.kind === 'quiz') {
        check(`${m.id} question`, t.question);
        check(`${m.id} explain`, t.explain);
        for (const o of t.options) check(`${m.id}·${o.id}`, o.label);
      }
      if (t.kind === 'order') {
        check(`${m.id} instruction`, t.instruction);
        check(`${m.id} explain`, t.explain);
        for (const o of t.items) check(`${m.id}·${o.id}`, o.label);
      }
    }
    expect(bad).toEqual([]);
  });
});
