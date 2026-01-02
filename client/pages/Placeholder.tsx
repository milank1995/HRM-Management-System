import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { AlertCircle } from "lucide-react";

interface PlaceholderProps {
  pageTitle: string;
  userRole: "admin" | "hr";
  pageName: string;
  userName?: string;
}

export const Placeholder = ({
  pageTitle,
  userRole,
  pageName,
  userName = "User",
}: PlaceholderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <MainLayout
      userRole={userRole}
      pageTitle={pageTitle}
      userName={userName}
      onLogout={handleLogout}
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white rounded-xl shadow-card p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {pageName}
          </h2>
          <p className="text-muted-foreground mb-6">
            This page is coming soon. Continue building this feature by chatting with the AI assistant.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full py-2 px-4 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
          >
            Go Back
          </button>
        </div>
      </div>
    </MainLayout>
  );
};
