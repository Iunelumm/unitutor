import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, ArrowLeft, Star, Calendar, MessageCircle, Heart, HeartOff, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function MyTutors() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: favoriteTutors, isLoading } = trpc.favoriteTutors.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const removeFavoriteMutation = trpc.favoriteTutors.remove.useMutation({
    onSuccess: () => {
      toast.success("Tutor removed from favorites");
      utils.favoriteTutors.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove tutor");
    },
  });

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const tutors = favoriteTutors || [];

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
          <h2 className="text-3xl font-bold mb-2">My Tutors</h2>
          <p className="text-muted-foreground">
            Your favorite tutors for quick access and booking
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading tutors...</p>
            </CardContent>
          </Card>
        ) : tutors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No favorite tutors yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Add tutors to your favorites for quick access
              </p>
              <Link href="/student/find-tutors">
                <Button>Find Tutors</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {tutors.map((tutor) => (
              <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {tutor.tutorName || "Unknown Tutor"}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {tutor.tutorProfile?.major || "No major specified"}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavoriteMutation.mutate({ tutorId: tutor.tutorId })}
                      disabled={removeFavoriteMutation.isPending}
                    >
                      <HeartOff className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">
                          {tutor.averageRating > 0 ? tutor.averageRating.toFixed(1) : "No ratings"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {tutor.sessionCount} sessions
                        </span>
                      </div>
                    </div>

                    {/* Courses */}
                    {tutor.tutorProfile?.courses && tutor.tutorProfile.courses.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Courses:</p>
                        <div className="flex flex-wrap gap-2">
                          {tutor.tutorProfile.courses.slice(0, 3).map((course, idx) => (
                            <Badge key={idx} variant="secondary">
                              {course}
                            </Badge>
                          ))}
                          {tutor.tutorProfile.courses.length > 3 && (
                            <Badge variant="outline">
                              +{tutor.tutorProfile.courses.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bio */}
                    {tutor.tutorProfile?.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tutor.tutorProfile.bio}
                      </p>
                    )}

                    {/* Personal Notes */}
                    {tutor.notes && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm font-medium mb-1">My Notes:</p>
                        <p className="text-sm text-muted-foreground">{tutor.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/student/find-tutors?tutor=${tutor.tutorId}`} className="flex-1">
                        <Button className="w-full" size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Session
                        </Button>
                      </Link>
                      <Link href={`/student/sessions?tutor=${tutor.tutorId}`}>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          View History
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
