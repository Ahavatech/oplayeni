import { useQuery } from "@tanstack/react-query";
import { type Profile } from "@shared/schema";
import ProfileHero from "@/components/profile-hero";
import ResearchSection from "@/components/research-section";
import CoursesSection from "@/components/courses-section";
import ConferencesSection from "@/components/conferences-section";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  if (isLoading || !profile) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfileHero profile={profile} />
      <main className="container mx-auto px-4 py-8 space-y-16">
        <ResearchSection />
        <CoursesSection />
        <ConferencesSection />
      </main>
    </div>
  );
}

function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-96 bg-slate-100 flex items-center justify-center">
        <Skeleton className="w-96 h-32" />
      </div>
      <main className="container mx-auto px-4 py-8 space-y-16">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </main>
    </div>
  );
}
