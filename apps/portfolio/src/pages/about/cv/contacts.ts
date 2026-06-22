export type ContactLink = {
  label: string;
  /** Visible value (e.g. "ivan@example.com" or "@IvanNavin"). */
  value: string;
  /** Anchor href; mailto: or full URL. */
  href: string;
  icon: string;
};

export const CV_CONTACTS: ContactLink[] = [
  {
    label: "Email",
    value: "ivan.holovko@example.com",
    href: "mailto:ivan.holovko@example.com",
    icon: "✉️",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/ivan-holovko",
    href: "https://www.linkedin.com/in/ivan-holovko",
    icon: "💼",
  },
  {
    label: "GitHub",
    value: "github.com/IvanNavin",
    href: "https://github.com/IvanNavin",
    icon: "🐙",
  },
  {
    label: "Location",
    value: "Dubai, UAE · Remote",
    href: "",
    icon: "📍",
  },
];
