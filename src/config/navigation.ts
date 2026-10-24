import type { LucideIcon } from "lucide-react";
import {
  FileText,
  FolderOpen,
  Images,
  LayoutDashboard,
  Settings,
  Tags,
} from "lucide-react";

export type PublicNavItem = {
  label: string;
  href: string;
  /** Shown as a dropdown on desktop and an expandable group in the site panel. */
  children?: readonly { label: string; href: string }[];
  /** Extra path prefix that also marks the item active (e.g. detail pages). */
  activePrefix?: string;
};

/** Flat list of the main pages (footer "Explore" column). */
export const publicNavigation: readonly PublicNavItem[] = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** Header and site-panel menu, shaped like the theme's: dropdown groups plus a final contact link. */
export function headerNavigation(collections: readonly { title: string; slug: string }[]): PublicNavItem[] {
  return [
    { label: "Home", href: "/" },
    {
      label: "Gallery",
      href: "/gallery",
      activePrefix: "/gallery/",
      children: [
        { label: "All work", href: "/gallery" },
        { label: "Photographs", href: "/gallery?type=image" },
        { label: "Films", href: "/gallery?type=video" },
        { label: "Elsewhere", href: "/gallery?type=link" },
      ],
    },
    ...(collections.length > 0
      ? [
          {
            label: "Collections",
            href: `/gallery?collection=${collections[0]!.slug}`,
            children: collections.slice(0, 8).map((collection) => ({ label: collection.title, href: `/gallery?collection=${collection.slug}` })),
          },
        ]
      : []),
    {
      label: "Pages",
      href: "/about",
      children: [
        { label: "About Us", href: "/about" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
    { label: "Contact Us", href: "/contact" },
  ];
}

export const legalNavigation = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

export type AdminNavItem = { label: string; href: string; icon: LucideIcon; exact?: boolean };

export const adminNavigation: AdminNavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Media", href: "/admin/media", icon: Images },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Collections", href: "/admin/collections", icon: FolderOpen },
  { label: "Pages", href: "/admin/pages", icon: FileText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
