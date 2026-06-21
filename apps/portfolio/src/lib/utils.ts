import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge class lists with clsx + tailwind-merge (last-wins on conflicts). */
export const clsxm = (...classes: ClassValue[]): string =>
  twMerge(clsx(classes));

/** True on touch-capable devices. */
export const isTouchDevice = (): boolean =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

/** Rough mobile-UA sniff (used to scale down the WebGL fluid sim). */
export const isMob = (): boolean =>
  [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ].some((re) => re.test(navigator.userAgent));
