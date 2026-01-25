import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency, getCountryByCode } from "@/lib/countries";
import { 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  History, 
  Info, 
  Headphones, 
  Users, 
  FileText,
  CreditCard,
  Lock,
  LogOut,
  Shield,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AboutModal from "@/components/about-modal";
import RulesModal from "@/components/rules-modal";
import ChangePasswordModal from "@/components/change-password-modal";
import WalletModal from "@/components/wallet-modal";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showAbout, setShowAbout] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");

  const { data: settings } = useQuery<{ supportLink: string; channelLink: string; groupLink: string }>({
    queryKey: ["/api/settings/links"],
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
  const initials = user.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const openSupport = () => {
    window.open(settings?.supportLink || "https://t.me/+DOnUcJs7idVmN2E0", "_blank");
  };

  return (
    <div className="flex flex-col min-h-full bg-amber-50">
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400"></div>
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-10">
          <Avatar className="w-20 h-20 border-4 border-white shadow-lg bg-amber-500">
            <AvatarFallback className="bg-amber-500 text-white text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="text-center mt-12 mb-4">
        <p className="text-lg font-semibold text-gray-800" data-testid="text-user-phone">
          +{user.phone}
        </p>
      </div>

      <div className="flex-1 px-4 space-y-4 overflow-y-auto pb-24">
        <div className="flex justify-center gap-8 py-2">
          <Link href="/deposit">
            <button className="flex flex-col items-center gap-2" data-testid="button-account-deposit">
              <div className="w-14 h-14 rounded-full bg-white border-2 border-pink-200 flex items-center justify-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-gradient-to-b from-pink-100 to-pink-50 flex items-center justify-center">
                  <ArrowDownToLine className="w-5 h-5 text-pink-500" />
                </div>
              </div>
              <span className="text-xs text-gray-600">Recharger</span>
            </button>
          </Link>

          <Link href="/withdrawal">
            <button className="flex flex-col items-center gap-2" data-testid="button-account-withdraw">
              <div className="w-14 h-14 rounded-full bg-white border-2 border-pink-200 flex items-center justify-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-gradient-to-b from-pink-100 to-pink-50 flex items-center justify-center">
                  <ArrowUpFromLine className="w-5 h-5 text-pink-500" />
                </div>
              </div>
              <span className="text-xs text-gray-600">Retrait</span>
            </button>
          </Link>

          <Link href="/history">
            <button className="flex flex-col items-center gap-2" data-testid="button-history">
              <div className="w-14 h-14 rounded-full bg-white border-2 border-pink-200 flex items-center justify-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-gradient-to-b from-pink-100 to-pink-50 flex items-center justify-center">
                  <History className="w-5 h-5 text-pink-500" />
                </div>
              </div>
              <span className="text-xs text-gray-600">Historique</span>
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-pink-400 to-pink-300 rounded-xl p-4 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xl font-bold" data-testid="text-account-balance">
                {balance.toLocaleString()} {currency}
              </p>
              <p className="text-xs opacity-90 mt-1">Solde du compte</p>
            </div>
            <div className="absolute right-2 bottom-2 opacity-80">
              <Wallet className="w-10 h-10" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-xl p-4 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xl font-bold" data-testid="text-total-earnings">
                {totalEarnings.toLocaleString()} {currency}
              </p>
              <p className="text-xs opacity-90 mt-1">Revenus accumules</p>
            </div>
            <div className="absolute right-2 bottom-2 opacity-80">
              <Wallet className="w-10 h-10" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => setShowAbout(true)}
              className="flex flex-col items-center gap-2"
              data-testid="button-about"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                <Info className="w-6 h-6 text-pink-400" />
              </div>
              <span className="text-xs text-gray-600 text-center leading-tight">a propos de nous</span>
            </button>

            <button
              onClick={openSupport}
              className="flex flex-col items-center gap-2"
              data-testid="button-support"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                <Headphones className="w-6 h-6 text-pink-400" />
              </div>
              <span className="text-xs text-gray-600 text-center leading-tight">Service Client</span>
            </button>

            <Link href="/team">
              <button className="flex flex-col items-center gap-2" data-testid="button-team">
                <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-pink-400" />
                </div>
                <span className="text-xs text-gray-600 text-center leading-tight">Equipe</span>
              </button>
            </Link>

            <button
              onClick={() => setShowRules(true)}
              className="flex flex-col items-center gap-2"
              data-testid="button-rules"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                <FileText className="w-6 h-6 text-pink-400" />
              </div>
              <span className="text-xs text-gray-600 text-center leading-tight">Regles de la plateforme</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            <button
              onClick={() => setShowWallet(true)}
              className="flex flex-col items-center gap-2"
              data-testid="button-wallet"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-cyan-500" />
              </div>
              <span className="text-xs text-gray-600 text-center leading-tight">Lier le compte de portefeuille</span>
            </button>

            <button
              onClick={() => setShowChangePassword(true)}
              className="flex flex-col items-center gap-2"
              data-testid="button-change-password"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <Lock className="w-6 h-6 text-amber-500" />
              </div>
              <span className="text-xs text-gray-600 text-center leading-tight">Changer le mot de passe</span>
            </button>

            {user.isAdmin && (
              <button
                onClick={handleAdminClick}
                className="flex flex-col items-center gap-2"
                data-testid="button-admin"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-500" />
                </div>
                <span className="text-xs text-gray-600 text-center leading-tight">Panel Admin</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-2"
              data-testid="button-logout"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <LogOut className="w-6 h-6 text-gray-500" />
              </div>
              <span className="text-xs text-gray-600 text-center leading-tight">Deconnexion</span>
            </button>
          </div>
        </div>
      </div>

      <AboutModal open={showAbout} onClose={() => setShowAbout(false)} />
      <RulesModal open={showRules} onClose={() => setShowRules(false)} />
      <ChangePasswordModal open={showChangePassword} onClose={() => setShowChangePassword(false)} />
      <WalletModal open={showWallet} onClose={() => setShowWallet(false)} />

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
