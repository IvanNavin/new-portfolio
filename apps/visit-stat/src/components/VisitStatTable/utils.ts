const regionNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

export const countryName = (code?: string | null) => {
  if (!code) return '';
  const up = code.toUpperCase();
  try {
    return regionNames?.of(up) ?? up;
  } catch {
    return up;
  }
};

export const tzWithOffset = (tz?: string | null) => {
  if (!tz) return '';
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).formatToParts(new Date());
    const off = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
    return off ? `${tz} (${off})` : tz;
  } catch {
    return tz;
  }
};

export const truncate = (s: string, n: number) =>
  s.length > n ? `${s.slice(0, n)}…` : s;
