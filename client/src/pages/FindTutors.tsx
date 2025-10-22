import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, ArrowLeft, Search, Star, Calendar } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import { UCSB_COURSES, searchCourses } from "../../../shared/courses";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function FindTutors() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);

  const { data: tutors, refetch } = trpc.tutors.search.useQuery(
    { course: selectedCourse },
    { enabled: !!selectedCourse }
  );

  const bookSessionMutation = trpc.sessions.create.useMutation({
    onSuccess: () => {
      toast.success("Session request sent! Waiting for tutor confirmation.");
      setLocation("/student/sessions");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to book session");
    },
  });

  const handleCourseSearch = (value: string) => {
    setCourseSearch(value);
    if (value) {
      setFilteredCourses(searchCourses(value).slice(0, 10));
    } else {
      setFilteredCourses([]);
    }
  };

  const selectCourse = (course: string) => {
    setSelectedCourse(course);
    setCourseSearch("");
    setFilteredCourses([]);
    refetch();
  };

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">{APP_TITLE}</h1>
          </Link>
          <Link href="/student">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Find Tutors</h2>
          <p className="text-muted-foreground">Search for tutors by course and book a session</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search by Course</CardTitle>
            <CardDescription>Find tutors who can help with your UCSB courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Label htmlFor="course-search">Course</Label>
                <Input
                  id="course-search"
                  placeholder="Search UCSB courses (e.g., CMPSC 16, MATH 3A)..."
                  value={courseSearch}
                  onChange={(e) => handleCourseSearch(e.target.value)}
                />
                {filteredCourses.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 border rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
                    {filteredCourses.map((course) => (
                      <div
                        key={course}
                        className="p-3 hover:bg-muted cursor-pointer text-sm"
                        onClick={() => selectCourse(course)}
                      >
                        {course}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedCourse && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Selected:</span>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {selectedCourse}
                    <button onClick={() => setSelectedCourse("")} className="hover:text-destructive">
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedCourse && (
          <div className="space-y-4">
            {tutors && tutors.length > 0 ? (
              tutors.map((tutor) => (
                <Card key={tutor.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{tutor.userName}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {tutor.year} • {tutor.major}
                        </p>
                        <p className="text-sm mb-4">{tutor.bio}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(tutor.courses as string[]).map((course) => (
                            <span key={course} className="text-xs bg-muted px-2 py-1 rounded">
                              {course}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">N/A</span>
                            <span className="text-muted-foreground">(No ratings yet)</span>
                          </div>
                          <div className="font-semibold text-primary">
                            ${tutor.priceMin}/hour
                          </div>
                          <div className="text-muted-foreground">
                            {tutor.creditPoints} credit points
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        <Button
                          onClick={() => {
                            // For now, just create a session request
                            // In a full implementation, this would open a booking dialog
                            const now = new Date();
                            const tomorrow = new Date(now);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            tomorrow.setHours(14, 0, 0, 0);
                            const endTime = new Date(tomorrow);
                            endTime.setHours(15, 0, 0, 0);

                            bookSessionMutation.mutate({
                              tutorId: tutor.userId,
                              course: selectedCourse,
                              startTime: tomorrow.toISOString(),
                              endTime: endTime.toISOString(),
                            });
                          }}
                          disabled={bookSessionMutation.isPending}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No tutors found for {selectedCourse}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try searching for a different course
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!selectedCourse && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Search for a course to find tutors</p>
              <p className="text-sm text-muted-foreground">
                Select a course from the dropdown above
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

