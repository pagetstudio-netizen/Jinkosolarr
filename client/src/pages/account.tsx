import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCountryByCode } from "@/lib/countries";
import { 
  Info, 
  Headphones, 
  Users, 
  FileText,
  CreditCard,
  Lock,
  LogOut,
  Shield,
  Loader2,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AboutModal from "@/components/about-modal";
import RulesModal from "@/components/rules-modal";
import ChangePasswordModal from "@/components/change-password-modal";
import WalletModal from "@/components/wallet-modal";

import fanucLogo from "@/assets/images/fanuc-circle-logo.png";
import mascotWaving from "@/assets/images/mascot-waving.png";
import retirerBtn from "@/assets/images/retirer-btn.png";
import rechargerBtn from "@/assets/images/recharger-btn.png";
import tasksBanner from "@/assets/images/tasks-banner.webp";

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
  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";
  const phonePrefix = country?.phonePrefix || "";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const openSupport = () => {
    window.open(settings?.supportLink || "https://t.me/+DOnUcJs7idVmN2E0", "_blank");
  };

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="flex items-center gap-3 px-4 py-4">
          <img src={fanucLogo} alt="FANUC" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold text-gray-800" data-testid="text-user-phone">
            +{phonePrefix} {user.phone}
          </span>
        </div>

        <div className="px-4">
          <div className="bg-pink-200 rounded-3xl p-5 relative overflow-hidden shadow-md" style={{ minHeight: "160px" }}>
            <div className="relative z-10">
              <p className="text-gray-700 font-medium text-base mb-1">Soldes du Compte</p>
              <p className="text-4xl font-bold text-gray-800" data-testid="text-account-balance">
                {balance.toLocaleString()} {currency}
              </p>
            </div>
            <img 
              src={mascotWaving} 
              alt="Mascot" 
              className="absolute right-0 bottom-0 h-36 object-contain"
              style={{ marginRight: "-10px", marginBottom: "-5px" }}
            />
            
            <div className="flex gap-2 mt-4 relative z-10">
              <Link href="/withdrawal" className="flex-1">
                <img 
                  src={retirerBtn} 
                  alt="Retirer" 
                  className="w-full h-12 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  data-testid="button-account-withdraw"
                />
              </Link>
              <Link href="/deposit" className="flex-1">
                <img 
                  src={rechargerBtn} 
                  alt="Recharger" 
                  className="w-full h-12 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  data-testid="button-account-deposit"
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="px-4 mt-4">
          <Link href="/tasks">
            <div className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow" style={{ minHeight: "120px" }}>
              <img 
                src={tasksBanner} 
                alt="Factory" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-white text-xl font-bold mb-1">Centre de taches</h3>
                  <p className="text-white/90 text-sm">
                    Accomplissez des missions pour gagner des bonus supplementaires.
                  </p>
                </div>
                <button className="self-start bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 mt-3 hover:bg-red-600 transition-colors">
                  Acceder <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Link>
        </div>

        <div className="px-4 mt-6">
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => setShowAbout(true)}
              className="flex flex-col items-center gap-2"
              data-testid="button-about"
            >
              <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center">
                <Info className="w-7 h-7 text-pink-400" />
              </div>
              <span className="text-xs text-gray-600 text-center leading-tight">a propos de nous</span>
            </button>

            <button
              onClick={openSupport}
              className="flex flex-col items-center gap-2"
              data-testid="button-support"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                <Headphones className="w-7 h-7 text-amber-500" />
              </div>
              <span className="text-xs text-gray-600 text-center leading-tight">Service Client</span>
            </button>

            <Link href="/team">
              <button className="flex flex-col items-center gap-2" data-testid="button-team">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-500" />
                </div>
                <span className="text-xs text-gray-600 text-center leading-tight">Equipe</span>
              </button>
            </Link>

            <button
              onClick={() => setShowRules(true)}
              className="flex flex-col items-center gap-2"
              data-testid="button-rules"
            >
              <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center">
                <FileText className="w-7 h-7 text-pink-400" />
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
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-blue-500" />
              </div>
              <span className="text-xs text-gray-600 text-center leading-tight">Lier le compte de portefeuille</span>
            </button>

            <button
              onClick={() => setShowChangePassword(true)}
              className="flex flex-col items-center gap-2"
              data-testid="button-change-password"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                <Lock className="w-7 h-7 text-amber-500" />
              </div>
              <span className="text-xs text-gray-600 text-center leading-tight">Changer le mot de passe</span>
            </button>

            {user.isAdmin && (
              <button
                onClick={handleAdminClick}
                className="flex flex-col items-center gap-2"
                data-testid="button-admin"
              >
                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-red-500" />
                </div>
                <span className="text-xs text-gray-600 text-center leading-tight">Panel Admin</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-2"
              data-testid="button-logout"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <LogOut className="w-7 h-7 text-gray-500" />
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
