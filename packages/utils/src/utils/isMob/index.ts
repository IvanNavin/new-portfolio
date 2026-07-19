export const isMob = () => {
  // Guard SSR/Node: `navigator` is undefined there and would throw.
  if (typeof navigator === 'undefined') return false;

  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  return toMatch.some((regex) => regex.test(navigator.userAgent));
};
