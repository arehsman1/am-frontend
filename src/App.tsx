import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { Navigate } from "react-router-dom";
import Login from "./pages/Login.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Signup from "./pages/Signup.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminReports from "./pages/admin/AdminReports.tsx";
import AdminRoles from "./pages/admin/AdminRoles.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import DashboardMale from "./pages/DashboardMale.tsx";
import DashboardFemale from "./pages/DashboardFemale.tsx";
import Requests from "./pages/Requests.tsx";
import Matches from "./pages/Matches.tsx";
import Messages from "./pages/Messages.tsx";
import Profile from "./pages/Profile.tsx";
import PublicProfile from "./pages/PublicProfile.tsx";
import Explore from "./pages/Explore.tsx";
import Wallet from "./pages/Wallet.tsx";
import Settings from "./pages/Settings.tsx";
import About from "./pages/static/About.tsx";
import Careers from "./pages/static/Careers.tsx";
import Press from "./pages/static/Press.tsx";
import Contact from "./pages/static/Contact.tsx";
import Privacy from "./pages/static/Privacy.tsx";
import Terms from "./pages/static/Terms.tsx";
import Cookies from "./pages/static/Cookies.tsx";
import Guidelines from "./pages/static/Guidelines.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/press" element={<Press />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/guidelines" element={<Guidelines />} />

            {/* Onboarding (auth required, but onboarded check disabled) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireOnboarded={false}>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* App (auth + onboarded required) — /dashboard is deprecated, send to /explore */}
            <Route path="/dashboard" element={<Navigate to="/explore" replace />} />
            <Route path="/dashboard-f" element={<Navigate to="/explore" replace />} />
            <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/messages/:conversationId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/u/:userId" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
            <Route path="/admin/roles" element={<AdminRoute requireAdmin><AdminRoles /></AdminRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Analytics />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
