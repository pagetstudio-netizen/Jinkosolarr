import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Loader2, Plus, CreditCard } from "lucide-react";
import { Link, useLocation } from "wouter";
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
  const currency = countryInfo?.currency || "XOF";
  const minWithdrawal = 1200;

  const { data: withdrawalSettings } = useQuery<{
    withdrawalFees: number;
    withdrawalStartHour: number;
    withdrawalEndHour: number;
  }>({
    queryKey: ["/api/settings/withdrawal"],
    staleTime: 0,
    refetchOnMount: true,
  });

  const withdrawalFee = withdrawalSettings?.withdrawalFees ?? 17;
  const withdrawalStartHour = withdrawalSettings?.withdrawalStartHour ?? 8;
  const withdrawalEndHour = withdrawalSettings?.withdrawalEndHour ?? 17;

  const amountAfterFees = amount
    ? Math.floor(Number(amount) * (1 - withdrawalFee / 100))
    : 0;

  const currentHour = new Date().getHours();
  const isWithinWithdrawalHours =
    currentHour >= withdrawalStartHour && currentHour < withdrawalEndHour;

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
      const wallet = wallets.find((w) => w.id === parseInt(savedWalletId));
      if (wallet) setSelectedWallet(wallet);
      localStorage.removeItem("selectedWalletId");
    }
  }, [wallets]);

  useEffect(() => {
    if (!selectedWallet && wallets.length > 0) {
      const defaultWallet = wallets.find((w) => w.isDefault);
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
      toast({
        title: "Horaires de retrait",
        description: `Les retraits sont disponibles de ${withdrawalStartHour}h à ${withdrawalEndHour}h`,
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
        title: "Compte requis",
        description: "Veuillez sélectionner un compte bancaire",
        variant: "destructive",
      });
      return;
    }
    withdrawMutation.mutate({ amount, walletId: selectedWallet.id });
  };

  if (walletsLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#3db51d" }} />
      </div>
    );
  }

  if (!user) return null;

  const balance = parseFloat(user?.balance || "0");
  const hasWallets = wallets.length > 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f5f5" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
        </Link>
        <h1 className="text-base font-bold text-gray-800">Retrait</h1>
        <Link href="/withdrawal-history">
          <button className="p-1" data-testid="button-history">
            <ChevronLeft className="w-6 h-6 text-gray-700 rotate-180" />
          </button>
        </Link>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* ── Balance card ── */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: "#3db51d" }}>Solde du compte</p>
            <p className="text-3xl font-extrabold mt-1" style={{ color: "#3db51d" }} data-testid="text-balance">
              {balance.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}<span className="text-xl ml-1">{currency}</span>
            </p>
          </div>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "#3db51d" }}
          >
            <CreditCard className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* ── Amount input card ── */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <p className="text-xs" style={{ color: "#3db51d" }}>
            Veuillez saisir le montant de retrait
          </p>
          <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder="montant"
              className="flex-1 text-xl font-semibold text-gray-700 outline-none bg-transparent"
              data-testid="input-withdrawal-amount"
            />
            <span className="text-gray-400 font-semibold text-base ml-2">{currency}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Montant reçu :{" "}
              <span className="font-semibold text-gray-700">
                {amountAfterFees.toLocaleString()}
              </span>
            </span>
            <span className="text-gray-400">Taxe : {withdrawalFee.toFixed(2)}%</span>
          </div>
        </div>

        {/* ── Choose wallet button ── */}
        <button
          onClick={() => navigate(hasWallets ? "/wallet?from=withdrawal" : "/wallet")}
          className="w-full py-4 rounded-2xl text-white font-bold text-sm flex items-center gap-3 px-5"
          style={{ background: "#3db51d" }}
          data-testid="button-select-wallet"
        >
          <CreditCard className="w-5 h-5 text-white" />
          <span className="flex-1 text-left">
            {selectedWallet
              ? `${selectedWallet.accountName} · ${selectedWallet.accountNumber}`
              : hasWallets
              ? "Choisissez votre portefeuille"
              : "Ajouter un portefeuille"}
          </span>
          <span className="text-white font-bold text-lg">›</span>
        </button>

        {/* Warnings */}
        {!isWithinWithdrawalHours && (
          <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm" style={{ color: "#3db51d" }}>
            ⏰ Horaires de retrait : {withdrawalStartHour}h00 – {withdrawalEndHour}h00 (Fermé actuellement)
          </div>
        )}
        {!hasActiveProduct && (
          <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm" style={{ color: "#3db51d" }}>
            ⚠️ Vous devez avoir un produit actif pour effectuer un retrait.
          </div>
        )}

        {/* ── Submit button ── */}
        <button
          onClick={handleSubmit}
          disabled={withdrawMutation.isPending || !amount || !selectedWallet || !hasActiveProduct}
          className="w-full py-4 rounded-full text-white font-bold text-base shadow disabled:opacity-40"
          style={{ background: "#3db51d" }}
          data-testid="button-submit-withdrawal"
        >
          {withdrawMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Envoi en cours...
            </span>
          ) : (
            "Retirer maintenant"
          )}
        </button>

        {/* ── Instructions ── */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3 pb-8">
          <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
            💳 Instructions de Retrait :
          </p>
          <div className="space-y-2.5 text-sm text-gray-600 leading-relaxed">
            <div className="flex gap-2">
              <span style={{ color: "#3db51d" }}>◆</span>
              <span>
                <span className="font-bold">Montant minimum de retrait :</span>{" "}
                {minWithdrawal.toLocaleString()} {currency}
              </span>
            </div>
            <div className="flex gap-2">
              <span style={{ color: "#3db51d" }}>◆</span>
              <span>
                <span className="font-bold">Retraits possibles à tout moment</span>, sans limite de
                temps, de montant ou de fréquence
              </span>
            </div>
            <div className="flex gap-2">
              <span style={{ color: "#3db51d" }}>◆</span>
              <span>
                <span className="font-bold">Frais de retrait :</span> {withdrawalFee}% par transaction
              </span>
            </div>
            <div className="flex gap-2">
              <span style={{ color: "#3db51d" }}>◆</span>
              <span>
                <span className="font-bold">Délai de traitement :</span> généralement dans les 2 heures, jusqu'à 24h dans des cas exceptionnels
              </span>
            </div>
            <div className="flex gap-2">
              <span style={{ color: "#3db51d" }}>◆</span>
              <span>
                Si le retrait échoue, vérifiez que vos informations de portefeuille sont correctes
                et soumettez à nouveau la demande.
              </span>
            </div>
            <div className="flex gap-2">
              <span style={{ color: "#3db51d" }}>◆</span>
              <span>
                Effectuez votre première recharge et activez un produit Jinko Solar pour débloquer
                la fonction de retrait.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
