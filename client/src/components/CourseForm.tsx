import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function CourseForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
    semester: "",
    session: new Date().getFullYear().toString()
  });

  const createCourseMutation = useMutation({
    mutationFn: (data: typeof formData) => 
      apiRequest("POST", "/api/courses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Course created successfully" });
      setFormData({
        title: "",
        code: "",
        description: "",
        semester: "",
        session: new Date().getFullYear().toString()
      });
    },
    onError: (error) => {
      toast({ 
        title: "Error creating course", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCourseMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium">Course Code</label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g. MTH401"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">Course Title</label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Advanced Calculus"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="semester" className="text-sm font-medium">Semester</label>
          <Input
            id="semester"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            placeholder="e.g. Rain"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="session" className="text-sm font-medium">Session</label>
          <Input
            id="session"
            name="session"
            value={formData.session}
            onChange={handleChange}
            placeholder="e.g. 2024"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter course description"
          required
          className="min-h-[100px]"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={createCourseMutation.isPending}
      >
        {createCourseMutation.isPending ? "Creating..." : "Create Course"}
      </Button>
    </form>
  );
} 