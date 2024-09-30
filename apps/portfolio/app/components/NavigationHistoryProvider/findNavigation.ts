import { AnyType } from '@app/types';

export const findNavigation = (map: AnyType, targetPath: string): AnyType => {
  for (const key in map) {
    if (key === targetPath) {
      return map[key];
    }
    // if it is an object we search recursively
    if (typeof map[key] === 'object') {
      const result = findNavigation(map[key], targetPath);
      if (result) {
        return result;
      }
    }
  }
  return null;
};
