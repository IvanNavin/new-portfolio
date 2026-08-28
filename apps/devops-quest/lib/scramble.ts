/**
 * Ordering tasks are authored with their steps written down in the right
 * order — that is the only sane way to read and review them. Rendering that
 * array as-is handed the answer over: the player clicked the steps top to
 * bottom and won without thinking.
 *
 * So the steps are scrambled before they are shown. The scramble is seeded
 * rather than random for two reasons: `Math.random` during render would
 * disagree between the server and the client and blow up hydration, and a
 * fixed seed lets a test prove that what the player sees is never already
 * the answer.
 */

/** FNV-1a: small, stable, and good enough to spread short ids apart. */
const hash = (text: string): number => {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
};

const shuffleWith = <T>(items: readonly T[], seed: string): T[] => {
  let state = hash(seed) || 1;
  const next = (): number => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };

  const out = [...items];
  for (let index = out.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(next() * (index + 1));
    [out[index], out[swap]] = [out[swap], out[index]];
  }
  return out;
};

/**
 * The order the player is shown, guaranteed not to be the answer.
 *
 * A seeded shuffle can land on the correct order by chance — with four steps
 * that is one run in twenty-four — so it reseeds until it does not.
 */
export const scramble = <T>(
  items: readonly T[],
  correct: readonly string[],
  idOf: (item: T) => string,
  seed: string,
): T[] => {
  if (items.length < 2) return [...items];

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = shuffleWith(items, `${seed}:${attempt}`);
    if (candidate.map(idOf).join('|') !== correct.join('|')) return candidate;
  }
  // Unreachable in practice; reversing is still not the answer for length > 1.
  return [...items].reverse();
};
