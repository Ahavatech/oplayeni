import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Trash2, ChevronRight } from "lucide-react";
import { CourseForm } from "@/components/CourseForm";
import { ProfileForm } from "@/components/ProfileForm";
import { Course } from "@shared/schema";

export default function AdminPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const coursesQuery = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/courses");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (courseId: string) => 
      apiRequest("DELETE", `/api/courses/${courseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Course deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error deleting course", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleDeleteCourse = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this course?")) {
      deleteMutation.mutate(courseId);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-slate-600">
              You do not have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={() => logoutMutation.mutate()}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 h-auto">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
            <TabsTrigger value="conferences">Conferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="rounded-xl border bg-card text-card-foreground shadow-lg">
              <div className="p-8">
                <h3 className="text-3xl font-bold mb-6">Edit Profile</h3>
                <ProfileForm />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <div className="space-y-8">
              <div className="rounded-xl border bg-card text-card-foreground shadow-lg">
                <div className="p-8">
                  <h3 className="text-3xl font-bold mb-6">Existing Courses</h3>
                  <div className="grid gap-6">
                    {coursesQuery.data?.map((course) => (
                      <div
                        key={course._id}
                        onClick={() => navigate(`/admin/courses/${course._id}`)}
                        className="bg-background rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex-1 space-y-2">
                              <h4 className="text-xl font-semibold">
                                {course.code} - {course.title}
                              </h4>
                              <div className="flex gap-4">
                                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                                  {course.semester}
                                </span>
                                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                                  {course.session}
                                </span>
                              </div>
                              <p className="text-muted-foreground">{course.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="destructive"
                                size="icon"
                                className="opacity-70 hover:opacity-100"
                                onClick={(e) => handleDeleteCourse(course._id, e)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!coursesQuery.data?.length && (
                      <p className="text-muted-foreground">No courses found. Add a new course below.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card text-card-foreground shadow-lg">
                <div className="p-8">
                  <h3 className="text-2xl font-semibold mb-4">Add New Course</h3>
                  <CourseForm />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="publications">
            <div className="rounded-xl border bg-card text-card-foreground shadow-lg">
              <div className="p-8">
                <h3 className="text-3xl font-bold mb-6">Publications</h3>
                {/* Publications content */}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conferences">
            <div className="rounded-xl border bg-card text-card-foreground shadow-lg">
              <div className="p-8">
                <h3 className="text-3xl font-bold mb-6">Conferences</h3>
                {/* Conferences content */}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Placeholder for CourseUploadForm component
function CourseUploadForm({ courseId }: { courseId: string }) {
  return (
    <div>
      <label htmlFor={`file-${courseId}`} className="sr-only">Upload course material</label>
      <input 
        type="file" 
        id={`file-${courseId}`}
        name={`file-${courseId}`}
        aria-label="Upload course material"
        title="Upload course material"
        placeholder="Choose a file to upload"
      />
      <button aria-label="Upload file">Upload</button>
    </div>
  );
}
