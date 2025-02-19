import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { Helmet } from "react-helmet";
import type { Talk } from "@shared/schema";

export default function Talks() {
  const { data: talks, isLoading } = useQuery<Talk[]>({
    queryKey: ["/api/talks"]
  });

  return (
    <>
      <Helmet>
        <title>Upcoming Talks - Prof. Olawanle Patrick Layeni</title>
        <meta name="description" content="Schedule of upcoming talks and presentations by Professor Layeni." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Upcoming Talks</h2>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
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
            {talks?.map((talk) => (
              <Card key={talk.id}>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">{talk.title}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>{format(new Date(talk.date), "MMMM d, yyyy")}</span>
                  </div>
                  <p className="text-muted-foreground mb-2">{talk.venue}</p>
                  {talk.description && (
                    <p className="text-sm text-muted-foreground">{talk.description}</p>
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
