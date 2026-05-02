import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

const GREEN = "#007054";

export default function PayPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  useEffect(() => { document.title = "Paiement | State Grid"; }, []);

  const params = new URLSearchParams(window.location.search);
  const amountParam = parseInt(params.get("amount") || "0");
  const countryParam = params.get("country") || user?.country || "BJ";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!amountParam || !user) return;
    initPayment();
  }, [user]);

  async function initPayment() {
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("POST", "/api/deposits/westpay-init", {
        amount: amountParam,
        country: countryParam,
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "Erreur lors de l'initialisation du paiement");
        setLoading(false);
        return;
      }

      const { westpayUrl } = await res.json();
      window.location.href = westpayUrl;
    } catch (e: any) {
      setError(e.message || "Erreur réseau");
      setLoading(false);
    }
  }

  if (!amountParam) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, background: "#f2f2f7" }}>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Montant invalide</p>
        <button onClick={() => navigate("/deposit")}
          style={{ color: GREEN, fontWeight: 600, fontSize: 14, background: "none", border: "none", cursor: "pointer" }}>
          ← Retour au dépôt
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${GREEN} 0%, #005040 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: 24 }}>
      <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "32px 28px", textAlign: "center", width: "100%", maxWidth: 340 }}>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: "0 0 6px 0" }}>Montant</p>
        <p style={{ color: "white", fontWeight: 800, fontSize: 36, margin: "0 0 24px 0" }}>
          {amountParam.toLocaleString("fr-FR")} <span style={{ fontSize: 20 }}>FCFA</span>
        </p>

        {loading && !error && (
          <>
            <Loader2 style={{ width: 40, height: 40, color: "white", margin: "0 auto 16px", display: "block", animation: "spin 1s linear infinite" }} />
            <p style={{ color: "white", fontWeight: 600, fontSize: 15, margin: 0 }}>
              Redirection vers WestPay…
            </p>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 8 }}>
              Vous allez être redirigé vers la page de paiement sécurisée.
            </p>
          </>
        )}

        {error && (
          <>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
              <p style={{ color: "white", fontSize: 13, margin: 0 }}>{error}</p>
            </div>
            <button onClick={initPayment}
              style={{ background: "white", color: GREEN, fontWeight: 700, fontSize: 14, border: "none", borderRadius: 999, padding: "12px 28px", cursor: "pointer", marginBottom: 12 }}>
              Réessayer
            </button>
            <br />
            <button onClick={() => navigate("/deposit")}
              style={{ color: "rgba(255,255,255,0.75)", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
              ← Retour
            </button>
          </>
        )}
      </div>
    </div>
  );
}
