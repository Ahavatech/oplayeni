import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { Helmet } from "react-helmet";
import type { Teaching } from "@shared/schema";

export default function Teaching() {
  const { data: materials, isLoading } = useQuery<Teaching[]>({
    queryKey: ["/api/teaching"]
  });

  return (
    <>
      <Helmet>
        <title>Teaching - Prof. Olawanle Patrick Layeni</title>
        <meta name="description" content="Course materials and teaching resources from Professor Layeni's mathematics courses." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Teaching</h2>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {materials?.map((material) => (
              <Card key={material.id}>
                <CardHeader>
                  <CardTitle>{material.course}</CardTitle>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium mb-2">{material.title}</h4>
                  {material.description && (
                    <p className="text-muted-foreground mb-4">{material.description}</p>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                      <FileDown className="mr-2 h-4 w-4" />
                      Download Slides
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
