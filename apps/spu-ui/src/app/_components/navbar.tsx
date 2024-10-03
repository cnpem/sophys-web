"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@sophys-web/ui";

const links = [
  { href: "/", label: "Home" },
  { href: "/queues", label: "Queues" },
  { href: "/tray", label: "Tray" },
  { href: "/data", label: "Data" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-10 flex w-full flex-row gap-2 border-b p-4 opacity-90 shadow-sm">
      {links.map(({ href, label }) => (
        <Link
          className={cn("text-lg", {
            "font-semibold text-blue-500": pathname === href,
            "text-gray-500": pathname !== href,
            "hover:text-blue-500": pathname !== href,
          })}
          href={href}
          key={href}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
