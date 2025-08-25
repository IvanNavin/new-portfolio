export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export type VisitStat = {
  id: string;
  domain: string;
  path: string;
  country: string | null;
  region: string | null;
  city: string | null;
  timeZone: string | null;
  latitude: number | null;
  longitude: number | null;
  ip: string;
  userAgent: string;
  referrer: string | null | unknown;
  language: string | null;
  deviceType: DeviceType | null;
  timestamp: string;
  sessionId: string | null;
  event: string;
  extra: unknown | null;
};

export type ApiListResponse = {
  items: VisitStat[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

export enum ETrackVisitEvent {
  PAGEVIEW = 'pageview',
  CLICK = 'click',
}
