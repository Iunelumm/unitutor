import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, AlertTriangle, MessageSquare, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, isAuthenticated, logout: authLogout } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const { data: sessions } = trpc.admin.sessions.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: disputes } = trpc.admin.disputes.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: tickets } = trpc.admin.tickets.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: analytics } = trpc.admin.analytics.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
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
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>Please sign in with admin credentials</CardDescription>
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

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have admin privileges</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">{APP_TITLE} Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name} <span className="text-xs">(Admin)</span>
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">Monitor platform activity and manage support</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics?.completedSessions || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disputes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {analytics?.disputes || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {analytics?.pendingRatings || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {tickets?.filter(t => t.status !== "resolved").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sessions">All Sessions</TabsTrigger>
            <TabsTrigger value="disputes">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Disputes ({disputes?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <MessageSquare className="h-4 w-4 mr-2" />
              Support Tickets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>All Sessions</CardTitle>
                <CardDescription>Complete session history</CardDescription>
              </CardHeader>
              <CardContent>
                {sessions && sessions.length > 0 ? (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-semibold">{session.course}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.studentName} ↔ {session.tutorName}
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
                  <p className="text-center py-8 text-muted-foreground">No sessions yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disputes">
            <Card>
              <CardHeader>
                <CardTitle>Disputed Sessions</CardTitle>
                <CardDescription>Sessions requiring admin review</CardDescription>
              </CardHeader>
              <CardContent>
                {disputes && disputes.length > 0 ? (
                  <div className="space-y-2">
                    {disputes.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5"
                      >
                        <div>
                          <p className="font-semibold">{session.course}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.studentName} ↔ {session.tutorName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Student completed: {session.studentCompleted ? "✓" : "✗"} | 
                            Tutor completed: {session.tutorCompleted ? "✓" : "✗"}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">Review</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No disputes</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>User support requests</CardDescription>
              </CardHeader>
              <CardContent>
                {tickets && tickets.length > 0 ? (
                  <div className="space-y-2">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {ticket.category}
                            </span>
                            <span className={`badge-status badge-${ticket.status}`}>
                              {ticket.status}
                            </span>
                          </div>
                          <p className="font-semibold">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            From: {ticket.userName} ({ticket.userEmail})
                          </p>
                          <p className="text-sm mt-2">{ticket.message}</p>
                        </div>
                        <Button size="sm" variant="outline">Respond</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No tickets</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

