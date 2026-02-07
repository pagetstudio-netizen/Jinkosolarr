import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCountryByCode } from "@/lib/countries";
import { 
  Monitor,
  DollarSign,
  Wallet,
  Headphones,
  Gift,
  ClipboardList,
  Lock,
  BookOpen,
  ChevronRight,
  Copy,
  Loader2,
  Shield,
  LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import elfLogo from "@/assets/images/fanuc-circle-logo.png";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 5 });

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

  const balance = parseFloat(user.balance || "0");
  const totalEarnings = parseFloat(user.totalEarnings || "0");
  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";
  const phonePrefix = country?.phonePrefix || "";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.referralCode || "");
    toast({
      title: "Copie",
      description: "ID copie dans le presse-papiers",
    });
  };

  const countdownStr = `${String(countdown.hours).padStart(2, "0")}:${String(countdown.minutes).padStart(2, "0")}`;

  return (
    <div className="flex flex-col min-h-full" style={{ backgroundColor: "#1a1a2e" }}>
      <div className="flex-1 overflow-y-auto pb-24">

        <div className="flex items-center gap-3 px-4 pt-5 pb-3">
          <div className="w-12 h-12 rounded-full border-2 border-gray-500 flex items-center justify-center overflow-hidden" style={{ backgroundColor: "#252545" }}>
            <img src={elfLogo} alt="ELF" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white text-base font-semibold" data-testid="text-user-phone">
                (+{phonePrefix}) {user.phone} · VIP0
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-gray-400 text-sm" data-testid="text-user-id">
                ID: {user.referralCode}
              </span>
              <button onClick={handleCopyId} className="text-gray-400" data-testid="button-copy-id">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 flex gap-3">
          <div className="flex-1 rounded-xl px-4 py-3" style={{ backgroundColor: "#252545", border: "1px solid #3a3a5c" }}>
            <p className="text-white text-2xl font-bold" data-testid="text-total-earnings">
              {totalEarnings.toLocaleString()} {currency}
            </p>
            <p className="text-gray-400 text-sm mt-0.5">Revenu cumul{"\u00e9"}</p>
          </div>
          <div className="flex-1 rounded-xl px-4 py-3 relative" style={{ backgroundColor: "#252545", border: "1px solid #3a3a5c" }}>
            <p className="text-white text-2xl font-bold" data-testid="text-account-balance">
              {balance.toLocaleString()} {currency}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <p className="text-gray-400 text-sm">Solde disponible</p>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div
              className="absolute -right-2 -bottom-2 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: "#ff6600" }}
              data-testid="text-countdown"
            >
              {countdownStr}
            </div>
          </div>
        </div>

        <div className="px-4 mt-5">
          <div className="flex justify-between gap-2">
            <Link href="/deposit" className="flex-1">
              <button
                className="w-full flex flex-col items-center gap-2 py-3 rounded-xl"
                style={{ backgroundColor: "#252545", border: "2px solid #4a6cf7" }}
                data-testid="button-account-deposit"
              >
                <Monitor className="w-7 h-7 text-white" />
                <span className="text-white text-xs font-medium">Recharge</span>
              </button>
            </Link>
            <Link href="/withdrawal" className="flex-1">
              <button
                className="w-full flex flex-col items-center gap-2 py-3 rounded-xl"
                style={{ backgroundColor: "#252545", border: "1px solid #3a3a5c" }}
                data-testid="button-account-withdraw"
              >
                <DollarSign className="w-7 h-7 text-white" />
                <span className="text-white text-xs font-medium">Retrait</span>
              </button>
            </Link>
            <Link href="/wallet" className="flex-1">
              <button
                className="w-full flex flex-col items-center gap-2 py-3 rounded-xl"
                style={{ backgroundColor: "#252545", border: "1px solid #3a3a5c" }}
                data-testid="button-wallet"
              >
                <Wallet className="w-7 h-7 text-white" />
                <span className="text-white text-xs font-medium">Banque</span>
              </button>
            </Link>
            <button
              onClick={() => navigate("/service")}
              className="flex-1 flex flex-col items-center gap-2 py-3 rounded-xl"
              style={{ backgroundColor: "#252545", border: "1px solid #3a3a5c" }}
              data-testid="button-support"
            >
              <Headphones className="w-7 h-7 text-white" />
              <span className="text-white text-xs font-medium">Assistance</span>
            </button>
          </div>
        </div>

        <div className="px-4 mt-5">
          <Link href="/team">
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #2a2a6e 0%, #3b3ba0 30%, #4a3a8a 60%, #5a3a70 100%)",
                minHeight: "130px",
              }}
            >
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: "radial-gradient(circle at 70% 50%, rgba(100,150,255,0.3) 0%, transparent 60%), radial-gradient(circle at 30% 80%, rgba(150,100,255,0.2) 0%, transparent 50%)",
              }}></div>
              <div className="relative z-10">
                <h3 className="text-white text-xl font-bold mb-2">Des revenus plus {"\u00e9"}lev{"\u00e9"}s</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Invitez vos {"\u00e0"} amis {"\u00e0"} nous rejoindre and obtenez plus des r{"\u00e9"}compenses {"\u00e9"}lev{"\u00e9"}es directement et automatiquement.
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="px-4 mt-5">
          <Link href="/gift-code">
            <div
              className="flex items-center justify-between py-4 border-b"
              style={{ borderColor: "#2a2a4a" }}
              data-testid="button-gift-code"
            >
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-gray-400" />
                <span className="text-white text-sm">Echanger la r{"\u00e9"}compense</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
          </Link>

          <Link href="/history">
            <div
              className="flex items-center justify-between py-4 border-b"
              style={{ borderColor: "#2a2a4a" }}
              data-testid="button-history"
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-gray-400" />
                <span className="text-white text-sm">Enregistrement</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
          </Link>

          <Link href="/orders">
            <div
              className="flex items-center justify-between py-4 border-b"
              style={{ borderColor: "#2a2a4a" }}
              data-testid="button-transactions"
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-gray-400" />
                <span className="text-white text-sm">Transactions</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
          </Link>

          <button
            onClick={() => navigate("/change-password")}
            className="w-full flex items-center justify-between py-4 border-b"
            style={{ borderColor: "#2a2a4a" }}
            data-testid="button-change-password"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <span className="text-white text-sm">Changer le mot de passe</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>

          <Link href="/rules">
            <div
              className="flex items-center justify-between py-4 border-b"
              style={{ borderColor: "#2a2a4a" }}
              data-testid="button-rules"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-gray-400" />
                <span className="text-white text-sm">Guide utilisateur</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
          </Link>

          {user.isAdmin && (
            <button
              onClick={handleAdminClick}
              className="w-full flex items-center justify-between py-4 border-b"
              style={{ borderColor: "#2a2a4a" }}
              data-testid="button-admin"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-white text-sm">Panel Admin</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between py-4"
            data-testid="button-logout"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">D{"\u00e9"}connexion</span>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400" />
          </button>
        </div>
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
    </div>
  );
}
