import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency, getCountryByCode } from "@/lib/countries";
import { 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  History, 
  CreditCard, 
  Info, 
  BookOpen, 
  ChevronRight,
  LogOut,
  Shield,
  Maximize2,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DepositModal from "@/components/deposit-modal";
import WithdrawModal from "@/components/withdraw-modal";
import WalletModal from "@/components/wallet-modal";
import TransactionHistoryModal from "@/components/transaction-history-modal";
import AboutModal from "@/components/about-modal";
import RulesModal from "@/components/rules-modal";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");

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
  const initials = user.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      <div className="bg-secondary px-4 py-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 bg-card border-2 border-primary">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-secondary-foreground">{user.fullName}</h2>
              {user.isPromoter && <Badge className="text-xs">Promoteur</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{country?.flag} +{user.phone}</p>
          </div>
          <Button size="icon" variant="ghost" data-testid="button-expand">
            <Maximize2 className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-20">
        <Card className="bg-card">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-foreground" data-testid="text-account-balance">
              {formatCurrency(balance, user.country)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Solde du compte</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <Link href="/deposit">
                <Button
                  variant="ghost"
                  className="flex flex-col items-center gap-2 h-auto py-3"
                  data-testid="button-account-deposit"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <ArrowDownToLine className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs text-secondary-foreground">Recharger</span>
                </Button>
              </Link>

              <Link href="/withdrawal">
                <Button
                  variant="ghost"
                  className="flex flex-col items-center gap-2 h-auto py-3"
                  data-testid="button-account-withdraw"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <ArrowUpFromLine className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-xs text-secondary-foreground">Retirer</span>
                </Button>
              </Link>

              <Button
                variant="ghost"
                className="flex flex-col items-center gap-2 h-auto py-3"
                onClick={() => setShowHistory(true)}
                data-testid="button-history"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <History className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-xs text-secondary-foreground">Historique</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0 divide-y divide-border">
            <button
              className="w-full flex items-center justify-between p-4 hover-elevate"
              onClick={() => setShowWallet(true)}
              data-testid="button-manage-wallet"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Gestion de carte bancaire</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              className="w-full flex items-center justify-between p-4 hover-elevate"
              onClick={() => setShowAbout(true)}
              data-testid="button-about"
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-foreground">À propos de nous</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              className="w-full flex items-center justify-between p-4 hover-elevate"
              onClick={() => setShowRules(true)}
              data-testid="button-rules"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-foreground">Règles de la plateforme</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {user.isAdmin && (
              <button
                className="w-full flex items-center justify-between p-4 hover-elevate"
                onClick={handleAdminClick}
                data-testid="button-admin"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-foreground">Panel Administrateur</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Se déconnecter
        </Button>
      </div>

      <DepositModal open={showDeposit} onClose={() => setShowDeposit(false)} />
      <WithdrawModal open={showWithdraw} onClose={() => setShowWithdraw(false)} />
      <WalletModal open={showWallet} onClose={() => setShowWallet(false)} />
      <TransactionHistoryModal open={showHistory} onClose={() => setShowHistory(false)} />
      <AboutModal open={showAbout} onClose={() => setShowAbout(false)} />
      <RulesModal open={showRules} onClose={() => setShowRules(false)} />

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
