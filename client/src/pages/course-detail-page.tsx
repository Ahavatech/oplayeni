import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Trash2, Save } from "lucide-react";
import { Course, CourseMaterial } from "@shared/schema";
import { useState, useEffect } from "react";
import { CourseMaterialUpload } from "@/components/course-material-upload";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");

  const courseQuery = useQuery<Course>({
    queryKey: ["/api/courses", id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/courses/${id}`);
      return response.json();
    },
  });

  const materialsQuery = useQuery<CourseMaterial[]>({
    queryKey: ["/api/courses", id, "materials"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/courses/${id}/materials`);
      return response.json();
    },
  });

  const [formData, setFormData] = useState<Partial<Course>>({
    title: "",
    code: "",
    description: "",
    semester: "",
    session: "",
  });

  // Update form data when course data is loaded
  useEffect(() => {
    if (courseQuery.data) {
      setFormData({
        title: courseQuery.data.title,
        code: courseQuery.data.code,
        description: courseQuery.data.description,
        semester: courseQuery.data.semester,
        session: courseQuery.data.session,
      });
    }
  }, [courseQuery.data]);

  const updateCourseMutation = useMutation({
    mutationFn: async (data: Partial<Course>) => {
      const response = await apiRequest("PUT", `/api/courses/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", id] });
      toast({ title: "Course updated successfully" });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: (materialId: string) => 
      apiRequest("DELETE", `/api/materials/${materialId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", id, "materials"] });
      toast({ title: "Material deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting material",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCourseMutation.mutate(formData);
  };

  const handleDeleteMaterial = (materialId: string) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      deleteMaterialMutation.mutate(materialId);
    }
  };

  if (courseQuery.isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!courseQuery.data) {
    return <div>Course not found</div>;
  }

  const materialsByType = materialsQuery.data?.reduce((acc, material) => {
    if (!acc[material.type]) {
      acc[material.type] = [];
    }
    acc[material.type].push(material);
    return acc;
  }, {} as Record<string, CourseMaterial[]>) || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/admin/dashboard")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card>
        <CardContent className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="code" className="text-sm font-medium">
                    Course Code
                  </label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Course Title
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="semester" className="text-sm font-medium">
                    Semester
                  </label>
                  <Input
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="session" className="text-sm font-medium">
                    Session
                  </label>
                  <Input
                    id="session"
                    name="session"
                    value={formData.session}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateCourseMutation.isPending}>
                  {updateCourseMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">
                    {courseQuery.data.code} - {courseQuery.data.title}
                  </h1>
                  <div className="flex gap-2 mt-2">
                    <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {courseQuery.data.semester}
                    </span>
                    <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {courseQuery.data.session}
                    </span>
                  </div>
                </div>
                <Button onClick={() => setIsEditing(true)}>Edit Course</Button>
              </div>

              <p className="text-slate-600">{courseQuery.data.description}</p>

              <div className="pt-6 border-t">
                <h2 className="text-2xl font-semibold mb-4">Course Materials</h2>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="tutorial">Tutorials</TabsTrigger>
                    <TabsTrigger value="assignment">Assignments</TabsTrigger>
                  </TabsList>

                  {["notes", "tutorial", "assignment"].map((type) => (
                    <TabsContent key={type} value={type}>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium capitalize">{type}s</h3>
                          <div className="flex gap-2">
                            <CourseMaterialUpload 
                              courseId={id} 
                              type={type as "notes" | "tutorial" | "assignment"} 
                            />
                            <Button variant="outline" className="flex items-center gap-2">
                              <Save className="h-4 w-4" />
                              Save Changes
                            </Button>
                          </div>
                        </div>
                        {materialsByType[type]?.length > 0 ? (
                          <div className="space-y-2">
                            {materialsByType[type].map((material) => (
                              <div
                                key={material._id}
                                className="flex justify-between items-center p-4 rounded-lg border"
                              >
                                <div>
                                  <h4 className="font-medium">{material.title}</h4>
                                  <p className="text-sm text-slate-500">
                                    Uploaded on{" "}
                                    {new Date(material.uploadedAt).toLocaleDateString()}
                                  </p>
                                  {material.type === "assignment" && material.submissionDate && (
                                    <p className="text-sm text-slate-500">
                                      Due on{" "}
                                      {new Date(material.submissionDate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" asChild>
                                    <a
                                      href={material.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Download
                                    </a>
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleDeleteMaterial(material._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 text-center py-8">
                            No {type}s uploaded yet
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 