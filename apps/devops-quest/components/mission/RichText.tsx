import { Fragment, type ReactNode } from 'react';

/**
 * The theory blocks use two bits of markdown and nothing else: `code` and
 * **bold**. A full markdown pipeline would be a dependency and a security
 * surface for a feature this small.
 */
export const RichText = ({ text }: { text: string }): ReactNode => {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <code
              key={index}
              className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-[0.9em] text-accent"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={index} className="font-semibold text-ink">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
};
