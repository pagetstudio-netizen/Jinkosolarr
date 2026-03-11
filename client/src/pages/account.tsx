import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCountryByCode } from "@/lib/countries";
import { Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import elfLogo from "@assets/elf-logo-1-jpg_1770372668472.webp";
import globeImg from "@/assets/images/elf-station-2.jpeg";

import iconDeposit from "@assets/téléchargement_(18)_1770814706072.png";
import iconWithdraw from "@assets/téléchargement_(17)_1770814706099.png";
import iconCoupon from "@assets/téléchargement_(20)_1770814705977.png";
import iconHistory from "@assets/téléchargement_(19)_1770814706043.png";
import iconTeam from "@assets/téléchargement_(15)_1770814706160.png";
import iconBank from "@assets/téléchargement_(14)_1770814706189.png";
import iconPassword from "@assets/téléchargement_(16)_1770814706129.png";
import iconSignout from "@assets/téléchargement_(17)_1770814706099.png";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");

  const { data: withdrawals } = useQuery<any[]>({
    queryKey: ["/api/user/withdrawals"],
  });

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
  const totalWithdrawals = withdrawals?.filter((w: any) => w.status === "completed").reduce((sum: number, w: any) => sum + parseFloat(w.amount || "0"), 0) || 0;
  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";
  const phonePrefix = country?.phonePrefix || "";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-100">
      <div className="flex-1 overflow-y-auto pb-24">

        <div className="relative" style={{ background: "linear-gradient(135deg, #0d47a1 0%, #1565c0 40%, #1976d2 70%, #1e88e5 100%)" }}>
          <div className="absolute inset-0 overflow-hidden">
            <img src={globeImg} alt="" className="absolute right-0 top-0 w-full h-full object-cover opacity-20" />
          </div>
          <div className="relative z-10 px-5 pt-5 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                <img src={elfLogo} alt="Wendy's" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white text-lg font-bold" data-testid="text-phone">{phonePrefix}{user.phone}</p>
                <p className="text-white/70 text-sm" data-testid="text-user-id">ID:{user.referralCode}</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex gap-3 px-5 pb-5">
            <Link href="/deposit" className="flex-1">
              <button className="w-full bg-white rounded-lg flex items-center justify-center gap-3 py-3.5" data-testid="button-account-deposit">
                <img src={iconDeposit} alt="" className="w-6 h-6" />
                <span className="text-gray-800 font-semibold text-sm">Recharger</span>
              </button>
            </Link>
            <Link href="/withdrawal" className="flex-1">
              <button className="w-full bg-white rounded-lg flex items-center justify-center gap-3 py-3.5" data-testid="button-account-withdraw">
                <img src={iconWithdraw} alt="" className="w-6 h-6" />
                <span className="text-gray-800 font-semibold text-sm">Retirer</span>
              </button>
            </Link>
          </div>
        </div>

        <div className="mx-4 -mt-1 bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5">
          <div className="grid grid-cols-2 gap-y-5">
            <div className="text-center">
              <p className="text-gray-500 text-xs">Portefeuille de recharge</p>
              <p className="text-gray-900 text-lg font-bold mt-1" data-testid="text-recharge-wallet">0.00</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-xs">Portefeuille de solde</p>
              <p className="text-gray-900 text-lg font-bold mt-1" data-testid="text-account-balance">{balance.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-xs">Gains totaux</p>
              <p className="text-gray-900 text-lg font-bold mt-1" data-testid="text-total-earnings">{totalEarnings.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-xs">Total des retraits</p>
              <p className="text-gray-900 text-lg font-bold mt-1" data-testid="text-total-withdrawals">{totalWithdrawals.toFixed(2)}</p>
            </div>
          </div>

          <Link href="/daily-bonus">
            <button className="w-full mt-5 py-3.5 rounded-full text-white font-semibold text-sm" style={{ backgroundColor: "#2196F3" }} data-testid="button-free-reward">
              Recompense gratuite
            </button>
          </Link>
        </div>

        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-5">
          <div className="grid grid-cols-3 gap-y-6">
            <Link href="/my-products">
              <button className="w-full flex flex-col items-center gap-2" data-testid="button-my-products">
                <img src={iconCoupon} alt="" className="w-9 h-9" />
                <span className="text-gray-700 text-xs">Mes produits</span>
              </button>
            </Link>
            <Link href="/history">
              <button className="w-full flex flex-col items-center gap-2" data-testid="button-history">
                <img src={iconHistory} alt="" className="w-9 h-9" />
                <span className="text-gray-700 text-xs">Historique</span>
              </button>
            </Link>
            <Link href="/team">
              <button className="w-full flex flex-col items-center gap-2" data-testid="button-team">
                <img src={iconTeam} alt="" className="w-9 h-9" />
                <span className="text-gray-700 text-xs">Mon equipe</span>
              </button>
            </Link>
            <Link href="/wallet">
              <button className="w-full flex flex-col items-center gap-2" data-testid="button-wallet">
                <img src={iconBank} alt="" className="w-9 h-9" />
                <span className="text-gray-700 text-xs">Compte bancaire</span>
              </button>
            </Link>
            <button onClick={() => navigate("/change-password")} className="w-full flex flex-col items-center gap-2" data-testid="button-change-password">
              <img src={iconPassword} alt="" className="w-9 h-9" />
              <span className="text-gray-700 text-xs">Mot de passe</span>
            </button>
            <button onClick={handleLogout} className="w-full flex flex-col items-center gap-2" data-testid="button-logout">
              <img src={iconSignout} alt="" className="w-9 h-9" />
              <span className="text-gray-700 text-xs">Deconnexion</span>
            </button>
          </div>
        </div>

        {user.isAdmin && (
          <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-4">
            <button
              onClick={handleAdminClick}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
              style={{ backgroundColor: "#2196F3" }}
              data-testid="button-admin"
            >
              <Shield className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-sm">Panel Admin</span>
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
    </div>
  );
}
