import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";

import elfBanner from "@assets/436d1e2_upload-1-mvvsrwhr5qqo-elf2cuneaffairede28099etat-2_1770737042194.jpg";
import moneyBagIcon from "@assets/20260210_132528_1770737005954.png";
import coinsIcon from "@assets/20260210_132544_1770737005913.png";

import elfExpert1 from "@/assets/images/elf-expert-1.jpeg";
import elfExpert2 from "@/assets/images/elf-expert-2.webp";
import elfStation1 from "@/assets/images/elf-station-1.jpg";
import elfStation2 from "@/assets/images/elf-station-2.jpeg";

const productImages = [elfExpert1, elfExpert2, elfStation1, elfStation2];

export default function MyProductsPage() {
  const { user } = useAuth();

  const { data: userProducts, isLoading } = useQuery<any[]>({
    queryKey: ["/api/user/products"],
  });

  if (!user) return null;

  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";

  const activeProducts = userProducts?.filter((p: any) => p.status === "active") || [];
  const allProducts = userProducts || [];

  const totalEarned = allProducts.reduce((sum: number, p: any) => {
    return sum + parseFloat(p.totalEarned || "0");
  }, 0);

  const getProductImage = (productId: number, index: number) => {
    return productImages[(productId || index) % productImages.length];
  };

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

        <div className="relative h-40 overflow-hidden">
          <img src={elfBanner} alt="ELF" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
          <div className="absolute top-3 left-3">
            <Link href="/account">
              <button className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm" data-testid="button-back">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            </Link>
          </div>
        </div>

        <div className="mx-4 -mt-6 relative z-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex">
              <div className="flex-1 flex items-center gap-3 px-5 py-4 border-r border-gray-100">
                <img src={moneyBagIcon} alt="" className="w-10 h-10 object-contain" />
                <div>
                  <p className="text-gray-500 text-xs font-medium">Produit actif</p>
                  <p className="text-gray-900 text-2xl font-black">{String(activeProducts.length).padStart(2, "0")}</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-3 px-5 py-4">
                <div>
                  <p className="text-gray-500 text-xs font-medium">Revenus cumule</p>
                  <p className="text-gray-900 text-lg font-black">{totalEarned.toLocaleString()} {currency}</p>
                </div>
                <img src={coinsIcon} alt="" className="w-10 h-10 object-contain" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mt-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#2196F3]" />
            </div>
          ) : allProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-[#e3f2fd] flex items-center justify-center mx-auto mb-4">
                <img src={moneyBagIcon} alt="" className="w-10 h-10 object-contain opacity-50" />
              </div>
              <p className="text-gray-500 font-medium">Aucun produit pour le moment</p>
              <p className="text-gray-400 text-sm mt-1">Achetez des produits pour commencer a gagner</p>
            </div>
          ) : (
            allProducts.map((up: any, index: number) => {
              const cycleDays = up.product?.cycleDays || 60;
              const daysRemaining = up.daysRemaining || 0;
              const daysCompleted = cycleDays - daysRemaining;
              const dailyEarnings = up.product?.dailyEarnings || 0;
              const totalRevenue = cycleDays * dailyEarnings;
              const earnedSoFar = parseFloat(up.totalEarned || "0");
              const price = up.product?.price || 0;

              return (
                <div
                  key={up.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  data-testid={`product-card-${up.id}`}
                >
                  <div className="px-5 pt-4 pb-2">
                    <p className="text-[#2196F3] font-bold text-base text-center">
                      {up.product?.name || "Produit"}
                    </p>
                  </div>

                  <div className="flex justify-center px-5 py-2">
                    <img
                      src={getProductImage(up.productId, index)}
                      alt={up.product?.name || "Produit"}
                      className="h-36 object-contain rounded-xl"
                    />
                  </div>

                  <div className="flex justify-center px-5 py-1">
                    <span className="bg-[#e3f2fd] text-[#2196F3] font-bold text-sm px-4 py-1.5 rounded-full border border-[#90CAF9]">
                      Terme : {daysCompleted}/{cycleDays} Jours
                    </span>
                  </div>

                  <div className="h-px bg-[#2196F3] mx-5 my-2 opacity-40" />

                  <div className="px-5 pb-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Prix :</span>
                      <span className="text-[#2196F3] font-bold text-sm">{currency} {price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Revenu journalier :</span>
                      <span className="text-[#2196F3] font-bold text-sm">{currency} {dailyEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Revenu total :</span>
                      <span className="text-[#2196F3] font-bold text-sm">{currency} {totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Revenu recu :</span>
                      <span className="text-[#2196F3] font-bold text-sm">{currency} {earnedSoFar.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Date d'achat :</span>
                      <span className="text-gray-800 font-bold text-sm">{formatDateTime(up.purchasedAt)}</span>
                    </div>
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
