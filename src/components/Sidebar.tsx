
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Target, 
  Calendar, 
  Award, 
  User, 
  PlayCircle 
} from "lucide-react";

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Target, label: "Goals", href: "/set-goal" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: Award, label: "Certificates", href: "/certificates" },
  { icon: User, label: "Profile", href: "/profile" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-100 h-screen fixed left-0 top-0 z-40">
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <PlayCircle className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-gray-900">Yudoku</span>
        </Link>
      </div>
      
      <nav className="px-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary text-white" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-primary"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
