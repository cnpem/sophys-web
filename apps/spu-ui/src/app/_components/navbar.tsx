"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@sophys-web/ui";

const links = [
  { href: "/", label: "~/" },
  { href: "/queues", label: "queue" },
  { href: "/tray", label: "tray" },
  { href: "/data", label: "data" },
];

interface NavbarProps {
  avatar?: React.ReactNode;
}

export default function Navbar(props: NavbarProps) {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-10 flex w-full flex-row items-center gap-2 border-b bg-white bg-opacity-30 p-2 shadow-sm backdrop-blur-lg backdrop-filter">
      {links.map(({ href, label }) => (
        <Link
          className={cn(
            "text-lg hover:text-rose-800",
            pathname === href && "text-primary font-semibold",
          )}
          href={href}
          key={href}
        >
          {label}
        </Link>
      ))}
      <div className="ml-auto">{props.avatar}</div>
    </nav>
  );
}
