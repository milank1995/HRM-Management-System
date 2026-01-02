import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import HRDashboard from "./pages/HRDashboard";
import UsersManagement from "./pages/usersManagement";
import CandidateList from "./pages/CandidateList";
import AddCandidate from "./pages/AddCandidate";
import CandidateDetails from "./pages/CandidateDetails";
import EditCandidate from "./pages/EditCandidate";
import AddInterviewRound from "./pages/AddInterviewRound";
import ResumeViewer from "./pages/ResumeViewer";
import Settings from "./pages/Settings";
import InterviewerDashboard from "./pages/InterviewerDashboard";
import InterviewerCandidateView from "./pages/InterviewerCandidateView";
import NotFound from "./pages/NotFound";
import { ListInterview } from "./pages/ListInterview";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({
  element,
  userRole,
}: {
  element: React.ReactNode;
  userRole?: "admin" | "hr" | "interviewer" | "both";
}) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return <Navigate to="/login" />;
  // if (userRole && user.role !== userRole) {
  //   return <Navigate to="/login" />;
  // }
  return element;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute element={<AdminDashboard />} userRole="admin" />
            }
          />
          <Route
            path="/admin/users"
            element={ <ProtectedRoute element={<UsersManagement />} userRole="admin" />
            }
          />
          <Route
            path="/admin/candidates"
            element={
              <ProtectedRoute element={<CandidateList />} userRole="admin" />
            }
          />
          <Route
            path="/admin/settings"
            element={<ProtectedRoute element={<Settings />} userRole="admin" />}
          />
           <Route
            path="/admin/interview"
            element={<ProtectedRoute element={<ListInterview />} userRole="admin" />}
          />

          {/* HR Routes */}
          <Route
            path="/hr/dashboard"
            element={<ProtectedRoute element={<HRDashboard />} userRole="hr" />}
          />
          <Route
            path="/hr/candidates"
            element={
              <ProtectedRoute element={<CandidateList />} userRole="hr" />
            }
          />
          <Route
            path="/hr/settings"
            element={<ProtectedRoute element={<Settings />} userRole="hr" />}
          />

          {/* Shared Routes (Both Admin and HR) */}
          <Route
            path="/candidate/add"
            element={
              <ProtectedRoute element={<AddCandidate />} userRole="both" />
            }
          />
          <Route
            path="/candidate/:id"
            element={
              <ProtectedRoute element={<CandidateDetails />} userRole="both" />
            }
          />
          <Route
            path="/candidate/:id/edit"
            element={
              <ProtectedRoute element={<EditCandidate />} userRole="both" />
            }
          />
          <Route
            path="/candidate/:id/resume"
            element={
              <ProtectedRoute element={<ResumeViewer />} userRole="both" />
            }
          />
          <Route
            path="/candidate/:candidateId/interview/add"
            element={
              <ProtectedRoute element={<AddInterviewRound />} userRole="both" />
            }
          />

          {/* Interviewer Routes */}
          <Route
            path="/interviewer/dashboard"
            element={
              <ProtectedRoute
                element={<InterviewerDashboard />}
                userRole="interviewer"
              />
            }
          />
          <Route
            path="/interviewer/candidates"
            element={
              <ProtectedRoute
                element={<InterviewerDashboard />}
                userRole="interviewer"
              />
            }
          />
          <Route
            path="/interviewer/candidate/:id"
            element={
              <ProtectedRoute
                element={<InterviewerCandidateView />}
                userRole="interviewer"
              />
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
