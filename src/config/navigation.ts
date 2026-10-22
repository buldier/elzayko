import type { LucideIcon } from "lucide-react";
import {
  FileText,
  FolderOpen,
  Images,
  LayoutDashboard,
  Settings,
  Tags,
} from "lucide-react";

export const publicNavigation = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

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
