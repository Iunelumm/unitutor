import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import TutorDashboard from "./pages/TutorDashboard";
import StudentProfile from "./pages/StudentProfile";
import TutorProfile from "./pages/TutorProfile";
import FindTutors from "./pages/FindTutors";
import Sessions from "./pages/Sessions";
import SessionDetail from "./pages/SessionDetail";
import Support from "./pages/Support";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/student"} component={StudentDashboard} />
      <Route path={"/student/profile"} component={StudentProfile} />
      <Route path={"/student/find-tutors"} component={FindTutors} />
      <Route path={"/student/sessions"} component={Sessions} />
      <Route path={"/tutor"} component={TutorDashboard} />
      <Route path={"/tutor/profile"} component={TutorProfile} />
      <Route path={"/tutor/sessions"} component={Sessions} />
      <Route path={"/sessions/:id"} component={SessionDetail} />
      <Route path={"/support"} component={Support} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

