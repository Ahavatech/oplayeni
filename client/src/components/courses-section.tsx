import { useQuery } from "@tanstack/react-query";
import { type Course, type CourseMaterial } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileDown, Presentation, FileText, BookOpen, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CoursesSection() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/courses");
      return response.json();
    }
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
  const { toast } = useToast();
  const { data: materials } = useQuery<CourseMaterial[]>({
    queryKey: ["/api/courses", course._id, "materials"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/courses/${course._id}/materials`);
      return response.json();
    }
  });

  const materialsByType = materials?.reduce((acc, material) => {
    const type = material.type as "notes" | "tutorial" | "assignment";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(material);
    return acc;
  }, {} as Record<"notes" | "tutorial" | "assignment", CourseMaterial[]>) || {
    notes: [],
    tutorial: [],
    assignment: []
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "notes":
        return <FileText className="h-4 w-4" />;
      case "tutorial":
        return <Presentation className="h-4 w-4" />;
      case "assignment":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileDown className="h-4 w-4" />;
    }
  };

  const handleDownload = async (material: CourseMaterial) => {
    try {
      const response = await apiRequest(
        "GET", 
        `/api/materials/${material._id}/download`,
        undefined,
        { responseType: "blob" }
      );
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      
      // Set the download attribute with the original filename or a fallback
      const filename = material.title.replace(/[^a-zA-Z0-9.]/g, '_');
      link.setAttribute('download', `${filename}`);
      
      // Append link to body, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the temporary URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error downloading file",
        description: "There was a problem downloading the file. Please try again.",
        variant: "destructive"
      });
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
          <Tabs defaultValue="notes">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="tutorial">Tutorials</TabsTrigger>
              <TabsTrigger value="assignment">Assignments</TabsTrigger>
            </TabsList>
            {["notes", "tutorial", "assignment"].map((type) => (
              <TabsContent key={type} value={type}>
                <div className="space-y-2">
                  {materialsByType[type]?.map((material) => (
                    <Button
                      key={material._id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleDownload(material)}
                    >
                      {getIcon(type)}
                      <span className="ml-2">{material.title}</span>
                      <Download className="h-4 w-4 ml-auto" />
                    </Button>
                  ))}
                  {(!materialsByType[type] || materialsByType[type].length === 0) && (
                    <p className="text-slate-500 text-center py-4">
                      No {type}s available
                    </p>
                  )}
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