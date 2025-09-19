import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/AuthProvider";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import CareersPage from "@/pages/careers";
import ProfilePage from "@/pages/profile";
import ProfileEditPage from "@/pages/profile-edit";
import RoadmapPage from "@/pages/roadmap";
import { ProfileSummary } from "@/components/dashboard/ProfileSummary";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/roadmap" component={RoadmapPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/profile/edit" component={ProfileEditPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
