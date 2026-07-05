import { createNavigation } from "next-intl/navigation";

import { routing } from "@/i18n/routing";

/** Локале-орієнтовані Link/useRouter/usePathname — самі підставляють префікс мови */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
