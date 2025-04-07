import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Trash2, ChevronRight, Pencil, Settings } from "lucide-react";
import { CourseForm } from "@/components/CourseForm";
import { ProfileForm } from "@/components/ProfileForm";
import { PublicationForm } from "@/components/PublicationForm";
import { PublicationList } from "@/components/PublicationList";
import { UpcomingTalkForm } from "@/components/UpcomingTalkForm";
import { EventList } from "@/components/EventList";
import { Course, Publication } from "@shared/schema";
import { useState } from "react";
import { AdminCredentialsForm } from "@/components/AdminCredentialsForm";
import { AdminSettings } from "@/components/AdminSettings";

interface PublicationWithId extends Publication {
  _id: string;
}

export default function AdminPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isAddingPublication, setIsAddingPublication] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingPublication, setEditingPublication] = useState<PublicationWithId | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showSettings, setShowSettings] = useState(false);
  
  const coursesQuery = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/courses");
      return response.json();
    },
  });

  const publicationsQuery = useQuery<PublicationWithId[]>({
    queryKey: ["/api/publications"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/publications");
      return response.json();
    },
  });

  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      console.log('Events data:', data); // Debug log
      
      // More robust transformation
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (typeof data === 'object') {
        const values = Object.values(data);
        if (Array.isArray(values)) return values;
      }
      return [];
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

  const deletePublicationMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("[Delete Publication] Attempting to delete publication:", id);
      try {
        const response = await apiRequest("DELETE", `/api/publications/${id}`);
        console.log("[Delete Publication] Server response status:", response.status);
        return response;
      } catch (error) {
        console.error("[Delete Publication] Network error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("[Delete Publication] Successfully deleted, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["/api/publications"] });
      toast({ title: "Publication deleted successfully" });
    },
    onError: (error: Error) => {
      console.error("[Delete Publication] Error:", error);
      toast({
        title: "Error deleting publication",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteCourse = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this course?")) {
      deleteMutation.mutate(courseId);
    }
  };

  const handleDeletePublication = (id: string) => {
    console.log("[Delete Publication] Delete button clicked for:", id);
    if (window.confirm("Are you sure you want to delete this publication?")) {
      console.log("[Delete Publication] User confirmed deletion");
      deletePublicationMutation.mutate(id);
    }
  };

  const handleEditPublication = (publication: PublicationWithId) => {
    setEditingPublication(publication);
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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          <Button variant="outline" onClick={() => logoutMutation.mutate()}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          </div>
        </div>

        {showSettings ? (
          <AdminSettings onBack={() => setShowSettings(false)} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 h-auto">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
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
              <div className="space-y-8">
                <div className="rounded-xl border bg-card text-card-foreground shadow-lg">
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-3xl font-bold">Publications</h3>
                      {!editingPublication && (
                        <Button onClick={() => setEditingPublication({ 
                          _id: '', 
                          title: '',
                          abstract: '',
                          authors: [{ name: '', institution: '', isMainAuthor: true }],
                          publicationType: 'journal',
                          year: new Date().getFullYear(),
                          status: 'published'
                        })} variant="default">
                          Add Publication
                        </Button>
                      )}
                    </div>

                    {editingPublication && (
                      <Card className="p-6 mb-6">
                        <h4 className="text-xl font-semibold mb-4">
                          {editingPublication._id ? "Edit Publication" : "Add New Publication"}
                        </h4>
                        <PublicationForm
                          initialData={editingPublication._id ? editingPublication : undefined}
                          onSubmit={async (formData) => {
                            try {
                              // Convert FormData to a proper object and log it
                              const formObject = Object.fromEntries(formData.entries());
                              console.log('Raw form data:', formObject);
                              
                              // Ensure authors is properly formatted
                              const authors = formObject.authors ? JSON.parse(formObject.authors as string) : [];
                              if (!Array.isArray(authors)) {
                                throw new Error('Authors must be an array');
                              }

                              // Format the data according to the schema
                              const publicationData = {
                                title: String(formObject.title),
                                abstract: String(formObject.abstract),
                                authors: authors.map(author => ({
                                  name: String(author.name),
                                  institution: author.institution ? String(author.institution) : undefined,
                                  isMainAuthor: Boolean(author.isMainAuthor)
                                })),
                                publicationType: String(formObject.publicationType),
                                year: parseInt(String(formObject.year), 10),
                                journal: formObject.journal ? String(formObject.journal) : undefined,
                                volume: formObject.volume ? String(formObject.volume) : undefined,
                                issue: formObject.issue ? String(formObject.issue) : undefined,
                                pages: formObject.pages ? String(formObject.pages) : undefined,
                                doi: formObject.doi ? String(formObject.doi) : undefined,
                                url: formObject.url ? String(formObject.url) : undefined,
                                status: formObject.status ? String(formObject.status) : 'published'
                              };

                              // Create FormData for file upload
                              const uploadFormData = new FormData();
                              
                              // Add the publication data as a JSON string
                              uploadFormData.append('data', JSON.stringify(publicationData));
                              
                              // Add the PDF file if it exists
                              const pdfFile = formObject.pdf;
                              if (pdfFile instanceof File) {
                                uploadFormData.append('pdf', pdfFile);
                              }

                              console.log("[Publication Form] Sending request:", {
                                method: editingPublication._id ? 'PUT' : 'POST',
                                url: editingPublication._id ? 
                                  `/api/publications/${editingPublication._id}` : 
                                  '/api/publications',
                                data: publicationData
                              });

                              const response = await apiRequest(
                                editingPublication._id ? 'PUT' : 'POST',
                                editingPublication._id ? 
                                  `/api/publications/${editingPublication._id}` : 
                                  '/api/publications',
                                uploadFormData,
                                { isFormData: true }
                              );

                              const responseData = await response.json();
                              console.log("[Publication Form] Server response:", responseData);

                              if (!response.ok) {
                                throw new Error(responseData.message || "Failed to save publication");
                              }

                              queryClient.invalidateQueries({ queryKey: ["/api/publications"] });
                              toast({ title: `Publication ${editingPublication._id ? "updated" : "created"} successfully` });
                              setEditingPublication(null);
                            } catch (error) {
                              console.error("Error saving publication:", error);
                              toast({ 
                                title: "Error saving publication", 
                                description: error instanceof Error ? error.message : 'Unknown error',
                                variant: "destructive"
                              });
                            }
                          }}
                          onCancel={() => setEditingPublication(null)}
                        />
                      </Card>
                    )}

                    <PublicationList
                      publications={publicationsQuery.data || []}
                      isAdmin={true}
                      onEdit={handleEditPublication}
                      onDelete={handleDeletePublication}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="events">
              <div className="space-y-8">
                <div className="rounded-xl border bg-card text-card-foreground shadow-lg">
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-3xl font-bold">Events</h3>
                      <Button onClick={() => setIsAddingEvent(true)} variant="default">
                        Add Event
                      </Button>
                    </div>

                    {isAddingEvent ? (
                      <Card className="p-6 mb-6">
                        <h4 className="text-xl font-semibold mb-4">Add New Event</h4>
                        <UpcomingTalkForm
                        onSubmit={async (formData: FormData) => {
                          try {
                            const response = await fetch("/api/events", {
                              method: "POST",
                              body: formData, // send as-is
                            });
                        
                            if (!response.ok) {
                              console.log("response: ", response);
                              throw new Error("Failed to create event");
                            }
                        
                            setIsAddingEvent(false);
                            queryClient.invalidateQueries({ queryKey: ["events"] });
                            toast({ title: "Event added successfully" });
                          } catch (error) {
                            console.error("Error creating event:", error);
                            toast({
                              title: "Error adding event",
                              description: error instanceof Error ? error.message : "Unknown error",
                              variant: "destructive",
                            });
                          }
                        }}
                          onCancel={() => setIsAddingEvent(false)}
                        />
                      </Card>
                    ) : null}

                    <EventList 
                      talks={(eventsQuery.data || []).filter(Boolean)}
                      isAdmin={true}
                      onEdit={(event) => {
                        // TODO: Implement edit functionality
                      }}
                      onDelete={async (id) => {
                        try {
                          const response = await fetch(`/api/events/${id}`, {
                            method: 'DELETE',
                          });
                          if (!response.ok) {
                            throw new Error('Failed to delete event');
                          }
                          queryClient.invalidateQueries({ queryKey: ['events'] });
                          toast({ title: "Event deleted successfully" });
                        } catch (error) {
                          console.error('Error deleting event:', error);
                          toast({ 
                            title: "Error deleting event", 
                            description: error instanceof Error ? error.message : 'Unknown error',
                            variant: "destructive"
                          });
                        }
                      }}
                    />
                  </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        )}
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
