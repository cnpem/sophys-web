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
    <nav className="flex top-0 flex-row sticky w-full p-4 gap-2 border-b shadow-sm opacity-90 z-10">
      {links.map(({ href, label }) => (
        <Link
          className={cn("text-lg", {
            "text-blue-500 font-semibold": pathname === href,
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
