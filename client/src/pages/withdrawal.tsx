import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Loader2 } from "lucide-react";
import historyIcon from "@assets/5708960_1774829436660-C3SIos42_1775833646464.png";
import jinkoBg from "@assets/15502488526db98c02ac135d0ac0e262d31dee111d_1775833317804.jpg";
import { Link, useLocation } from "wouter";
import { getCountryByCode } from "@/lib/countries";

const GREEN = "#3db51d";

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
  useEffect(() => { document.title = "Retrait | Jinko Solar"; }, []);
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
  const hasWallets = wallets.length > 0;

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: GREEN }}>
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!user) return null;

  const balance = parseFloat(user?.balance || "0");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f5f5", overflowX: "hidden" }}>

      {/* ── Zone image : en-tête + carte ── */}
      <div style={{ backgroundImage: `url(${jinkoBg})`, backgroundSize: "cover", backgroundPosition: "center", paddingBottom: 32 }}>

      {/* Header sur fond image */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4">
        <Link href="/account">
          <button data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </Link>
        <h1 className="text-lg font-bold text-white">Retrait</h1>
        <Link href="/withdrawal-history">
          <button data-testid="button-history">
            <img src={historyIcon} alt="Historique" style={{ width: 26, height: 26, objectFit: "contain" }} />
          </button>
        </Link>
      </div>

      {/* Carte blanche principale */}
      <div className="bg-white shadow-lg overflow-hidden" style={{ marginLeft: 16, marginRight: 0, borderRadius: "24px 0 0 24px" }}>

        {/* Section solde — fond vert clair */}
        <div
          className="flex items-center justify-between px-5 py-5"
          style={{ background: "#e8f8e0" }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: GREEN }}>
              Solde du compte
            </p>
            <p
              className="text-4xl font-extrabold mt-1 leading-tight"
              style={{ color: GREEN }}
              data-testid="text-balance"
            >
              {balance.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}
              <span className="text-2xl font-bold ml-1">{currency}</span>
            </p>
          </div>
          {/* Icône portefeuille */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center shadow"
            style={{ background: "white" }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="3" y="9" width="26" height="18" rx="3" fill={GREEN} />
              <rect x="3" y="7" width="26" height="6" rx="2" fill={GREEN} opacity="0.6" />
              <circle cx="23" cy="18" r="2.5" fill="white" />
            </svg>
          </div>
        </div>

        {/* Section saisie montant */}
        <div className="px-5 pt-4 pb-5">
          <p className="text-sm mb-3" style={{ color: GREEN }}>
            Veuillez saisir le montant de retrait
          </p>

          {/* Champ montant */}
          <div
            className="flex items-center rounded-xl px-4 py-3 border"
            style={{ borderColor: "#e5e7eb" }}
          >
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder="montant"
              className="flex-1 text-lg text-gray-600 outline-none bg-transparent"
              data-testid="input-withdrawal-amount"
            />
            <span className="text-gray-400 font-semibold ml-2">{currency}</span>
          </div>

          {/* Montant reçu / Taxe */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>Montant reçu : {amountAfterFees.toLocaleString()}</span>
            <span>Taxe : {withdrawalFee.toFixed(2)}%</span>
          </div>
        </div>
      </div>
      </div>{/* fin zone image */}

      {/* Bouton Choisissez votre portefeuille */}
      <div className="mx-4 mt-4">
        <button
          onClick={() => navigate(hasWallets ? "/wallet?from=withdrawal" : "/wallet")}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-white font-semibold text-sm shadow"
          style={{ background: GREEN }}
          data-testid="button-select-wallet"
        >
          {/* Icône carte */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="1" y="4" width="20" height="14" rx="3" stroke="white" strokeWidth="1.8" />
            <rect x="1" y="8" width="20" height="3" fill="white" />
            <rect x="4" y="13" width="6" height="2" rx="1" fill="white" />
          </svg>
          <span className="flex-1 text-left">
            {selectedWallet
              ? `${selectedWallet.accountName} · ${selectedWallet.accountNumber}`
              : "Choisissez votre portefeuille"}
          </span>
          <span className="text-white text-lg font-bold">›</span>
        </button>
      </div>

      {/* Warnings */}
      {!isWithinWithdrawalHours && (
        <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-3 text-sm" style={{ color: GREEN }}>
          ⏰ Horaires de retrait : {withdrawalStartHour}h00 – {withdrawalEndHour}h00 (Fermé actuellement)
        </div>
      )}
      {!hasActiveProduct && (
        <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-3 text-sm" style={{ color: GREEN }}>
          ⚠️ Vous devez avoir un produit actif pour effectuer un retrait.
        </div>
      )}

      {/* Bouton Retirer maintenant — pill centré */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20, marginBottom: 4 }}>
        <button
          onClick={handleSubmit}
          disabled={withdrawMutation.isPending || !amount || !selectedWallet || !hasActiveProduct}
          data-testid="button-submit-withdrawal"
          style={{
            width: 220,
            height: 50,
            borderRadius: 999,
            background: GREEN,
            color: "white",
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(61,181,29,0.35)",
            opacity: (withdrawMutation.isPending || !amount || !selectedWallet || !hasActiveProduct) ? 0.4 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {withdrawMutation.isPending ? (
            <>
              <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
              Envoi en cours...
            </>
          ) : (
            "Retirer maintenant"
          )}
        </button>
      </div>

      {/* Zone instructions — fond gris clair */}
      <div className="flex-1 bg-gray-50 mt-4 px-5 pt-5 pb-10 space-y-4">
        <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
          💳 Instructions de Retrait :
        </p>

        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <div className="flex gap-2 items-start">
            <span className="mt-0.5 font-bold" style={{ color: "#1565C0" }}>◆</span>
            <p>
              <span className="font-bold">Montant minimum de retrait :</span>{" "}
              {minWithdrawal.toLocaleString()} {currency}
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="mt-0.5 font-bold" style={{ color: "#1565C0" }}>◆</span>
            <p>
              <span className="font-bold">Retraits possibles à tout moment</span>, sans limite de
              temps, de montant ou de fréquence
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="mt-0.5 font-bold" style={{ color: "#1565C0" }}>◆</span>
            <p>
              <span className="font-bold">Frais de retrait :</span> {withdrawalFee}% par transaction
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="mt-0.5 font-bold" style={{ color: "#1565C0" }}>◆</span>
            <p>
              <span className="font-bold">Délai de traitement :</span> généralement dans les 2
              heures, jusqu'à 24h dans des cas exceptionnels
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="mt-0.5 font-bold" style={{ color: "#1565C0" }}>◆</span>
            <p>
              Si le retrait échoue, vérifiez que vos informations de portefeuille sont correctes
              et soumettez à nouveau la demande.
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="mt-0.5 font-bold" style={{ color: "#1565C0" }}>◆</span>
            <p>
              Effectuez votre première recharge et activez un produit Jinko Solar pour débloquer
              la fonction de retrait.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
