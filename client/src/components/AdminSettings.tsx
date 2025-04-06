import { AdminCredentialsForm } from "@/components/AdminCredentialsForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AdminSettingsProps {
  onBack: () => void;
}

export function AdminSettings({ onBack }: AdminSettingsProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow-lg">
        <div className="p-8">
          <h3 className="text-3xl font-bold mb-6">Admin Settings</h3>
          <AdminCredentialsForm />
        </div>
      </div>
    </div>
  );
} 