import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ChevronLeft, Users, TrendingUp } from "lucide-react";

import level1Img from "@assets/1_1777738442044.jpeg";
import level2Img from "@assets/1000375967_1777738442107.png";
import level3Img from "@assets/1000375968_1777738442072.png";

const GREEN      = "#007054";
const GREEN_DARK = "#005040";
const ORANGE     = "#f59e0b";

interface TeamMember {
  id: number;
  phone: string;
  country: string;
  createdAt: string;
  totalInvested: number;
}

interface TeamDetails {
  level1: TeamMember[];
  level2: TeamMember[];
  level3: TeamMember[];
  totalLevel1Invested: number;
  totalLevel2Invested: number;
  totalLevel3Invested: number;
}

function maskPhone(phone: string): string {
  if (phone.length <= 5) return phone;
  return `${phone.slice(0, 2)}${"*".repeat(Math.max(phone.length - 5, 3))}${phone.slice(-3)}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const LEVEL_IMGS = [level1Img, level2Img, level3Img];

export default function TeamDetailsPage() {
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3>(1);
  const [, navigate] = useLocation();

  const { data: team, isLoading } = useQuery<TeamDetails>({
    queryKey: ["/api/team/details"],
    staleTime: 0,
  });

  const levels = [
    { num: 1 as const, label: "Niveau 1", img: LEVEL_IMGS[0], count: team?.level1?.length || 0, total: team?.totalLevel1Invested || 0 },
    { num: 2 as const, label: "Niveau 2", img: LEVEL_IMGS[1], count: team?.level2?.length || 0, total: team?.totalLevel2Invested || 0 },
    { num: 3 as const, label: "Niveau 3", img: LEVEL_IMGS[2], count: team?.level3?.length || 0, total: team?.totalLevel3Invested || 0 },
  ];

  const activeData = levels[activeLevel - 1];
  const members: TeamMember[] = team
    ? (activeLevel === 1 ? team.level1 : activeLevel === 2 ? team.level2 : team.level3)
    : [];

  const totalAll = (team?.level1?.length || 0) + (team?.level2?.length || 0) + (team?.level3?.length || 0);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f2f2f7", display: "flex", flexDirection: "column" }}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
        padding: "48px 16px 56px",
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => navigate("/team")} data-testid="button-back"
            style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ChevronLeft style={{ width: 20, height: 20, color: "white" }} />
          </button>
          <h1 style={{ flex: 1, textAlign: "center", fontSize: 17, fontWeight: 700, color: "white", margin: 0 }}>
            Mon Équipe
          </h1>
          <div style={{ width: 32 }} />
        </div>

        {/* Total badge */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{
            background: "rgba(255,255,255,0.2)", borderRadius: 999,
            padding: "6px 20px", display: "flex", alignItems: "center", gap: 8,
          }}>
            <Users style={{ width: 16, height: 16, color: "white" }} />
            <span style={{ color: "white", fontSize: 13, fontWeight: 600 }}>
              {totalAll} membre(s) au total
            </span>
          </div>
        </div>
      </div>

      {/* ── LEVEL TABS — overlap header ────────────────── */}
      <div style={{ margin: "0 12px", marginTop: -36, position: "relative", zIndex: 10 }}>
        <div style={{
          background: "white", borderRadius: 16,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          display: "flex", overflow: "hidden",
        }}>
          {levels.map((lv) => (
            <button
              key={lv.num}
              onClick={() => setActiveLevel(lv.num)}
              data-testid={`tab-level-${lv.num}`}
              style={{
                flex: 1, padding: "12px 4px 10px",
                background: "transparent", border: "none", cursor: "pointer",
                borderBottom: activeLevel === lv.num ? `3px solid ${GREEN}` : "3px solid transparent",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}
            >
              <img src={lv.img} alt={lv.label} style={{ width: 36, height: 36, objectFit: "contain" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: activeLevel === lv.num ? GREEN : "#9ca3af" }}>
                {lv.count}
              </span>
              <span style={{ fontSize: 11, color: activeLevel === lv.num ? GREEN : "#9ca3af" }}>
                {lv.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── STATS ROW ──────────────────────────────────── */}
      <div style={{ margin: "12px 12px 0", display: "flex", gap: 10 }}>
        {/* Membres */}
        <div style={{
          flex: 1, background: "white", borderRadius: 14,
          padding: "12px 14px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f0faf7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users style={{ width: 20, height: 20, color: GREEN }} />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: ORANGE, margin: 0 }} data-testid="text-level-count">
              {activeData.count}
            </p>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Filleuls</p>
          </div>
        </div>

        {/* Investissement */}
        <div style={{
          flex: 1, background: "white", borderRadius: 14,
          padding: "12px 14px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f0faf7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp style={{ width: 20, height: 20, color: GREEN }} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: ORANGE, margin: 0 }} data-testid="text-level-total">
              {activeData.total.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}
            </p>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Total investi</p>
          </div>
        </div>
      </div>

      {/* ── MEMBERS LIST ───────────────────────────────── */}
      <div style={{ margin: "12px 12px 40px" }}>
        <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>

          {/* List header */}
          {members.length > 0 && (
            <div style={{
              display: "flex", alignItems: "center",
              padding: "10px 16px", borderBottom: "1px solid #f5f5f5",
              background: "#fafafa",
            }}>
              <span style={{ flex: 1, fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>Membre</span>
              <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, marginRight: 8 }}>Date d'inscription</span>
              <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, minWidth: 70, textAlign: "right" }}>Investi</span>
            </div>
          )}

          {isLoading ? (
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ height: 56, background: "#f3f4f6", borderRadius: 10, animation: "pulse 1.5s ease-in-out infinite" }} />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0faf7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Users style={{ width: 28, height: 28, color: GREEN }} />
              </div>
              <p style={{ fontSize: 14, color: "#6b7280", fontWeight: 600, margin: "0 0 4px 0" }}>
                Aucun membre au {activeData.label}
              </p>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                Invitez des amis pour agrandir votre équipe
              </p>
            </div>
          ) : (
            members.map((member, idx) => (
              <div
                key={member.id}
                data-testid={`team-member-${member.id}`}
                style={{
                  display: "flex", alignItems: "center", padding: "12px 16px", gap: 12,
                  borderBottom: idx < members.length - 1 ? "1px solid #f5f5f5" : "none",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>
                    {member.phone.slice(0, 1)}
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 2px 0" }} data-testid={`text-member-phone-${member.id}`}>
                    {maskPhone(member.phone)}
                  </p>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                    {formatDate(member.createdAt)}
                  </p>
                </div>

                {/* Invested */}
                <p style={{ fontSize: 13, fontWeight: 700, color: ORANGE, flexShrink: 0, minWidth: 70, textAlign: "right" }} data-testid={`text-member-invested-${member.id}`}>
                  {member.totalInvested.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
