import { Lightbulb } from 'lucide-react';

import type { TheoryBlock } from '@/lib/content/types';

import { RichText } from './RichText';

type TheoryProps = {
  blocks: TheoryBlock[];
};

export const Theory = ({ blocks }: TheoryProps) => (
  <div className="space-y-3.5">
    {blocks.map((block, index) => {
      if (block.kind === 'text') {
        return (
          <p key={index} className="text-[13.5px] leading-relaxed text-ink-dim">
            <RichText text={block.text} />
          </p>
        );
      }

      if (block.kind === 'note') {
        return (
          <div
            key={index}
            className="flex gap-2.5 rounded-lg border border-warn/25 bg-warn-soft px-3 py-2.5"
          >
            <Lightbulb size={15} className="mt-0.5 shrink-0 text-warn" />
            <p className="text-[13px] leading-relaxed text-ink-dim">
              <RichText text={block.text} />
            </p>
          </div>
        );
      }

      if (block.kind === 'code') {
        return (
          <div key={index} className="space-y-1">
            {block.caption ? (
              <p className="text-[11.5px] uppercase tracking-wide text-ink-faint">
                {block.caption}
              </p>
            ) : null}
            <pre className="scroll-thin overflow-x-auto rounded-lg border border-edge bg-surface-sunken px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-accent">
              {block.lines.join('\n')}
            </pre>
          </div>
        );
      }

      return (
        <div key={index} className="space-y-1">
          {block.caption ? (
            <p className="text-[11.5px] uppercase tracking-wide text-ink-faint">
              {block.caption}
            </p>
          ) : null}
          <div className="overflow-hidden rounded-lg border border-edge">
            {block.rows.map(([term, description], rowIndex) => (
              <div
                key={term}
                className={`grid grid-cols-[minmax(84px,auto)_1fr] gap-3 px-3 py-2 text-[13px] ${
                  rowIndex % 2 === 0 ? 'bg-surface-sunken' : 'bg-surface-raised'
                }`}
              >
                <code className="font-mono text-[12.5px] text-accent">
                  {term}
                </code>
                <span className="text-ink-dim">
                  <RichText text={description} />
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);
