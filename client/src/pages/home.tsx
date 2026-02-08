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
import elfPopupBanner from "@assets/20260126_073237_1769413159534.jpg";

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
            <img src={elfPopupBanner} alt="ELF Banner" className="w-full h-auto object-cover" />
            <div className="p-4 text-white">
              <h2 className="text-[#ff3b30] font-bold text-center text-lg mb-3 tracking-wider">
                NOTIFIE
              </h2>
              <div className="space-y-3 text-[13px] leading-relaxed">
                <p className="font-semibold text-center text-base">Bienvenue sur ELF</p>
                <p className="text-center">Investissez dans le secteur p{"\u00e9"}trolier et {"\u00e9"}nerg{"\u00e9"}tique et g{"\u00e9"}n{"\u00e9"}rez des revenus quotidiens.</p>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="font-bold">1.</span>
                    <span>Les nouveaux utilisateurs re{"\u00e7"}oivent 500 FCFA {"\u00e0"} l'inscription.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">2.</span>
                    <span>Retrait minimum : 1 200 FCFA.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">3.</span>
                    <span>Gagnez 30 % de commission gr{"\u00e2"}ce {"\u00e0"} notre programme de parrainage {"\u00e0"} trois niveaux.</span>
                  </li>
                </ul>
                <p className="text-center pt-1 italic text-[12px] text-gray-300">
                  Cliquez ci-dessous pour rejoindre notre cha{"\u00ee"}ne Telegram officielle.
                </p>
                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => setShowPopup(false)}
                    className="w-full py-3 bg-[#333] hover:bg-[#444] rounded-xl font-bold transition-colors"
                  >
                    D'ACCORD
                  </button>
                  <a
                    href="https://t.me/elfgroup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#0088cc] hover:bg-[#0099ee] rounded-xl font-bold transition-colors"
                  >
                    <Send className="w-5 h-5 fill-current" />
                    Rejoindre la cha{"\u00ee"}ne Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <img src={elfLogo} alt="ELF" className="h-10 w-auto object-contain" />
        <span className="text-blue-600 font-bold text-lg" data-testid="text-brand-name">EIF petrol</span>
      </div>

      <div className="px-4">
        <div className="rounded-2xl overflow-hidden">
          <img
            src={heroImg}
            alt="ELF Expert"
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
          onClick={() => navigate("/history")}
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
              Lubrifiants et carburants de performance - ELF, partenaire officiel de la F1 et du MotoGP
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 pb-24">
        <div className="flex gap-3" style={{ height: "280px" }}>
          <div className="flex-1 rounded-2xl overflow-hidden relative" data-testid="card-balance">
            <img src={stationImg} alt="ELF Station" className="absolute inset-0 w-full h-full object-cover" />
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
              <img src={stationImg} alt="ELF Station" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 flex flex-col justify-center h-full p-3">
                <h3 className="text-white text-lg font-black">Cumulatif</h3>
                <p className="text-white text-base font-bold" data-testid="text-cumulative">
                  {cumulativeEarnings.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {currency}
                </p>
              </div>
            </div>

            <div className="flex-1 rounded-2xl overflow-hidden relative" data-testid="card-active-products">
              <img src={stationImg} alt="ELF Station" className="absolute inset-0 w-full h-full object-cover" />
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
