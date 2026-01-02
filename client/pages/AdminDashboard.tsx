import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Users,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Candidate {
  id: number;
  name: string;
  position: string;
  status: "applied" | "screening" | "technical" | "hr" | "selected" | "rejected";
  appliedDate: string;
  addedBy: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [userName] = useState(
    JSON.parse(localStorage.getItem("user") || "{}").name || "Admin"
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Mock data
  const stats = [
    {
      label: "Total Candidates",
      value: "248",
      icon: <FileText size={24} />,
      color: "bg-blue-100",
      iconColor: "text-primary",
    },
    {
      label: "HR Users",
      value: "12",
      icon: <Users size={24} />,
      color: "bg-purple-100",
      iconColor: "text-secondary",
    },
    {
      label: "Selected",
      value: "45",
      icon: <CheckCircle size={24} />,
      color: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "In Progress",
      value: "89",
      icon: <TrendingUp size={24} />,
      color: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  const candidateStatusData = [
    { name: "Applied", value: 45, color: "#3b82f6" },
    { name: "Screening", value: 38, color: "#a855f7" },
    { name: "Technical", value: 32, color: "#06b6d4" },
    { name: "HR Round", value: 28, color: "#f59e0b" },
    { name: "Selected", value: 45, color: "#10b981" },
    { name: "Rejected", value: 60, color: "#ef4444" },
  ];

  const trendData = [
    { month: "Jan", candidates: 20 },
    { month: "Feb", candidates: 35 },
    { month: "Mar", candidates: 48 },
    { month: "Apr", candidates: 52 },
    { month: "May", candidates: 65 },
    { month: "Jun", candidates: 78 },
  ];

  const recentCandidates: Candidate[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Senior Developer",
      status: "screening",
      appliedDate: "2024-01-15",
      addedBy: "John Doe",
    },
    {
      id: 2,
      name: "Mike Chen",
      position: "Product Manager",
      status: "technical",
      appliedDate: "2024-01-14",
      addedBy: "Jane Smith",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "UX Designer",
      status: "applied",
      appliedDate: "2024-01-13",
      addedBy: "John Doe",
    },
    {
      id: 4,
      name: "David Lee",
      position: "Backend Engineer",
      status: "hr",
      appliedDate: "2024-01-12",
      addedBy: "Jane Smith",
    },
    {
      id: 5,
      name: "Lisa Park",
      position: "DevOps Engineer",
      status: "selected",
      appliedDate: "2024-01-11",
      addedBy: "John Doe",
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
      userRole="admin"
      pageTitle="Dashboard"
      userName={userName}
      onLogout={handleLogout}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} rounded-lg p-3 ${stat.iconColor}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Candidate Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Candidate Applications Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="candidates"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Candidate Status Pie Chart */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Candidate Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={candidateStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {candidateStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Candidates Table */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Recent Candidates
          </h3>
          <a
            href="/admin/candidates"
            className="text-primary hover:underline font-medium text-sm"
          >
            View All
          </a>
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
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Added By
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
                  <td className="py-4 px-4 text-muted-foreground">
                    {candidate.addedBy}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button className="inline-flex items-center gap-2 text-primary hover:underline">
                      <Eye size={16} />
                      <span className="text-sm">View</span>
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
