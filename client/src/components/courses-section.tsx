import { useQuery } from "@tanstack/react-query";
import { type Course, type CourseMaterial } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileDown, Presentation, FileText, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesSection() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  if (isLoading) {
    return <CoursesSkeleton />;
  }

  return (
    <section id="courses">
      <h2 className="text-3xl font-bold mb-8">Courses</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {courses?.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </section>
  );
}

function CourseCard({ course }: { course: Course }) {
  const { data: materials } = useQuery<CourseMaterial[]>({
    queryKey: ["/api/courses", course._id, "materials"],
  });

  const materialsByType = materials?.reduce((acc, material) => {
    if (!acc[material.type]) {
      acc[material.type] = [];
    }
    acc[material.type].push(material);
    return acc;
  }, {} as Record<string, CourseMaterial[]>);

  const getIcon = (type: string) => {
    switch (type) {
      case "slides":
        return <Presentation className="h-4 w-4" />;
      case "notes":
        return <FileText className="h-4 w-4" />;
      case "assignment":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileDown className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {course.code}: {course.title}
        </CardTitle>
        <p className="text-sm text-slate-500">{course.semester}</p>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 mb-4">{course.description}</p>

        {materials && materials.length > 0 && (
          <Tabs defaultValue="slides">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="slides">Slides</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="assignment">Assignments</TabsTrigger>
            </TabsList>
            {["slides", "notes", "assignment"].map((type) => (
              <TabsContent key={type} value={type}>
                <div className="space-y-2">
                  {materialsByType?.[type]?.map((material) => (
                    <Button
                      key={material._id}
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                        {getIcon(type)}
                        <span className="ml-2">{material.title}</span>
                      </a>
                    </Button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

function CoursesSkeleton() {
  return (
    <section>
      <Skeleton className="h-10 w-64 mb-8" />
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </section>
  );
}