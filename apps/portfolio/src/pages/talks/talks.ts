import type { TFunction } from "i18next";

/** A single external resource linked from a talk's detail page. */
export type TalkLink = { href: string; label: string };

export type Talk = {
  slug: string;
  /** Label in the Talks nav menu. */
  navTitle: string;
  /** Heading on the detail overlay. */
  title: string;
  /** YouTube embed URL. */
  videoSrc: string;
  /** Optional heading above the link list. */
  heading?: string;
  links: TalkLink[];
};

/** Detail routes live at /talks/<slug>. */
export const TALK_SLUGS = [
  "accessibility",
  "regexp",
  "jest",
  "type-vs-interface",
] as const;

export type TalkSlug = (typeof TALK_SLUGS)[number];

export const isTalkSlug = (s: string): s is TalkSlug =>
  (TALK_SLUGS as readonly string[]).includes(s);

/**
 * Ported from the old portfolio's four /talks/* pages. Built with `t` so the
 * titles/labels stay localized; static URLs are inlined.
 */
export function buildTalks(t: TFunction): Talk[] {
  return [
    {
      slug: "accessibility",
      navTitle: t("talks.accessibility"),
      title: t("accessibility.title"),
      videoSrc: "https://www.youtube.com/embed/c1W9u6SN2Cw",
      heading: t("accessibility.linkName"),
      links: [
        {
          href: "https://developing-accessible-interfaces.netlify.app/",
          label: "https://developing-accessible-interfaces.netlify.app/",
        },
      ],
    },
    {
      slug: "regexp",
      navTitle: t("talks.regexp"),
      title: t("regexp.title"),
      videoSrc: "https://www.youtube.com/embed/ZJw-nqtDrWc",
      heading: t("regexp.linkName"),
      links: [
        {
          href: "https://ru.wikipedia.org/wiki/%D0%A0%D0%B5%D0%B3%D1%83%D0%BB%D1%8F%D1%80%D0%BD%D1%8B%D0%B5_%D0%B2%D1%8B%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F",
          label: t("regexp.wikiLink"),
        },
        { href: "https://regexr.com/", label: "regexr.com" },
        { href: "https://regex101.com/", label: "regex101.com" },
        {
          href: "https://learn.javascript.ru/regular-expressions",
          label: t("regexp.learnJS"),
        },
        {
          href: "https://www.exlab.net/files/tools/sheets/regexp/regexp.png",
          label: t("regexp.crib"),
        },
      ],
    },
    {
      slug: "jest",
      navTitle: t("talks.testingWithJest"),
      title: t("jest.title"),
      videoSrc: "https://www.youtube.com/embed/5I-ieBMWElA",
      heading: t("jest.usefulLinks"),
      links: [
        {
          href: "https://jestjs.io/docs/getting-started",
          label: "Jest documentation",
        },
        {
          href: "https://testing-playground.com/",
          label: "Testing playground",
        },
        {
          href: "https://docs.google.com/presentation/d/1xImjqRFFIQHXt2sgdj5Eiw-RhWTfdbyMM3dgAiNn9RY/edit?usp=sharing",
          label: "Presentation slides",
        },
      ],
    },
    {
      slug: "type-vs-interface",
      navTitle: "Type vs Interface",
      title: t("types.title"),
      videoSrc: "https://www.youtube.com/embed/k8V4Q1MGwro",
      links: [
        {
          href: "https://type-vs-interface.vercel.app/",
          label: "https://type-vs-interface.vercel.app/",
        },
      ],
    },
  ];
}

export const findTalk = (slug: string, t: TFunction): Talk | undefined =>
  buildTalks(t).find((talk) => talk.slug === slug);
