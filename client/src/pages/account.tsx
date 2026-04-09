import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCountryByCode } from "@/lib/countries";
import { Loader2, Shield, ChevronRight, Copy, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import jinkoLogo from "@assets/jinko-solar-logo-png_seeklogo-265492_1775671142176.png";
import iconDeposit from "@assets/20260312_105135_1773312869115.png";
import iconWithdraw from "@assets/20260312_105153_1773312869170.png";
import serviceIcon from "@assets/20260312_105210_1773312869198.png";
import iconSecurite from "@assets/20260312_105239_1773312869222.png";
import giftBox from "@assets/20260312_072546_1773301338613.png";

const GREEN = "#3db51d";
const GREEN_DARK = "#2a8d13";

const carbonCard: React.CSSProperties = {
  backgroundColor: "#161616",
  backgroundImage: `
    repeating-linear-gradient(
      45deg,
      rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px,
      transparent 1px, transparent 8px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px,
      transparent 1px, transparent 8px
    )
  `,
  borderRadius: 20,
};

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");

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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const copyCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast({ title: "Code copié !" });
    }
  };

  if (!user) return null;

  const balance = parseFloat(user.balance || "0");
  const todayEarnings = products?.reduce((sum: number, p: any) => sum + parseFloat(p.dailyIncome || "0"), 0) || 0;
  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";
  const phonePrefix = country?.phonePrefix || "";

  const menuItems = [
    { icon: iconWithdraw, label: "Mon portefeuille", href: "/wallet" },
    { icon: iconDeposit, label: "Recharger", href: "/deposit" },
    { icon: giftBox, label: "Argent gratuit", href: "/gift-code" },
    { icon: iconDeposit, label: "Historique des dépôts", href: "/deposit-orders" },
    { icon: iconWithdraw, label: "Historique des retraits", href: "/withdrawal-history" },
    { icon: serviceIcon, label: "Nous contacter", href: "/service" },
    { icon: iconSecurite, label: "Sécurité", href: "/change-password" },
  ];

  return (
    <div className="flex flex-col min-h-full bg-gray-100">
      <div className="flex-1 overflow-y-auto pb-24">

        {/* Green header */}
        <div
          className="px-4 pt-5 pb-6"
          style={{ background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` }}
        >
          {/* Top row: logo + chat icon */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                <img src={jinkoLogo} alt="Jinko Solar" className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-extrabold text-lg tracking-tight">Jinko Solar</span>
            </div>
            {user.isAdmin && (
              <button
                onClick={handleAdminClick}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)" }}
                data-testid="button-admin"
              >
                <Shield className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* User info row */}
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)" }}
            >
              <img src={jinkoLogo} alt="" className="w-10 h-10 object-contain rounded-full" />
            </div>
            <div>
              <p className="text-white font-extrabold text-xl leading-tight" data-testid="text-phone">
                {phonePrefix}{user.phone}
              </p>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 mt-0.5"
                data-testid="button-copy-code"
              >
                <span className="text-white/70 text-xs">
                  Code d'invitation: <span className="text-white font-semibold">{user.referralCode}</span>
                </span>
                <Copy size={12} color="rgba(255,255,255,0.7)" />
              </button>
            </div>
          </div>
        </div>

        {/* Balance card (carbon fiber) */}
        <div className="mx-3 -mt-3">
          <div style={carbonCard} className="p-4 shadow-xl">
            {/* Solde + buttons */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-semibold">Solde</span>
              <div className="flex gap-2">
                <Link href="/deposit">
                  <button
                    className="px-4 py-1.5 rounded-full text-white text-xs font-bold"
                    style={{ background: `linear-gradient(90deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` }}
                    data-testid="button-recharger"
                  >
                    Recharger
                  </button>
                </Link>
                <Link href="/withdrawal">
                  <button
                    className="px-4 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: "#2a2a2a", color: "#ccc", border: "1px solid #444" }}
                    data-testid="button-retrait"
                  >
                    Retrait
                  </button>
                </Link>
              </div>
            </div>

            {/* Big balance */}
            <p
              className="text-3xl font-extrabold mb-4"
              style={{ color: GREEN }}
              data-testid="text-balance"
            >
              {balance.toFixed(0)}
            </p>

            {/* Stats row */}
            <div className="flex justify-between pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div>
                <p className="text-gray-500 text-[10px] leading-tight mb-1">Gains<br />d'aujourd'hui</p>
                <p className="text-white font-bold text-sm" data-testid="text-today-earnings">
                  {todayEarnings.toFixed(0)}
                </p>
              </div>
              <div className="w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="text-center">
                <p className="text-gray-500 text-[10px] leading-tight mb-1">Gains<br />d'hier</p>
                <p className="text-white font-bold text-sm">0</p>
              </div>
              <div className="w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="text-right">
                <p className="text-gray-500 text-[10px] leading-tight mb-1">Revenu<br />cumulé</p>
                <p className="text-white font-bold text-sm" data-testid="text-cumulative">
                  {balance.toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu items — white card */}
        <div className="mx-3 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          {menuItems.map((item, idx) => (
            <Link href={item.href} key={item.label}>
              <button
                className="w-full flex items-center px-4 py-3.5 text-left"
                style={{
                  borderBottom: idx < menuItems.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
                data-testid={`button-menu-${idx}`}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mr-3 shrink-0"
                  style={{ background: "#f5f5f5" }}>
                  <img src={item.icon} alt="" className="w-5 h-5 object-contain" />
                </div>
                <span className="flex-1 text-gray-800 font-medium text-sm">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            </Link>
          ))}
        </div>

        {/* Logout — separate card */}
        <div className="mx-3 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3.5"
            data-testid="button-logout"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mr-3 shrink-0"
              style={{ background: "#fff0f0" }}>
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <span className="flex-1 text-gray-800 font-medium text-sm">Déconnexion</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        <div className="h-4" />
      </div>

      {/* PIN modal */}
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
              onClick={() => {
                if (adminPin.length < 4) {
                  toast({ title: "Le code PIN doit contenir au moins 4 caractères", variant: "destructive" });
                  return;
                }
                verifyPinMutation.mutate(adminPin);
              }}
              disabled={verifyPinMutation.isPending || adminPin.length < 4}
              className="w-full"
              style={{ backgroundColor: GREEN }}
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
