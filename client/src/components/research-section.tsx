import { useQuery } from "@tanstack/react-query";
import { type Publication } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function PublicationCard({ publication }: { publication: Publication }) {
  const { title, authors, journal, year, doi, abstract } = publication;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {doi ? (
            <a 
              href={`https://doi.org/${doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-slate-600">{authors}</p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span>{journal}</span>
            <span>{year}</span>
            {doi && (
              <a
                href={`https://doi.org/${doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                DOI: {doi}
              </a>
            )}
          </div>
          {abstract && <p className="text-sm text-slate-600">{abstract}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResearchSection() {
  const { data: publications, isLoading } = useQuery<Publication[]>({
    queryKey: ["/api/publications"],
  });

  if (isLoading) {
    return <ResearchSkeleton />;
  }

  return (
    <section id="research">
      <h2 className="text-3xl font-bold mb-8">Research Publications</h2>
      <div className="grid gap-6">
        {publications?.map((pub) => (
          <PublicationCard key={pub._id} publication={pub} />
        ))}
      </div>
    </section>
  );
}

function ResearchSkeleton() {
  return (
    <section>
      <Skeleton className="h-10 w-64 mb-8" />
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </section>
  );
}