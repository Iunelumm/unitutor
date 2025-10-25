import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Users, BookOpen, AlertTriangle, MessageSquare, LogOut, Search, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useState } from "react";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  PENDING_RATING: "bg-blue-100 text-blue-800",
  CLOSED: "bg-gray-100 text-gray-800",
  DISPUTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export default function AdminDashboard() {
  const { user, isAuthenticated, logout: authLogout } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();
  const utils = trpc.useUtils();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [ticketResponse, setTicketResponse] = useState("");
  const [ticketStatus, setTicketStatus] = useState<"pending" | "in_progress" | "resolved">("in_progress");

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

  const { data: users } = trpc.admin.users.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: searchResults } = trpc.admin.searchUsers.useQuery(
    { query: searchQuery },
    { enabled: isAuthenticated && user?.role === "admin" && searchQuery.length > 2 }
  );

  const updateTicketMutation = trpc.admin.updateTicket.useMutation({
    onSuccess: () => {
      toast.success("Ticket updated successfully");
      setSelectedTicketId(null);
      setTicketResponse("");
      utils.admin.tickets.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update ticket");
    },
  });

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    authLogout();
    toast.success("Logged out successfully");
    setLocation("/");
  };

  const handleUpdateTicket = (ticketId: number) => {
    updateTicketMutation.mutate({
      ticketId,
      status: ticketStatus,
      adminResponse: ticketResponse,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have admin privileges</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">{APP_TITLE} Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name} (Admin)</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics?.studentCount || 0} students, {analytics?.tutorCount || 0} tutors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.completedSessions || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully closed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Disputes</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{analytics?.disputes || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
                <CardDescription>Key metrics and recent activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Pending Ratings</p>
                    <p className="text-2xl font-bold">{analytics?.pendingRatings || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Sessions</p>
                    <p className="text-2xl font-bold">{sessions?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Disputes */}
            {disputes && disputes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Disputes</CardTitle>
                  <CardDescription>Sessions requiring admin intervention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {disputes.slice(0, 5).map((dispute) => (
                      <div key={dispute.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{dispute.course}</p>
                          <p className="text-sm text-muted-foreground">
                            {dispute.studentName} ↔ {dispute.tutorName}
                          </p>
                        </div>
                        <Badge className={STATUS_COLORS.DISPUTED}>Disputed</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Search and manage platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {(searchQuery.length > 2 ? searchResults : users?.slice(0, 20))?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Sessions</CardTitle>
                <CardDescription>View and manage all tutoring sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sessions?.slice(0, 20).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{session.course}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.studentName} ↔ {session.tutorName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.startTime).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={STATUS_COLORS[session.status]}>{session.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disputes Tab */}
          <TabsContent value="disputes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Disputed Sessions</CardTitle>
                <CardDescription>Sessions with conflicting completion status</CardDescription>
              </CardHeader>
              <CardContent>
                {disputes && disputes.length > 0 ? (
                  <div className="space-y-3">
                    {disputes.map((dispute) => (
                      <div key={dispute.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{dispute.course}</p>
                            <p className="text-sm text-muted-foreground">
                              Student: {dispute.studentName} | Tutor: {dispute.tutorName}
                            </p>
                          </div>
                          <Badge className={STATUS_COLORS.DISPUTED}>Disputed</Badge>
                        </div>
                        <div className="text-sm">
                          <p>
                            Student Completed: {dispute.studentCompleted ? "✓ Yes" : "✗ No"}
                          </p>
                          <p>
                            Tutor Completed: {dispute.tutorCompleted ? "✓ Yes" : "✗ No"}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Session Time: {new Date(dispute.startTime).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No disputes at this time</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Manage user support requests</CardDescription>
              </CardHeader>
              <CardContent>
                {tickets && tickets.length > 0 ? (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{ticket.subject}</p>
                            <p className="text-sm text-muted-foreground">
                              From: {ticket.userName} ({ticket.userEmail})
                            </p>
                            <p className="text-sm mt-2">{ticket.message}</p>
                          </div>
                          <Badge variant={ticket.status === "resolved" ? "default" : "secondary"}>
                            {ticket.status}
                          </Badge>
                        </div>

                        {ticket.adminResponse && (
                          <div className="bg-blue-50 p-3 rounded">
                            <p className="text-sm font-medium">Admin Response:</p>
                            <p className="text-sm">{ticket.adminResponse}</p>
                          </div>
                        )}

                        {selectedTicketId === ticket.id ? (
                          <div className="space-y-3 pt-3 border-t">
                            <Select value={ticketStatus} onValueChange={(v: any) => setTicketStatus(v)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                            <Textarea
                              placeholder="Your response..."
                              value={ticketResponse}
                              onChange={(e) => setTicketResponse(e.target.value)}
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button onClick={() => handleUpdateTicket(ticket.id)}>
                                Submit Response
                              </Button>
                              <Button variant="outline" onClick={() => setSelectedTicketId(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTicketId(ticket.id);
                              setTicketStatus(ticket.status as any);
                              setTicketResponse(ticket.adminResponse || "");
                            }}
                          >
                            Respond
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No support tickets</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

