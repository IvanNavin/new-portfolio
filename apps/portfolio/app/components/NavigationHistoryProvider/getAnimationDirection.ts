import { findNavigation } from '@components/NavigationHistoryProvider/findNavigation';
import { KeyOfRoutesType } from '@components/NavigationHistoryProvider/types';

import { mapNavigation } from './mapNavigation';

export const getAnimationByPaths = (
  fromPath: KeyOfRoutesType,
  toPath: KeyOfRoutesType,
) => {
  const fromNavigation = findNavigation(mapNavigation, fromPath);
  const toNavigation = findNavigation(mapNavigation, toPath);
  const fromLevel = fromNavigation?.level;
  const toLevel = toNavigation?.level;

  if (fromLevel === 0) {
    if (toLevel === 1) {
      return {
        initial: toNavigation.goIn,
        exit: fromNavigation.goOut,
      };
    }
  }

  if (fromLevel === 1) {
    if (toLevel === 0) {
      return {
        initial: toNavigation.goIn,
        exit: fromNavigation.goBack,
      };
    }

    if (toLevel === 2) {
      return {
        initial: toNavigation.goIn,
        exit: fromNavigation.goNext,
      };
    }
  }

  if (fromLevel === 2) {
    if (toLevel === 1) {
      return {
        initial: toNavigation.goBack,
        exit: fromNavigation.goOut,
      };
    }
  }

  return {
    initial: toNavigation.goIn,
    exit: fromNavigation.goOut,
  };
};
