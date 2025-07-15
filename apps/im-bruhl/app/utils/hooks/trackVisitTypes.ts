import { AnyType } from "@app/types";

export enum ETrackVisitEvent {
  PAGEVIEW = "pageview",
  CLICK = "click",
}

export type TrackVisitProps = {
  event?: ETrackVisitEvent;
  extra?: Record<string, AnyType>;
  domain?: string;
};

export type TrackVisitBodyType = {
  domain: string;
  path: string;
  referrer: string;
  sessionId: string;
  event: ETrackVisitEvent;
  extra?: Record<string, AnyType>;
};
