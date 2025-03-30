import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface CourseMaterialUploadProps {
  courseId: string;
  type: "notes" | "tutorial" | "assignment";
}

export function CourseMaterialUpload({ courseId, type }: CourseMaterialUploadProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Force re-render on file change
  const [formData, setFormData] = useState({
    title: "",
    file: null as File | null,
    submissionDate: type === "assignment" ? new Date().toISOString().slice(0, 16) : undefined
  });

  // Debugging: Log file changes
  useEffect(() => {
    console.log("Selected file:", formData.file);
  }, [formData.file]);

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", `/api/courses/${courseId}/materials/upload`, data, { isFormData: true });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "materials"] });
      toast({ title: "Material uploaded successfully" });
      setIsOpen(false);
      setFormData({
        title: "",
        file: null,
        submissionDate: type === "assignment" ? new Date().toISOString().slice(0, 16) : undefined
      });
      setFileInputKey(Date.now()); // Reset file input field
    },
    onError: (error: Error) => {
      console.log("Error uploading material:", error);
      toast({
        title: "Error uploading material",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file) {
      toast({
        title: "Please select a file",
        variant: "destructive"
      });
      return;
    }
  
    const data = new FormData();
    data.append("file", formData.file);
    data.append("title", formData.title);
    data.append("type", type);
  
    if (type === "assignment" && formData.submissionDate) {
      data.append("submissionDate", new Date(formData.submissionDate).toISOString());
    }
  
    // ✅ Debugging: Log FormData to ensure the file is being sent
    console.log("Uploading data...");
    for (let [key, value] of data.entries()) {
      console.log(`${key}:`, value);
    }
  
    uploadMutation.mutate(data);
  };
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", file); // Debugging log
      setFormData(prev => ({ ...prev, file }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Upload {type}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload {type}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={`Enter ${type} title`}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="file" className="text-sm font-medium">File</label>
            <Input
              key={fileInputKey} // Forces re-render on file change
              id="file"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf" // Restrict file types
              onChange={handleFileChange}
              required
            />
          </div>

          {type === "assignment" && (
            <div className="space-y-2">
              <label htmlFor="submissionDate" className="text-sm font-medium">Submission Date</label>
              <Input
                id="submissionDate"
                type="datetime-local"
                value={formData.submissionDate}
                onChange={(e) => setFormData(prev => ({ ...prev, submissionDate: e.target.value }))}
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
