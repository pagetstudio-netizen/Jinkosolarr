import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { getCountryByCode } from "@/lib/countries";
import { Skeleton } from "@/components/ui/skeleton";

interface Withdrawal {
  id: number;
  amount: string;
  netAmount: string;
  status: string;
  accountName: string;
  accountNumber: string;
  createdAt: string;
}

const GREEN = "#007054";

function maskAccount(account: string) {
  if (!account) return "—";
  const clean = account.replace(/\D/g, "");
  if (clean.length <= 6) return account;
  return clean.slice(0, 2) + "****" + clean.slice(-4);
}

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

export default function WithdrawalHistoryPage() {
  useEffect(() => { document.title = "Dossiers de retrait | State Grid"; }, []);
  const { user } = useAuth();
  const countryInfo = user ? getCountryByCode(user.country) : null;
  const currency = countryInfo?.currency || "FCFA";

  const { data: withdrawals = [], isLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/withdrawals/history"],
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>

      {/* ── Header vert ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "14px 16px", background: GREEN, position: "relative",
      }}>
        <Link href="/account">
          <button
            data-testid="button-back"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
            <ChevronLeft size={24} color="white" />
          </button>
        </Link>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: "white", margin: 0 }}>Dossiers de retrait</h1>
      </header>

      {/* ── Liste ── */}
      <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)
        ) : withdrawals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: 14 }}>Aucun dossier de retrait</div>
        ) : (
          withdrawals.map((w) => {
            const cfg = STATUS_CONFIG[w.status] || { label: w.status, color: "#6b7280" };
            const gross = parseFloat(w.amount).toLocaleString("fr-FR");
            const net   = parseFloat(w.netAmount || w.amount).toLocaleString("fr-FR");

            return (
              <div
                key={w.id}
                data-testid={`card-withdrawal-${w.id}`}
                style={{ background: "white", borderRadius: 10, padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                {/* Titre + montant brut */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 7, borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Retrait</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: GREEN }}>{currency} {gross}</span>
                </div>

                <Row label="Montant reçu" value={`${currency} ${net}`}     valueColor={GREEN} />
                <Row label="Compte"       value={maskAccount(w.accountNumber)} />
                <Row label="Un résultat"  value={cfg.label}                 valueColor={cfg.color} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 7 }}>
                  <span style={{ fontSize: 13, color: "#9ca3af" }}>Temps</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: GREEN }}>{formatDate(w.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination footer */}
        {!isLoading && withdrawals.length > 0 && (
          <div style={{ textAlign: "center", padding: "12px 0 40px", color: "#9ca3af", fontSize: 13 }}>
            Plus de données
          </div>
        )}
      </div>
    </div>
  );
}
