import { useAuth } from "@/lib/auth";
import { ChevronRight, Megaphone } from "lucide-react";
import { SiTelegram } from "react-icons/si";
import serviceIcon from "@assets/20260311_214852_1773265973964.png";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { useToast } from "@/hooks/use-toast";

import jinkoLogoText from "@assets/JinkoSolarLOGO_1775671142017.png";
import jinkoLogoSquare from "@assets/jinko-solar-logo-png_seeklogo-265492_1775671142176.png";
import iconRecharger from "@assets/20260312_105135_1773313898669.png";
import iconRetraits from "@assets/20260312_105153_1773313898582.png";
import iconService from "@assets/20260312_105210_1773313898694.png";
import iconPlayStore from "@assets/d8f_GooglePlay_mediumklein_1773313882717.jpg";
import iconConnexion from "@assets/20260311_204241_1773262537486.png";
import iconBonus from "@assets/20260311_204319_1773262537445.png";
import iconEquipe from "@assets/20260311_204705_1773262537367.png";
import iconProduits from "@assets/20260311_201005_1773262537523.png";

const TELEGRAM_LINK = "https://t.me/wendysappgroup";

export default function HomePage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [showPopup, setShowPopup] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  const { data: userProducts } = useQuery<any[]>({
    queryKey: ["/api/user/products"],
    enabled: !!user,
  });

  useEffect(() => {
    setShowPopup(true);
  }, [location]);

  useEffect(() => {
    const w = window as any;
    if (w._installPrompt) {
      setInstallPrompt(w._installPrompt);
      w._installPrompt = null;
    }
    if (w._appInstalled) setInstalled(true);

    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const { toast } = useToast();

  const handleInstall = async () => {
    if (installed) {
      toast({ title: "Déjà installée", description: "L'application est déjà installée sur votre appareil." });
      return;
    }
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setInstallPrompt(null);
    } else {
      toast({
        title: "Installer l'application",
        description: "Sur iPhone : appuyez sur Partager puis 'Sur l'écran d'accueil'. Sur Android : menu du navigateur → 'Ajouter à l'écran d'accueil'.",
      });
    }
  };

  if (!user) return null;

  const balance = parseFloat(user.balance || "0");
  const cumulativeEarnings = parseFloat(user.totalEarnings || "0");
  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";
  const activeProductCount = userProducts?.filter((p: any) => p.status === "active").length || 0;

  return (
    <div className="flex flex-col min-h-full bg-gray-100">
      {showPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5 animate-in fade-in duration-200"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="w-full max-w-[340px] rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ background: "linear-gradient(160deg, #3db51d 0%, #1e7a0e 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-7 pb-6">
              {/* Logo in popup */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-lg">
                  <img src={jinkoLogoSquare} alt="Jinko Solar" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-white text-2xl font-extrabold text-center tracking-widest mb-4">
                AVERTIR
              </h2>

              {/* Body text */}
              <p className="text-white/90 text-sm leading-relaxed mb-4">
                Jinko Solar est l'un des plus grands fabricants de panneaux solaires au monde, présent dans plus de 160 pays.
              </p>

              {/* Numbered list */}
              <div className="space-y-2 text-white/90 text-sm mb-6">
                <p>1. Bonus d'inscription : <span className="font-bold text-white">700 FCFA</span>.</p>
                <p>2. Bonus quotidien : <span className="font-bold text-white">50 FCFA</span>.</p>
                <p>3. Parrainage : jusqu'à <span className="font-bold text-white">27 %</span> de commission.</p>
                <p>4. Rejoignez notre groupe pour les codes bonus.</p>
              </div>

              {/* D'ACCORD button */}
              <button
                onClick={() => setShowPopup(false)}
                className="w-full py-3.5 bg-white rounded-full font-extrabold text-base tracking-wide mb-3"
                style={{ color: "#3db51d" }}
                data-testid="button-popup-agree"
              >
                D'ACCORD
              </button>

              {/* Telegram button */}
              <a
                href={TELEGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-3 bg-white rounded-full text-gray-700 font-semibold text-sm"
                data-testid="button-popup-telegram"
                onClick={() => setShowPopup(false)}
              >
                <SiTelegram className="w-5 h-5 text-[#229ED9]" />
                Cliquez ici pour rejoindre le groupe Telegram
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm">
        <img src={jinkoLogoText} alt="Jinko Solar" className="h-10 w-auto object-contain" data-testid="text-brand-name" />
        <button onClick={() => navigate("/service")} data-testid="button-service-header">
          <img src={serviceIcon} alt="Service client" className="w-8 h-8 object-contain" />
        </button>
      </div>

      <div className="px-3 pt-3">
        <div className="rounded-2xl overflow-hidden shadow-sm">
          <img
            src={jinkoLogoSquare}
            alt="Jinko Solar"
            className="w-full h-44 object-cover"
            data-testid="img-hero"
          />
        </div>
      </div>

      <div className="px-3 mt-3">
        <div className="rounded-2xl px-4 py-4 shadow-sm" style={{ background: "linear-gradient(135deg, #3db51d 0%, #2a8d13 100%)" }}>
          <div className="flex justify-around items-center">
            <button
              onClick={() => navigate("/deposit")}
              className="flex flex-col items-center gap-1.5"
              data-testid="button-depot"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <img src={iconRecharger} alt="Dépôt" className="w-8 h-8 object-contain" style={{ filter: "grayscale(1) brightness(100)", mixBlendMode: "screen" }} />
              </div>
              <span className="text-white text-xs font-medium">Dépôt</span>
            </button>

            <button
              onClick={() => navigate("/withdrawal")}
              className="flex flex-col items-center gap-1.5"
              data-testid="button-retrait"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <img src={iconRetraits} alt="Retrait" className="w-8 h-8 object-contain" style={{ filter: "grayscale(1) brightness(100)", mixBlendMode: "screen" }} />
              </div>
              <span className="text-white text-xs font-medium">Retrait</span>
            </button>

            <button
              onClick={() => navigate("/service")}
              className="flex flex-col items-center gap-1.5"
              data-testid="button-telegram"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <img src={iconService} alt="Service" className="w-8 h-8 object-contain" style={{ filter: "grayscale(1) brightness(100)", mixBlendMode: "screen" }} />
              </div>
              <span className="text-white text-xs font-medium">Telegram</span>
            </button>

            <button
              onClick={handleInstall}
              className="flex flex-col items-center gap-1.5"
              data-testid="button-app"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <img src={iconPlayStore} alt="App" className="w-8 h-8 object-contain rounded-lg" />
              </div>
              <span className="text-white text-xs font-medium">
                {installed ? "Installée" : "App"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-3 mt-3">
        <div className="flex gap-2">
          <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm flex flex-col gap-2">
            <img src={iconConnexion} alt="Connexion" className="w-10 h-10 object-contain" />
            <div>
              <p className="font-bold text-gray-800 text-sm">Connexion</p>
              <p className="text-gray-500 text-xs">Tâche de référence</p>
            </div>
            <button
              onClick={() => navigate("/checkin")}
              className="mt-auto text-xs text-white font-semibold py-1.5 px-2 rounded-lg text-center"
              style={{ background: "#3db51d" }}
              data-testid="button-checkin"
            >
              Réclamer maintenant
            </button>
          </div>

          <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm flex flex-col gap-2">
            <img src={iconBonus} alt="Bonus" className="w-10 h-10 object-contain" />
            <div>
              <p className="font-bold text-gray-800 text-sm">Bonus</p>
              <p className="text-gray-500 text-xs">Rédemption</p>
            </div>
            <button
              onClick={() => navigate("/gift-code")}
              className="mt-auto text-xs text-white font-semibold py-1.5 px-2 rounded-lg text-center"
              style={{ background: "#3db51d" }}
              data-testid="button-bonus"
            >
              Réclamer les récompenses
            </button>
          </div>

          <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm flex flex-col gap-2">
            <button onClick={() => navigate("/team-details")} className="w-full flex flex-col gap-2">
              <img src={iconEquipe} alt="Mon équipe" className="w-10 h-10 object-contain" />
              <div>
                <p className="font-bold text-gray-800 text-sm">Mon équipe</p>
                <p className="text-gray-500 text-xs">Parrainage</p>
              </div>
            </button>
            <button
              onClick={() => navigate("/team-details")}
              className="mt-auto text-xs text-white font-semibold py-1.5 px-2 rounded-lg text-center"
              style={{ background: "#3db51d" }}
              data-testid="button-team"
            >
              Voir les détails
            </button>
          </div>
        </div>
      </div>

      <div className="px-3 mt-3">
        <button
          onClick={() => navigate("/my-products")}
          className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
          data-testid="button-my-products"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#f0fff0" }}>
            <img src={iconProduits} alt="Mes produits" className="w-9 h-9 object-contain" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-gray-800 text-sm">Mes produits</p>
            <p className="text-gray-500 text-xs">{activeProductCount} produit(s) actif(s)</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="px-3 mt-3">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl shadow-sm">
          <Megaphone className="w-4 h-4 flex-shrink-0" style={{ color: "#3db51d" }} />
          <div className="overflow-hidden flex-1">
            <p className="text-gray-600 text-xs whitespace-nowrap animate-marquee">
              Jinko Solar ☀️ - Leader mondial du panneau solaire, présent dans plus de 160 pays avec plus de 200 GW de capacité installée dans le monde.
            </p>
          </div>
        </div>
      </div>

      <div className="px-3 mt-3 pb-24">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-bold text-gray-800 text-sm">My statistics and balance</p>
            <button onClick={() => navigate("/team")} className="text-xs font-medium flex items-center gap-0.5" style={{ color: "#3db51d" }}>
              Voir plus <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex divide-x divide-gray-100">
            <div className="flex-1 p-4 text-center" data-testid="card-balance">
              <p className="text-xs text-gray-500 mb-1">Balance</p>
              <p className="font-bold text-gray-800 text-sm" data-testid="text-balance">
                {balance.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {currency}
              </p>
            </div>
            <div className="flex-1 p-4 text-center" data-testid="card-cumulatif">
              <p className="text-xs text-gray-500 mb-1">Cumulatif</p>
              <p className="font-bold text-gray-800 text-sm" data-testid="text-cumulative">
                {cumulativeEarnings.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {currency}
              </p>
            </div>
            <div className="flex-1 p-4 text-center" data-testid="card-active-products">
              <p className="text-xs text-gray-500 mb-1">Produits</p>
              <p className="font-bold text-sm" style={{ color: "#3db51d" }} data-testid="text-active-products">
                {activeProductCount}
              </p>
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
          animation: marquee 14s linear infinite;
        }
      `}</style>
    </div>
  );
}
