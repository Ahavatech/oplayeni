import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-6 flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=professor" />
          <AvatarFallback>PL</AvatarFallback>
        </Avatar>
        
        <div>
          <h1 className="text-3xl font-bold">Professor Olawanle Patrick Layeni</h1>
          <p className="text-lg text-muted-foreground">
            Mathematician specializing in Solid Mechanics and Continuum Mechanics
          </p>
        </div>
      </div>
    </header>
  );
}
