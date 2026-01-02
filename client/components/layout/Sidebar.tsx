import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Building2,
  Calendar,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  userRole: "admin" | "hr" | "interviewer";
  onLogout: () => void;
}

export const Sidebar = ({ userRole, onLogout }: SidebarProps) => {
  const location = useLocation();

  const navItems: NavItem[] =
    userRole === "admin"
      ? [
          {
            label: "Dashboard",
            path: "/admin/dashboard",
            icon: <LayoutDashboard size={20} />,
          },
          {
            label: "Users",
            path: "/admin/users",
            icon: <Users size={20} />,
          },
          {
            label: "Candidates",
            path: "/admin/candidates",
            icon: <FileText size={20} />,
          },
          {
            label: "Settings",
            path: "/admin/settings",
            icon: <Settings size={20} />,
          },
          {
            label: "Interview",
            path: "/admin/interview",
            icon: <Calendar size={20} />,
          }
        ]
      : userRole === "hr"
        ? [
            {
              label: "Dashboard",
              path: "/hr/dashboard",
              icon: <LayoutDashboard size={20} />,
            },
            {
              label: "Candidates",
              path: "/hr/candidates",
              icon: <FileText size={20} />,
            },
            {
              label: "Settings",
              path: "/hr/settings",
              icon: <Settings size={20} />,
            },
          ]
        : [
            {
              label: "Dashboard",
              path: "/interviewer/dashboard",
              icon: <LayoutDashboard size={20} />,
            },
            {
              label: "Assigned Candidates",
              path: "/interviewer/candidates",
              icon: <FileText size={20} />,
            },
          ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Building2 size={20} className="text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-white text-sm">HRM</h1>
            <p className="text-xs text-sidebar-foreground opacity-70">
              Management System
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              isActive(item.path)
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={onLogout}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};
