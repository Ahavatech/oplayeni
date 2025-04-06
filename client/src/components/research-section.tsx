import { useQuery } from "@tanstack/react-query";
import { type Publication } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PublicationWithId extends Publication {
  _id: string;
}

export default function ResearchSection() {
  const { data: publications, isLoading } = useQuery<PublicationWithId[]>({
    queryKey: ["/api/publications"],
  });

  if (isLoading) {
    return <ResearchSkeleton />;
  }

  return (
    <section id="research">
      <h2 className="text-3xl font-bold mb-8">Publications</h2>
      <div className="grid gap-6">
        {publications?.map((pub) => (
          <PublicationCard key={pub._id} publication={pub} />
        ))}
      </div>
    </section>
  );
}

function PublicationCard({ publication }: { publication: PublicationWithId }) {
  const { title, authors, journal, year, doi, abstract, pdfUrl, url } = publication;

  const formatAuthors = (authors: Publication['authors']) => {
    if (!Array.isArray(authors)) {
      // If authors is an object with numeric keys, convert it to array
      if (authors && typeof authors === 'object') {
        return Object.values(authors)
          .map(author => (author as { name: string }).name)
          .join(', ');
      }
      return '';
    }
    return authors.map(author => author.name).join(', ');
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/publications/${publication._id}/download`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Get the filename from the Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = title;
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download the file. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-slate-600">{formatAuthors(authors)}</p>
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
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Publication
              </a>
            )}
            {pdfUrl && (
              <button
                onClick={handleDownload}
                className="text-blue-600 hover:underline"
              >
                Download PDF
              </button>
            )}
          </div>
          {abstract && <p className="text-sm text-slate-600">{abstract}</p>}
        </div>
      </CardContent>
    </Card>
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