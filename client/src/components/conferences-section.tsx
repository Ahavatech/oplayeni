import { useQuery } from "@tanstack/react-query";
import { type Conference } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConferencesSection() {
  const { data: conferences, isLoading } = useQuery<Conference[]>({
    queryKey: ["/api/conferences"],
  });

  if (isLoading) {
    return <ConferencesSkeleton />;
  }

  const upcomingConferences = conferences
    ?.filter((conf) => new Date(conf.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <section id="conferences">
      <h2 className="text-3xl font-bold mb-8">Upcoming Talks & Conferences</h2>
      <div className="space-y-6">
        {upcomingConferences?.map((conference) => (
          <ConferenceCard key={conference._id} conference={conference} />
        ))}
        {upcomingConferences?.length === 0 && (
          <p className="text-slate-600">No upcoming conferences scheduled.</p>
        )}
      </div>
    </section>
  );
}

function ConferenceCard({ conference }: { conference: Conference }) {
  const { title, venue, date, description, type } = conference;

  const badgeVariant = {
    talk: "default",
    conference: "secondary",
    workshop: "outline",
  } as const;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Badge variant={badgeVariant[type]}>{type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={date.toString()}>
                {format(new Date(date), "MMMM d, yyyy")}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{venue}</span>
            </div>
          </div>
          <p className="text-slate-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ConferencesSkeleton() {
  return (
    <section>
      <Skeleton className="h-10 w-64 mb-8" />
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </section>
  );
}