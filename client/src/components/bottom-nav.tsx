import { useLocation } from "wouter";
import { Home, Users, User, ShoppingCart } from "lucide-react";

const ProduitIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="2.5" />
    <circle cx="16" cy="8" r="2.5" />
    <circle cx="8" cy="16" r="2.5" />
    <circle cx="16" cy="16" r="2.5" />
  </svg>
);

const navItems = [
  { path: "/", label: "Accueil", icon: "home" },
  { path: "/invest", label: "Produit", icon: "produit" },
  { path: "/tasks", label: "Moi", icon: "moi" },
  { path: "/team", label: "Equipe", icon: "equipe" },
  { path: "/account", label: "Compte", icon: "compte" },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around h-16 pb-1">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const color = isActive ? "#4a6cf7" : "#6b7280";

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full"
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <div className="mb-0.5" style={{ color }}>
                {item.icon === "home" && <Home className="w-6 h-6" />}
                {item.icon === "produit" && <ProduitIcon />}
                {item.icon === "moi" && <ShoppingCart className="w-6 h-6" />}
                {item.icon === "equipe" && <Users className="w-6 h-6" />}
                {item.icon === "compte" && <User className="w-6 h-6" />}
              </div>
              <span className="text-[10px]" style={{ color }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
