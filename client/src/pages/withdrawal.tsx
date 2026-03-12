import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getCountryByCode } from "@/lib/countries";
import iconCardWhite from "@assets/téléchargement_(18)_1773330337885.png";
import iconCardBlack from "@assets/téléchargement_(20)_1773330337986.png";

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

  const { data: wallets = [], isLoading: walletsLoading } = useQuery<WalletData[]>({
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
      if (wallet) setSelectedWallet(wallet);
      localStorage.removeItem("selectedWalletId");
    }
  }, [wallets]);

  useEffect(() => {
    if (!selectedWallet && wallets.length > 0) {
      const defaultWallet = wallets.find(w => w.isDefault);
      if (defaultWallet) setSelectedWallet(defaultWallet);
    }
  }, [wallets, selectedWallet]);

  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; walletId: number }) => {
      const res = await apiRequest("POST", "/api/withdrawals", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Demande envoyée", description: "Votre demande de retrait a été envoyée." });
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
      toast({ title: "Horaires de retrait", description: `Les retraits sont disponibles de ${withdrawalStartHour}h à ${withdrawalEndHour}h`, variant: "destructive" });
      return;
    }
    if (!hasActiveProduct) {
      toast({ title: "Produit requis", description: "Vous devez avoir un produit actif pour effectuer un retrait", variant: "destructive" });
      return;
    }
    if (!amount || amount < minWithdrawal) {
      toast({ title: "Montant invalide", description: `Le montant minimum est de ${minWithdrawal} ${currency}`, variant: "destructive" });
      return;
    }
    if (!selectedWallet) {
      toast({ title: "Compte requis", description: "Veuillez sélectionner un compte bancaire", variant: "destructive" });
      return;
    }
    withdrawMutation.mutate({ amount, walletId: selectedWallet.id });
  };

  if (walletsLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c8102e]" />
      </div>
    );
  }

  if (!user) return null;

  const balance = parseFloat(user?.balance || "0");
  const hasWallets = wallets.length > 0;

  /* ── Main withdrawal page ── */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-[#c8102e]" />
          </button>
        </Link>
        <h1 className="text-base font-bold text-[#c8102e]">Retrait</h1>
        <Link href="/history">
          <button className="p-1" data-testid="button-history">
            <ChevronLeft className="w-6 h-6 text-[#c8102e] rotate-180" />
          </button>
        </Link>
      </header>

      {/* Balance Banner */}
      <div className="bg-[#c8102e] px-5 py-4 flex items-center gap-4">
        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
          <img
            src={iconCardWhite}
            alt="card"
            className="w-7 h-7 object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>
        <div>
          <p className="text-white text-2xl font-bold" data-testid="text-balance">
            {currency} {balance.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-white/75 text-xs mt-0.5">Solde du compte</p>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* Select bank account */}
        <button
          onClick={() => {
            if (!hasWallets) {
              navigate("/wallet");
            } else {
              navigate("/wallet?from=withdrawal");
            }
          }}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-sm"
          data-testid="button-select-wallet"
        >
          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <img
              src={iconCardBlack}
              alt="card"
              className="w-6 h-6 object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
          <div className="flex-1 text-left">
            {selectedWallet ? (
              <>
                <p className="text-sm font-semibold text-gray-800">{selectedWallet.accountName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{selectedWallet.accountNumber} · {selectedWallet.paymentMethod}</p>
              </>
            ) : hasWallets ? (
              <p className="text-sm text-[#c8102e] font-medium">Sélectionner un compte bancaire</p>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#c8102e]" />
                <p className="text-sm text-[#c8102e] font-medium">Ajouter un portefeuille de retrait</p>
              </div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Amount section */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="font-bold text-[#c8102e] text-sm mb-3">Montant du retrait</p>

          <div className="border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
            <span className="font-bold text-[#c8102e] text-sm">{currency}</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder="Veuillez saisir le montant du retrait."
              className="flex-1 text-sm outline-none text-gray-500 bg-transparent"
              data-testid="input-withdrawal-amount"
            />
          </div>

          <div className="flex items-center justify-between text-xs mt-3">
            <span className="text-[#c8102e]">
              Montant reçu: <span className="font-semibold">{currency} {amountAfterFees.toLocaleString()}</span>
            </span>
            <span className="text-gray-400">Impôt: {withdrawalFee}%</span>
          </div>
        </div>

        {/* Warnings */}
        {!isWithinWithdrawalHours && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[#c8102e] text-xs">
            ⏰ Horaires de retrait : {withdrawalStartHour}h00 - {withdrawalEndHour}h00 (Fermé actuellement)
          </div>
        )}
        {!hasActiveProduct && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[#c8102e] text-xs">
            ⚠️ Vous devez avoir un produit actif pour effectuer un retrait.
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={withdrawMutation.isPending || !amount || !selectedWallet || !hasActiveProduct}
          className="w-full py-4 rounded-full text-white font-bold text-base disabled:opacity-40 shadow-md"
          style={{ background: "linear-gradient(135deg, #c8102e, #a00d25)" }}
          data-testid="button-submit-withdrawal"
        >
          {withdrawMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Envoi en cours...
            </span>
          ) : (
            "Retirez-vous maintenant"
          )}
        </button>

        {/* Instructions */}
        <div className="pt-2 pb-8">
          <p className="font-bold text-[#c8102e] text-sm mb-3">Instructions de retrait</p>
          <div className="space-y-2.5 text-sm text-[#c8102e] leading-relaxed">
            <p>1. Le montant minimum de retrait est de {minWithdrawal.toLocaleString()} {currency}.</p>
            <p>2. Il n'y a pas de limite de temps pour les retraits, mais une limite de trois retraits par jour est autorisée.</p>
            <p>3. Des frais de traitement de {withdrawalFee}% seront appliqués sur chaque retrait.</p>
            <p>4. Les retraits seront disponibles sous 2 heures, et exceptionnellement sous 24 heures.</p>
            <p>5. Si le retrait échoue, vérifiez que vos informations bancaires sont correctes, puis soumettez à nouveau la demande.</p>
            <p>6. Effectuez votre première recharge et achetez des produits Wendy's pour activer la fonction de retrait.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
