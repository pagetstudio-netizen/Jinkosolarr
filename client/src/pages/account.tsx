import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCountryByCode } from "@/lib/countries";
import { 
  Wallet,
  Headphones,
  ClipboardCheck,
  Bell,
  Loader2,
  Shield
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import vrHeroImg from "@/assets/images/vr-headset-hero.png";
import apercuLeftImg from "@/assets/images/apercu-left.png";
import apercuRightImg from "@/assets/images/apercu-right.png";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 17 });
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.minutes === 0 && prev.hours === 0) return prev;
        if (prev.minutes === 0) return { hours: prev.hours - 1, minutes: 59 };
        return { ...prev, minutes: prev.minutes - 1 };
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const verifyPinMutation = useMutation({
    mutationFn: async (pin: string) => {
      const res = await apiRequest("POST", "/api/admin/verify-pin", { pin });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Code PIN incorrect");
      }
      return res.json();
    },
    onSuccess: () => {
      setShowPinModal(false);
      setAdminPin("");
      navigate("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAdminClick = () => {
    if (user?.isAdminPasswordRequired === false) {
      navigate("/admin");
      return;
    }
    setShowPinModal(true);
  };

  const handlePinSubmit = () => {
    if (adminPin.length < 4) {
      toast({
        title: "Code invalide",
        description: "Le code PIN doit contenir au moins 4 caracteres",
        variant: "destructive",
      });
      return;
    }
    verifyPinMutation.mutate(adminPin);
  };

  if (!user) return null;

  const totalEarnings = parseFloat(user.totalEarnings || "0");
  const country = getCountryByCode(user.country);
  const phonePrefix = country?.phonePrefix || "";

  const maskedPhone = user.phone ? `******${user.phone.slice(-4)}` : "";
  const countdownStr = `${String(countdown.hours).padStart(2, "0")}:${String(countdown.minutes).padStart(2, "0")}`;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-full bg-black">
      <div className="flex-1 overflow-y-auto pb-20">

        <div className="relative w-full" style={{ backgroundColor: "#111" }}>
          <div className="text-center pt-6 pb-2 px-4">
            <h1 className="text-white text-2xl font-bold tracking-wide leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              IMAGINATION
            </h1>
            <h1 className="text-white text-2xl font-bold tracking-wide leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              EST LA SEULE LIMITE
            </h1>
          </div>

          <div className="w-full px-4">
            <img
              src={vrHeroImg}
              alt="VR Headset"
              className="w-full h-auto object-contain"
              style={{ maxHeight: "200px" }}
            />
          </div>

          <div className="flex justify-around items-start px-6 pb-5 pt-2">
            <button
              onClick={() => navigate("/deposit")}
              className="flex flex-col items-center gap-1.5"
              data-testid="button-account-deposit"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#e85d04" }}>
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-xs">Recharger</span>
            </button>

            <button
              onClick={() => navigate("/withdrawal")}
              className="flex flex-col items-center gap-1.5"
              data-testid="button-account-withdraw"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#333" }}>
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-xs">Retrait</span>
            </button>

            <button
              onClick={() => navigate("/service")}
              className="flex flex-col items-center gap-1.5"
              data-testid="button-support"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#333" }}>
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-xs">Aide</span>
            </button>

            <button
              onClick={() => navigate("/history")}
              className="flex flex-col items-center gap-1.5"
              data-testid="button-history"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#e85d04" }}>
                <ClipboardCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-xs">Pointage</span>
            </button>
          </div>
        </div>

        <div className="px-4 mt-3">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ backgroundColor: "#1a1a2e", border: "1px solid #3a3a5c" }}
          >
            <Bell className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div className="overflow-hidden flex-1" ref={tickerRef}>
              <p className="text-gray-300 text-sm whitespace-nowrap animate-marquee">
                JO ******9624 a recharg{"\u00e9"} 300,000 {maskedPhone}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 mt-4">
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1a1a2e" }}>
            <div className="flex items-center justify-between px-4 py-3 relative" style={{ background: "linear-gradient(90deg, #4a2d8a 0%, #6b3fa0 50%, #8a4fb0 100%)" }}>
              <span className="text-white text-lg font-semibold">Aper{"\u00e7"}u</span>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: "#ff6600" }}
                data-testid="text-countdown"
              >
                {countdownStr}
              </div>
            </div>

            <div className="flex gap-3 p-3">
              <div className="flex-1 rounded-xl overflow-hidden relative" style={{ height: "140px" }}>
                <img src={apercuLeftImg} alt="Apercu" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 rounded-xl overflow-hidden relative flex flex-col items-center justify-center" style={{ height: "140px" }}>
                <img src={apercuRightImg} alt="Cumulatif" className="absolute inset-0 w-full h-full object-cover" />
                <div className="relative z-10 text-center">
                  <p className="text-white text-3xl font-bold" data-testid="text-total-earnings">
                    {totalEarnings.toLocaleString()}
                  </p>
                  <p className="text-gray-300 text-sm">Cumulatif</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {user.isAdmin && (
          <div className="px-4 mt-4">
            <button
              onClick={handleAdminClick}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
              style={{ backgroundColor: "#252545", border: "1px solid #3a3a5c" }}
              data-testid="button-admin"
            >
              <Shield className="w-5 h-5 text-gray-300" />
              <span className="text-gray-300 text-sm font-medium">Panel Admin</span>
            </button>
          </div>
        )}

      </div>

      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Code d'acces administrateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Entrez votre code PIN pour acceder au panel administrateur
            </p>
            <Input
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="Code PIN"
              className="text-center text-2xl tracking-widest"
              maxLength={8}
              data-testid="input-admin-pin"
            />
            <Button
              onClick={handlePinSubmit}
              disabled={verifyPinMutation.isPending || adminPin.length < 4}
              className="w-full"
              data-testid="button-verify-pin"
            >
              {verifyPinMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
