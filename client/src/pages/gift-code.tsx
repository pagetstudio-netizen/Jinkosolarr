import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, Loader2, Gift, Tag, Send } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import bannerImg from "@assets/172052459377789_1777682768403.jpg";

export default function GiftCodePage() {
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  useEffect(() => { document.title = "Argent gratuit | State Grid"; }, []);
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
      toast({
        title: "Félicitations !",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!code.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un code",
        variant: "destructive",
      });
      return;
    }
    claimMutation.mutate(code.trim());
  };

  const GREEN = "#007054";
  const GREEN_DARK = "#005040";

  return (
    <div style={{ minHeight: "100vh", background: "#f2f2f7", display: "flex", flexDirection: "column" }}>

      {/* ── Banner image + header ── */}
      <div style={{ position: "relative" }}>
        <img
          src={bannerImg}
          alt="State Grid"
          style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
          data-testid="img-gift-banner"
        />
        {/* Green overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,112,84,0.55) 0%, rgba(0,80,64,0.80) 100%)" }} />

        {/* Back button + title */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", padding: "14px 16px" }}>
          <Link href="/">
            <button style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} data-testid="button-back">
              <ChevronLeft style={{ width: 20, height: 20, color: "white" }} />
            </button>
          </Link>
          <h1 style={{ flex: 1, textAlign: "center", color: "white", fontWeight: 800, fontSize: 17, margin: 0, paddingRight: 34 }}>
            Code Bonus
          </h1>
        </div>

        {/* Gift icon badge */}
        <div style={{ position: "absolute", bottom: -22, left: "50%", transform: "translateX(-50%)", width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`, border: "3px solid white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
          <Gift style={{ width: 22, height: 22, color: "white" }} />
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "36px 16px 100px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Info texte */}
        <div style={{ background: "white", borderRadius: 16, padding: "16px", textAlign: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          <p style={{ color: "#374151", fontSize: 14, fontWeight: 500, margin: 0 }}>
            Vous pouvez obtenir des codes cadeaux dans le groupe
          </p>
          <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>
            Les codes sont disponibles chaque soir à 17h GMT
          </p>
        </div>

        {/* Bouton Groupes Telegram */}
        <a
          href="https://t.me/stategrad10"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
          data-testid="button-telegram-group"
        >
          <div style={{ background: "white", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", cursor: "pointer" }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#0088cc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Send style={{ width: 20, height: 20, color: "white" }} />
            </div>
            <span style={{ flex: 1, color: "#111827", fontWeight: 600, fontSize: 15 }}>Groupes Telegram</span>
            <ChevronLeft style={{ width: 18, height: 18, color: "#9ca3af", transform: "rotate(180deg)" }} />
          </div>
        </a>

        {/* Saisie du code */}
        <div style={{ background: "white", borderRadius: 16, padding: "16px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tag style={{ width: 16, height: 16, color: GREEN }} />
            <span style={{ color: "#1f2937", fontWeight: 600, fontSize: 14 }}>Code cadeau</span>
          </div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Veuillez saisir votre code de cadeau"
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 12, border: `2px solid ${code ? GREEN : "#e5e7eb"}`,
              fontSize: 14, textAlign: "center", fontFamily: "monospace", letterSpacing: "0.1em",
              outline: "none", color: "#1f2937", boxSizing: "border-box",
            }}
            data-testid="input-gift-code"
          />
          <button
            onClick={handleSubmit}
            disabled={claimMutation.isPending}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`,
              color: "white", fontWeight: 700, fontSize: 15,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            data-testid="button-submit-code"
          >
            {claimMutation.isPending ? <Loader2 style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} /> : "Recevoir"}
          </button>
        </div>

        {/* Note bas de page */}
        <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
          Les codes sont disponibles chaque soir à 17h GMT
        </p>
      </div>
    </div>
  );
}
