import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Eye, MessageSquare } from "lucide-react";

interface AssignedCandidate {
  id: number;
  name: string;
  email: string;
  position: string;
  roundName: string;
  interviewDate: string;
  status: "pending" | "completed";
}

export default function InterviewerDashboard() {
  const navigate = useNavigate();
  const [userName] = useState(
    JSON.parse(localStorage.getItem("user") || "{}").name || "Interviewer"
  );

  const [candidates] = useState<AssignedCandidate[]>([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      position: "Senior Developer",
      roundName: "Technical Assessment",
      interviewDate: "2024-01-20",
      status: "pending",
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike@example.com",
      position: "Product Manager",
      roundName: "Initial Screening",
      interviewDate: "2024-01-18",
      status: "completed",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily@example.com",
      position: "UX Designer",
      roundName: "HR Round",
      interviewDate: "2024-01-22",
      status: "pending",
    },
    {
      id: 4,
      name: "David Lee",
      email: "david@example.com",
      position: "Backend Engineer",
      roundName: "Technical Assessment",
      interviewDate: "2024-01-19",
      status: "completed",
    },
  ]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const pendingCount = candidates.filter((c) => c.status === "pending").length;
  const completedCount = candidates.filter((c) => c.status === "completed").length;

  const getStatusColor = (status: string) => {
    return status === "completed"
      ? "bg-green-100 text-green-800"
      : "bg-orange-100 text-orange-800";
  };

  return (
    <MainLayout
      userRole="interviewer"
      pageTitle="Dashboard"
      userName={userName}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Interview Schedule
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage assigned candidate interviews
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Assigned</p>
            <p className="text-3xl font-bold text-foreground">
              {candidates.length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completedCount}</p>
          </div>
        </div>

        {/* Assigned Candidates Table */}
        <div className="bg-white rounded-xl shadow-card p-6 overflow-hidden">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Assigned Candidates
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Position
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Interview Round
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4 px-4 text-foreground font-medium">
                      {candidate.name}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {candidate.email}
                    </td>
                    <td className="py-4 px-4 text-foreground">
                      {candidate.position}
                    </td>
                    <td className="py-4 px-4 text-foreground">
                      {candidate.roundName}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {candidate.interviewDate}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          candidate.status
                        )}`}
                      >
                        {candidate.status.charAt(0).toUpperCase() +
                          candidate.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/interviewer/candidate/${candidate.id}`}
                          className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-sm"
                        >
                          <Eye size={16} />
                          View
                        </Link>
                        {candidate.status === "pending" && (
                          <Link
                            to={`/interviewer/candidate/${candidate.id}?feedback=true`}
                            className="inline-flex items-center gap-1 text-secondary hover:underline font-medium text-sm"
                          >
                            <MessageSquare size={16} />
                            Feedback
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {candidates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No candidates assigned</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
