import { Menu, Bell, Moon, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { Button } from "./ui";

function Navbar({ onMenuClick }) {
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
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" aria-hidden="true" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" aria-hidden="true" />
        </Button>
        
        <Button variant="ghost" size="icon">
          <Moon className="size-5" aria-hidden="true" />
        </Button>
        
        <div className="relative">
          <Button variant="ghost" className="gap-2 pr-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="size-4 text-white" aria-hidden="true" />
            </div>
            <span className="hidden sm:block font-medium text-text-primary">Admin</span>
            <ChevronDown className="size-4" aria-hidden="true" />
          </Button>
          
          <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl border border-border shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200" role="menu">
            <button className="flex items-center gap-3 px-4 py-2 text-text-primary hover:bg-slate-50 w-full text-left" role="menuitem">
              <User className="size-4" aria-hidden="true" />
              Profile
            </button>
            <button className="flex items-center gap-3 px-4 py-2 text-text-primary hover:bg-slate-50 w-full text-left" role="menuitem">
              <Settings className="size-4" aria-hidden="true" />
              Settings
            </button>
            <hr className="my-2 border-border" />
            <button className="flex items-center gap-3 px-4 py-2 text-danger hover:bg-danger-light w-full text-left" role="menuitem">
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;