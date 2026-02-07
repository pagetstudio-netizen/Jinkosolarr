import { useLocation } from "wouter";
import { Home, Cloudy, Users, User } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "" },
  { path: "/invest", icon: Cloudy, label: "Produit" },
  { path: "/team", icon: Users, label: "\u00c9quipe" },
  { path: "/account", icon: User, label: "Mon Compte" },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe" style={{ backgroundColor: "#f5f5f5", borderTop: "1px solid #e0e0e0" }}>
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full transition-colors"
              data-testid={`nav-${item.label ? item.label.toLowerCase().replace(/\s+/g, '-') : 'home'}`}
            >
              <IconComponent
                className={`w-6 h-6 ${item.label ? "mb-0.5" : ""} ${isActive ? "text-blue-500" : "text-gray-500"}`}
              />
              {item.label && (
                <span className={`text-[10px] ${isActive ? "font-semibold text-blue-500" : "text-gray-500"}`}>{item.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
