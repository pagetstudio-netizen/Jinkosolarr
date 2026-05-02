import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";

const GREEN = "#007054";

export default function DepositCallbackPage() {
  const [, navigate] = useLocation();
  useEffect(() => { document.title = "Résultat du paiement | State Grid"; }, []);

  const params = new URLSearchParams(window.location.search);
  const depositId = params.get("depositId") || "";
  const statusParam = params.get("status") || "";
  const ref = params.get("ref") || "";
  const amount = parseInt(params.get("amount") || "0");

  const [status, setStatus] = useState<"loading" | "approved" | "rejected" | "pending">(
    statusParam === "success" ? "loading" : statusParam === "failed" ? "rejected" : "loading"
  );
  const [attempts, setAttempts] = useState(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // As soon as we land here, save the WestPay txId/ref so the webhook handler can match faster
  useEffect(() => {
    if (depositId && ref) {
      fetch(`/api/deposits/${depositId}/save-ref`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ref }),
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!depositId) {
      setStatus("pending");
      return;
    }

    if (statusParam === "failed") {
      setStatus("rejected");
      return;
    }

    // Poll for deposit approval (webhook may have been faster)
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/deposits/${depositId}/verify`, { credentials: "include" });
        const data = await res.json();

        setAttempts(a => a + 1);

        if (data.status === "approved") {
          clearInterval(pollingRef.current!);
          setStatus("approved");
        } else if (data.status === "rejected") {
          clearInterval(pollingRef.current!);
          setStatus("rejected");
        } else if (attempts >= 20) {
          // After 20 attempts (~100s), show "en attente"
          clearInterval(pollingRef.current!);
          setStatus("pending");
        }
      } catch {}
    }, 5000);

    return () => { if (pollingRef.current) clearInterval(pollingRef.current!); };
  }, [depositId]);

  const content: Record<typeof status, { icon: JSX.Element; title: string; text: string; color: string; bg: string }> = {
    loading: {
      icon: <Loader2 style={{ width: 56, height: 56, color: GREEN, animation: "spin 1s linear infinite" }} />,
      title: "Vérification du paiement…",
      text: "Nous vérifions votre paiement. Veuillez patienter.",
      color: GREEN,
      bg: "#f0faf7",
    },
    approved: {
      icon: <CheckCircle2 style={{ width: 56, height: 56, color: "#16a34a" }} />,
      title: "Paiement réussi !",
      text: `Votre dépôt${amount ? ` de ${amount.toLocaleString("fr-FR")} FCFA` : ""} a été crédité sur votre compte.`,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    rejected: {
      icon: <XCircle style={{ width: 56, height: 56, color: "#dc2626" }} />,
      title: "Paiement échoué",
      text: "Le paiement n'a pas pu être traité. Réessayez ou contactez le support.",
      color: "#dc2626",
      bg: "#fef2f2",
    },
    pending: {
      icon: <Clock style={{ width: 56, height: 56, color: "#f59e0b" }} />,
      title: "Paiement en cours de traitement",
      text: "Votre paiement est en cours de validation. Il sera crédité dans quelques minutes.",
      color: "#f59e0b",
      bg: "#fffbeb",
    },
  };

  const c = content[status];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f2f2f7", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 24, padding: "40px 28px", width: "100%", maxWidth: 360, textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          {c.icon}
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 800, color: c.color, margin: "0 0 10px 0" }}>
          {c.title}
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, margin: "0 0 24px 0" }}>
          {c.text}
        </p>

        {ref && (
          <div style={{ background: "#f9fafb", borderRadius: 10, padding: "8px 14px", marginBottom: 20, display: "inline-block" }}>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Référence</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: 0, fontFamily: "monospace" }}>{ref}</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => navigate("/")}
            style={{ height: 48, borderRadius: 999, background: `linear-gradient(135deg, ${GREEN}, #005040)`, color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}
            data-testid="button-go-home">
            Retour à l'accueil
          </button>
          <button
            onClick={() => navigate("/deposit-orders")}
            style={{ height: 44, borderRadius: 999, background: "white", color: GREEN, fontWeight: 600, fontSize: 14, border: `2px solid ${GREEN}`, cursor: "pointer" }}
            data-testid="button-go-orders">
            Voir mes dépôts
          </button>
        </div>
      </div>
    </div>
  );
}
