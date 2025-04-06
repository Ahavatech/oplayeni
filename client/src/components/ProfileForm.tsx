import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "@shared/schema";

export function ProfileForm() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  // Fetch current profile data
  const profileQuery = useQuery<Profile>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/profile");
      return response.json();
    },
  });

  const [formData, setFormData] = useState<Omit<Profile, "_id">>({
    name: "",
    title: "",
    bio: "",
    photoUrl: "",
    contactInfo: {
      email: "",
      phone: "",
      office: "",
    }
  });

  // Update form data when profile data is loaded
  useEffect(() => {
    if (profileQuery.data) {
      setFormData({
        name: profileQuery.data.name,
        title: profileQuery.data.title,
        bio: profileQuery.data.bio,
        photoUrl: profileQuery.data.photoUrl,
        contactInfo: {
          email: profileQuery.data.contactInfo.email,
          phone: profileQuery.data.contactInfo.phone || "",
          office: profileQuery.data.contactInfo.office || "",
        }
      });
    }
  }, [profileQuery.data]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof formData) => 
      apiRequest("PUT", "/api/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "Profile updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error updating profile", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("contactInfo.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await apiRequest("PUT", "/api/profile/upload-photo", formData, { isFormData: true });
      const { imageUrl } = await response.json();
      setFormData(prev => ({ ...prev, photoUrl: imageUrl }));
      console.log(response);
      toast({ title: "Profile picture uploaded successfully" });
    } catch (error) {
      console.log(error)
      toast({ 
        title: "Error uploading profile picture", 
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (profileQuery.isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture Section */}
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={formData.photoUrl} />
          <AvatarFallback>
            {formData.name.split(" ").map((n: string) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Profile Picture</h3>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="max-w-xs"
            />
            {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Full Name</label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Position/Title</label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Professor of Mathematics"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium">Biography</label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Enter your professional biography"
            required
            className="min-h-[150px]"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email Address</label>
            <Input
              id="email"
              name="contactInfo.email"
              type="email"
              value={formData.contactInfo.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
            <Input
              id="phone"
              name="contactInfo.phone"
              value={formData.contactInfo.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="office" className="text-sm font-medium">Office Address</label>
          <Input
            id="office"
            name="contactInfo.office"
            value={formData.contactInfo.office}
            onChange={handleChange}
            placeholder="Enter your office address"
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full"
        disabled={updateProfileMutation.isPending}
      >
        {updateProfileMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating Profile...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
} 