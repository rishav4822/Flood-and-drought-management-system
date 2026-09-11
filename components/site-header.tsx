import Link from "next/link";
import { Satellite } from "lucide-react";
import { LocationSearch } from "@/components/search/location-search";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/alerts", label: "Alerts" },
  { href: "/about", label: "Methodology" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Satellite className="h-4.5 w-4.5" />
            </span>
            <span>
              TerraPulse
              <span className="ml-1.5 hidden text-xs font-normal text-muted-foreground sm:inline">
                Climate Risk Index
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm sm:hidden">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <nav className="hidden items-center gap-5 text-sm sm:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <LocationSearch />
      </div>
    </header>
  );
}
