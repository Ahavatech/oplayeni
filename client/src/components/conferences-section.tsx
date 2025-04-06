import { useQuery } from "@tanstack/react-query";
import { type Conference, type UpcomingTalk } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface EventWithId extends UpcomingTalk {
  _id: string;
}

export default function ConferencesSection() {
  const { data: events, isLoading } = useQuery<EventWithId[]>({
    queryKey: ["/api/events"],
  });

  if (isLoading) {
    return <ConferencesSkeleton />;
  }

  console.log("[ConferencesSection] All events:", events);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate date comparison

  const upcomingEvents = events
    ?.filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0); // Set to start of day for accurate date comparison
      
      // Include events happening today or in the future
      const isUpcoming = eventDate >= today;
      
      console.log(`[ConferencesSection] Event "${event.title}":`, {
        eventDate,
        today,
        isUpcoming,
        status: event.status
      });
      
      return isUpcoming;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log("[ConferencesSection] Filtered upcoming events:", upcomingEvents);

  return (
    <section id="conferences">
      <h2 className="text-3xl font-bold mb-8">Events</h2>
      <div className="space-y-6">
        {upcomingEvents?.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
        {upcomingEvents?.length === 0 && (
          <p className="text-slate-600">No upcoming events scheduled.</p>
        )}
      </div>
    </section>
  );
}

function EventCard({ event }: { event: EventWithId }) {
  const { title, venue, date, time, description, status, registrationLink, flyerUrl } = event;

  const getStatusColor = (status: UpcomingTalk['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if event is happening today
  const eventDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  const isToday = eventDate.getTime() === today.getTime();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Badge className={getStatusColor(status)}>
            {isToday ? "Today" : status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {flyerUrl && (
            <div className="relative w-full h-48 overflow-hidden rounded-lg">
              <img
                src={flyerUrl}
                alt={`Flyer for ${title}`}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={date.toString()}>
                {format(new Date(date), "MMMM d, yyyy")} at {time}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{venue}</span>
            </div>
          </div>
          <p className="text-slate-600">{description}</p>
          <div className="flex flex-wrap gap-4">
            {registrationLink && (
              <a
                href={registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Register Here
              </a>
            )}
            {flyerUrl && (
              <a
                href={flyerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View Full Flyer
              </a>
            )}
          </div>
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