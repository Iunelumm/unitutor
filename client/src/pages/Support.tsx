import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "How do I book a tutoring session?",
    answer: "Go to 'Find Tutors', search for a course, select a tutor, and click 'Book Session'. The tutor will receive your request and can confirm or decline it."
  },
  {
    question: "What is the 4-hour booking rule?",
    answer: "You must book sessions at least 4 hours in advance. This gives tutors enough time to prepare and prevents last-minute cancellations."
  },
  {
    question: "Can I cancel a confirmed session?",
    answer: "Yes, but you must cancel at least 12 hours before the session start time. Cancellations within 12 hours require direct coordination with your tutor/student."
  },
  {
    question: "Why are ratings mandatory?",
    answer: "Both students and tutors must rate each session to maintain platform quality and accountability. Ratings help build trust and improve the tutoring experience."
  },
  {
    question: "What are credit points?",
    answer: "Credit points are awarded after completing and rating sessions. They serve as a reputation indicator showing your active participation on the platform."
  },
  {
    question: "Why is my chat message blocked?",
    answer: "The system blocks contact information (phone numbers, emails, social media) until you complete your first session together. This protects both parties and ensures platform safety."
  },
  {
    question: "What happens if there's a dispute?",
    answer: "If one person marks a session complete and the other doesn't, the session enters 'DISPUTED' status. Admin will review and resolve the dispute."
  },
  {
    question: "How do I become a tutor?",
    answer: "Click 'Switch to Tutor' from your student dashboard, then complete your tutor profile with your courses, availability, and hourly rate."
  },
];

export default function Support() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const utils = trpc.useUtils();

  const createTicketMutation = trpc.tickets.create.useMutation({
    onSuccess: () => {
      toast.success("Support ticket submitted! We'll get back to you soon.");
      setSubject("");
      setDescription("");
      utils.tickets.list.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit ticket");
    },
  });

  const { data: myTickets } = trpc.tickets.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    createTicketMutation.mutate({ 
      category: "technical",
      subject, 
      message: description 
    });
  };

  const isTutor = window.location.pathname.includes("/tutor");

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

      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Support & Help</h2>
          <p className="text-muted-foreground">Find answers to common questions or submit a support ticket</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {FAQ_ITEMS.map((item, index) => (
                  <div key={index} className="border rounded-lg">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="font-medium">{item.question}</span>
                      </div>
                      {expandedFAQ === index ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-4 pb-4 pt-2 text-sm text-muted-foreground border-t">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Ticket</CardTitle>
              <CardDescription>Can't find an answer? Contact our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide details about your issue..."
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" disabled={createTicketMutation.isPending}>
                  {createTicketMutation.isPending ? "Submitting..." : "Submit Ticket"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {myTickets && myTickets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>My Support Tickets</CardTitle>
                <CardDescription>Track your submitted tickets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myTickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{ticket.subject}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          ticket.status === "pending" 
                            ? "bg-yellow-100 text-yellow-800"
                            : ticket.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                          {ticket.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{ticket.message}</p>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                      {ticket.adminResponse && (
                        <div className="mt-3 p-3 bg-muted/50 rounded border-l-4 border-primary">
                          <p className="text-sm font-medium mb-1">Admin Response:</p>
                          <p className="text-sm">{ticket.adminResponse}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

