import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { useQuery } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { Loader2 } from "lucide-react";

import moneyIcon  from "@assets/20260228_002918_1777758768873.png";
import fallbackImg from "@assets/EdwUP_fe_400x400_1777682768333.jpg";

const GREEN = "#007054";

function formatDateTime(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f3f4f6" }}>
      <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{value}</span>
    </div>
  );
}

export default function MyProductsPage() {
  useEffect(() => { document.title = "Revenu | State Grid"; }, []);
  const { user } = useAuth();

  const { data: userProducts, isLoading } = useQuery<any[]>({
    queryKey: ["/api/user/products"],
  });

  if (!user) return null;

  const country   = getCountryByCode(user.country);
  const currency  = country?.currency || "FCFA";
  const allProducts = userProducts || [];
  const activeCount  = allProducts.filter((p: any) => p.status === "active").length;
  const totalEarned  = allProducts.reduce((s: number, p: any) => s + parseFloat(p.totalEarned || "0"), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#f2f2f7", display: "flex", flexDirection: "column" }}>

      {/* ── Header dégradé bleu → vert ── */}
      <div style={{
        background: "linear-gradient(135deg, #1d4ed8 0%, #007054 100%)",
        padding: "52px 16px 20px",
      }}>
        <div style={{ display: "flex", gap: 12 }}>

          {/* Bloc Produit actif */}
          <div style={{
            flex: 1, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
            borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
          }}>
            <img src={moneyIcon} alt="" style={{ width: 38, height: 38, objectFit: "contain" }} />
            <div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>Produit actif</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }} data-testid="text-active-count">
                {String(activeCount).padStart(2, "0")}
              </p>
            </div>
          </div>

          {/* Diviseur vertical */}
          <div style={{ width: 1, background: "rgba(255,255,255,0.25)", borderRadius: 1 }} />

          {/* Bloc Revenus cumulé */}
          <div style={{
            flex: 1, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
            borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
          }}>
            <img src={moneyIcon} alt="" style={{ width: 38, height: 38, objectFit: "contain" }} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>Revenus cumulé</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: "white", margin: 0, whiteSpace: "nowrap" }} data-testid="text-total-earned">
                {totalEarned.toLocaleString("fr-FR")} {currency}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Liste des produits ── */}
      <div style={{ flex: 1, padding: "16px 12px 100px", display: "flex", flexDirection: "column", gap: 14 }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 style={{ width: 32, height: 32, color: GREEN, animation: "spin 1s linear infinite" }} />
          </div>
        ) : allProducts.length === 0 ? (
          <EmptyState message="Aucun produit pour le moment" />
        ) : (
          allProducts.map((up: any) => {
            const product      = up.product || {};
            const cycleDays    = product.cycleDays  || 60;
            const daysRemaining = up.daysRemaining  || 0;
            const daysCompleted = Math.max(0, cycleDays - daysRemaining);
            const dailyEarnings = product.dailyEarnings || 0;
            const price         = product.price || 0;
            const totalRevenue  = cycleDays * dailyEarnings;
            const earnedSoFar   = parseFloat(up.totalEarned || "0");
            const imgSrc        = product.imageUrl ? product.imageUrl : fallbackImg;

            return (
              <div
                key={up.id}
                data-testid={`product-card-${up.id}`}
                style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
              >
                {/* Nom du produit */}
                <p style={{ textAlign: "center", fontWeight: 700, fontSize: 15, color: "#111827", margin: 0, padding: "14px 16px 10px" }}>
                  {product.name || "Produit"}
                </p>

                {/* Image produit */}
                <div style={{ padding: "0 16px" }}>
                  <img
                    src={imgSrc}
                    alt={product.name || "Produit"}
                    style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12 }}
                    onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
                  />
                </div>

                {/* Pill Terme */}
                <div style={{ padding: "12px 16px 4px", display: "flex", justifyContent: "center" }}>
                  <div style={{
                    background: "linear-gradient(90deg, #1d4ed8 0%, #007054 100%)",
                    borderRadius: 999, padding: "7px 28px",
                    color: "white", fontWeight: 700, fontSize: 13,
                  }}>
                    Terme : {daysCompleted}/{cycleDays} Jours
                  </div>
                </div>

                {/* Lignes détails */}
                <div style={{ padding: "10px 16px 14px" }}>
                  <InfoRow label="Prix :"              value={`${currency} ${Number(price).toLocaleString("fr-FR")}`} />
                  <InfoRow label="Revenu journalier :" value={`${currency} ${Number(dailyEarnings).toLocaleString("fr-FR")}`} />
                  <InfoRow label="Revenu total :"      value={`${currency} ${Number(totalRevenue).toLocaleString("fr-FR")}`} />
                  <InfoRow label="Revenu reçu :"       value={`${currency} ${earnedSoFar.toLocaleString("fr-FR")}`} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 5 }}>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>Date d'achat :</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{formatDateTime(up.purchasedAt)}</span>
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
