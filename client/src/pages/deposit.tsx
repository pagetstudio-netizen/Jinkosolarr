import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { getCountryByCode } from "@/lib/countries";
import { useToast } from "@/hooks/use-toast";

const GREEN      = "#007054";
const GREEN_DARK = "#005040";
const PRESET_AMOUNTS = [3000, 5000, 10000, 20000];

export default function DepositPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  useEffect(() => { document.title = "Dépôt | State Grid"; }, []);

  const [amount, setAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  const countryInfo = getCountryByCode(user?.country || "");
  const currency    = countryInfo?.currency || "XOF";
  const userCountry = user?.country || "BJ";

  const { data: platformSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });
  const MIN_DEPOSIT = parseInt(platformSettings?.minDeposit || "3000");
  const MAX_DEPOSIT = 2000000;

  const handleRecharge = async () => {
    const amt = typeof amount === "number" ? amount : 0;
    if (!amt || amt < MIN_DEPOSIT) {
      toast({ title: "Montant invalide", description: `Le montant minimum est de ${MIN_DEPOSIT.toLocaleString()} ${currency}`, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/deposits/westpay-redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: amt, country: userCountry }),
      });

      let body: any = {};
      try { body = await res.json(); } catch {}

      if (!res.ok) {
        setLoading(false);
        toast({ title: "Erreur de paiement", description: body.message || "Une erreur est survenue. Réessayez.", variant: "destructive" });
        return;
      }

      // Redirect to WestPay hosted payment page
      window.location.href = body.payUrl;
    } catch {
      setLoading(false);
      toast({ title: "Erreur de connexion", description: "Vérifiez votre connexion internet et réessayez.", variant: "destructive" });
    }
  };

  if (!user) return null;

  const balance = Number(user.balance);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, ${GREEN} 0%, #005040 100%)`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 24,
      }}>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "32px 28px", textAlign: "center", width: "100%", maxWidth: 340 }}>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: "0 0 6px 0" }}>Montant</p>
          <p style={{ color: "white", fontWeight: 800, fontSize: 36, margin: "0 0 24px 0" }}>
            {(typeof amount === "number" ? amount : 0).toLocaleString("fr-FR")} <span style={{ fontSize: 20 }}>{currency}</span>
          </p>
          <Loader2 style={{ width: 40, height: 40, color: "white", margin: "0 auto 16px", display: "block", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "white", fontWeight: 600, fontSize: 15, margin: 0 }}>Redirection vers WestPay…</p>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 8 }}>Veuillez patienter</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      background: `linear-gradient(180deg, #003d2e 0%, #001a12 60%, #000d09 100%)`,
    }}>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "48px 16px 16px" }}>
        <button onClick={() => navigate("/")} data-testid="button-back"
          style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }}>
          <ChevronLeft style={{ width: 26, height: 26, color: "white" }} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "white", margin: 0 }}>Recharger</h1>
        <a href="/deposit-orders" style={{ background: "transparent", border: "none", cursor: "pointer", color: "white", fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
          Historique
        </a>
      </div>

      {/* ── BALANCE ── */}
      <div style={{ margin: "0 16px 10px" }}>
        <div style={{ background: "white", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, color: "#374151", fontWeight: 500 }}>Solde</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#f59e0b" }}>
            {balance.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
          </span>
        </div>
      </div>

      {/* ── MAIN CARD ── */}
      <div style={{ margin: "0 16px 16px" }}>
        <div style={{ background: "white", borderRadius: 14, padding: "18px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>

          {/* Canal */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>Canal De Recharge</span>
            <div style={{ background: "#f3f4f6", borderRadius: 8, padding: "6px 12px" }}>
              <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>Mobile Money</span>
            </div>
          </div>

          {/* Montant minimum */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500, lineHeight: 1.4 }}>Montant De Recharge<br />Minimum</span>
            <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, textAlign: "right", whiteSpace: "nowrap" }}>
              {MIN_DEPOSIT.toLocaleString()}.00 ~ {MAX_DEPOSIT.toLocaleString()}
            </span>
          </div>

          {/* Preset amounts */}
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 10px 0" }}>Choisissez Le Montant</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {PRESET_AMOUNTS.map((p) => (
              <button key={p} onClick={() => setAmount(amount === p ? "" : p)} data-testid={`button-preset-${p}`}
                style={{
                  height: 40, borderRadius: 8,
                  border: `1.5px solid ${amount === p ? GREEN : "#e5e7eb"}`,
                  background: amount === p ? `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})` : "#f9fafb",
                  color: amount === p ? "white" : "#374151",
                  fontSize: 15, fontWeight: 600, cursor: "pointer",
                }}>
                {p.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Montant libre */}
          <p style={{ fontSize: 13, color: "#374151", fontWeight: 500, marginBottom: 8 }}>Montant De La Recharge</p>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 14px", background: "#f9fafb" }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder="Veuillez entrer le montant de la recharge"
              data-testid="input-deposit-amount"
              style={{ width: "100%", fontSize: 14, color: "#374151", border: "none", outline: "none", background: "transparent" }}
            />
          </div>
        </div>
      </div>

      {/* ── BUTTONS ── */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={handleRecharge} data-testid="button-submit-deposit"
          style={{
            width: "100%", height: 52, borderRadius: 999,
            background: `linear-gradient(135deg, ${GREEN} 0%, #009688 100%)`,
            color: "white", fontWeight: 700, fontSize: 16,
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,112,84,0.4)",
          }}>
          Recharger maintenant
        </button>

        <a href="/deposit-tutorial" style={{ textDecoration: "none" }}>
          <button data-testid="button-tutorial"
            style={{
              width: "100%", height: 52, borderRadius: 999,
              background: `linear-gradient(135deg, #0077b6 0%, #0096c7 100%)`,
              color: "white", fontWeight: 700, fontSize: 16,
              border: "none", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,119,182,0.4)",
            }}>
            Recharge Tutorial
          </button>
        </a>
      </div>

      {/* ── INSTRUCTIONS ── */}
      <div style={{ padding: "24px 16px 80px", display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { bold: "Montant minimum :", text: ` ${MIN_DEPOSIT.toLocaleString()} ${currency}` },
          { bold: "Cliquez sur Recharger", text: " pour être redirigé vers la page de paiement sécurisée WestPay." },
          { bold: "Choisissez votre opérateur", text: " (Wave, MTN, Orange Money…) et suivez les instructions sur la page WestPay." },
          { bold: "Après paiement", text: ", votre solde sera crédité automatiquement. Si non crédité, contactez le service client." },
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
