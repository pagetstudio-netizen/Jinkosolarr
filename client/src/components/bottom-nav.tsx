import { useLocation } from "wouter";

import iconHome from "@assets/téléchargement_(10)_1770815896968.png";
import iconProduit from "@assets/téléchargement_(11)_1770815896895.png";
import iconEquipe from "@assets/téléchargement_(15)_1770815897189.png";
import iconCompte from "@assets/téléchargement_(12)_1770815897017.png";

const navItems = [
  { path: "/", label: "Accueil", icon: iconHome },
  { path: "/invest", label: "Produit", icon: iconProduit },
  { path: "/team", label: "Equipe", icon: iconEquipe },
  { path: "/account", label: "Compte", icon: iconCompte },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around h-16 pb-1">
        {navItems.map((item) => {
          const isActive = location === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full"
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="w-6 h-6 mb-0.5"
                style={{ opacity: isActive ? 1 : 0.45 }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? "#2196F3" : "#6b7280" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
