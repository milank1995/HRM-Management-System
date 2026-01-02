import { Bell, Search, Settings, User } from "lucide-react";

interface NavbarProps {
  title: string;
  userName?: string;
  userRole?: "admin" | "hr" | "interviewer";
}

export const Navbar = ({ title, userName = "User", userRole = "admin" }: NavbarProps) => {
  return (
    <div className="fixed left-64 right-0 top-0 h-16 bg-background border-b border-border flex items-center justify-between px-8 z-40">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-56">
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm text-foreground placeholder-muted-foreground w-full"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
          <Bell size={20} className="text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* Settings */}
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Settings size={20} className="text-foreground" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
          </div>
          <button className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white hover:shadow-lg transition-shadow">
            <User size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
