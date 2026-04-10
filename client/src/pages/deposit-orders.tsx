import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { getCountryByCode } from "@/lib/countries";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import jinkoLogo from "@assets/jinko-solar-logo-png_seeklogo-265492_1775671142176.png";

interface Deposit {
  id: number;
  amount: string;
  status: string;
  paymentMethod?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  approved: { label: "Succès",     color: "#3db51d" },
  pending:  { label: "En attente", color: "#f97316" },
  rejected: { label: "Rejeté",     color: "#ef4444" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function DepositOrdersPage() {
  useEffect(() => { document.title = "Historique des dépôts | Jinko Solar"; }, []);
  const { user } = useAuth();
  const countryInfo = user ? getCountryByCode(user.country) : null;
  const currency = countryInfo?.currency || "FCFA";

  const { data: deposits = [], isLoading } = useQuery<Deposit[]>({
    queryKey: ["/api/deposits/history"],
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", padding: "12px 16px", background: "white", borderBottom: "1px solid #e5e7eb" }}>
        <Link href="/account">
          <button style={{ padding: 4, marginRight: 8, background: "transparent", border: "none", cursor: "pointer" }} data-testid="button-back">
            <ChevronLeft size={22} color="#3db51d" />
          </button>
        </Link>
        <h1 style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 700, color: "#111827", paddingRight: 30 }}>
          Historique des dépôts
        </h1>
      </header>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))
        ) : deposits.length === 0 ? (
          <EmptyState message="Aucun dépôt pour le moment" />
        ) : (
          deposits.map((d) => {
            const cfg = STATUS_CONFIG[d.status] || { label: d.status, color: "#6b7280" };

            return (
              <div
                key={d.id}
                style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0", display: "flex", alignItems: "stretch" }}
                data-testid={`card-deposit-${d.id}`}
              >
                {/* Logo à gauche */}
                <div style={{ width: 72, flexShrink: 0, background: "linear-gradient(135deg, #1a6e2e 0%, #3db51d 60%, #7dd94a 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 10 }}>
                  <img
                    src={jinkoLogo}
                    alt="Jinko Solar"
                    style={{ width: 48, height: 48, objectFit: "contain", filter: "brightness(0) invert(1)" }}
                  />
                </div>

                {/* Contenu à droite */}
                <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Dépôt</span>
                    <span style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>
                      {parseFloat(d.amount).toLocaleString()} <span style={{ fontSize: 12, fontWeight: 600 }}>{currency}</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{formatDate(d.createdAt)}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
