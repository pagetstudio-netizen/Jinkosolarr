import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { getCountryByCode } from "@/lib/countries";
import { Skeleton } from "@/components/ui/skeleton";

interface Deposit {
  id: number;
  amount: string;
  status: string;
  paymentMethod?: string;
  createdAt: string;
}

const GREEN = "#007054";

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  approved: { label: "succès",     color: GREEN },
  pending:  { label: "en attente", color: "#f97316" },
  rejected: { label: "rejeté",     color: "#ef4444" },
};

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
      <span style={{ fontSize: 13, color: "#9ca3af" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: valueColor || "#111827" }}>{value}</span>
    </div>
  );
}

export default function DepositOrdersPage() {
  useEffect(() => { document.title = "Dossiers de dépôt | State Grid"; }, []);
  const { user } = useAuth();
  const countryInfo = user ? getCountryByCode(user.country) : null;
  const currency = countryInfo?.currency || "FCFA";

  const { data: deposits = [], isLoading } = useQuery<Deposit[]>({
    queryKey: ["/api/deposits/history"],
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>

      {/* ── Header vert ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 16px 14px", background: GREEN, position: "relative",
      }}>
        <Link href="/account">
          <button
            data-testid="button-back"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
            <ChevronLeft size={24} color="white" />
          </button>
        </Link>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: "white", margin: 0 }}>Dossiers de dépôt</h1>
      </header>

      {/* ── Liste ── */}
      <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
        ) : deposits.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: 14 }}>Aucun dossier de dépôt</div>
        ) : (
          deposits.map((d) => {
            const cfg = STATUS_CONFIG[d.status] || { label: d.status, color: "#6b7280" };
            const amount = parseFloat(d.amount).toLocaleString("fr-FR");
            const method = d.paymentMethod || "WestPay";

            return (
              <div
                key={d.id}
                data-testid={`card-deposit-${d.id}`}
                style={{ background: "white", borderRadius: 10, padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                {/* Titre + montant */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 7, borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Dépôt</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: GREEN }}>{currency} {amount}</span>
                </div>

                <Row label="Méthode"     value={method} />
                <Row label="Un résultat" value={cfg.label} valueColor={cfg.color} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 7 }}>
                  <span style={{ fontSize: 13, color: "#9ca3af" }}>Temps</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: GREEN }}>{formatDate(d.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination footer */}
        {!isLoading && deposits.length > 0 && (
          <div style={{ textAlign: "center", padding: "12px 0 40px", color: "#9ca3af", fontSize: 13 }}>
            Plus de données
          </div>
        )}
      </div>
    </div>
  );
}
