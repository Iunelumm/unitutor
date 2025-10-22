import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, Calendar, Search, User, HelpCircle, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function StudentDashboard() {
  const { user, isAuthenticated, logout: authLogout } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const { data: profile } = trpc.profile.get.useQuery(
    { role: "student" },
    { enabled: isAuthenticated }
  );

  const { data: sessions } = trpc.sessions.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    authLogout();
    toast.success("Logged out successfully");
    setLocation("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to access the student dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <a href={getLoginUrl()}>
              <Button className="w-full">Sign In</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeSessions = sessions?.filter(s => 
    s.status === "PENDING" || s.status === "CONFIRMED" || s.status === "PENDING_RATING"
  ) || [];

  const needsRating = sessions?.filter(s => 
    s.status === "PENDING_RATING" && !s.studentRated
  ) || [];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">{APP_TITLE}</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name} <span className="text-xs">(Student)</span>
            </span>
            <Link href="/tutor">
              <Button variant="outline" size="sm">Switch to Tutor</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-muted-foreground">Manage your tutoring sessions and find new tutors</p>
        </div>

        {!profile && (
          <Card className="mb-8 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">Complete Your Profile</CardTitle>
              <CardDescription>Set up your profile to start finding tutors</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/student/profile">
                <Button>Create Profile</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {needsRating.length > 0 && (
          <Card className="mb-8 border-yellow-500/50 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-700">⚠️ Rating Required</CardTitle>
              <CardDescription>You have {needsRating.length} session(s) waiting for your rating</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/student/sessions">
                <Button variant="outline">View Sessions</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/student/profile">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <User className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">My Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {profile ? "Update your profile" : "Create your profile"}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/find-tutors">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <Search className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">Find Tutors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Search for tutors by course</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/sessions">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">My Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{activeSessions.length} active sessions</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/support">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <HelpCircle className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Get help and FAQs</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your latest tutoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {activeSessions.length > 0 ? (
              <div className="space-y-4">
                {activeSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{session.course}</p>
                      <p className="text-sm text-muted-foreground">
                        with {session.tutorName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(session.startTime).toLocaleString()}
                      </p>
                    </div>
                    <span className={`badge-status badge-${session.status.toLowerCase()}`}>
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No sessions yet</p>
                <Link href="/student/find-tutors">
                  <Button>Find a Tutor</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

