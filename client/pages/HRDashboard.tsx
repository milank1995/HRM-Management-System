import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Filter,
} from "lucide-react";

interface Candidate {
  id: number;
  name: string;
  position: string;
  status: "applied" | "screening" | "technical" | "hr" | "selected" | "rejected";
  appliedDate: string;
}

export default function HRDashboard() {
  const navigate = useNavigate();
  const [userName] = useState(
    JSON.parse(localStorage.getItem("user") || "{}").name || "HR User"
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Mock data
  const statusCards = [
    {
      label: "Applied",
      value: "45",
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: <FileText size={24} />,
    },
    {
      label: "Screening",
      value: "38",
      color: "bg-purple-100",
      iconColor: "text-purple-600",
      icon: <Users size={24} />,
    },
    {
      label: "Technical",
      value: "32",
      color: "bg-cyan-100",
      iconColor: "text-cyan-600",
      icon: <Clock size={24} />,
    },
    {
      label: "HR Round",
      value: "28",
      color: "bg-orange-100",
      iconColor: "text-orange-600",
      icon: <Users size={24} />,
    },
    {
      label: "Selected",
      value: "45",
      color: "bg-green-100",
      iconColor: "text-green-600",
      icon: <CheckCircle size={24} />,
    },
    {
      label: "Rejected",
      value: "60",
      color: "bg-red-100",
      iconColor: "text-red-600",
      icon: <XCircle size={24} />,
    },
  ];

  const recentCandidates: Candidate[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Senior Developer",
      status: "screening",
      appliedDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Mike Chen",
      position: "Product Manager",
      status: "technical",
      appliedDate: "2024-01-14",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "UX Designer",
      status: "applied",
      appliedDate: "2024-01-13",
    },
    {
      id: 4,
      name: "David Lee",
      position: "Backend Engineer",
      status: "hr",
      appliedDate: "2024-01-12",
    },
    {
      id: 5,
      name: "Lisa Park",
      position: "DevOps Engineer",
      status: "selected",
      appliedDate: "2024-01-11",
    },
  ];

  const getStatusColor = (
    status: "applied" | "screening" | "technical" | "hr" | "selected" | "rejected"
  ) => {
    const colors = {
      applied: "bg-blue-100 text-blue-800",
      screening: "bg-purple-100 text-purple-800",
      technical: "bg-cyan-100 text-cyan-800",
      hr: "bg-orange-100 text-orange-800",
      selected: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  return (
    <MainLayout
      userRole="hr"
      pageTitle="Dashboard"
      userName={userName}
      onLogout={handleLogout}
    >
      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statusCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {card.value}
                </p>
              </div>
              <div className={`${card.color} rounded-lg p-3 ${card.iconColor}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Candidates Section */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Recent Candidates
          </h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-slate-300 transition-colors">
            <Filter size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Position
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Applied Date
                </th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {recentCandidates.map((candidate) => (
                <tr
                  key={candidate.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="py-4 px-4 text-foreground font-medium">
                    {candidate.name}
                  </td>
                  <td className="py-4 px-4 text-foreground">
                    {candidate.position}
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
                  <td className="py-4 px-4 text-muted-foreground">
                    {candidate.appliedDate}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button className="inline-block text-primary hover:underline font-medium text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
