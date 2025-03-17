
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertMaterialSchema, type InsertMaterial } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "./ui/use-toast";
import { apiRequest } from "@/lib/api";

export default function CourseUploadForm({ courseId }: { courseId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<InsertMaterial>({
    resolver: zodResolver(insertMaterialSchema),
    defaultValues: {
      courseId,
      type: "notes",
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/materials/upload`, data);
      return res.json();
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "materials"] });
      toast({ title: "Material uploaded successfully" });
    },
  });

  const onSubmit = (data: InsertMaterial) => {
    const formData = new FormData();
    formData.append("file", data.file[0]);
    formData.append("title", data.title);
    formData.append("type", data.type);
    if (data.type === "assignment" && data.submissionDate) {
      formData.append("submissionDate", data.submissionDate.toISOString());
    }
    uploadMutation.mutate(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="notes">Notes</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("type") === "assignment" && (
          <FormField
            control={form.control}
            name="submissionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Submission Date</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>File</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={uploadMutation.isPending}>
          {uploadMutation.isPending ? "Uploading..." : "Upload Material"}
        </Button>
      </form>
    </Form>
  );
}
