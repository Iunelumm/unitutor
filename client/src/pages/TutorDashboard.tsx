import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, Calendar, User, HelpCircle, LogOut, Award, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function TutorDashboard() {
  const { user, isAuthenticated, logout: authLogout } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const { data: profile } = trpc.profile.get.useQuery(
    { role: "tutor" },
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
            <CardDescription>Please sign in to access the tutor dashboard</CardDescription>
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

  const tutorSessions = sessions?.filter(s => s.tutorId === user?.id) || [];
  const pendingRequests = tutorSessions.filter(s => s.status === "PENDING");
  const confirmedSessions = tutorSessions.filter(s => s.status === "CONFIRMED");
  const needsRating = tutorSessions.filter(s => 
    s.status === "PENDING_RATING" && !s.tutorRated
  );

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
              {user?.name} <span className="text-xs">(Tutor)</span>
            </span>
            <Link href="/student">
              <Button variant="outline" size="sm">Switch to Student</Button>
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
          <p className="text-muted-foreground">Manage your tutoring sessions and build your reputation</p>
        </div>

        {!profile && (
          <Card className="mb-8 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">Complete Your Tutor Profile</CardTitle>
              <CardDescription>Set up your profile to start receiving tutoring requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tutor/profile">
                <Button>Create Tutor Profile</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {profile && (
          <Card className="mb-8 border-green-500/50 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <CardTitle className="text-green-800">Welcome to UniTutor Beta!</CardTitle>
                  <CardDescription className="text-green-700 mt-2">
                    Thank you for being a founding tutor! You're helping build UCSB's peer tutoring community. 
                    We're currently prioritizing high-demand courses like <strong>CMPSC 8, MATH 3A, CHEM 1A, ECON 1</strong>, and more. 
                    Your profile will be featured prominently as we launch to students.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {pendingRequests.length > 0 && (
          <Card className="mb-8 border-blue-500/50 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-700">📬 New Session Requests</CardTitle>
              <CardDescription>You have {pendingRequests.length} pending session request(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tutor/sessions">
                <Button variant="outline">View Requests</Button>
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
              <Link href="/tutor/sessions">
                <Button variant="outline">View Sessions</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Credit Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{profile?.creditPoints || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">From completed sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting your response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Confirmed Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{confirmedSessions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Upcoming sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                N/A
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                No ratings yet
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/tutor/profile">
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

          <Link href="/tutor/sessions">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">My Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tutorSessions.length} total sessions</p>
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

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <Award className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-lg">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {profile?.creditPoints || 0} points earned
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your latest tutoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {tutorSessions.length > 0 ? (
              <div className="space-y-4">
                {tutorSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{session.course}</p>
                      <p className="text-sm text-muted-foreground">
                        with {session.studentName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(session.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge-status badge-${session.status.toLowerCase()}`}>
                        {session.status}
                      </span>
                      {session.status === "PENDING" && (
                        <Link href={`/sessions/${session.id}`}>
                          <Button size="sm">Review</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No sessions yet</p>
                <p className="text-sm text-muted-foreground">
                  {profile ? "Students will request sessions once they find your profile" : "Create your profile to start receiving requests"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

