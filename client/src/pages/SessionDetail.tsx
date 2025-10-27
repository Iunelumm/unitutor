import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, ArrowLeft, Send, Star, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { formatDatePT, formatTimePT, formatDateTimePT } from "@shared/timezone";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  PENDING_RATING: "bg-blue-100 text-blue-800",
  CLOSED: "bg-gray-100 text-gray-800",
  DISPUTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export default function SessionDetail() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const isStudentRoute = location.startsWith('/student');
  const isTutorRoute = location.startsWith('/tutor');
  const [, params] = useRoute(isStudentRoute ? "/student/sessions/:id" : "/tutor/sessions/:id");
  const [, setLocation] = useLocation();
  const sessionId = params?.id ? parseInt(params.id) : 0;
  const utils = trpc.useUtils();

  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: session } = trpc.sessions.get.useQuery(
    { sessionId },
    { enabled: isAuthenticated && sessionId > 0 }
  );

  const { data: messages } = trpc.chat.getMessages.useQuery(
    { sessionId },
    { enabled: isAuthenticated && sessionId > 0, refetchInterval: 3000 }
  );

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessageMutation = trpc.chat.send.useMutation({
    onSuccess: () => {
      setMessage("");
      utils.chat.getMessages.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const completeMutation = trpc.sessions.markComplete.useMutation({
    onSuccess: () => {
      toast.success("Session marked as complete");
      utils.sessions.get.invalidate();
      utils.sessions.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to complete session");
    },
  });

  const rateMutation = trpc.ratings.submit.useMutation({
    onSuccess: () => {
      toast.success("Rating submitted successfully");
      utils.sessions.get.invalidate();
      utils.sessions.list.invalidate();
      setLocation(isTutorRoute ? "/tutor/sessions" : "/student/sessions");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit rating");
    },
  });

  const rateCancellationMutation = trpc.ratings.rateCancellation.useMutation({
    onSuccess: () => {
      toast.success("Cancellation rated successfully");
      utils.sessions.get.invalidate();
      utils.sessions.list.invalidate();
      setLocation(isTutorRoute ? "/tutor/sessions" : "/student/sessions");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to rate cancellation");
    },
  });

  const cancelMutation = trpc.sessions.cancel.useMutation({
    onSuccess: () => {
      toast.success("Session cancelled successfully");
      utils.sessions.get.invalidate();
      utils.sessions.list.invalidate();
      setLocation(isTutorRoute ? "/tutor/sessions" : "/student/sessions");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel session");
    },
  });

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  const isTutor = session.tutorId === user?.id;
  const canComplete = session.status === "CONFIRMED";
  const canCancel = (session.status === "PENDING" || session.status === "CONFIRMED");
  const needsRating = session.status === "PENDING_RATING" && 
    (isTutor ? !session.tutorRated : !session.studentRated);
  const needsCancellationRating = session.status === "CANCELLED" && 
    !session.cancellationRated && 
    session.cancelledBy !== user?.id;

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate({ sessionId, message });
  };

  const handleComplete = () => {
    completeMutation.mutate({ sessionId });
  };

  const handleRate = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    const targetId = isTutor ? session.studentId : session.tutorId;
    rateMutation.mutate({
      sessionId,
      targetId,
      score: rating,
      comment: ratingComment,
    });
  };

  const handleRateCancellation = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    rateCancellationMutation.mutate({
      sessionId,
      score: rating,
      comment: ratingComment,
    });
  };

  const handleCancel = () => {
    cancelMutation.mutate({
      sessionId,
      reason: cancelReason || undefined,
    });
    setShowCancelDialog(false);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">{APP_TITLE}</h1>
          </Link>
          <Link href={isTutor ? "/tutor/sessions" : "/student/sessions"}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Button>
          </Link>
        </div>
      </header>

      <div className="container py-8 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{session.course}</CardTitle>
                    <CardDescription>Session Details</CardDescription>
                  </div>
                  <Badge className={STATUS_COLORS[session.status]}>
                    {session.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Student</p>
                    <p className="font-semibold">{session.studentName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tutor</p>
                    <p className="font-semibold">{session.tutorName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-semibold">
                      {formatDatePT(session.startTime)} (PT)
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-semibold">
                      {formatTimePT(session.startTime)} - {formatTimePT(session.endTime)} PT
                    </p>
                  </div>
                </div>

                {canComplete && (
                  <div className="pt-4 border-t">
                    <Button onClick={handleComplete} disabled={completeMutation.isPending}>
                      Mark as Complete
                    </Button>
                  </div>
                )}

                {canCancel && (
                  <div className="pt-4 border-t">
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowCancelDialog(true)}
                    >
                      Cancel Session
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {needsCancellationRating && (
              <Card className="border-orange-500/50">
                <CardHeader>
                  <CardTitle>⚠️ Rate Cancellation</CardTitle>
                  <CardDescription>
                    The other party cancelled this session. Rate their cancellation behavior.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {session.cancelReason && (
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm font-medium mb-1">Cancellation Reason:</p>
                      <p className="text-sm text-muted-foreground">{session.cancelReason}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium mb-2">Rating</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= rating
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Comment (Optional)</p>
                    <Textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="How do you feel about this cancellation?..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleRateCancellation} disabled={rateCancellationMutation.isPending}>
                    Submit Cancellation Rating
                  </Button>
                </CardContent>
              </Card>
            )}

            {needsRating && (
              <Card className="border-yellow-500/50">
                <CardHeader>
                  <CardTitle>⭐ Rate This Session</CardTitle>
                  <CardDescription>Your rating is required to close this session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Rating</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= rating
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Comment (Optional)</p>
                    <Textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Share your experience..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleRate} disabled={rateMutation.isPending}>
                    Submit Rating
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Chat</CardTitle>
                <CardDescription>
                  {session.status === "CONFIRMED" 
                    ? "Communicate with your " + (isTutor ? "student" : "tutor")
                    : "Chat will be available once the session is confirmed"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 h-96 overflow-y-auto bg-muted/30">
                    {messages && messages.length > 0 ? (
                      <div className="space-y-3">
                        {messages.map((msg) => {
                          const isMyMessage = msg.senderId === user?.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                  isMyMessage
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-white border"
                                }`}
                              >
                                <p className="text-sm">{msg.message}</p>
                                <p className="text-xs mt-1 opacity-70">
                                  {formatTimePT(msg.createdAt)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground text-sm">No messages yet</p>
                      </div>
                    )}
                  </div>

                  {session.status === "CONFIRMED" && (
                    <div className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage} disabled={sendMessageMutation.isPending}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={STATUS_COLORS[session.status]}>
                    {session.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>{formatDateTimePT(session.createdAt)}</p>
                </div>
                {session.status === "PENDING_RATING" && (
                  <div>
                    <p className="text-muted-foreground">Ratings</p>
                    <p>Student: {session.studentRated ? "✓" : "Pending"}</p>
                    <p>Tutor: {session.tutorRated ? "✓" : "Pending"}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {session.status === "DISPUTED" && (
              <Card className="border-red-500/50">
                <CardHeader>
                  <CardTitle className="text-red-700">⚠️ Disputed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This session is under review. Admin will resolve the dispute.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this session? This action can only be done 12+ hours before the session starts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason (Optional)</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Let the other party know why you're cancelling..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                className="flex-1"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
              >
                Keep Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

