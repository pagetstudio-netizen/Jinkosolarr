import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency, getCountryByCode } from "@/lib/countries";
import { Loader2, AlertTriangle, Settings, DollarSign } from "lucide-react";
import type { Product } from "@shared/schema";

import elfLogoCard from "@/assets/images/elf-logo-card.png";
import productsIcon from "@/assets/images/products-icon.png";
import revenueIcon from "@/assets/images/revenue-icon.png";

interface ProductWithOwnership extends Product {
  isOwned: boolean;
  canClaimFree: boolean;
  ownedCount?: number;
}

export default function InvestPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [confirmProduct, setConfirmProduct] = useState<ProductWithOwnership | null>(null);

  const { data: products, isLoading } = useQuery<ProductWithOwnership[]>({
    queryKey: ["/api/products"],
  });

  const { data: userProducts } = useQuery<any[]>({
    queryKey: ["/api/user/products"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest("POST", `/api/products/${productId}/purchase`, {});
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/products"] });
      refreshUser();
      setConfirmProduct(null);
      toast({ title: "Produit achete!", description: "Vous commencerez a recevoir des gains demain." });
    },
    onError: (error: any) => {
      setConfirmProduct(null);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  if (!user) return null;

  const balance = parseFloat(user.balance || "0");
  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";

  const activeProducts = userProducts?.filter((p: any) => p.status === "active") || [];
  const activeProductsCount = activeProducts.length;
  const totalProductRevenue = userProducts?.reduce((sum: number, p: any) => {
    const daysCompleted = (p.product?.cycleDays || 0) - (p.daysRemaining || 0);
    return sum + (daysCompleted * (p.product?.dailyEarnings || 0));
  }, 0) || 0;

  const handleBuyClick = (product: ProductWithOwnership) => {
    setConfirmProduct(product);
  };

  const confirmPurchase = () => {
    if (confirmProduct) {
      purchaseMutation.mutate(confirmProduct.id);
    }
  };

  const paidProducts = products?.filter(p => !p.isFree) || [];

  return (
    <div className="flex flex-col min-h-full bg-gray-100">
      <div className="bg-[#2196F3] px-4 pt-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 flex-shrink-0">
              <img src={productsIcon} alt="" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800" data-testid="text-active-products">
                {activeProductsCount}
              </p>
              <p className="text-xs text-gray-500">Mes Produits</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 flex-shrink-0">
              <img src={revenueIcon} alt="" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800" data-testid="text-product-revenue">
                {currency} {totalProductRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Mes revenus</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : paidProducts.length > 0 ? (
          <div className="space-y-4">
            {paidProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-visible shadow-sm relative"
                data-testid={`product-card-${product.id}`}
              >
                <div className="bg-[#2196F3] rounded-t-2xl px-4 py-3 flex items-center justify-between">
                  <h3 className="text-white font-bold text-base" data-testid={`text-product-name-${product.id}`}>
                    {product.name}
                  </h3>
                  <span className="bg-black/80 text-white text-[10px] font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-sm">NEW</span>
                </div>

                <div className="px-4 py-2 flex gap-3">
                  <div className="w-20 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={elfLogoCard}
                      alt="Wendy's"
                      className="w-full object-contain"
                    />
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex justify-between items-center flex-wrap gap-1">
                      <span className="text-xs text-gray-400">prix</span>
                      <span className="text-sm font-bold text-gray-800">{product.price.toLocaleString()} {currency}</span>
                    </div>
                    <div className="flex justify-between items-center flex-wrap gap-1">
                      <span className="text-xs text-gray-400">Benefice quotidien</span>
                      <span className="text-sm font-bold text-gray-800">{product.dailyEarnings.toLocaleString()} {currency}</span>
                    </div>
                    <div className="flex justify-between items-center flex-wrap gap-1">
                      <span className="text-xs text-gray-400">Revenu total</span>
                      <span className="text-sm font-bold text-gray-800">{product.totalReturn.toLocaleString()} {currency}</span>
                    </div>
                    <div className="flex justify-between items-center flex-wrap gap-1">
                      <span className="text-xs text-gray-400">Nombre de jours</span>
                      <span className="text-sm font-bold text-gray-800">{product.cycleDays} jours</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-4 pt-1">
                  <button
                    onClick={() => handleBuyClick(product)}
                    className="w-full bg-[#2196F3] text-white font-bold py-3 rounded-full text-base shadow-md active:opacity-90 transition-opacity"
                    data-testid={`button-purchase-${product.id}`}
                  >
                    investir
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400">Aucun produit disponible</p>
          </div>
        )}
      </div>

      <Dialog open={!!confirmProduct} onOpenChange={() => setConfirmProduct(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmer l'achat</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment acheter ce produit?
            </DialogDescription>
          </DialogHeader>

          {confirmProduct && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-[#2196F3] text-lg">{confirmProduct.name}</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Prix:</span>
                    <span className="font-medium">{confirmProduct.price.toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gains quotidiens:</span>
                    <span className="font-medium text-green-500">{confirmProduct.dailyEarnings.toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Revenu total:</span>
                    <span className="font-medium text-green-500">{confirmProduct.totalReturn.toLocaleString()} {currency}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-white border rounded-lg">
                <span className="text-gray-500">Votre solde:</span>
                <span className={`font-bold ${balance >= confirmProduct.price ? "text-green-500" : "text-red-500"}`}>
                  {formatCurrency(balance, user.country)}
                </span>
              </div>

              {balance < confirmProduct.price && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-500">
                    Solde insuffisant. Il vous manque {formatCurrency(confirmProduct.price - balance, user.country)}.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmProduct(null)} data-testid="button-cancel-purchase">
              Annuler
            </Button>
            <Button
              onClick={confirmPurchase}
              disabled={purchaseMutation.isPending || !!(confirmProduct && balance < confirmProduct.price)}
              data-testid="button-confirm-purchase"
            >
              {purchaseMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirmer l'achat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
