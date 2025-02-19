import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/teaching", label: "Teaching" },
  { href: "/publications", label: "Publications" },
  { href: "/contact", label: "Contact" }
];

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex">
          {navItems.map(({ href, label }) => (
            <Link key={href} href={href}>
              <a className={cn(
                "px-5 py-4 text-sm font-medium transition-colors hover:text-primary",
                location === href ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
              )}>
                {label}
              </a>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}