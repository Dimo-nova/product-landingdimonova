import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "de", "fr", "pt"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

// Defer navigation imports to avoid issues in test environments
const getNavigation = () => {
  try {
    const { createNavigation } = require("next-intl/navigation");
    return createNavigation(routing);
  } catch {
    return {
      Link: null,
      redirect: null,
      usePathname: null,
      useRouter: null,
      getPathname: null,
    };
  }
};

export const { Link, redirect, usePathname, useRouter, getPathname } =
  getNavigation();
