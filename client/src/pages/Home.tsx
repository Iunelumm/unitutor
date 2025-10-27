import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, Flame, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { HIGH_DEMAND_COURSES } from "@shared/courses";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Get tutor count for display
  const { data: tutorCount } = trpc.admin.getTutorCount.useQuery(undefined, {
    enabled: !isAuthenticated,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect authenticated users to their dashboard
      setLocation("/student");
    }
  }, [isAuthenticated, user, setLocation]);

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-primary">{APP_TITLE}</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            UCSB Academic Tutoring Platform
          </p>
        </div>

        {/* Focus Courses Banner */}
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <Flame className="h-5 w-5 text-orange-600" />
          <AlertDescription className="text-sm">
            <strong className="text-orange-900">High-Demand Courses:</strong>{" "}
            We're currently prioritizing tutors for{" "}
            <span className="font-semibold">
              {HIGH_DEMAND_COURSES.slice(0, 3).map(c => c.split(" - ")[0]).join(", ")}
            </span>
            , and more.{" "}
            <span className="text-orange-700">Join as a Founding Tutor to get featured first!</span>
          </AlertDescription>
        </Alert>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>
              Connect with tutors or offer your expertise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a href={getLoginUrl()} className="block">
              <Button className="w-full h-12 text-lg" size="lg">
                Sign In / Register
              </Button>
            </a>
            
            {tutorCount !== undefined && tutorCount > 0 && (
              <div className="flex items-center justify-center gap-2 py-3 px-4 bg-muted/50 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium">
                  📚 <strong>{tutorCount}</strong> UCSB tutors have joined so far
                </p>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground text-center">
                For UCSB students and tutors only
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 UniTutor. Built for UCSB.</p>
        </div>
      </div>
    </div>
  );
}

