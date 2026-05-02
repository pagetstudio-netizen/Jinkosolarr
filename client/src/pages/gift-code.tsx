import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SiTelegram } from "react-icons/si";

import bannerImg from "@assets/172052459377789_1777682768403.jpg";

const GREEN = "#007054";

export default function GiftCodePage() {
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  useEffect(() => { document.title = "Code Bonus | State Grid"; }, []);
  const [code, setCode] = useState("");

  const claimMutation = useMutation({
    mutationFn: async (giftCode: string) => {
      const response = await apiRequest("POST", "/api/gift-codes/claim", { code: giftCode });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: (data) => {
      refreshUser();
      setCode("");
      toast({ title: "Félicitations !", description: data.message });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!code.trim()) {
      toast({ title: "Erreur", description: "Veuillez saisir un code", variant: "destructive" });
      return;
    }
    claimMutation.mutate(code.trim());
  };

  return (
    <div style={{ minHeight: "100vh", background: "white", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column" }}>

      {/* ── Bannière image ── */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={bannerImg}
          alt="State Grid"
          style={{ width: "100%", height: 230, objectFit: "cover", display: "block" }}
          data-testid="img-gift-banner"
        />
        {/* Bouton retour */}
        <Link href="/">
          <button
            data-testid="button-back"
            style={{
              position: "absolute", top: 14, left: 14,
              background: "rgba(0,0,0,0.35)", border: "none", borderRadius: "50%",
              width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronLeft style={{ width: 20, height: 20, color: "white" }} />
          </button>
        </Link>
      </div>

      {/* ── Contenu ── */}
      <div style={{ flex: 1, background: "#f5f5f5", padding: "28px 18px 100px", display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Texte d'information */}
        <p style={{ textAlign: "center", color: "#333", fontSize: 16, fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
          Vous pouvez obtenir des codes cadeaux<br />dans le groupe
        </p>

        {/* Bouton Groupes Telegram */}
        <a
          href="https://t.me/stategrad10"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
          data-testid="button-telegram-group"
        >
          <div style={{
            background: "white", borderRadius: 999, padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 14,
            boxShadow: "0 1px 6px rgba(0,0,0,0.08)", cursor: "pointer",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%", background: "#29a9eb",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <SiTelegram style={{ width: 24, height: 24, color: "white" }} />
            </div>
            <span style={{ flex: 1, color: "#111", fontWeight: 600, fontSize: 16 }}>Groupes Telegram</span>
            <ChevronRight style={{ width: 20, height: 20, color: "#aaa" }} />
          </div>
        </a>

        {/* Champ saisie code */}
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Veuillez saisir votre code de cadeau"
          style={{
            width: "100%", padding: "16px 18px", borderRadius: 14,
            border: `1.5px solid ${code ? GREEN : "#ddd"}`,
            fontSize: 14, outline: "none", color: "#111",
            background: "white", boxSizing: "border-box",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
          data-testid="input-gift-code"
        />

        {/* Bouton Recevoir */}
        <button
          onClick={handleSubmit}
          disabled={claimMutation.isPending}
          data-testid="button-submit-code"
          style={{
            width: "100%", padding: "16px", borderRadius: 999, border: "none",
            background: GREEN, color: "white", fontWeight: 700, fontSize: 17,
            cursor: claimMutation.isPending ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 4px 16px rgba(0,112,84,0.3)",
          }}
        >
          {claimMutation.isPending
            ? <Loader2 style={{ width: 22, height: 22, animation: "spin 1s linear infinite" }} />
            : "Recevoir"
          }
        </button>

        {/* Note */}
        <p style={{ textAlign: "center", color: "#aaa", fontSize: 13, margin: 0 }}>
          Les codes sont disponibles chaque soir à 17h GMT
        </p>

      </div>
    </div>
  );
}
