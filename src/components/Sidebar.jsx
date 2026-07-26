import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  UserPlus, 
  Building2, 
  BookOpen, 
  Calendar,
  Menu,
  X,
  School,Link2,
  CalendarCheck
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Teachers", href: "/teachers", icon: UserPlus },
  { name: "Subjects", href: "/subjects", icon: BookOpen },
  { name: "Classes", href: "/classes", icon: Building2 },
  { name: "Mapping", href: "/mapping", icon: Link2 },
  { name: "Consolidated Timetable", href: "/consolidated-timetable", icon: Calendar },
  { name: "Fixed Slots", href: "/fixed-slots", icon: CalendarCheck },
];

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <aside className={`fixed left-0 top-0 z-50 h-screen bg-sidebar transition-all duration-300 flex flex-col ${isCollapsed ? "lg:w-20 w-64" : "w-64"} ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl">
              <School className="size-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-white">Timetable</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? <Menu className="size-5" /> : <X className="size-5" />}
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin" aria-label="Main navigation">
        <ul className="space-y-1" role="list">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024 && onClose) onClose();
                  }}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                    }
                    ${isCollapsed ? "lg:justify-center" : ""}
                  `}
                  title={isCollapsed ? item.name : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="size-5 flex-shrink-0" aria-hidden="true" />
                  {!isCollapsed && <span className="font-medium">{item.name}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <div className="rounded-xl bg-white/5 p-4">
          {!isCollapsed ? (
            <div className="text-center">
              <p className="text-white/70 text-sm mb-2">School ERP System</p>
              <p className="text-white/50 text-xs">v1.0.0</p>
            </div>
          ) : (
            <div className="text-center">
              <School className="size-6 text-white/70 mx-auto" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;