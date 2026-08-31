import { Menu, LogOut, User } from "lucide-react";
import { Button } from "./ui";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { adminName, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        
        <h1 className="text-lg font-semibold text-text-primary hidden sm:block">
          School Timetable Management System
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
          <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
            <User className="size-4" />
          </div>
          <span className="text-sm font-semibold text-text-primary">
            {adminName}
          </span>
        </div>

        <Button variant="ghost" onClick={handleLogout} className="gap-2 text-danger hover:bg-danger-light hover:text-danger border border-transparent hover:border-danger/20 transition-all duration-200">
          <LogOut className="size-4" aria-hidden="true" />
          <span className="hidden sm:block font-medium">Logout</span>
        </Button>
      </div>
    </header>
  );
}

export default Navbar;