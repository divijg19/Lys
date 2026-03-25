export const ROUTES = {
  home: "/",
  about: "/about",
  projects: "/projects",
  blog: "/blog",
  contact: "/contact",
  cv: "/cv",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export const NAV_LINKS: Array<{ href: AppRoute; label: string }> = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.about, label: "About" },
  { href: ROUTES.projects, label: "Projects" },
  { href: ROUTES.blog, label: "Blog" },
  { href: ROUTES.contact, label: "Contact" },
];
