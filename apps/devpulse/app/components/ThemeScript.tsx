/**
 * Inline script that runs BEFORE React hydration. Reads the saved theme
 * from localStorage and sets data-theme on <html> so the first paint
 * already matches the user's choice — avoids the white→dark (or dark→
 * light) flash that would otherwise happen on every load.
 *
 * Rendered as a regular <script> in the <head>, executed synchronously.
 */
export function ThemeScript() {
  const code = `(() => {
    try {
      const t = localStorage.getItem('devpulse.theme');
      if (t === 'light' || t === 'dark') {
        document.documentElement.setAttribute('data-theme', t);
      }
    } catch {}
  })();`;
  return (
    <script
      // The inline-script-in-RSC pattern; dangerouslySetInnerHTML is the
      // only way to emit unescaped JS, and the payload is a fixed literal.
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
