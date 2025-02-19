import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-start gap-6">
          <Avatar className="h-32 w-32 rounded-full">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=professor" />
            <AvatarFallback>PL</AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Prof. Olawanle Patrick Layeni</h1>
            <p className="mt-1 text-muted-foreground">
              Since 2020, Professor at the Department of Mathematics
            </p>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              I work at the intersection of Solid Mechanics and Continuum Mechanics. 
              My research focuses on developing mathematical models to understand material behavior 
              and structural mechanics.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}