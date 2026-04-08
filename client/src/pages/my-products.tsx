import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";

import productHeroImg from "@assets/jinko-solar-logo-png_seeklogo-265492_1775671142176.png";

export default function MyProductsPage() {
  const { user } = useAuth();

  const { data: userProducts, isLoading } = useQuery<any[]>({
    queryKey: ["/api/user/products"],
  });

  if (!user) return null;

  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";

  const allProducts = userProducts || [];

  const totalEarned = allProducts.reduce((sum: number, p: any) => {
    return sum + parseFloat(p.totalEarned || "0");
  }, 0);

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-100">
      <div className="flex-1 overflow-y-auto pb-24">

        {/* Red header */}
        <div className="relative pt-10 pb-8 px-4 text-center" style={{ background: "linear-gradient(135deg, #3db51d 0%, #2a8d13 100%)" }}>
          <div className="absolute top-3 left-3">
            <Link href="/account">
              <button className="p-1.5 bg-white/20 rounded-full" data-testid="button-back">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            </Link>
          </div>
          <p className="text-white text-4xl font-black tracking-tight">
            {currency} {totalEarned.toLocaleString()}
          </p>
          <p className="text-white/80 text-sm mt-1">Revenus totaux</p>
        </div>

        {/* Info notice */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 text-center">
          <p className="text-gray-500 text-xs">
            ℹ️ Les revenus des produits sont réglés toutes les 24 heures
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            Vous pouvez acheter plusieurs appareils pour augmenter vos revenus
          </p>
        </div>

        {/* Product cards */}
        <div className="px-4 mt-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#3db51d" }} />
            </div>
          ) : allProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <p className="text-gray-500 font-medium">Aucun produit pour le moment</p>
              <p className="text-gray-400 text-sm mt-1">Achetez des produits pour commencer à gagner</p>
            </div>
          ) : (
            allProducts.map((up: any, index: number) => {
              const cycleDays = up.product?.cycleDays || 60;
              const daysRemaining = up.daysRemaining || 0;
              const daysCompleted = Math.max(0, cycleDays - daysRemaining);
              const dailyEarnings = up.product?.dailyEarnings || 0;
              const totalRevenue = cycleDays * dailyEarnings;
              const earnedSoFar = parseFloat(up.totalEarned || "0");

              return (
                <div
                  key={up.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                  data-testid={`product-card-${up.id}`}
                >
                  {/* Date badge + earnings row */}
                  <div className="px-4 pt-3 pb-2">
                    {/* Date badge */}
                    <div className="flex justify-end mb-2">
                      <span
                        className="text-white text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ backgroundColor: "#3db51d" }}
                      >
                        {formatDateTime(up.purchasedAt)}
                      </span>
                    </div>

                    {/* Earnings row */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[#3db51d] font-black text-lg leading-tight">
                          {currency} {dailyEarnings.toLocaleString()}
                        </p>
                        <p className="text-gray-400 text-xs">Revenus quotidiens</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#3db51d] font-black text-lg leading-tight">
                          {currency} {earnedSoFar.toLocaleString()}
                        </p>
                        <p className="text-gray-400 text-xs">Revenus totaux</p>
                      </div>
                    </div>
                  </div>

                  {/* Product info row */}
                  <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100">
                    <img
                      src={productHeroImg}
                      alt={up.product?.name || "Produit"}
                      className="w-14 h-14 object-cover rounded-xl shrink-0"
                    />
                    <div>
                      <p className="text-gray-900 font-bold text-sm">{up.product?.name || "Produit"}</p>
                      <p className="text-[#3db51d] text-xs font-medium mt-0.5">
                        Durée : {daysCompleted}/{cycleDays} Jours
                      </p>
                    </div>
                  </div>

                  {/* Red bottom bar */}
                  <div
                    className="px-4 py-2.5 text-center text-white text-sm font-semibold"
                    style={{ background: "linear-gradient(135deg, #3db51d, #2a8d13)" }}
                  >
                    Revenus reçus : {currency} {earnedSoFar.toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
