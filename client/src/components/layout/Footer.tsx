export function Footer() {
  return (
    <footer className="bg-muted mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Professor Olawanle Patrick Layeni</p>
          <p className="mt-2">Department of Mathematics</p>
        </div>
      </div>
    </footer>
  );
}
