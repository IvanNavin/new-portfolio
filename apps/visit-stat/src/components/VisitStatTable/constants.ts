export const ALLOWED_SERVER_SORT = new Set([
  'timestamp',
  'domain',
  'path',
  'country',
  'city',
  'event',
]);

export const DEBOUNCE_TIME = 500;

import { ETrackVisitEvent } from './types';

export const EVENT_OPTIONS = [
  { value: ETrackVisitEvent.PAGEVIEW, label: 'pageview' },
  { value: ETrackVisitEvent.CLICK, label: 'click' },
];
