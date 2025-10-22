import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, ArrowLeft, Send, Star } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

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
  const [, params] = useRoute("/sessions/:id");
  const [, setLocation] = useLocation();
  const sessionId = params?.id ? parseInt(params.id) : 0;
  const utils = trpc.useUtils();

  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  const { data: session } = trpc.sessions.get.useQuery(
    { sessionId },
    { enabled: isAuthenticated && sessionId > 0 }
  );

  const { data: messages } = trpc.chat.getMessages.useQuery(
    { sessionId },
    { enabled: isAuthenticated && sessionId > 0, refetchInterval: 3000 }
  );

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
      setLocation(window.location.pathname.includes("/tutor") ? "/tutor/sessions" : "/student/sessions");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit rating");
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
  const needsRating = session.status === "PENDING_RATING" && 
    (isTutor ? !session.tutorRated : !session.studentRated);

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
                      {new Date(session.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-semibold">
                      {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              </CardContent>
            </Card>

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
                                  {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
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
                  <p>{new Date(session.createdAt).toLocaleDateString()}</p>
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
    </div>
  );
}

