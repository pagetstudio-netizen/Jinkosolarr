import { useLocation } from "wouter";
import { Home, Target, Users, Diamond, User } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Accueil" },
  { path: "/tasks", icon: Target, label: "Mission" },
  { path: "/team", icon: Users, label: "Equipe" },
  { path: "/invest", icon: Diamond, label: "VIP" },
  { path: "/account", icon: User, label: "Moi" },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 bottom-nav z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive 
                  ? "text-red-600" 
                  : "text-gray-400"
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? "text-red-600" : "text-gray-400"}`} />
              <span className={`text-xs ${isActive ? "font-medium text-red-600" : "text-gray-400"}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
