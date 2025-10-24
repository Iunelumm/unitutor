import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  PENDING_RATING: "bg-blue-100 text-blue-800",
  CLOSED: "bg-gray-100 text-gray-800",
  DISPUTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export default function Sessions() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const isStudentRoute = location.startsWith('/student');
  const isTutorRoute = location.startsWith('/tutor');
  const rolePrefix = isStudentRoute ? '/student' : '/tutor';
  const utils = trpc.useUtils();

  const { data: sessions, isLoading } = trpc.sessions.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const confirmMutation = trpc.sessions.confirm.useMutation({
    onSuccess: () => {
      toast.success("Session confirmed!");
      utils.sessions.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to confirm session");
    },
  });

  const cancelMutation = trpc.sessions.cancel.useMutation({
    onSuccess: () => {
      toast.success("Session cancelled");
      utils.sessions.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel session");
    },
  });

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const isTutor = window.location.pathname.includes("/tutor");
  const mySessions = sessions || [];

  const pendingSessions = mySessions.filter(s => s.status === "PENDING");
  const confirmedSessions = mySessions.filter(s => s.status === "CONFIRMED");
  const needsRating = mySessions.filter(s => 
    s.status === "PENDING_RATING" && 
    (isTutor ? !s.tutorRated : !s.studentRated)
  );
  const cancelledSessions = mySessions.filter(s => 
    s.status === "CANCELLED" && !s.cancellationRated && s.cancelledBy !== user?.id
  );
  const completedSessions = mySessions.filter(s => 
    s.status === "CLOSED" || s.status === "DISPUTED"
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">{APP_TITLE}</h1>
          </Link>
          <Link href={isTutor ? "/tutor" : "/student"}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Sessions</h2>
          <p className="text-muted-foreground">
            {isTutor ? "Manage your tutoring sessions" : "View and manage your learning sessions"}
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading sessions...</p>
            </CardContent>
          </Card>
        ) : mySessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No sessions yet</p>
              <p className="text-sm text-muted-foreground">
                {isTutor 
                  ? "Students will request sessions once they find your profile" 
                  : "Find a tutor to book your first session"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {pendingSessions.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Pending Requests</h3>
                <div className="space-y-4">
                  {pendingSessions.map((session) => (
                    <Card key={session.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-lg">{session.course}</h4>
                              <Badge className={STATUS_COLORS[session.status]}>
                                {session.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>
                                  {isTutor ? `Student: ${session.studentName}` : `Tutor: ${session.tutorName}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(session.startTime).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                  {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isTutor && (
                              <Button
                                onClick={() => confirmMutation.mutate({ sessionId: session.id })}
                                disabled={confirmMutation.isPending}
                              >
                                Confirm
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              onClick={() => cancelMutation.mutate({ sessionId: session.id })}
                              disabled={cancelMutation.isPending}
                            >
                              Cancel
                            </Button>
                            <Link href={`${rolePrefix}/sessions/${session.id}`}>
                              <Button variant="ghost">View Details</Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {confirmedSessions.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Confirmed Sessions</h3>
                <div className="space-y-4">
                  {confirmedSessions.map((session) => (
                    <Card key={session.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-lg">{session.course}</h4>
                              <Badge className={STATUS_COLORS[session.status]}>
                                {session.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>
                                  {isTutor ? `Student: ${session.studentName}` : `Tutor: ${session.tutorName}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(session.startTime).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                  {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Link href={`${rolePrefix}/sessions/${session.id}`}>
                            <Button>View Details</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {needsRating.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-yellow-700">⚠️ Needs Rating</h3>
                <div className="space-y-4">
                  {needsRating.map((session) => (
                    <Card key={session.id} className="border-yellow-500/50">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-lg">{session.course}</h4>
                              <Badge className={STATUS_COLORS[session.status]}>
                                {session.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>
                                  {isTutor ? `Student: ${session.studentName}` : `Tutor: ${session.tutorName}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(session.startTime).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <Link href={`${rolePrefix}/sessions/${session.id}`}>
                            <Button>Rate Session</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {cancelledSessions.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-orange-700">⚠️ Cancelled Sessions - Rate Cancellation</h3>
                <div className="space-y-4">
                  {cancelledSessions.map((session) => (
                    <Card key={session.id} className="border-orange-500/50">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-lg">{session.course}</h4>
                              <Badge className={STATUS_COLORS[session.status]}>
                                {session.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>
                                  {isTutor ? `Student: ${session.studentName}` : `Tutor: ${session.tutorName}`} cancelled this session
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(session.startTime).toLocaleDateString()}</span>
                              </div>
                              {session.cancelReason && (
                                <p className="text-sm italic">Reason: {session.cancelReason}</p>
                              )}
                            </div>
                          </div>
                          <Link href={`${rolePrefix}/sessions/${session.id}`}>
                            <Button variant="outline">Rate Cancellation</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {completedSessions.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Completed Sessions</h3>
                <div className="space-y-4">
                  {completedSessions.map((session) => (
                    <Card key={session.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-lg">{session.course}</h4>
                              <Badge className={STATUS_COLORS[session.status]}>
                                {session.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>
                                  {isTutor ? `Student: ${session.studentName}` : `Tutor: ${session.tutorName}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(session.startTime).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <Link href={`${rolePrefix}/sessions/${session.id}`}>
                            <Button variant="outline">View Details</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

