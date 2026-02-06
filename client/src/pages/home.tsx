import { useAuth } from "@/lib/auth";
import { Bell, X, Send } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import elfHeader from "@/assets/images/fanuc-header.png";
import btnRecharge from "@/assets/images/btn-recharge.png";
import btnRetirer from "@/assets/images/btn-retirer.png";
import btnAide from "@/assets/images/btn-aide.png";
import robotSoldes from "@/assets/images/robot-soldes.png";
import robotCumulatif from "@/assets/images/robot-cumulatif.png";
import elfTeamWide from "@/assets/images/fanuc-team-wide.png";
import elfPopupBanner from "@assets/20260126_073237_1769413159534.jpg";

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Show popup on component mount (Accueil tab)
    setShowPopup(true);
    
    // Auto-hide after 8 seconds
    const timer = setTimeout(() => {
      setShowPopup(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  if (!user) return null;

  const balance = parseFloat(user.balance || "0");
  const cumulativeEarnings = parseFloat(user.totalEarnings || "0");

  return (
    <div className="flex flex-col min-h-full bg-amber-50">
      {/* Pop-up Notification */}
      {showPopup && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-300"
          onClick={() => setShowPopup(false)}
        >
          <div 
            className="bg-[#1a1a1a] w-full max-w-sm rounded-2xl overflow-hidden relative animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 text-white/70 hover:text-white z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <img 
              src={elfPopupBanner} 
              alt="ELF Banner" 
              className="w-full h-auto object-cover"
            />
            
            <div className="p-4 text-white">
              <h2 className="text-[#ff3b30] font-bold text-center text-lg mb-3 tracking-wider">
                ⚠️ NOTIFIÉ
              </h2>
              
              <div className="space-y-3 text-[13px] leading-relaxed">
                <p className="font-semibold text-center text-base">Bienvenue sur ELF</p>
                <p className="text-center">Investissez dans votre propre machine et générez des revenus quotidiens.</p>
                
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="font-bold">1.</span>
                    <span>Les nouveaux utilisateurs reçoivent 500 FCFA à l’inscription.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">2.</span>
                    <span>Retrait minimum : 1 200 FCFA.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">3.</span>
                    <span>Gagnez 30 % de commission grâce à notre programme de parrainage à trois niveaux.</span>
                  </li>
                </ul>
                
                <p className="text-center pt-1 italic text-[12px] text-gray-300">
                  Cliquez ci-dessous pour rejoindre notre chaîne Telegram officielle.
                </p>

                <div className="space-y-3 pt-2">
                  <button 
                    onClick={() => setShowPopup(false)}
                    className="w-full py-3 bg-[#333] hover:bg-[#444] rounded-xl font-bold transition-colors"
                  >
                    D’ACCORD
                  </button>
                  
                  <a 
                    href="https://t.me/elfgroup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#0088cc] hover:bg-[#0099ee] rounded-xl font-bold transition-colors"
                  >
                    <Send className="w-5 h-5 fill-current" />
                    Rejoindre la chaîne Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="w-full">
        <img 
          src={elfHeader} 
          alt="ELF" 
          className="w-full h-44 object-cover"
        />
      </div>

      <div className="px-3 py-3 flex items-end justify-center gap-1">
        <Link href="/deposit" className="flex-1 hover:opacity-90 transition-opacity mb-0">
          <button
            className="w-full"
            data-testid="button-recharge"
          >
            <img src={btnRecharge} alt="Recharge" className="w-full h-10 object-contain" />
          </button>
        </Link>

        <Link href="/withdrawal" className="flex-1 hover:opacity-90 transition-opacity mb-2">
          <button
            className="w-full"
            data-testid="button-retirer"
          >
            <img src={btnRetirer} alt="Retirer" className="w-full h-10 object-contain" />
          </button>
        </Link>

        <button
          onClick={() => navigate("/service")}
          className="flex-1 hover:opacity-90 transition-opacity mb-4"
          data-testid="button-aide"
        >
          <img src={btnAide} alt="Service Client" className="w-full h-10 object-contain" />
        </button>
      </div>

      <div className="mx-3 bg-amber-900 rounded-lg px-3 py-2 flex items-center gap-2 overflow-hidden">
        <Bell className="w-5 h-5 text-white flex-shrink-0" />
        <div className="overflow-hidden flex-1">
          <p className="text-white text-sm font-medium whitespace-nowrap animate-marquee">
            Rejoignez ELF, la plateforme incontournable pour investir dans l'industrie et gagner des revenus quotidiens!
          </p>
        </div>
      </div>

      <div className="px-3 mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-24 h-24">
            <img 
              src={robotSoldes} 
              alt="Robot" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-right">
            <span className="inline-block bg-yellow-400 text-gray-800 font-bold text-sm px-4 py-1 rounded-full mb-1">
              Soldes
            </span>
            <p className="text-red-600 font-bold text-xl" data-testid="text-balance">
              FCFA {balance.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="w-24 h-24">
            <img 
              src={robotCumulatif} 
              alt="Robot" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-right">
            <span className="inline-block bg-yellow-400 text-gray-800 font-bold text-sm px-4 py-1 rounded-full mb-1">
              Cumulatif
            </span>
            <p className="text-red-600 font-bold text-xl" data-testid="text-cumulative">
              FCFA {cumulativeEarnings.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="px-3 mt-4 pb-4">
        <img 
          src={elfTeamWide} 
          alt="ELF Team" 
          className="w-full h-auto rounded-xl object-cover"
        />
      </div>
    </div>
  );
}
