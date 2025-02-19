import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Helmet } from "react-helmet";
import type { Publication } from "@shared/schema";

export default function Publications() {
  const { data: publications, isLoading } = useQuery<Publication[]>({
    queryKey: ["/api/publications"]
  });

  return (
    <>
      <Helmet>
        <title>Publications - Prof. Olawanle Patrick Layeni</title>
        <meta name="description" content="Academic publications and research papers by Professor Layeni in the field of mathematics and mechanics." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Publications</h2>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {publications?.map((pub) => (
              <Card key={pub.id}>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">{pub.title}</h3>
                  <p className="text-muted-foreground mb-2">{pub.authors}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {pub.journal} ({pub.year})
                  </p>
                  {pub.abstract && (
                    <p className="text-sm text-muted-foreground mb-4">{pub.abstract}</p>
                  )}
                  {pub.link && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={pub.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Publication
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
