// Only http(s). new URL() also accepts javascript:/data:/file: — an XSS/SSRF
// footgun for a function named "isValidUrl".
export const isValidUrl = (url: string) => {
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};
