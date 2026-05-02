import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, CheckCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { getCountryByCode } from "@/lib/countries";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const GREEN      = "#007054";
const GREEN_DARK = "#005040";
const PRESET_AMOUNTS = [3000, 5000, 10000, 20000];

type Step = "form" | "loading" | "success";

export default function DepositPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  useEffect(() => { document.title = "Dépôt | State Grid"; }, []);

  const [amount, setAmount] = useState<number | "">("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [reference, setReference] = useState("");

  const countryInfo = getCountryByCode(user?.country || "");
  const currency    = countryInfo?.currency || "XOF";
  const userCountry = user?.country || "BJ";

  const { data: platformSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });
  const MIN_DEPOSIT = parseInt(platformSettings?.minDeposit || "3000");
  const MAX_DEPOSIT = 2000000;

  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  const handleRecharge = async () => {
    const amt = typeof amount === "number" ? amount : 0;
    if (!amt || amt < MIN_DEPOSIT) {
      toast({ title: "Montant invalide", description: `Le montant minimum est de ${MIN_DEPOSIT.toLocaleString()} ${currency}`, variant: "destructive" });
      return;
    }
    if (!phone || phone.replace(/\D/g, "").length < 6) {
      toast({ title: "Numéro invalide", description: "Veuillez entrer un numéro de téléphone valide.", variant: "destructive" });
      return;
    }

    setStep("loading");
    try {
      const res = await apiRequest("POST", "/api/deposits/westpay-init", {
        amount: amt,
        phone: phone.replace(/\D/g, ""),
        country: userCountry,
      });

      if (!res.ok) {
        const err = await res.json();
        setStep("form");
        toast({ title: "Erreur de paiement", description: err.message || "Erreur lors du paiement", variant: "destructive" });
        return;
      }

      const data = await res.json();
      setReference(data.reference || "");
      setStep("success");
    } catch (e: any) {
      setStep("form");
      toast({ title: "Erreur réseau", description: e.message || "Vérifiez votre connexion et réessayez.", variant: "destructive" });
    }
  };

  if (!user) return null;

  const balance = Number(user.balance);

  if (step === "loading") {
    return (
      <div style={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, ${GREEN} 0%, #005040 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "32px 28px", textAlign: "center", width: "100%", maxWidth: 340 }}>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: "0 0 6px 0" }}>Montant</p>
          <p style={{ color: "white", fontWeight: 800, fontSize: 36, margin: "0 0 24px 0" }}>
            {(typeof amount === "number" ? amount : 0).toLocaleString("fr-FR")} <span style={{ fontSize: 20 }}>{currency}</span>
          </p>
          <Loader2 style={{ width: 40, height: 40, color: "white", margin: "0 auto 16px", display: "block", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "white", fontWeight: 600, fontSize: 15, margin: 0 }}>Initialisation du paiement…</p>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 8 }}>
            Veuillez patienter
          </p>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div style={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, ${GREEN} 0%, #005040 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "32px 28px", textAlign: "center", width: "100%", maxWidth: 340 }}>
          <CheckCircle style={{ width: 56, height: 56, color: "#4ade80", margin: "0 auto 16px", display: "block" }} />
          <p style={{ color: "white", fontWeight: 700, fontSize: 20, margin: "0 0 8px 0" }}>Demande envoyée !</p>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: "0 0 6px 0" }}>Montant</p>
          <p style={{ color: "white", fontWeight: 800, fontSize: 30, margin: "0 0 16px 0" }}>
            {(typeof amount === "number" ? amount : 0).toLocaleString("fr-FR")} <span style={{ fontSize: 18 }}>{currency}</span>
          </p>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: "0 0 4px 0" }}>
            Une confirmation USSD a été envoyée au
          </p>
          <p style={{ color: "white", fontWeight: 700, fontSize: 15, margin: "0 0 16px 0" }}>{phone}</p>
          {reference && (
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginBottom: 20 }}>
              Réf: {reference}
            </p>
          )}
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 24, lineHeight: 1.6 }}>
            Confirmez sur votre téléphone mobile. Le crédit apparaîtra dans votre compte après confirmation.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{ background: "white", color: GREEN, fontWeight: 700, fontSize: 14, border: "none", borderRadius: 999, padding: "12px 32px", cursor: "pointer" }}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }


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
        <a href="/deposit-orders" style={{ background: "transparent", border: "none", cursor: "pointer", color: "white", fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
          enregistrement
        </a>
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

          {/* Preset amounts */}
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 10, margin: "0 0 10px 0" }}>
            Choisissez Le Montant
          </p>
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

          {/* Montant */}
          <p style={{ fontSize: 13, color: "#374151", fontWeight: 500, marginBottom: 8 }}>
            Montant De La Recharge
          </p>
          <div style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "12px 14px",
            background: "#f9fafb",
            marginBottom: 14,
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

          {/* Numéro de téléphone */}
          <p style={{ fontSize: 13, color: "#374151", fontWeight: 500, marginBottom: 8 }}>
            Numéro Mobile Money
          </p>
          <div style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "12px 14px",
            background: "#f9fafb",
          }}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Numéro de téléphone Mobile Money"
              data-testid="input-deposit-phone"
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

        <a href="/deposit-tutorial" style={{ textDecoration: "none" }}>
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
        </a>
      </div>

      {/* ── INSTRUCTIONS ─────────────────────────────────────── */}
      <div style={{ padding: "24px 16px 80px", display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { bold: "Montant minimum :", text: ` ${MIN_DEPOSIT.toLocaleString()} ${currency}` },
          { bold: "Entrez votre numéro Mobile Money", text: " pour recevoir la confirmation USSD sur votre téléphone." },
          { bold: "Confirmez le paiement", text: " sur votre téléphone après réception du code USSD." },
          { bold: "Après confirmation", text: ", votre solde sera crédité automatiquement. Si non crédité, contactez le service client." },
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
