import { Menu, LogOut } from "lucide-react";
import { Button } from "./ui";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
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
      
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" onClick={handleLogout} className="gap-2 text-danger hover:bg-danger-light hover:text-danger border border-transparent hover:border-danger/20 transition-all duration-200">
          <LogOut className="size-4" aria-hidden="true" />
          <span className="hidden sm:block font-medium">Logout</span>
        </Button>
      </div>
    </header>
  );
}

export default Navbar;