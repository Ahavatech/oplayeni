import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  type Profile,
  type Course,
  type Publication,
  type Conference,
  insertProfileSchema,
  insertCourseSchema,
  insertPublicationSchema,
  insertConferenceSchema,
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Trash2 } from "lucide-react";

export default function AdminPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const coursesQuery = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: () => apiRequest("GET", "/api/courses"),
  });

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
            <ProfileForm />
          </TabsContent>

          <TabsContent value="courses">
            <div className="space-y-8">
              <div className="rounded-xl border bg-card text-card-foreground shadow-lg">
                <div className="p-8">
                  <h3 className="text-3xl font-bold mb-6">Existing Courses</h3>
                  <div className="grid gap-6">
                    {coursesQuery.data?.map((course) => (
                      <div key={course._id} className="bg-background rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xl font-semibold">{course.code}</h4>
                                <span className="text-muted-foreground">•</span>
                                <h4 className="text-xl">{course.title}</h4>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                                  {course.semester}
                                </span>
                                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                                  {course.session}
                                </span>
                              </div>
                              <p className="text-muted-foreground">{course.description}</p>
                            </div>
                            <div className="flex items-start gap-4">
                              <div>
                                <CourseUploadForm courseId={course._id} />
                              </div>
                              <Button 
                                variant="destructive" 
                                size="icon"
                                className="opacity-70 hover:opacity-100"
                                onClick={() => {
                              if (window.confirm('Are you sure you want to delete this course?')) {
                                apiRequest('DELETE', `/api/courses/${course._id}`).then(() => {
                                  queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
                                  toast({ title: 'Course deleted successfully' });
                                });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {!coursesQuery.data?.length && (
                      <p className="text-muted-foreground">No courses found. Add a new course below.</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-8 border-t">
                <h3 className="text-2xl font-semibold mb-4">Add New Course</h3>
                <CourseForm />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="publications">
            <PublicationForm />
          </TabsContent>

          <TabsContent value="conferences">
            <ConferenceForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProfileForm() {
  const { toast } = useToast();
  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const form = useForm({
    resolver: zodResolver(insertProfileSchema),
    defaultValues: profile || {},
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData | Profile) => {
      const res = await apiRequest(
        "PUT",
        "/api/profile",
        data,
        data instanceof FormData ? { isFormData: true } : undefined
      );
      return res.json();
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["/api/profile"], updatedProfile);
      form.reset(updatedProfile);
      toast({ title: "Profile updated successfully" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal and contact information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              // Create a FormData object and append all fields
              const formData = new FormData();
              Object.entries(data).forEach(([key, value]) => {
                if (key === 'contactInfo') {
                  Object.entries(value as Record<string, string>).forEach(([subKey, subValue]) => {
                    formData.append(`contactInfo[${subKey}]`, subValue);
                  });
                } else {
                  formData.append(key, value as string);
                }
              });
              mutation.mutate(formData);
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Profile Photo</FormLabel>
              {profile?.photoUrl && (
                <div className="relative w-32 h-32 mb-4">
                  <img
                    src={profile.photoUrl}
                    alt="Current profile"
                    className="rounded-full object-cover w-full h-full"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const formData = new FormData();
                    formData.append("photo", file);
                    // Keep existing profile data
                    if (profile) {
                      Object.entries(profile).forEach(([key, value]) => {
                        if (key !== 'photoUrl') {
                          if (key === 'contactInfo') {
                            Object.entries(value as Record<string, string>).forEach(([subKey, subValue]) => {
                              formData.append(`contactInfo[${subKey}]`, subValue);
                            });
                          } else {
                            formData.append(key, value as string);
                          }
                        }
                      });
                    }
                    mutation.mutate(formData);
                  }
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="contactInfo.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactInfo.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactInfo.office"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function CourseForm() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertCourseSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: Course) => {
      const res = await apiRequest("POST", "/api/courses", data);
      return res.json();
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Course added successfully" });
    },
  });

  const { data: course } = useQuery<Course>({
    queryKey: ["/api/courses"],
  });


  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Add New Course</CardTitle>
        <CardDescription>
          Create a new course and add course materials.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutation.mutate(data as Course))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="semester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="session"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 2023/2024" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add Course"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>

    </>
  );
}

function PublicationForm() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertPublicationSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: Publication) => {
      const res = await apiRequest("POST", "/api/publications", data);
      return res.json();
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/publications"] });
      toast({ title: "Publication added successfully" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Publication</CardTitle>
        <CardDescription>
          Add details about your research publications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutation.mutate(data as Publication))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authors</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="journal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Journal</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DOI</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="abstract"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abstract</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add Publication"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function ConferenceForm() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertConferenceSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: Conference) => {
      const res = await apiRequest("POST", "/api/conferences", data);
      return res.json();
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/conferences"] });
      toast({ title: "Conference added successfully" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Conference</CardTitle>
        <CardDescription>
          Add details about upcoming talks and conferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutation.mutate(data as Conference))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add Conference"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Placeholder for CourseUploadForm component -  Requires Cloudinary integration and backend handling.
function CourseUploadForm({ courseId }: { courseId: string }) {
  return (
    <div>
      <p>Course ID: {courseId}</p>
      <p>Upload Form Placeholder - Integrate Cloudinary here</p>
      <input type="file" />
      <button>Upload</button>
    </div>
  );
}