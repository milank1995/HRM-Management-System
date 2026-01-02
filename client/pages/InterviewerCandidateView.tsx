import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { InterviewerFeedbackModal } from "@/components/InterviewerFeedbackModal";
import { Download, MessageSquare, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InterviewerCandidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  experience: number;
  skills: string[];
  position: string;
}

interface InterviewRound {
  id: number;
  name: string;
  interviewDate: string;
  status: "pending" | "completed";
}

export default function InterviewerCandidateView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName] = useState(
    JSON.parse(localStorage.getItem("user") || "{}").name || "Interviewer"
  );
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(
    searchParams.get("feedback") === "true"
  );

  // Mock candidate data - only non-sensitive information
  const [candidate] = useState<InterviewerCandidate>({
    id: parseInt(id || "1"),
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1 (555) 123-4567",
    experience: 5,
    skills: ["React", "Node.js", "TypeScript", "MongoDB"],
    position: "Senior Developer",
  });

  const [interviewRound] = useState<InterviewRound>({
    id: 1,
    name: "Technical Assessment",
    interviewDate: "2024-01-20",
    status: "pending",
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleFeedbackSubmit = (data: {
    score: number;
    status: string;
    feedback: string;
  }) => {
    console.log("Feedback submitted:", data);
    toast({
      title: "Feedback submitted successfully!",
      description: "Your interview feedback has been recorded.",
    });
    setIsFeedbackOpen(false);
    navigate("/interviewer/dashboard");
  };

  const userRole = JSON.parse(localStorage.getItem("user") || "{}").userType || "interviewer";

  return (
    <MainLayout
      userRole={userRole as "admin" | "hr" | "interviewer"}
      pageTitle="Candidate Profile"
      userName={userName}
      onLogout={handleLogout}
    >
      <div className="space-y-6 max-w-4xl">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary hover:underline font-medium mb-4"
          >
            <ChevronLeft size={20} />
            Back to Dashboard
          </button>
        </div>

        {/* Candidate Header Card */}
        <div className="bg-white rounded-xl shadow-card p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {candidate.name}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                {candidate.position}
              </p>
            </div>

            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition-shadow">
              <Download size={20} />
              View Resume
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-muted-foreground mb-2">Email</p>
            <p className="text-lg font-semibold text-foreground">
              {candidate.email}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-muted-foreground mb-2">Phone</p>
            <p className="text-lg font-semibold text-foreground">
              {candidate.phone}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-muted-foreground mb-2">Experience</p>
            <p className="text-lg font-semibold text-foreground">
              {candidate.experience} years
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-muted-foreground mb-2">Position Applied</p>
            <p className="text-lg font-semibold text-foreground">
              {candidate.position}
            </p>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Technical Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Interview Round Details */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Interview Details
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
              <div>
                <p className="font-semibold text-foreground">
                  {interviewRound.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Scheduled: {interviewRound.interviewDate}
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  interviewRound.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {interviewRound.status.charAt(0).toUpperCase() +
                  interviewRound.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Submit Feedback Button */}
          {interviewRound.status === "pending" && (
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-secondary to-secondary/90 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
            >
              <MessageSquare size={20} />
              Submit Interview Feedback
            </button>
          )}

          {interviewRound.status === "completed" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Feedback has been submitted for this interview round
              </p>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> You can only view profile information relevant
            to the interview process. Sensitive HR information is restricted.
          </p>
        </div>
      </div>

      {/* Feedback Modal */}
      <InterviewerFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
        candidateName={candidate.name}
        interviewRound={interviewRound.name}
      />
    </MainLayout>
  );
}
