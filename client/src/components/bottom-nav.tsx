import { useLocation } from "wouter";

import iconHome   from "@assets/20260228_010602_1775758828500.png";
import iconRevenu from "@assets/20260228_010536_1775758828691.png";
import iconEquipe from "@assets/20251223_225137_1775758828713.png";
import iconCompte from "@assets/20260228_010619_1775758828669.png";

const grayFilter   = "brightness(0) saturate(0%) opacity(40%)";
const greenFilter  = "brightness(0) saturate(100%) invert(27%) sepia(49%) saturate(590%) hue-rotate(115deg) brightness(91%) contrast(97%)";

const navItems = [
  { path: "/",            label: "Accueil", icon: iconHome,   needsWhite: false },
  { path: "/my-products", label: "Revenu",  icon: iconRevenu, needsWhite: false },
  { path: "/team",        label: "Equipe",  icon: iconEquipe, needsWhite: true  },
  { path: "/account",     label: "Compte",  icon: iconCompte, needsWhite: false },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e5e7eb" }}>
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
                className="w-7 h-7 mb-0.5"
                style={{
                  filter: isActive ? greenFilter : grayFilter,
                }}
              />
              <span
                className="text-[10px] font-semibold"
                style={{ color: isActive ? "#007054" : "#9ca3af" }}
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
