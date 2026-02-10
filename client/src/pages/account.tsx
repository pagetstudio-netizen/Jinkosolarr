import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCountryByCode } from "@/lib/countries";
import { 
  Zap,
  TrendingUp,
  Users,
  DollarSign,
  CalendarCheck,
  FileText,
  ChevronRight,
  Copy,
  Loader2,
  Shield,
  LogOut,
  Lock,
  BookOpen,
  Gift,
  ClipboardList
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import elfLogo from "@assets/elf-logo-1-jpg_1770372668472.webp";
import globeImg from "@/assets/images/elf-station-2.jpeg";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");

  const { data: userProducts } = useQuery<any[]>({
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
  const activeProducts = userProducts?.length || 0;

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

  return (
    <div className="flex flex-col min-h-full bg-gray-100">
      <div className="flex-1 overflow-y-auto pb-24">

        <div className="relative" style={{ background: "linear-gradient(135deg, #0d47a1 0%, #1565c0 40%, #1976d2 70%, #1e88e5 100%)" }}>
          <div className="absolute inset-0 overflow-hidden">
            <img src={globeImg} alt="" className="absolute right-0 top-0 w-40 h-full object-cover opacity-30" />
          </div>
          <div className="relative z-10 flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-xl tracking-tight">elf</span>
              <span className="text-lg">🇨🇲</span>
              <span className="text-[#64B5F6] font-bold text-sm" data-testid="text-user-id">
                id: {user.referralCode}
              </span>
              <button onClick={handleCopyId} data-testid="button-copy-id">
                <Copy className="w-3.5 h-3.5 text-[#64B5F6]" />
              </button>
            </div>
            <span className="bg-[#2196F3] text-white text-xs font-bold px-3 py-1.5 rounded-md">
              PV1
            </span>
          </div>
        </div>

        <div className="mx-4 -mt-1 bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex-1">
              <p className="text-gray-500 text-sm text-center">Equilibre</p>
              <p className="text-gray-900 text-3xl font-black text-center mt-1" data-testid="text-account-balance">
                {balance.toFixed(2)} {currency}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-[#e3f2fd] flex items-center justify-center ml-3">
              <DollarSign className="w-7 h-7 text-[#2196F3]" />
            </div>
          </div>

          <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex-1 text-center">
              <p className="text-gray-500 text-xs">Nombre d'appareils</p>
              <p className="text-gray-900 text-xl font-bold mt-1">{activeProducts}</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="flex-1 text-center">
              <p className="text-gray-500 text-xs">Maitre d'ouvrage</p>
              <p className="text-gray-900 text-xl font-bold mt-1" data-testid="text-total-earnings">{totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5">
          <div className="flex justify-between">
            <Link href="/deposit" className="flex-1">
              <button className="w-full flex flex-col items-center gap-2" data-testid="button-account-deposit">
                <div className="w-14 h-14 rounded-full bg-[#2196F3] flex items-center justify-center">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <span className="text-gray-700 text-xs font-medium">Recharger</span>
              </button>
            </Link>
            <Link href="/withdrawal" className="flex-1">
              <button className="w-full flex flex-col items-center gap-2" data-testid="button-account-withdraw">
                <div className="w-14 h-14 rounded-full bg-[#1976D2] flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <span className="text-gray-700 text-xs font-medium">Retirer</span>
              </button>
            </Link>
            <Link href="/team" className="flex-1">
              <button className="w-full flex flex-col items-center gap-2" data-testid="button-team">
                <div className="w-14 h-14 rounded-full bg-[#42A5F5] flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <span className="text-gray-700 text-xs font-medium">Equipe</span>
              </button>
            </Link>
            <Link href="/wallet" className="flex-1">
              <button className="w-full flex flex-col items-center gap-2" data-testid="button-wallet">
                <div className="w-14 h-14 rounded-full bg-[#0D47A1] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">PV</span>
                </div>
                <span className="text-gray-700 text-xs font-medium">PV fonds</span>
              </button>
            </Link>
          </div>
        </div>

        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Link href="/history">
            <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100" data-testid="button-history">
              <div className="w-11 h-11 rounded-xl bg-[#e3f2fd] flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-[#2196F3]" />
              </div>
              <span className="text-gray-800 text-sm font-medium flex-1">Enregistrement du solde</span>
            </div>
          </Link>

          <Link href="/orders">
            <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100" data-testid="button-transactions">
              <div className="w-11 h-11 rounded-xl bg-[#e3f2fd] flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#2196F3]" />
              </div>
              <span className="text-gray-800 text-sm font-medium flex-1">Recharger l'enregistrement</span>
              <ChevronRight className="w-5 h-5 text-[#2196F3]" />
            </div>
          </Link>

          <Link href="/gift-code">
            <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100" data-testid="button-gift-code">
              <div className="w-11 h-11 rounded-xl bg-[#e3f2fd] flex items-center justify-center">
                <Gift className="w-5 h-5 text-[#2196F3]" />
              </div>
              <span className="text-gray-800 text-sm font-medium flex-1">Echanger la recompense</span>
              <ChevronRight className="w-5 h-5 text-[#2196F3]" />
            </div>
          </Link>

          <button
            onClick={() => navigate("/change-password")}
            className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-100"
            data-testid="button-change-password"
          >
            <div className="w-11 h-11 rounded-xl bg-[#e3f2fd] flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#2196F3]" />
            </div>
            <span className="text-gray-800 text-sm font-medium flex-1 text-left">Changer le mot de passe</span>
            <ChevronRight className="w-5 h-5 text-[#2196F3]" />
          </button>

          <Link href="/rules">
            <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100" data-testid="button-rules">
              <div className="w-11 h-11 rounded-xl bg-[#e3f2fd] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#2196F3]" />
              </div>
              <span className="text-gray-800 text-sm font-medium flex-1">Guide utilisateur</span>
              <ChevronRight className="w-5 h-5 text-[#2196F3]" />
            </div>
          </Link>

          {user.isAdmin && (
            <button
              onClick={handleAdminClick}
              className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-100"
              data-testid="button-admin"
            >
              <div className="w-11 h-11 rounded-xl bg-[#e3f2fd] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#2196F3]" />
              </div>
              <span className="text-gray-800 text-sm font-medium flex-1 text-left">Panel Admin</span>
              <ChevronRight className="w-5 h-5 text-[#2196F3]" />
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4"
            data-testid="button-logout"
          >
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-red-500 text-sm font-medium flex-1 text-left">Deconnexion</span>
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
