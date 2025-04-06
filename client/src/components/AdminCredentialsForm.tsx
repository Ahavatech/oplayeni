import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export function AdminCredentialsForm() {
  const { toast } = useToast();
  const { logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newUsername: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    
    if (formData.newUsername && formData.newUsername.length < 3) {
      newErrors.newUsername = "Username must be at least 3 characters";
    }
    
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update credentials mutation
  const updateCredentialsMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      try {
        // First check if we're still authenticated
        const authCheckResponse = await fetch("/api/user", {
          credentials: "include"
        });
        
        if (!authCheckResponse.ok) {
          console.log("[Admin Credentials] Auth check failed, redirecting to login");
          throw new Error("Your session has expired. Please log in again.");
        }

        console.log("[Admin Credentials] Auth check passed, sending update request");
        const response = await fetch("/api/admin/credentials", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            currentPassword: data.currentPassword,
            newUsername: data.newUsername || undefined,
            newPassword: data.newPassword || undefined
          }),
          credentials: "include"
        });

        console.log("[Admin Credentials] Response status:", response.status);
        const contentType = response.headers.get("content-type");
        console.log("[Admin Credentials] Response content type:", contentType);

        // Try to get the response as text first
        const responseText = await response.text();
        console.log("[Admin Credentials] Raw response:", responseText);

        let result;
        try {
          // Try to parse the text as JSON
          result = JSON.parse(responseText);
        } catch (e) {
          console.error("[Admin Credentials] Failed to parse response as JSON:", e);
          // If we can't parse as JSON and the response wasn't successful, throw an error
          if (!response.ok) {
            throw new Error(responseText || "Failed to update credentials");
          }
          // If response was successful but not JSON, create a default success result
          result = { message: "Credentials updated successfully" };
        }

        if (!response.ok) {
          throw new Error(result.error || "Failed to update credentials");
        }

        console.log("[Admin Credentials] Update successful:", result);
        return result;
      } catch (error: any) {
        console.error("[Admin Credentials] Error:", error);
        if (error.message.includes("session has expired")) {
          // Handle session expiration
          navigate("/auth");
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Credentials updated successfully" });
      setFormData({
        currentPassword: "",
        newUsername: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      // Log out and redirect to login page after credentials update
      logoutMutation.mutate(undefined, {
        onSuccess: () => {
          toast({ 
            title: "Please log in again", 
            description: "Your credentials have been updated. Please log in with your new credentials." 
          });
          navigate("/auth");
        }
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error updating credentials", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    updateCredentialsMutation.mutate(formData, {
      onSettled: () => {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Admin Credentials</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">Current Password*</label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                required
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-500">{errors.currentPassword}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="newUsername" className="text-sm font-medium">Reset Username</label>
              <Input
                id="newUsername"
                name="newUsername"
                value={formData.newUsername}
                onChange={handleChange}
                placeholder="Enter new username"
              />
              {errors.newUsername && (
                <p className="text-sm text-red-500">{errors.newUsername}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">Reset Password</label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                disabled={!formData.newPassword}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Reset Credentials"
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              * Required field. You must enter your current password to make any changes.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 