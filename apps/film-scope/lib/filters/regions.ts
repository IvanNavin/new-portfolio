/**
 * Country groups, so "everything except the CIS" is one click instead of ten.
 *
 * Picking origin one country at a time is fine for "only Japanese films" and
 * useless for "anything not made over there" — that intent is about a bloc, not
 * a country. Groups are plain ISO 3166-1 alpha-2 lists: clicking one adds every
 * member to include or exclude, and the individual chips stay editable
 * afterwards, so a group is a shortcut and never a lock-in.
 *
 * Membership is geographic / industrial, not political. `cis` lists the actual
 * Commonwealth of Independent States members — Ukraine and Georgia withdrew and
 * are therefore not in it, and the Baltic states never joined.
 */
export type RegionGroup = {
  id: string;
  countries: string[];
};

export const REGION_GROUPS: RegionGroup[] = [
  {
    id: "west",
    countries: [
      "US",
      "CA",
      "GB",
      "IE",
      "AU",
      "NZ",
      "FR",
      "DE",
      "IT",
      "ES",
      "PT",
      "NL",
      "BE",
      "LU",
      "AT",
      "CH",
      "SE",
      "NO",
      "DK",
      "FI",
      "IS",
    ],
  },
  {
    id: "europe",
    countries: [
      "GB",
      "IE",
      "FR",
      "DE",
      "IT",
      "ES",
      "PT",
      "NL",
      "BE",
      "LU",
      "AT",
      "CH",
      "SE",
      "NO",
      "DK",
      "FI",
      "IS",
      "PL",
      "CZ",
      "SK",
      "HU",
      "RO",
      "BG",
      "HR",
      "RS",
      "SI",
      "BA",
      "MK",
      "AL",
      "ME",
      "GR",
      "MT",
      "CY",
      "UA",
      "EE",
      "LV",
      "LT",
      "MD",
    ],
  },
  {
    id: "asia",
    countries: [
      "JP",
      "KR",
      "CN",
      "HK",
      "TW",
      "TH",
      "VN",
      "ID",
      "MY",
      "SG",
      "PH",
      "KH",
      "MM",
    ],
  },
  { id: "india", countries: ["IN"] },
  {
    id: "latam",
    countries: [
      "MX",
      "BR",
      "AR",
      "CL",
      "CO",
      "PE",
      "UY",
      "VE",
      "CU",
      "EC",
      "BO",
      "PY",
      "CR",
      "GT",
    ],
  },
  {
    // Actual CIS membership. Ukraine and Georgia left; the Baltics never joined.
    id: "cis",
    countries: ["RU", "BY", "KZ", "UZ", "AZ", "AM", "KG", "TJ", "MD", "TM"],
  },
];

const setsEqual = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((item) => b.includes(item));

/** 'include' / 'exclude' when the group is fully applied to that bucket, else null. */
export const groupState = (
  group: RegionGroup,
  include: readonly string[],
  exclude: readonly string[],
): "include" | "exclude" | null => {
  if (group.countries.every((code) => include.includes(code))) return "include";
  if (group.countries.every((code) => exclude.includes(code))) return "exclude";
  return null;
};

export { setsEqual };
