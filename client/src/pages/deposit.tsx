import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getCountryByCode } from "@/lib/countries";

const GREEN      = "#007054";
const GREEN_DARK = "#005040";
const PRESET_AMOUNTS = [3000, 5000, 10000, 20000];

export default function DepositPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  useEffect(() => { document.title = "Dépôt | State Grid"; }, []);
  const [amount, setAmount] = useState<number | "">("");

  const countryInfo = getCountryByCode(user?.country || "");
  const currency    = countryInfo?.currency || "XOF";
  const userCountry = user?.country || "BJ";

  const { data: platformSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });
  const MIN_DEPOSIT = parseInt(platformSettings?.minDeposit || "3000");
  const MAX_DEPOSIT = 2000000;

  const handleRecharge = () => {
    const amt = typeof amount === "number" ? amount : 0;
    if (!amt || amt < MIN_DEPOSIT) {
      alert(`Le montant minimum est de ${MIN_DEPOSIT.toLocaleString()} ${currency}`);
      return;
    }
    navigate(`/pay?amount=${amt}&country=${userCountry}`);
  };

  if (!user) return null;

  const balance = Number(user.balance);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: `linear-gradient(180deg, #003d2e 0%, #001a12 60%, #000d09 100%)`,
    }}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "48px 16px 16px",
      }}>
        <button onClick={() => navigate("/")} data-testid="button-back"
          style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }}>
          <ChevronLeft style={{ width: 26, height: 26, color: "white" }} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "white", margin: 0 }}>Recharger</h1>
        <Link href="/deposit-orders">
          <button data-testid="button-history"
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "white", fontSize: 13, fontWeight: 500 }}>
            enregistrement
          </button>
        </Link>
      </div>

      {/* ── BALANCE ROW ────────────────────────────────────── */}
      <div style={{ marginLeft: 16, marginRight: 16, marginBottom: 10 }}>
        <div style={{
          background: "white",
          borderRadius: 10,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 15, color: "#374151", fontWeight: 500 }}>Solde</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#f59e0b" }}>
            {balance.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
          </span>
        </div>
      </div>

      {/* ── MAIN WHITE CARD ─────────────────────────────────── */}
      <div style={{ marginLeft: 16, marginRight: 16, marginBottom: 16 }}>
        <div style={{
          background: "white",
          borderRadius: 14,
          padding: "18px 16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        }}>

          {/* Canal De Recharge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>Canal De Recharge</span>
            <div style={{
              background: "#f3f4f6",
              borderRadius: 8,
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}>
              <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>Mobile Money</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>∨</span>
            </div>
          </div>

          {/* Montant minimum */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500, lineHeight: 1.4 }}>
              Montant De Recharge<br />Minimum
            </span>
            <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, textAlign: "right", whiteSpace: "nowrap" }}>
              {MIN_DEPOSIT.toLocaleString()}.00 ~ {MAX_DEPOSIT.toLocaleString()}
            </span>
          </div>

          {/* Label choisir montant */}
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 10, margin: "0 0 10px 0" }}>
            Choisissez Le Montant
          </p>

          {/* Preset amounts grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {PRESET_AMOUNTS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(amount === p ? "" : p)}
                data-testid={`button-preset-${p}`}
                style={{
                  height: 40,
                  borderRadius: 8,
                  border: `1.5px solid ${amount === p ? GREEN : "#e5e7eb"}`,
                  background: amount === p ? `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})` : "#f9fafb",
                  color: amount === p ? "white" : "#374151",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {p.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Label montant */}
          <p style={{ fontSize: 13, color: "#374151", fontWeight: 500, marginBottom: 8 }}>
            Montant De La Recharge
          </p>

          {/* Input montant */}
          <div style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "12px 14px",
            background: "#f9fafb",
          }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder="Veuillez entrer le montant de la recharge"
              data-testid="input-deposit-amount"
              style={{
                width: "100%",
                fontSize: 14,
                color: "#374151",
                border: "none",
                outline: "none",
                background: "transparent",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── BUTTONS ─────────────────────────────────────────── */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Recharger maintenant */}
        <button
          onClick={handleRecharge}
          data-testid="button-submit-deposit"
          style={{
            width: "100%",
            height: 52,
            borderRadius: 999,
            background: `linear-gradient(135deg, ${GREEN} 0%, #009688 100%)`,
            color: "white",
            fontWeight: 700,
            fontSize: 16,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,112,84,0.4)",
          }}
        >
          Recharger maintenant
        </button>

        {/* Recharge Tutorial */}
        <Link href="/info">
          <button
            data-testid="button-tutorial"
            style={{
              width: "100%",
              height: 52,
              borderRadius: 999,
              background: `linear-gradient(135deg, #0077b6 0%, #0096c7 100%)`,
              color: "white",
              fontWeight: 700,
              fontSize: 16,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,119,182,0.4)",
            }}
          >
            Recharge Tutorial
          </button>
        </Link>
      </div>

      {/* ── INSTRUCTIONS ─────────────────────────────────────── */}
      <div style={{ padding: "24px 16px 80px", display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { bold: "Montant minimum :", text: ` ${MIN_DEPOSIT.toLocaleString()} ${currency}` },
          { bold: "Vérifiez attentivement vos informations", text: " lors du virement pour éviter toute erreur de paiement." },
          { bold: "Chaque commande a ses propres informations de paiement", text: " ; ne réutilisez pas les informations précédentes." },
          { bold: "Après un virement réussi", text: ", patientez 10 à 30 minutes. Si non crédité, contactez le service client." },
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
