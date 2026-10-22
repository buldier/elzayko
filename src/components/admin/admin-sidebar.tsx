"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Studio">
      <p className="mb-2 hidden px-3 text-[0.62rem] font-semibold tracking-[0.2em] text-paper/35 uppercase lg:block">Manage</p>
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">
        {adminNavigation.map((item) => {
          const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm whitespace-nowrap transition-colors duration-(--duration-fast)",
                  active ? "bg-paper/10 font-medium text-paper" : "text-paper/60 hover:bg-paper/5 hover:text-paper",
                )}
              >
                {active && <span className="absolute top-2 bottom-2 left-0 hidden w-0.5 rounded-full bg-sand lg:block" aria-hidden="true" />}
                <Icon className="size-[1.1rem]" strokeWidth={1.5} aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
        <li className="lg:mt-6">
          <p className="mb-2 hidden px-3 text-[0.62rem] font-semibold tracking-[0.2em] text-paper/35 uppercase lg:block">Website</p>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm whitespace-nowrap text-paper/60 hover:bg-paper/5 hover:text-paper"
          >
            <ExternalLink className="size-[1.1rem]" strokeWidth={1.5} aria-hidden="true" />
            View live site
          </Link>
        </li>
      </ul>
    </nav>
  );
}
