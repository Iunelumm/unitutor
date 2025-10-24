import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, ArrowLeft, Search, Star, Calendar, Clock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import { UCSB_COURSES, searchCourses } from "../../../shared/courses";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface AvailabilitySlot {
  weekIndex: number;
  dayOfWeek: number;
  hourBlock: string;
  isBookable: boolean;
}

export default function FindTutors() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");

  const { data: studentProfile } = trpc.profile.get.useQuery(
    { role: "student" },
    { enabled: isAuthenticated }
  );

  const { data: tutors, refetch } = trpc.tutors.search.useQuery(
    { course: selectedCourse },
    { enabled: !!selectedCourse }
  );

  const bookSessionMutation = trpc.sessions.create.useMutation({
    onSuccess: () => {
      toast.success("Session request sent! Waiting for tutor confirmation.");
      setSelectedTutor(null);
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

  // Calculate overlapping availability between student and tutor
  const getOverlappingSlots = (tutorAvailability: AvailabilitySlot[]) => {
    if (!studentProfile?.availability) return [];
    
    const studentSlots = studentProfile.availability as AvailabilitySlot[];
    const overlapping: string[] = [];

    tutorAvailability.forEach(tutorSlot => {
      studentSlots.forEach(studentSlot => {
        if (
          tutorSlot.dayOfWeek === studentSlot.dayOfWeek &&
          tutorSlot.hourBlock === studentSlot.hourBlock
        ) {
          const day = DAYS[tutorSlot.dayOfWeek];
          const hour = tutorSlot.hourBlock;
          overlapping.push(`${day} ${hour}`);
        }
      });
    });

    return overlapping;
  };

  const handleBookSession = () => {
    if (!selectedTutor || !selectedTimeSlot) {
      toast.error("Please select a time slot");
      return;
    }

    // Parse the selected time slot
    const [dayStr, timeStr] = selectedTimeSlot.split(' ');
    const dayIndex = DAYS.indexOf(dayStr);
    const hour = parseInt(timeStr.split(':')[0]);

    // Calculate start and end time (assuming 1-hour sessions)
    const now = new Date();
    const daysUntilTarget = (dayIndex - now.getDay() + 7) % 7 || 7;
    const startTime = new Date(now);
    startTime.setDate(now.getDate() + daysUntilTarget);
    startTime.setHours(hour, 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(hour + 1);

    bookSessionMutation.mutate({
      tutorId: selectedTutor.userId,
      course: selectedCourse,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });
  };

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (!studentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center mb-4">Please complete your student profile first</p>
            <Link href="/student/profile">
              <Button className="w-full">Go to Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
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
          <p className="text-muted-foreground">Search for tutors by course and view available time slots</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search by Course</CardTitle>
            <CardDescription>Find tutors who can help with specific UCSB courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Course</Label>
                <div className="relative">
                  <Input
                    placeholder="Search UCSB courses..."
                    value={courseSearch}
                    onChange={(e) => handleCourseSearch(e.target.value)}
                  />
                  {filteredCourses.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 border rounded-md bg-white shadow-lg max-h-48 overflow-y-auto">
                      {filteredCourses.map((course) => (
                        <div
                          key={course}
                          className="p-2 hover:bg-muted cursor-pointer text-sm"
                          onClick={() => selectCourse(course)}
                        >
                          {course}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedCourse && (
                  <div className="mt-2 flex items-center gap-2">
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
            </div>
          </CardContent>
        </Card>

        {selectedCourse && tutors && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Available Tutors ({tutors.length})</h3>
            {tutors.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No tutors found for this course
                </CardContent>
              </Card>
            ) : (
              tutors.map((tutor: any) => {
                const overlappingSlots = getOverlappingSlots(tutor.availability || []);
                
                return (
                  <Card key={tutor.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1">{tutor.userName}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{tutor.bio}</p>
                          <div className="flex items-center gap-4 text-sm mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              <span className="font-medium">{tutor.averageRating ? Number(tutor.averageRating).toFixed(1) : "New"}</span>
                            </div>
                            <span className="text-muted-foreground">
                              ${tutor.hourlyRate}/hour
                            </span>
                          </div>
                          
                          {overlappingSlots.length > 0 ? (
                            <div className="mb-3">
                              <p className="text-sm font-medium mb-2 text-green-700">
                                ✓ {overlappingSlots.length} matching time slot{overlappingSlots.length > 1 ? 's' : ''}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {overlappingSlots.slice(0, 6).map(slot => (
                                  <div key={slot} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                                    {slot}
                                  </div>
                                ))}
                                {overlappingSlots.length > 6 && (
                                  <div className="text-xs text-muted-foreground px-2 py-1">
                                    +{overlappingSlots.length - 6} more
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-orange-600 mb-3">
                              ⚠️ No overlapping availability - adjust your schedule to book this tutor
                            </p>
                          )}
                        </div>
                        
                        <Dialog open={selectedTutor?.userId === tutor.userId} onOpenChange={(open) => !open && setSelectedTutor(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              onClick={() => setSelectedTutor(tutor)}
                              disabled={overlappingSlots.length === 0}
                            >
                              Book Session
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Book Session with {tutor.userName}</DialogTitle>
                              <DialogDescription>
                                Select an available time slot for {selectedCourse}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Available Time Slots</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2 max-h-64 overflow-y-auto">
                                  {overlappingSlots.map(slot => (
                                    <div
                                      key={slot}
                                      onClick={() => setSelectedTimeSlot(slot)}
                                      className={`p-3 border rounded cursor-pointer transition-colors ${
                                        selectedTimeSlot === slot
                                          ? "bg-primary text-primary-foreground"
                                          : "hover:bg-muted"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm font-medium">{slot}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleBookSession}
                                  disabled={!selectedTimeSlot || bookSessionMutation.isPending}
                                  className="flex-1"
                                >
                                  {bookSessionMutation.isPending ? "Booking..." : "Confirm Booking"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedTutor(null);
                                    setSelectedTimeSlot("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

