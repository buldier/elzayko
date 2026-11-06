import type { LucideIcon } from "lucide-react";
import { FileText, FolderOpen, Images, LayoutDashboard, Settings, Tags } from "lucide-react";

/**
 * Public side dock (desktop) and mobile menu. `icon` keys are resolved to glyphs in the
 * client component. Hash links point at sections of the home page.
 */
export const dockNavigation = [
  { label: "Home", href: "/", icon: "home" },
  { label: "About", href: "/about", icon: "about" },
  { label: "Journey", href: "/#journey", icon: "journey" },
  { label: "Work", href: "/#work", icon: "work" },
  { label: "Collections", href: "/#collections", icon: "collections" },
  { label: "Gallery", href: "/gallery", icon: "gallery" },
  { label: "Contact", href: "/contact", icon: "contact" },
] as const;

export type DockIcon = (typeof dockNavigation)[number]["icon"];

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
