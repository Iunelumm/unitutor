import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { UCSB_COURSES, searchCourses } from "../../../shared/courses";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

export default function StudentProfile() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: profile } = trpc.profile.get.useQuery(
    { role: "student" },
    { enabled: isAuthenticated }
  );

  const [formData, setFormData] = useState({
    age: "",
    year: "",
    major: "",
    bio: "",
    priceMin: "",
    priceMax: "",
    courses: [] as string[],
    availability: [] as string[],
  });

  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = this week, 1 = next week, etc.

  const [courseSearch, setCourseSearch] = useState("");
  const [filteredCourses, setFilteredCourses] = useState(UCSB_COURSES);

  useEffect(() => {
    if (profile) {
      // Convert availability objects back to simple strings
      const availabilitySlots = profile.availability 
        ? (profile.availability as any[]).map((slot: any) => {
            const day = DAYS[slot.dayOfWeek];
            const hour = slot.hourBlock.split(':')[0];
            return `${slot.weekIndex}-${day}-${hour}`;
          })
        : [];

      setFormData({
        age: profile.age?.toString() || "",
        year: profile.year || "",
        major: profile.major || "",
        bio: profile.bio || "",
        priceMin: profile.priceMin?.toString() || "",
        priceMax: profile.priceMax?.toString() || "",
        courses: (profile.courses as string[]) || [],
        availability: availabilitySlots,
      });
    }
  }, [profile]);

  useEffect(() => {
    setFilteredCourses(searchCourses(courseSearch));
  }, [courseSearch]);

  const saveMutation = trpc.profile.save.useMutation({
    onSuccess: () => {
      toast.success("Profile saved successfully");
      utils.profile.get.invalidate();
      setLocation("/student");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.age || !formData.year || !formData.major || 
        !formData.priceMin || !formData.priceMax || formData.courses.length === 0 ||
        formData.availability.length === 0) {
      toast.error("Please complete all required fields including availability");
      return;
    }

    // Convert simple strings to availability objects
    const availabilityObjects = formData.availability.map(slot => {
      const [weekIndex, day, hour] = slot.split('-');
      return {
        weekIndex: parseInt(weekIndex),
        dayOfWeek: DAYS.indexOf(day),
        hourBlock: `${hour}:00`,
        isBookable: true,
      };
    });

    saveMutation.mutate({
      role: "student",
      age: parseInt(formData.age),
      year: formData.year,
      major: formData.major,
      bio: formData.bio || undefined,
      priceMin: parseInt(formData.priceMin),
      priceMax: parseInt(formData.priceMax),
      courses: formData.courses,
      availability: availabilityObjects,
    });
  };

  const addCourse = (course: string) => {
    if (!formData.courses.includes(course)) {
      setFormData({ ...formData, courses: [...formData.courses, course] });
      setCourseSearch("");
    }
  };

  const removeCourse = (course: string) => {
    setFormData({ ...formData, courses: formData.courses.filter(c => c !== course) });
  };

  const toggleAvailability = (slot: string) => {
    const slotWithWeek = `${selectedWeek}-${slot}`;
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(slotWithWeek)
        ? prev.availability.filter(s => s !== slotWithWeek)
        : [...prev.availability, slotWithWeek]
    }));
  };

  const getWeekLabel = (weekIndex: number) => {
    if (weekIndex === 0) return "This Week";
    if (weekIndex === 1) return "Next Week";
    return `Week ${weekIndex + 1}`;
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

      <div className="container py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Student Profile</CardTitle>
            <CardDescription>
              Complete your profile to start finding tutors. All fields except bio are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Freshman">Freshman</SelectItem>
                      <SelectItem value="Sophomore">Sophomore</SelectItem>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Graduate">Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="major">Major *</Label>
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell tutors a bit about yourself..."
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priceMin">Min Price ($/hour) *</Label>
                  <Input
                    id="priceMin"
                    type="number"
                    value={formData.priceMin}
                    onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="priceMax">Max Price ($/hour) *</Label>
                  <Input
                    id="priceMax"
                    type="number"
                    value={formData.priceMax}
                    onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Courses *</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Search UCSB courses..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                  />
                  {courseSearch && filteredCourses.length > 0 && (
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                      {filteredCourses.slice(0, 10).map((course) => (
                        <div
                          key={course}
                          className="p-2 hover:bg-muted cursor-pointer text-sm"
                          onClick={() => addCourse(course)}
                        >
                          {course}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.courses.map((course) => (
                      <div key={course} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {course}
                        <button type="button" onClick={() => removeCourse(course)} className="hover:text-destructive">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label>Your Availability (Week-Day-Hour) *</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select when you're available for tutoring sessions for different weeks. You can only book tutors during overlapping time slots.
                </p>
                
                {/* Week Selector */}
                <div className="flex gap-2 mb-4">
                  {[0, 1, 2, 3].map(weekIndex => (
                    <button
                      key={weekIndex}
                      type="button"
                      onClick={() => setSelectedWeek(weekIndex)}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                        selectedWeek === weekIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {getWeekLabel(weekIndex)}
                    </button>
                  ))}
                </div>

                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  {DAYS.map(day => (
                    <div key={day} className="mb-4">
                      <h4 className="font-semibold mb-2">{day}</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {HOURS.map(hour => {
                          const slot = `${day}-${hour}`;
                          const slotWithWeek = `${selectedWeek}-${slot}`;
                          const isSelected = formData.availability.includes(slotWithWeek);
                          return (
                            <div
                              key={slot}
                              onClick={() => toggleAvailability(slot)}
                              className={`p-2 text-center text-sm rounded cursor-pointer transition-colors ${
                                isSelected 
                                  ? "bg-primary text-primary-foreground" 
                                  : "bg-muted hover:bg-muted/80"
                              }`}
                            >
                              {hour}:00
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
