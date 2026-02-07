import { useLocation } from "wouter";
import { Home, Settings, ShoppingCart, Users, User } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Accueil" },
  { path: "/invest", icon: Settings, label: "Produit" },
  { path: "/orders", icon: ShoppingCart, label: "Moi" },
  { path: "/team", icon: Users, label: "Equipe" },
  { path: "/account", icon: User, label: "Compte" },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe" style={{ backgroundColor: "#1a1a2e", borderTop: "1px solid #2a2a4a" }}>
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full transition-colors"
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <IconComponent
                className={`w-6 h-6 mb-1 ${isActive ? "text-blue-500" : "text-gray-500"}`}
              />
              <span className={`text-[10px] ${isActive ? "font-semibold text-blue-500" : "text-gray-500"}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
