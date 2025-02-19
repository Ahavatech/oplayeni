import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/research", label: "Research" },
  { href: "/teaching", label: "Teaching" },
  { href: "/publications", label: "Publications" },
  { href: "/talks", label: "Upcoming Talks" },
  { href: "/contact", label: "Contact" }
];

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap">
          {navItems.map(({ href, label }) => (
            <Link key={href} href={href}>
              <a className={cn(
                "px-4 py-3 hover:bg-primary/90 transition-colors",
                location === href && "bg-primary/90 font-medium"
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
