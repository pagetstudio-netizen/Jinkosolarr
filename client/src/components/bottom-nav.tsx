import { useLocation } from "wouter";

import iconHome from "@assets/20260312_091332_1773307680527.png";
import iconProduit from "@assets/20260312_091314_1773307680650.png";
import iconEquipe from "@assets/téléchargement_(15)_1770815897189.png";
import iconCompte from "@assets/téléchargement_(12)_1770815897017.png";

const navItems = [
  { path: "/", label: "Accueil", icon: iconHome, tintRed: false },
  { path: "/invest", label: "Produit", icon: iconProduit, tintRed: false },
  { path: "/team", label: "Equipe", icon: iconEquipe, tintRed: true },
  { path: "/account", label: "Compte", icon: iconCompte, tintRed: true },
];

const redFilter = "brightness(0) saturate(100%) invert(13%) sepia(98%) saturate(3000%) hue-rotate(347deg) brightness(85%)";

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
                className="w-8 h-8 mb-0.5"
                style={{
                  opacity: isActive ? 1 : 0.45,
                  filter: item.tintRed ? redFilter : undefined,
                }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? "#c8102e" : "#6b7280" }}
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
