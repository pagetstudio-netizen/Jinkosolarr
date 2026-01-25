import { useLocation } from "wouter";
import navHome from "@/assets/images/nav-home.png";
import navVip from "@/assets/images/nav-vip.png";
import navMachine from "@/assets/images/nav-machine.png";
import navTeam from "@/assets/images/nav-team.png";
import navAccount from "@/assets/images/nav-account.png";

const navItems = [
  { path: "/", icon: navHome, label: "Accueil" },
  { path: "/invest", icon: navVip, label: "VIP" },
  { path: "/orders", icon: navMachine, label: "Machine" },
  { path: "/team", icon: navTeam, label: "Equipe" },
  { path: "/account", icon: navAccount, label: "Compte" },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 bottom-nav z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <img 
                src={item.icon} 
                alt={item.label} 
                className={`w-[32px] h-[32px] mb-1 ${isActive ? "" : "opacity-40"}`}
                style={isActive ? { filter: "invert(27%) sepia(91%) saturate(6500%) hue-rotate(355deg) brightness(95%) contrast(100%)" } : {}}
              />
              <span className={`text-[10px] ${isActive ? "font-semibold text-red-500" : "text-gray-400"}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
