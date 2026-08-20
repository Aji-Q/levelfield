"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Markets", className: "" },
  { href: "/methodology", label: "Methodology", className: "" },
  { href: "/assess", label: "Assess contract", className: "nav-cta" },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="Primary navigation">
      {LINKS.map((link) => {
        const current =
          link.href === "/"
            ? pathname === "/" || pathname.startsWith("/market/")
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={link.className || undefined}
            aria-current={current ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
