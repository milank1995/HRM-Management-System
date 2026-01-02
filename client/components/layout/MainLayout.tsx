import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface MainLayoutProps {
  children: ReactNode;
  userRole: "admin" | "hr" | "interviewer";
  pageTitle: string;
  userName?: string;
  onLogout: () => void;
}

export const MainLayout = ({
  children,
  userRole,
  pageTitle,
  userName,
  onLogout,
}: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar userRole={userRole} onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Navbar */}
        <Navbar title={pageTitle} userName={userName} userRole={userRole} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pt-20 pb-8">
          <div className="px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
