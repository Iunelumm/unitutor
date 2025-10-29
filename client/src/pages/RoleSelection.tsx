import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { BookOpen, GraduationCap, Users } from "lucide-react";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<"student" | "tutor" | "both" | "">("");
  const [, setLocation] = useLocation();
  
  const updateRoleMutation = trpc.user.updatePreferredRoles.useMutation({
    onSuccess: () => {
      toast.success("Role preferences saved!");
      
      // Redirect based on selection
      if (selectedRole === "student") {
        setLocation("/student/profile");
      } else if (selectedRole === "tutor") {
        setLocation("/tutor/profile");
      } else {
        // For 'both', show role selection
        setLocation("/");
      }
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    
    if (selectedRole === "student" || selectedRole === "tutor" || selectedRole === "both") {
      updateRoleMutation.mutate({ preferredRoles: selectedRole });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to UniTutor!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Please select how you'd like to use the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as "student" | "tutor" | "both")}>
            {/* Student Only */}
            <Card className={`cursor-pointer transition-all ${selectedRole === "student" ? "ring-2 ring-blue-500" : ""}`}>
              <Label htmlFor="student" className="cursor-pointer">
                <CardContent className="flex items-start gap-4 p-6">
                  <RadioGroupItem value="student" id="student" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">Student</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      I'm looking for tutoring help with my courses
                    </p>
                  </div>
                </CardContent>
              </Label>
            </Card>

            {/* Tutor Only */}
            <Card className={`cursor-pointer transition-all ${selectedRole === "tutor" ? "ring-2 ring-blue-500" : ""}`}>
              <Label htmlFor="tutor" className="cursor-pointer">
                <CardContent className="flex items-start gap-4 p-6">
                  <RadioGroupItem value="tutor" id="tutor" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-lg">Tutor</h3>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                        🔥 Founding Tutor
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      I want to offer tutoring services and earn money
                    </p>
                    <p className="text-xs text-orange-600 font-medium">
                      ⭐ As a founding tutor, you'll get priority placement in search results!
                    </p>
                  </div>
                </CardContent>
              </Label>
            </Card>

            {/* Both */}
            <Card className={`cursor-pointer transition-all ${selectedRole === "both" ? "ring-2 ring-blue-500" : ""}`}>
              <Label htmlFor="both" className="cursor-pointer">
                <CardContent className="flex items-start gap-4 p-6">
                  <RadioGroupItem value="both" id="both" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-lg">Both Student & Tutor</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      I want to both find tutors and offer tutoring services
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      You'll be able to switch between student and tutor modes
                    </p>
                  </div>
                </CardContent>
              </Label>
            </Card>
          </RadioGroup>

          <div className="text-center text-xs text-muted-foreground mb-4">
            By signing up, you agree to our{" "}
            <a href="/terms" target="_blank" className="text-primary underline hover:text-primary/80">
              Disclaimer and Terms of Use
            </a>
            .
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full"
            size="lg"
            disabled={!selectedRole || updateRoleMutation.isPending}
          >
            {updateRoleMutation.isPending ? "Saving..." : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

