import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency, getCountryByCode } from "@/lib/countries";
import { Loader2, AlertTriangle, Settings } from "lucide-react";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";

import wendysLogoFull from "@assets/20260311_215217_1773265974092.png";
import serviceIcon from "@assets/20260311_214852_1773265973964.png";
import productHeroImg from "@assets/Wendys-Still-Wants-Dynamic-Pricing-to-Work-FT-BLOG0224-53eb3b6_1773262521308.jpg";

interface ProductWithOwnership extends Product {
  isOwned: boolean;
  canClaimFree: boolean;
  ownedCount?: number;
}

export default function InvestPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [confirmProduct, setConfirmProduct] = useState<ProductWithOwnership | null>(null);

  const { data: products, isLoading } = useQuery<ProductWithOwnership[]>({
    queryKey: ["/api/products"],
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
      <div className="flex items-center justify-between px-4 py-3 shadow-sm" style={{ background: "linear-gradient(135deg, #c8102e 0%, #a00d25 100%)" }}>
        <img src={wendysLogoFull} alt="Wendy's" className="h-9 w-auto object-contain" data-testid="img-wendys-logo" />
        <button
          onClick={() => navigate("/service")}
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          data-testid="button-service"
        >
          <img src={serviceIcon} alt="Service client" className="w-6 h-6 object-contain" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 px-3 pt-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        ) : paidProducts.length > 0 ? (
          <div className="space-y-4">
            {paidProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm"
                data-testid={`product-card-${product.id}`}
              >
                <div className="px-4 pt-3 pb-2">
                  <h3 className="font-bold text-gray-900 text-base" data-testid={`text-product-name-${product.id}`}>
                    {product.name}
                  </h3>
                </div>

                <div className="mx-3 rounded-xl overflow-hidden" style={{ height: "130px" }}>
                  <img
                    src={productHeroImg}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="px-4 pt-3 pb-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Cycle(Jours)</span>
                    <span className="text-sm font-semibold text-orange-500">{product.cycleDays}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Revenu quotidien({currency})</span>
                    <span className="text-sm font-semibold text-orange-500">{product.dailyEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Revenu total({currency})</span>
                    <span className="text-sm font-semibold text-orange-500">
                      {product.price.toLocaleString()}+{product.totalReturn.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 mt-1 border-t border-gray-100">
                  <div>
                    <span className="text-xs text-gray-400">Prix({currency})</span>
                    <p className="text-base font-bold text-orange-500">{product.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleBuyClick(product)}
                    className="px-6 py-2.5 rounded-full text-sm font-bold text-white shadow-md"
                    style={{ background: "linear-gradient(90deg, #c8102e, #e8394e)" }}
                    data-testid={`button-purchase-${product.id}`}
                  >
                    Investir
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
              Voulez-vous vraiment acheter ce produit ?
            </DialogDescription>
          </DialogHeader>

          {confirmProduct && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-[#c8102e] text-lg">{confirmProduct.name}</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Prix:</span>
                    <span className="font-medium">{confirmProduct.price.toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gains quotidiens:</span>
                    <span className="font-medium text-orange-500">{confirmProduct.dailyEarnings.toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Revenu total:</span>
                    <span className="font-medium text-orange-500">{confirmProduct.totalReturn.toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Durée:</span>
                    <span className="font-medium">{confirmProduct.cycleDays} jours</span>
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
              className="bg-[#c8102e] hover:bg-[#a00d25]"
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
