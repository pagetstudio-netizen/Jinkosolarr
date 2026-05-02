import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getCountryByCode } from "@/lib/countries";

const GREEN      = "#007054";
const GREEN_DARK = "#005040";

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
  const { toast }             = useToast();
  const queryClient           = useQueryClient();
  const [amount, setAmount]   = useState<number | "">("");
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [, navigate]          = useLocation();

  useEffect(() => { document.title = "Retrait | State Grid"; }, []);

  const countryInfo   = user ? getCountryByCode(user.country) : null;
  const currency      = countryInfo?.currency || "XOF";
  const minWithdrawal = 1200;

  const { data: withdrawalSettings } = useQuery<{
    withdrawalFees: number;
    withdrawalStartHour: number;
    withdrawalEndHour: number;
  }>({ queryKey: ["/api/settings/withdrawal"], staleTime: 0, refetchOnMount: true });

  const withdrawalFee       = withdrawalSettings?.withdrawalFees       ?? 17;
  const withdrawalStartHour = withdrawalSettings?.withdrawalStartHour  ?? 8;
  const withdrawalEndHour   = withdrawalSettings?.withdrawalEndHour    ?? 17;

  const amountAfterFees = amount
    ? Math.floor(Number(amount) * (1 - withdrawalFee / 100))
    : 0;

  const currentHour             = new Date().getHours();
  const isWithinWithdrawalHours = currentHour >= withdrawalStartHour && currentHour < withdrawalEndHour;

  const { data: wallets = [], isLoading: walletsLoading } = useQuery<WalletData[]>({
    queryKey: ["/api/wallets"],
    refetchOnWindowFocus: true,
  });

  const { data: userProducts = [] } = useQuery<UserProduct[]>({
    queryKey: ["/api/user/products"],
  });

  const hasActiveProduct = userProducts.some((p) => p.status === "active");
  const hasWallets       = wallets.length > 0;

  useEffect(() => {
    const savedId = localStorage.getItem("selectedWalletId");
    if (savedId && wallets.length > 0) {
      const w = wallets.find((x) => x.id === parseInt(savedId));
      if (w) setSelectedWallet(w);
      localStorage.removeItem("selectedWalletId");
    }
  }, [wallets]);

  useEffect(() => {
    if (!selectedWallet && wallets.length > 0) {
      const def = wallets.find((w) => w.isDefault);
      if (def) setSelectedWallet(def);
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
      toast({ title: "Horaires de retrait", description: `Disponibles de ${withdrawalStartHour}h à ${withdrawalEndHour}h`, variant: "destructive" });
      return;
    }
    if (!hasActiveProduct) {
      toast({ title: "Produit requis", description: "Vous devez avoir un produit actif", variant: "destructive" });
      return;
    }
    if (!amount || amount < minWithdrawal) {
      toast({ title: "Montant invalide", description: `Minimum : ${minWithdrawal.toLocaleString()} ${currency}`, variant: "destructive" });
      return;
    }
    if (!selectedWallet) {
      toast({ title: "Compte requis", description: "Veuillez sélectionner un portefeuille", variant: "destructive" });
      return;
    }
    withdrawMutation.mutate({ amount: Number(amount), walletId: selectedWallet.id });
  };

  if (walletsLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: GREEN }}>
        <Loader2 style={{ width: 32, height: 32, color: "white", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!user) return null;

  const balance = parseFloat(user?.balance || "0");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: `linear-gradient(180deg, #003d2e 0%, #001a12 60%, #000d09 100%)` }}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "48px 16px 16px" }}>
        <button onClick={() => navigate("/account")} data-testid="button-back"
          style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }}>
          <ChevronLeft style={{ width: 26, height: 26, color: "white" }} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "white", margin: 0 }}>Retrait</h1>
        <Link href="/withdrawal-history">
          <button data-testid="button-history"
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "white", fontSize: 13, fontWeight: 500 }}>
            enregistrement
          </button>
        </Link>
      </div>

      {/* ── BALANCE ROW ────────────────────────────────────── */}
      <div style={{ margin: "0 16px 10px" }}>
        <div style={{ background: "white", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, color: "#374151", fontWeight: 500 }}>Solde</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#f59e0b" }} data-testid="text-balance">
            {balance.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
          </span>
        </div>
      </div>

      {/* ── MAIN WHITE CARD ─────────────────────────────────── */}
      <div style={{ margin: "0 16px 16px" }}>
        <div style={{ background: "white", borderRadius: 14, padding: "18px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>

          {/* Canal De Retrait */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>Canal De Retrait</span>
            <div style={{ background: "#f3f4f6", borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>
                {selectedWallet ? selectedWallet.paymentMethod : "Mobile Money"}
              </span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>∨</span>
            </div>
          </div>

          {/* Montant minimum */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500, lineHeight: 1.4 }}>
              Montant De Retrait<br />Minimum
            </span>
            <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, textAlign: "right", whiteSpace: "nowrap" }}>
              {minWithdrawal.toLocaleString()}.00 ~ 2 000 000
            </span>
          </div>

          {/* Horaires */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>Horaires de retrait</span>
            <span style={{ fontSize: 13, color: isWithinWithdrawalHours ? GREEN : "#ef4444", fontWeight: 600 }}>
              {withdrawalStartHour}h00 – {withdrawalEndHour}h00
            </span>
          </div>

          {/* Frais */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>Frais de service</span>
            <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{withdrawalFee}%</span>
          </div>

          {/* Choisir portefeuille */}
          <p style={{ fontSize: 13, color: "#374151", fontWeight: 500, marginBottom: 8 }}>
            Choisissez Le Portefeuille
          </p>
          <button
            onClick={() => navigate(hasWallets ? "/wallet?from=withdrawal" : "/wallet")}
            data-testid="button-select-wallet"
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 8,
              border: `1.5px solid ${selectedWallet ? GREEN : "#e5e7eb"}`,
              background: selectedWallet ? "#f0faf7" : "#f9fafb",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: "pointer", marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 14, color: selectedWallet ? GREEN : "#9ca3af", fontWeight: selectedWallet ? 600 : 400 }}>
              {selectedWallet
                ? `${selectedWallet.accountName} · ${selectedWallet.accountNumber}`
                : "Veuillez choisir votre portefeuille"}
            </span>
            <span style={{ color: "#9ca3af", fontSize: 16 }}>›</span>
          </button>

          {/* Label montant */}
          <p style={{ fontSize: 13, color: "#374151", fontWeight: 500, marginBottom: 8 }}>
            Montant Du Retrait
          </p>

          {/* Input montant */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 14px", background: "#f9fafb", marginBottom: 8 }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder="Veuillez entrer le montant du retrait"
              data-testid="input-withdrawal-amount"
              style={{ width: "100%", fontSize: 14, color: "#374151", border: "none", outline: "none", background: "transparent" }}
            />
          </div>

          {/* Montant reçu */}
          {amount ? (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280" }}>
              <span>Montant reçu : <strong style={{ color: GREEN }}>{amountAfterFees.toLocaleString()} {currency}</strong></span>
              <span>Taxe : {withdrawalFee}%</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Avertissements */}
      {!isWithinWithdrawalHours && (
        <div style={{ margin: "0 16px 10px", background: "rgba(239,68,68,0.15)", borderRadius: 10, padding: "10px 14px" }}>
          <p style={{ fontSize: 13, color: "#fca5a5", margin: 0 }}>
            ⏰ Retraits disponibles de {withdrawalStartHour}h00 à {withdrawalEndHour}h00 — Fermé actuellement
          </p>
        </div>
      )}
      {!hasActiveProduct && (
        <div style={{ margin: "0 16px 10px", background: "rgba(245,158,11,0.15)", borderRadius: 10, padding: "10px 14px" }}>
          <p style={{ fontSize: 13, color: "#fcd34d", margin: 0 }}>
            ⚠️ Vous devez avoir un produit actif pour effectuer un retrait.
          </p>
        </div>
      )}

      {/* ── BUTTONS ─────────────────────────────────────────── */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={handleSubmit}
          disabled={withdrawMutation.isPending || !amount || !selectedWallet || !hasActiveProduct}
          data-testid="button-submit-withdrawal"
          style={{
            width: "100%", height: 52, borderRadius: 999,
            background: `linear-gradient(135deg, ${GREEN} 0%, #009688 100%)`,
            color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,112,84,0.4)",
            opacity: (withdrawMutation.isPending || !amount || !selectedWallet || !hasActiveProduct) ? 0.5 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {withdrawMutation.isPending
            ? <><Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> Envoi...</>
            : "Retirer maintenant"}
        </button>

        <Link href="/withdrawal-history">
          <button
            data-testid="button-history-bottom"
            style={{
              width: "100%", height: 52, borderRadius: 999,
              background: `linear-gradient(135deg, #0077b6 0%, #0096c7 100%)`,
              color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,119,182,0.4)",
            }}
          >
            Historique des retraits
          </button>
        </Link>
      </div>

      {/* ── INSTRUCTIONS ─────────────────────────────────────── */}
      <div style={{ padding: "24px 16px 80px", display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { bold: "Montant minimum :",            text: ` ${minWithdrawal.toLocaleString()} ${currency}` },
          { bold: "Frais de retrait :",            text: ` ${withdrawalFee}% par transaction` },
          { bold: "Délai de traitement :",         text: " généralement sous 2h, jusqu'à 24h dans des cas exceptionnels." },
          { bold: "Vérifiez vos informations",     text: " de portefeuille avant de soumettre votre demande." },
          { bold: "Produit actif requis :",         text: " rechargez et activez un produit pour débloquer le retrait." },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ color: "#34d399", fontWeight: 700, fontSize: 14, marginTop: 1, flexShrink: 0 }}>◆</span>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>
              <span style={{ fontWeight: 700, color: "white" }}>{item.bold}</span>
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
