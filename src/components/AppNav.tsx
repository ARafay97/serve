"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Matches the trimmed navbar from commit 37d38e2 on the old frontend: the
// station screens (kitchen, bar, and the per-station histories) are reachable
// from the home page rather than crowding the header.
const links = [
  { href: "/", label: "Home" },
  { href: "/employee", label: "Employee" },
  { href: "/orders", label: "Orders" },
  { href: "/completed", label: "Completed" },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="pos-nav">
      {links.map((link) => {
        const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} className={isActive ? "is-active" : undefined}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
