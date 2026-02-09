import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ChevronRight, Clock, Wallet } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { getCountryByCode } from "@/lib/countries";

interface WalletData {
  id: number;
  userId: number;
  accountName: string;
  accountNumber: string;
  paymentMethod: string;
  country: string;
  isDefault: boolean;
}

interface UserProduct {
  id: number;
  status: string;
}

export default function WithdrawalPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number | "">("");
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [, navigate] = useLocation();

  const countryInfo = user ? getCountryByCode(user.country) : null;
  const currency = countryInfo?.currency || "FCFA";
  const minWithdrawal = 1200;

  const { data: withdrawalSettings } = useQuery<{
    withdrawalFees: number;
    withdrawalStartHour: number;
    withdrawalEndHour: number;
    maxWithdrawalsPerDay: number;
  }>({
    queryKey: ["/api/settings/withdrawal"],
    staleTime: 0,
    refetchOnMount: true,
  });

  const withdrawalFee = withdrawalSettings?.withdrawalFees ?? 15;
  const withdrawalStartHour = withdrawalSettings?.withdrawalStartHour ?? 8;
  const withdrawalEndHour = withdrawalSettings?.withdrawalEndHour ?? 17;

  const amountAfterFees = amount ? Math.floor(Number(amount) * (1 - withdrawalFee / 100)) : 0;

  const currentHour = new Date().getHours();
  const isWithinWithdrawalHours = currentHour >= withdrawalStartHour && currentHour < withdrawalEndHour;

  const { data: wallets = [] } = useQuery<WalletData[]>({
    queryKey: ["/api/wallets"],
    refetchOnWindowFocus: true,
  });

  const { data: userProducts = [] } = useQuery<UserProduct[]>({
    queryKey: ["/api/user/products"],
  });

  const hasActiveProduct = userProducts.some((p) => p.status === "active");

  useEffect(() => {
    const savedWalletId = localStorage.getItem("selectedWalletId");
    if (savedWalletId && wallets.length > 0) {
      const wallet = wallets.find(w => w.id === parseInt(savedWalletId));
      if (wallet) {
        setSelectedWallet(wallet);
      }
      localStorage.removeItem("selectedWalletId");
    }
  }, [wallets]);

  useEffect(() => {
    if (!selectedWallet && wallets.length > 0) {
      const defaultWallet = wallets.find(w => w.isDefault);
      if (defaultWallet) {
        setSelectedWallet(defaultWallet);
      }
    }
  }, [wallets, selectedWallet]);

  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; walletId: number }) => {
      const res = await apiRequest("POST", "/api/withdrawals", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Demande envoyee",
        description: "Votre demande de retrait a ete envoyee.",
      });
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals"] });
      setAmount("");
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!isWithinWithdrawalHours) {
      toast({
        title: "Horaires de retrait",
        description: `Les retraits sont disponibles de ${withdrawalStartHour}h a ${withdrawalEndHour}h`,
        variant: "destructive",
      });
      return;
    }
    if (!hasActiveProduct) {
      toast({
        title: "Produit requis",
        description: "Vous devez avoir un produit actif pour effectuer un retrait",
        variant: "destructive",
      });
      return;
    }
    if (!amount || amount < minWithdrawal) {
      toast({
        title: "Montant invalide",
        description: `Le montant minimum est de ${minWithdrawal} ${currency}`,
        variant: "destructive",
      });
      return;
    }
    if (!selectedWallet) {
      toast({
        title: "Selectionnez un portefeuille",
        description: "Veuillez selectionner un portefeuille de retrait",
        variant: "destructive",
      });
      return;
    }
    withdrawMutation.mutate({ amount, walletId: selectedWallet.id });
  };

  const handleSelectWallet = () => {
    navigate("/wallet?from=withdrawal");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <Link href="/account">
          <button className="p-2" data-testid="button-back">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">Les retraits</h1>
        <Link href="/history">
          <button className="p-2" data-testid="button-history">
            <Clock className="w-5 h-5 text-[#2196F3]" />
          </button>
        </Link>
      </header>

      <div className="px-4 pt-4 pb-4">
        <div className="bg-gradient-to-r from-[#1976D2] to-[#2196F3] rounded-2xl p-5 shadow-lg">
          <p className="text-sm text-white/80">Solde du compte</p>
          <h2 className="text-3xl font-bold text-white mt-1" data-testid="text-balance">
            {currency} {parseFloat(user?.balance || "0").toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <button
          onClick={handleSelectWallet}
          className="w-full bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between shadow-sm"
          data-testid="button-select-wallet"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#2196F3]" />
            </div>
            <div className="text-left">
              {selectedWallet ? (
                <>
                  <p className="text-sm font-semibold text-gray-800">{selectedWallet.accountName}</p>
                  <p className="text-xs text-gray-500">{selectedWallet.accountNumber} - {selectedWallet.paymentMethod}</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Choisissez votre compte de retrait</p>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-700 mb-2">Montant du retrait</p>
          <div className="border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
            <span className="font-bold text-gray-800 text-sm">{currency}</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder="Veuillez entrer le montant"
              className="flex-1 text-sm outline-none text-gray-700 bg-transparent"
              data-testid="input-withdrawal-amount"
            />
          </div>
          <div className="flex items-center justify-between text-sm mt-3">
            <span className="text-gray-600">A recevoir: <span className="font-semibold text-gray-800">{currency} {amountAfterFees.toLocaleString()}</span></span>
            <span className="text-gray-400">Frais: {withdrawalFee}%</span>
          </div>
        </div>

        {!isWithinWithdrawalHours && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[#2196F3] text-sm">
            Horaires de retrait: {withdrawalStartHour}h - {withdrawalEndHour}h (Ferme actuellement)
          </div>
        )}

        {!hasActiveProduct && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
            Vous devez avoir un produit actif pour effectuer un retrait.
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={withdrawMutation.isPending || !amount || !selectedWallet || !hasActiveProduct}
          className="w-full py-3.5 bg-[#2196F3] text-white font-semibold rounded-full disabled:opacity-50 text-base shadow-lg"
          data-testid="button-submit-withdrawal"
        >
          {withdrawMutation.isPending ? "Envoi en cours..." : "Retirer de l'argent"}
        </button>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 text-sm mb-3">Instructions pour retraits</h3>
          <div className="space-y-2 text-sm text-gray-500 leading-relaxed">
            <p>1. L'heure de retrait est de {withdrawalStartHour}h00 a {withdrawalEndHour}h00 tous les jours et les retraits sont disponibles tous les jours.</p>
            <p>2. Vous pouvez retirer de l'argent une fois par jour.</p>
            <p>3. Le montant minimum de retrait est de {minWithdrawal} {currency}.</p>
            <p>4. Des frais de traitement de {withdrawalFee}% seront factures pour les retraits.</p>
            <p>5. Les retraits sont traites dans un delai de 1h a 24h maximum.</p>
            <p>6. Si le retrait echoue, veuillez verifier si les informations bancaires sont correctes, puis soumettez a nouveau la demande.</p>
            <p>7. Effectuez la premiere recharge et achetez des produits ELF pour activer la fonction de retrait.</p>
          </div>
        </div>

        <div className="h-6"></div>
      </div>
    </div>
  );
}
