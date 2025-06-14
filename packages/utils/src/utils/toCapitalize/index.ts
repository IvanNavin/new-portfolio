/**
 * Capitalize the first letter of a string
 * @param str
 * @returns string
 * */
export const toCapitalize = (str: string): string => {
  if (!str) return str;

  return str.charAt(0).toUpperCase() + str.slice(1);
};
