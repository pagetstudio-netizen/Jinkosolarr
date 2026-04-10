import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getCountryByCode } from "@/lib/countries";

const GREEN = "#3db51d";

/* 3 montants prédéfinis — exactement comme la capture */
const PRESET_AMOUNTS = [3500, 8000, 15000];

export default function DepositPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [amount, setAmount] = useState<number | "">("");

  const countryInfo = getCountryByCode(user?.country || "");
  const currency = countryInfo?.currency || "XOF";
  const userCountry = user?.country || "BJ";

  const { data: platformSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });
  const MIN_DEPOSIT = parseInt(platformSettings?.minDeposit || "3500");

  const handleRecharge = () => {
    const amt = typeof amount === "number" ? amount : 0;
    if (!amt || amt < MIN_DEPOSIT) {
      alert(`Le montant minimum est de ${MIN_DEPOSIT.toLocaleString()} ${currency}`);
      return;
    }
    navigate(`/pay?amount=${amt}&country=${userCountry}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: GREEN, overflowX: "hidden" }}>

      {/* ── En-tête sur fond vert ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "40px 16px 16px",
        }}
      >
        <button onClick={() => navigate("/")} data-testid="button-back" style={{ padding: 4 }}>
          <ChevronLeft style={{ width: 24, height: 24, color: "white" }} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "white", margin: 0 }}>Recharger</h1>
        <Link href="/deposit-orders">
          <button data-testid="button-history" style={{ padding: 4 }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="3" rx="1.5" fill="white" />
              <rect x="3" y="10.5" width="18" height="3" rx="1.5" fill="white" />
              <rect x="3" y="17" width="18" height="3" rx="1.5" fill="white" />
            </svg>
          </button>
        </Link>
      </div>

      {/* ── Carte blanche ── */}
      <div
        style={{
          width: "calc(100% - 16px)",
          marginLeft: 16,
          marginRight: 0,
          boxSizing: "border-box",
          background: "white",
          borderRadius: "24px 0 0 24px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          padding: "20px 16px 20px",
        }}
      >
        {/* 3 boutons prédéfinis */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {PRESET_AMOUNTS.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              data-testid={`button-preset-${p}`}
              style={{
                flex: "0 0 auto",
                height: 36,
                paddingLeft: 14,
                paddingRight: 14,
                borderRadius: 8,
                border: `1.5px solid ${amount === p ? GREEN : "#d1d5db"}`,
                background: amount === p ? GREEN : "white",
                color: amount === p ? "white" : "#374151",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {p.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Label vert */}
        <p style={{ fontSize: 13, color: GREEN, marginBottom: 10 }}>
          Veuillez saisir le montant de recharge
        </p>

        {/* Champ montant — fin */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1.5px solid #e5e7eb",
            borderRadius: 10,
            padding: "10px 14px",
          }}
        >
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            placeholder={MIN_DEPOSIT.toLocaleString()}
            data-testid="input-deposit-amount"
            style={{
              flex: 1,
              fontSize: 16,
              color: "#6b7280",
              border: "none",
              outline: "none",
              background: "transparent",
            }}
          />
          <span style={{ fontSize: 15, color: "#9ca3af", fontWeight: 600, marginLeft: 8 }}>
            {currency}
          </span>
        </div>
      </div>

      {/* ── Espace vert entre la carte et la zone grise ── */}
      <div style={{ height: 32 }} />

      {/* ── Zone gris : bouton + instructions ── */}
      <div
        style={{
          flex: 1,
          background: "#f5f5f5",
          padding: "24px 20px 40px",
        }}
      >
        {/* Bouton Recharger maintenant — pill centré, sur fond gris */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <button
            onClick={handleRecharge}
            data-testid="button-submit-deposit"
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
            }}
          >
            Recharger maintenant
          </button>
        </div>

        <p style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 16 }}>
          💳 Instructions de Recharge :
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            {
              bold: "Montant minimum de recharge :",
              text: ` ${MIN_DEPOSIT.toLocaleString()} ${currency}`,
            },
            {
              bold: "Vérifiez attentivement vos informations de compte",
              text: " lors du virement pour éviter toute erreur de paiement",
            },
            {
              bold: "Chaque commande possède ses propres informations de paiement",
              text: " ; ne réutilisez pas les informations précédentes pour un second paiement",
            },
            {
              bold: "Après un virement réussi",
              text: ", veuillez patienter 10 à 30 minutes. Si le montant n'est pas crédité après ce délai, contactez le service client.",
            },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: "#1565C0", fontWeight: 700, fontSize: 14, marginTop: 1, flexShrink: 0 }}>
                ◆
              </span>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, margin: 0 }}>
                <span style={{ fontWeight: 700 }}>{item.bold}</span>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
