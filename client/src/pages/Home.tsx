import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { BookOpen, Calendar, Star, Users, Shield, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
                {user?.role === "admin" ? (
                  <Link href="/admin">
                    <Button>Admin Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/student">
                      <Button variant="outline">Student</Button>
                    </Link>
                    <Link href="/tutor">
                      <Button variant="outline">Tutor</Button>
                    </Link>
                  </>
                )}
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Sign In</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container text-center">
          <h2 className="text-5xl font-bold mb-6 text-balance">
            Academic Tutoring for <span className="text-primary">UCSB Students</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with qualified tutors for any course. Build your academic success with transparent ratings, 
            flexible scheduling, and a trusted community.
          </p>
          {!isAuthenticated && (
            <a href={getLoginUrl()}>
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose UniTutor?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Course-Based Matching</CardTitle>
                <CardDescription>
                  Find tutors who specialize in your exact courses, from CMPSC to MATH to ECON
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Flexible Scheduling</CardTitle>
                <CardDescription>
                  Book sessions that fit your schedule with our week-day-hour availability system
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Star className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Transparent Ratings</CardTitle>
                <CardDescription>
                  Make informed decisions with public tutor ratings and verified session reviews
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Trust & Safety</CardTitle>
                <CardDescription>
                  Built-in protections ensure on-platform engagement and fair dispute resolution
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Direct Communication</CardTitle>
                <CardDescription>
                  Chat with your tutor to coordinate details and build a learning relationship
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <CardTitle>No Payment Hassle</CardTitle>
                <CardDescription>
                  Focus on learning - coordinate payment details directly with your tutor
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h4 className="text-2xl font-semibold mb-6 text-primary">For Students</h4>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">1</span>
                  <div>
                    <strong>Create Your Profile</strong>
                    <p className="text-muted-foreground">Add your courses, availability, and price range</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">2</span>
                  <div>
                    <strong>Find a Tutor</strong>
                    <p className="text-muted-foreground">Search by course and review tutor profiles and ratings</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">3</span>
                  <div>
                    <strong>Book a Session</strong>
                    <p className="text-muted-foreground">Request a time slot and wait for tutor confirmation</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">4</span>
                  <div>
                    <strong>Learn & Rate</strong>
                    <p className="text-muted-foreground">Complete your session and rate your experience</p>
                  </div>
                </li>
              </ol>
            </div>

            <div>
              <h4 className="text-2xl font-semibold mb-6 text-primary">For Tutors</h4>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">1</span>
                  <div>
                    <strong>Set Up Your Profile</strong>
                    <p className="text-muted-foreground">List your expertise, rates, and available time slots</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">2</span>
                  <div>
                    <strong>Receive Requests</strong>
                    <p className="text-muted-foreground">Get notified when students request your help</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">3</span>
                  <div>
                    <strong>Confirm & Teach</strong>
                    <p className="text-muted-foreground">Accept sessions that fit your schedule</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">4</span>
                  <div>
                    <strong>Build Your Reputation</strong>
                    <p className="text-muted-foreground">Earn ratings and credit points for completed sessions</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="container text-center">
          <h3 className="text-4xl font-bold mb-6">Ready to Start Learning?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join the UCSB community of students and tutors today
          </p>
          {!isAuthenticated && (
            <a href={getLoginUrl()}>
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Sign Up Now
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 UniTutor. Built for UCSB students.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/support">
              <a className="hover:text-foreground transition-colors">Support</a>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

