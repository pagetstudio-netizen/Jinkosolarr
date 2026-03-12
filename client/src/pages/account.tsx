import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCountryByCode } from "@/lib/countries";
import { Loader2, Shield, Bell, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import wendysLogo from "@assets/wendys_logo.png";
import inviteBanner from "@assets/20260311_235212_1773273730144.png";
import robotCoins from "@assets/20260312_072729_1773301338434.png";
import robotWallet from "@assets/20260312_072644_1773301338541.png";
import robotGift from "@assets/20260312_072622_1773301338571.png";
import giftBox from "@assets/20260312_072546_1773301338613.png";

import iconDeposit from "@assets/téléchargement_(18)_1770814706072.png";
import iconWithdraw from "@assets/téléchargement_(17)_1770814706099.png";
import serviceIcon from "@assets/20260311_214852_1773265973964.png";
import iconTeam from "@assets/téléchargement_(15)_1770814706160.png";
import iconPassword from "@assets/téléchargement_(16)_1770814706129.png";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");

  const { data: withdrawals } = useQuery<any[]>({
    queryKey: ["/api/user/withdrawals"],
  });

  const { data: products } = useQuery<any[]>({
    queryKey: ["/api/user-products"],
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
      toast({ title: error.message, variant: "destructive" });
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
      toast({ title: "Le code PIN doit contenir au moins 4 caractères", variant: "destructive" });
      return;
    }
    verifyPinMutation.mutate(adminPin);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  const balance = parseFloat(user.balance || "0");
  const todayEarnings = products?.reduce((sum: number, p: any) => sum + parseFloat(p.dailyIncome || "0"), 0) || 0;
  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";
  const phonePrefix = country?.phonePrefix || "";

  return (
    <div className="flex flex-col min-h-full bg-gray-100">
      <div className="flex-1 overflow-y-auto pb-24">

        {/* Header */}
        <div className="bg-white px-4 pt-5 pb-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
            <img src={wendysLogo} alt="Wendy's" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <p className="text-gray-500 text-xs">Bonjour!</p>
            <p className="text-gray-900 font-bold text-lg leading-tight" data-testid="text-phone">
              {phonePrefix}{user.phone}
            </p>
          </div>
          <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center" data-testid="button-notifications">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* FONCTIONS PRATIQUES */}
        <div className="bg-white mt-2 px-4 pt-4 pb-5">
          <p className="text-gray-900 font-bold text-sm mb-4">FONCTIONS PRATIQUES</p>
          <div className="flex justify-around">
            <Link href="/deposit">
              <button className="flex flex-col items-center gap-1.5" data-testid="button-recharger">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e3f2fd, #bbdefb)" }}>
                  <img src={iconDeposit} alt="" className="w-8 h-8" />
                </div>
                <span className="text-gray-700 text-xs font-medium">Recharger</span>
              </button>
            </Link>
            <Link href="/withdrawal">
              <button className="flex flex-col items-center gap-1.5" data-testid="button-retirer">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fff8e1, #ffecb3)" }}>
                  <img src={iconWithdraw} alt="" className="w-8 h-8" />
                </div>
                <span className="text-gray-700 text-xs font-medium">Retirer</span>
              </button>
            </Link>
            <Link href="/service">
              <button className="flex flex-col items-center gap-1.5" data-testid="button-service">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f3e5f5, #e1bee7)" }}>
                  <img src={serviceIcon} alt="" className="w-8 h-8" />
                </div>
                <span className="text-gray-700 text-xs font-medium">Service</span>
              </button>
            </Link>
            <button onClick={() => navigate("/change-password")} className="flex flex-col items-center gap-1.5" data-testid="button-securite">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fce4ec, #f8bbd0)" }}>
                <img src={iconTeam} alt="" className="w-8 h-8" />
              </div>
              <span className="text-gray-700 text-xs font-medium">Sécurité</span>
            </button>
          </div>
        </div>

        {/* Invitation Banner */}
        <div className="mx-3 mt-3">
          <Link href="/team">
            <button className="w-full rounded-2xl overflow-hidden shadow-sm" data-testid="button-invite-banner">
              <img src={inviteBanner} alt="Invitez des amis" className="w-full object-cover" />
            </button>
          </Link>
        </div>

        {/* INVESTISSEMENTS CHAUDS */}
        <div className="mx-6 mt-4">
          <p className="text-gray-900 font-bold text-sm mb-3">INVESTISSEMENTS CHAUDS</p>

          {/* État du fonds */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🪙</span>
              <span className="text-gray-800 font-semibold text-sm">État du fonds</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs mb-1">Revenu du jour</p>
                <p className="font-bold text-sm" style={{ color: "#c8102e" }} data-testid="text-today-earnings">
                  {todayEarnings.toFixed(2)} {currency}
                </p>
                <p className="text-gray-500 text-xs mt-2 mb-1">Solde</p>
                <p className="font-bold text-sm" style={{ color: "#c8102e" }} data-testid="text-balance">
                  {balance.toFixed(2)} {currency}
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <img src={robotCoins} alt="" className="w-28 h-28 object-contain" />
                <Link href="/history">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-xs font-semibold" style={{ backgroundColor: "#c8102e" }} data-testid="button-history">
                    Historique <ChevronRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Carte bancaire */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-800 font-semibold text-sm mb-1">Carte bancaire</p>
                <p className="text-gray-500 text-xs">Gérez vos comptes bancaires pour les retraits</p>
                <Link href="/wallet">
                  <button className="mt-3 flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-xs font-semibold" style={{ backgroundColor: "#c8102e" }} data-testid="button-bank">
                    ALLER <ChevronRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
              <img src={robotWallet} alt="" className="w-28 h-28 object-contain ml-2 shrink-0" />
            </div>
          </div>

          {/* Échanger des récompenses */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-800 font-semibold text-sm mb-1">Échanger des récompenses</p>
                <p className="text-gray-500 text-xs">Utilisez votre code cadeau pour obtenir des bonus</p>
                <Link href="/gift-code">
                  <button className="mt-3 flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-xs font-semibold" style={{ backgroundColor: "#c8102e" }} data-testid="button-gift-code">
                    ALLER <ChevronRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
              <img src={giftBox} alt="" className="w-28 h-28 object-contain ml-2 shrink-0" />
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="mx-3 mt-1 space-y-3 pb-2">
          <button
            onClick={() => navigate("/change-password")}
            className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3.5 flex items-center justify-between"
            data-testid="button-change-password"
          >
            <div className="flex items-center gap-3">
              <img src={iconPassword} alt="" className="w-7 h-7" />
              <span className="text-gray-800 font-medium text-sm">Mot de passe</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <Link href="/my-products">
            <button
              className="w-full rounded-2xl px-4 py-4 text-white font-bold text-base shadow-sm"
              style={{ background: "linear-gradient(135deg, #1565c0, #1976d2)" }}
              data-testid="button-tasks"
            >
              Tâches
            </button>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3.5 flex items-center justify-center"
            data-testid="button-logout"
          >
            <span className="text-gray-500 font-medium text-sm">Déconnexion</span>
          </button>
        </div>

        {user.isAdmin && (
          <div className="mx-3 mt-3 mb-2">
            <button
              onClick={handleAdminClick}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl"
              style={{ background: "linear-gradient(135deg, #c8102e, #a00d25)" }}
              data-testid="button-admin"
            >
              <Shield className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-sm">Panel Admin</span>
            </button>
          </div>
        )}

      </div>

      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Code d'accès administrateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Entrez votre code PIN pour accéder au panel administrateur
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
              style={{ backgroundColor: "#c8102e" }}
              data-testid="button-verify-pin"
            >
              {verifyPinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
