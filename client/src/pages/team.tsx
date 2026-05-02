import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import { getCountryByCode } from "@/lib/countries";

import referralImg  from "@assets/referral_program_1777738441992.webp";
import usersIcon    from "@assets/33_1777738442022.png";
import level1Img    from "@assets/1_1777738442044.jpeg";
import level2Img    from "@assets/1000375967_1777738442107.png";
import level3Img    from "@assets/1000375968_1777738442072.png";

interface TeamStats {
  level1Count:      number;
  level2Count:      number;
  level3Count:      number;
  totalCommission:  number;
  level1Commission: number;
  level2Commission: number;
  level3Commission: number;
}

/* State Grid brand gradient used for level banners & invite card */
const TEAL_GRAD  = "linear-gradient(90deg, #007054 0%, #005040 100%)";
const ORANGE     = "#f59e0b";

export default function TeamPage() {
  const { user }   = useAuth();
  const { toast }  = useToast();
  const [, navigate] = useLocation();
  useEffect(() => { document.title = "Équipe | State Grid"; }, []);

  const { data: stats } = useQuery<TeamStats>({ queryKey: ["/api/team/stats"] });
  const { data: platformSettings } = useQuery<Record<string, string>>({ queryKey: ["/api/settings"] });

  if (!user) return null;

  const country   = getCountryByCode(user.country);
  const currency  = country?.currency || "FC";

  const referralLink  = `${window.location.origin}/register?start=${user.referralCode}`;
  const totalUsers    = (stats?.level1Count || 0) + (stats?.level2Count || 0) + (stats?.level3Count || 0);
  const totalRecharge = (stats?.totalCommission || 0);

  const lvl1Rate = parseInt(platformSettings?.level1Commission || "27");
  const lvl2Rate = parseInt(platformSettings?.level2Commission || "2");
  const lvl3Rate = parseInt(platformSettings?.level3Commission || "1");

  const levels = [
    { num: 1, rate: `${lvl1Rate}%`, img: level1Img, count: stats?.level1Count || 0, recharge: stats?.level1Commission || 0 },
    { num: 2, rate: `${lvl2Rate}%`, img: level2Img, count: stats?.level2Count || 0, recharge: stats?.level2Commission || 0 },
    { num: 3, rate: `${lvl3Rate}%`, img: level3Img, count: stats?.level3Count || 0, recharge: stats?.level3Commission || 0 },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Lien copié !" });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", flexDirection: "column" }}>

      {/* ── HEADER ──────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px 10px", backgroundColor: "white",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        <button onClick={() => navigate("/")} data-testid="button-back"
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}>
          <ChevronLeft style={{ width: 24, height: 24, color: "#374151" }} />
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: 0 }}>Équipe</h1>
        <div style={{ width: 32 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 100px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── LIEN D'INVITATION CARD ───────────────────────── */}
        <div style={{
          borderRadius: 16, overflow: "hidden",
          background: TEAL_GRAD,
          padding: "18px 16px",
          display: "flex", alignItems: "center", gap: 12,
          boxShadow: "0 4px 16px rgba(0,119,182,0.3)",
        }}>
          {/* Illustration */}
          <img src={referralImg} alt="" style={{ width: 72, height: 72, objectFit: "contain", flexShrink: 0 }} />

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: "white", margin: "0 0 4px 0" }}>
              Lien d'Invitation
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: "0 0 10px 0", wordBreak: "break-all" }}>
              {referralLink}
            </p>
            <button
              onClick={copyLink}
              data-testid="button-copy-link"
              style={{
                padding: "6px 20px", borderRadius: 999,
                background: "rgba(255,255,255,0.25)",
                color: "white", fontWeight: 700, fontSize: 13,
                border: "1.5px solid rgba(255,255,255,0.6)",
                cursor: "pointer",
              }}
            >
              Copier
            </button>
          </div>
        </div>

        {/* ── DETAILS DE L'EQUIPE ──────────────────────────── */}
        <div style={{ background: "white", borderRadius: 14, padding: "16px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 4, height: 16, background: TEAL_GRAD, borderRadius: 2, display: "inline-block" }} />
            Details de l'Equipe
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
            {/* Utilisateurs */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src={usersIcon} alt="" style={{ width: 40, height: 40, objectFit: "contain" }} />
              <div>
                <p style={{ fontSize: 20, fontWeight: 800, color: ORANGE, margin: 0 }} data-testid="text-total-users">
                  {totalUsers}
                </p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Utilisateurs</p>
              </div>
            </div>
            {/* Divider */}
            <div style={{ width: 1, height: 40, background: "#f0f0f0" }} />
            {/* Recharge Totale */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Org chart icon SVG */}
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="10" r="6" stroke="#007054" strokeWidth="2" fill="none"/>
                <circle cx="8"  cy="32" r="5" stroke="#007054" strokeWidth="2" fill="none"/>
                <circle cx="20" cy="32" r="5" stroke="#007054" strokeWidth="2" fill="none"/>
                <circle cx="32" cy="32" r="5" stroke="#007054" strokeWidth="2" fill="none"/>
                <line x1="20" y1="16" x2="20" y2="22" stroke="#007054" strokeWidth="1.5"/>
                <line x1="20" y1="22" x2="8"  y2="27" stroke="#007054" strokeWidth="1.5"/>
                <line x1="20" y1="22" x2="20" y2="27" stroke="#007054" strokeWidth="1.5"/>
                <line x1="20" y1="22" x2="32" y2="27" stroke="#007054" strokeWidth="1.5"/>
              </svg>
              <div>
                <p style={{ fontSize: 20, fontWeight: 800, color: ORANGE, margin: 0 }} data-testid="text-total-recharge">
                  {currency} {totalRecharge.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}
                </p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Recharge Totale</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── MON EQUIPE header ────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 2px" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 4, height: 16, background: TEAL_GRAD, borderRadius: 2, display: "inline-block" }} />
            Mon Equipe
          </p>
          <button
            onClick={() => navigate("/team-details")}
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 12, color: "#007054", fontWeight: 600 }}
            data-testid="button-team-details"
          >
            Details de l'Equipe &gt;&gt;
          </button>
        </div>

        {/* ── LEVEL CARDS ──────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {levels.map((lv) => (
            <div key={lv.num} style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }} data-testid={`card-level-${lv.num}`}>

              {/* Banner header */}
              <div style={{
                background: TEAL_GRAD,
                padding: "10px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: "white" }}>Niveau {lv.num}</span>
                <span style={{ fontSize: 13, color: "white" }}>
                  Taux de Commission: <strong>{lv.rate}</strong>
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 16 }}>
                {/* Level image */}
                <img src={lv.img} alt={`Level ${lv.num}`} style={{ width: 62, height: 62, objectFit: "contain", flexShrink: 0 }} />

                {/* Stats */}
                <div style={{ flex: 1, display: "flex", gap: 0 }}>
                  {/* Equipe */}
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <p style={{ fontSize: 24, fontWeight: 800, color: ORANGE, margin: "0 0 2px 0" }} data-testid={`text-level${lv.num}-count`}>
                      {lv.count}
                    </p>
                    <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Equipe</p>
                  </div>
                  {/* Divider */}
                  <div style={{ width: 1, background: "#f0f0f0", alignSelf: "stretch" }} />
                  {/* Recharge Niveau */}
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <p style={{ fontSize: 24, fontWeight: 800, color: ORANGE, margin: "0 0 2px 0" }} data-testid={`text-level${lv.num}-recharge`}>
                      {lv.recharge.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}
                    </p>
                    <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Recharge Niveau</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── BONUS D'INVITATION ───────────────────────────── */}
        <div style={{ background: "white", borderRadius: 14, padding: "16px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 12px 0" }}>
            Bonus d'Invitation
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
              Lorsqu'un ami que vous avez invité s'inscrit et investit, vous recevez immédiatement un bonus en espèce de <strong style={{ color: "#111827" }}>{lvl1Rate}%</strong> de son montant d'investissement.
            </p>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
              Lorsque les membres de votre équipe de deuxième niveau investissent, vous recevez un bonus en espèce de <strong style={{ color: "#111827" }}>{lvl2Rate}%</strong>.
            </p>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
              Lorsque les membres de votre équipe de troisième niveau investissent, vous recevez un bonus en espèce de <strong style={{ color: "#111827" }}>{lvl3Rate}%</strong>.
            </p>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
              Dès qu'un membre de votre équipe investit, le bonus en espèce est immédiatement ajouté à votre compte et vous pouvez le retirer immédiatement.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
