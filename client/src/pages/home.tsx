import { useAuth } from "@/lib/auth";
import { Bell, X, Send } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";

import elfLogo from "@assets/elf-logo-1-jpg_1770372668472.webp";
import heroImg from "@assets/images_(12)_1770548411196.jpeg";
import stationImg from "@assets/images_(10)_1770548411220.jpeg";
import iconRecharger from "@assets/20260208_191924_1770580677527.png";
import iconRetraits from "@assets/20260208_191333_1770580677612.png";
import iconAider from "@assets/20260208_105040_1770548435850.png";
import iconEnregistrer from "@assets/images_(6)_1770548411064.png";
import notifyBanner from "@/assets/images/notify-banner.png";
import elfLogoPopup from "@/assets/images/elf-logo-card.png";

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showPopup, setShowPopup] = useState(false);

  const { data: userProducts } = useQuery<any[]>({
    queryKey: ["/api/user-products"],
    enabled: !!user,
  });

  useEffect(() => {
    setShowPopup(true);
    const timer = setTimeout(() => {
      setShowPopup(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!user) return null;

  const balance = parseFloat(user.balance || "0");
  const cumulativeEarnings = parseFloat(user.totalEarnings || "0");
  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";
  const activeProductCount = userProducts?.length || 0;

  return (
    <div className="flex flex-col min-h-full bg-white">
      {showPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white w-full max-w-[320px] rounded-2xl overflow-hidden relative animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img src={notifyBanner} alt="Notify" className="w-full h-28 object-cover" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <img src={elfLogoPopup} alt="Wendy's" className="w-12 h-12 object-contain" />
              </div>
            </div>

            <div className="pt-10 px-4 pb-4 text-gray-700">
              <div className="space-y-1.5 text-[12px] leading-snug">
                <p>Rejoignez Wendy's, profitez des dividendes et faites fructifier votre patrimoine !</p>
                <p>1. Bonus d'inscription : 500 FCFA</p>
                <p>2. Bonus quotidien : 50 FCFA</p>
                <p>3. Invitez vos filleuls et recevez 30 % de prime.</p>
              </div>
              <div className="mt-3 space-y-2">
                <a
                  href="https://t.me/+M229bmWp-AkyZWEx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#2196F3] rounded-full text-white font-semibold text-xs transition-colors"
                >
                  <Send className="w-4 h-4 fill-current" />
                  Canal Telegram officiel &gt;
                </a>
                <button
                  onClick={() => setShowPopup(false)}
                  className="mx-auto block px-8 py-2 bg-black text-white rounded-full font-bold text-xs"
                >
                  D'accord
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <img src={elfLogo} alt="Wendy's" className="h-10 w-auto object-contain" />
        <span className="text-blue-600 font-bold text-lg" data-testid="text-brand-name">Wendy's</span>
      </div>

      <div className="px-4">
        <div className="rounded-2xl overflow-hidden">
          <img
            src={heroImg}
            alt="Wendy's"
            className="w-full h-48 object-cover"
            data-testid="img-hero"
          />
        </div>
      </div>

      <div className="flex justify-around items-start px-4 py-4">
        <button
          onClick={() => navigate("/deposit")}
          className="flex flex-col items-center gap-1"
          data-testid="button-recharge"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <img src={iconRecharger} alt="Recharger" className="w-10 h-10 object-contain" />
          </div>
          <span className="text-gray-700 text-xs">Recharger</span>
        </button>

        <button
          onClick={() => navigate("/withdrawal")}
          className="flex flex-col items-center gap-1"
          data-testid="button-retirer"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <img src={iconRetraits} alt="Les retraits" className="w-10 h-10 object-contain" />
          </div>
          <span className="text-gray-700 text-xs">Les retraits</span>
        </button>

        <button
          onClick={() => navigate("/service")}
          className="flex flex-col items-center gap-1"
          data-testid="button-aide"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <img src={iconAider} alt="Aider les" className="w-10 h-10 object-contain" />
          </div>
          <span className="text-gray-700 text-xs">Aider les</span>
        </button>

        <button
          onClick={() => navigate("/checkin")}
          className="flex flex-col items-center gap-1"
          data-testid="button-enregistrer"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <img src={iconEnregistrer} alt="S'enregistrer" className="w-10 h-10 object-contain" />
          </div>
          <span className="text-gray-700 text-xs">S'enregistrer</span>
        </button>
      </div>

      <div className="px-4">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ backgroundColor: "#e8f0fe" }}>
          <Bell className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <div className="overflow-hidden flex-1">
            <p className="text-gray-700 text-sm whitespace-nowrap animate-marquee">
              Wendy's - Plus de 6 000 restaurants dans le monde, des hamburgers au bœuf frais jamais congelé 🍔
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 pb-24">
        <div className="flex gap-3" style={{ height: "280px" }}>
          <div className="flex-1 rounded-2xl overflow-hidden relative" data-testid="card-balance">
            <img src={stationImg} alt="Wendy's" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 flex flex-col justify-between h-full p-4">
              <h3 className="text-white text-3xl font-black mt-8">Balance</h3>
              <p className="text-white text-xl font-bold mb-4" data-testid="text-balance">
                {balance.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {currency}
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <div className="flex-1 rounded-2xl overflow-hidden relative" data-testid="card-cumulatif">
              <img src={stationImg} alt="Wendy's" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 flex flex-col justify-center h-full p-3">
                <h3 className="text-white text-lg font-black">Cumulatif</h3>
                <p className="text-white text-base font-bold" data-testid="text-cumulative">
                  {cumulativeEarnings.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {currency}
                </p>
              </div>
            </div>

            <div className="flex-1 rounded-2xl overflow-hidden relative" data-testid="card-active-products">
              <img src={stationImg} alt="Wendy's" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 flex flex-col justify-center h-full p-3">
                <h3 className="text-white text-lg font-black">Active product</h3>
                <p className="text-blue-400 text-2xl font-bold" data-testid="text-active-products">
                  {activeProductCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 12s linear infinite;
        }
      `}</style>
    </div>
  );
}
