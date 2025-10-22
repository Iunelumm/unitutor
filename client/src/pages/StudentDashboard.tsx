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
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">{APP_TITLE}</h1>
            </a>
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

        {needsRating.length > 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">Action Required</CardTitle>
              <CardDescription className="text-yellow-700">
                You have {needsRating.length} session{needsRating.length > 1 ? 's' : ''} waiting for your rating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/student/sessions">
                <Button variant="default">Rate Sessions</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!profile && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Complete Your Profile</CardTitle>
              <CardDescription className="text-blue-700">
                Set up your profile to start finding tutors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/student/profile">
                <Button variant="default">Create Profile</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/student/profile">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <User className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">My Profile</CardTitle>
                <CardDescription>
                  {profile ? "Update your information" : "Create your profile"}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/student/find-tutors">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Search className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">Find Tutors</CardTitle>
                <CardDescription>Search for tutors by course</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/student/sessions">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">My Sessions</CardTitle>
                <CardDescription>
                  {activeSessions.length} active session{activeSessions.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/support">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <HelpCircle className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">Support</CardTitle>
                <CardDescription>Get help and FAQs</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your latest tutoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {sessions && sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.slice(0, 5).map((session) => (
                  <Link key={session.id} href={`/sessions/${session.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
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
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sessions yet</p>
                <Link href="/student/find-tutors">
                  <Button className="mt-4">Find a Tutor</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
