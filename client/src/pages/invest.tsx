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

import product1 from "@/assets/images/product-1.jpg";
import product2 from "@/assets/images/product-2.webp";
import product3 from "@/assets/images/product-3.webp";
import product4 from "@/assets/images/product-4.webp";
import product5 from "@/assets/images/product-5.webp";
import product6 from "@/assets/images/product-6.webp";
import product7 from "@/assets/images/product-7.webp";
import product8 from "@/assets/images/product-8.webp";

const productImages = [product1, product2, product3, product4, product5, product6, product7, product8];

interface ProductWithOwnership extends Product {
  isOwned: boolean;
  canClaimFree: boolean;
  ownedCount?: number;
}

export default function InvestPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [confirmProduct, setConfirmProduct] = useState<ProductWithOwnership | null>(null);
  const [activeTab, setActiveTab] = useState<"sale" | "presale">("sale");

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

  const getProductImage = (index: number) => {
    return productImages[index % productImages.length];
  };

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
    <div className="flex flex-col min-h-full bg-gray-50">
      <div className="bg-gradient-to-b from-blue-100 to-gray-50 px-4 pt-4 pb-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800" data-testid="text-active-products">
                {activeProductsCount}
              </p>
              <p className="text-xs text-gray-500">Mes Produits</p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800" data-testid="text-product-revenue">
                {currency} {totalProductRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Mes revenus</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex px-4 pt-3 bg-gray-50">
        <button
          onClick={() => setActiveTab("sale")}
          className={`flex-1 pb-2 text-sm font-medium text-center border-b-2 transition-colors ${
            activeTab === "sale" 
              ? "border-blue-500 text-blue-600" 
              : "border-transparent text-gray-400"
          }`}
          data-testid="tab-products-sale"
        >
          Produits en vente
        </button>
        <button
          onClick={() => setActiveTab("presale")}
          className={`flex-1 pb-2 text-sm font-medium text-center border-b-2 transition-colors ${
            activeTab === "presale" 
              ? "border-blue-500 text-blue-600" 
              : "border-transparent text-gray-400"
          }`}
          data-testid="tab-products-presale"
        >
          Produits en pre-vente
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-3">
        {activeTab === "presale" ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">Aucun produit en pre-vente pour le moment</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : paidProducts.length > 0 ? (
          <div className="space-y-3">
            {paidProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl p-4 shadow-sm"
                data-testid={`product-card-${product.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 flex-shrink-0">
                    <img 
                      src={getProductImage(index)} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm mb-1" data-testid={`text-product-name-${product.id}`}>
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Prix: <span className="text-red-500 font-semibold">{product.price.toLocaleString()} {currency}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Revenu quotidien: <span className="text-[#2196F3] font-semibold">{product.dailyEarnings.toLocaleString()} {currency}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Revenu total: <span className="text-[#2196F3] font-semibold">{product.totalReturn.toLocaleString()} {currency}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Periode de revenu: <span className="text-gray-700 font-semibold">{product.cycleDays} jours</span>
                    </p>
                  </div>

                  <Button
                    onClick={() => handleBuyClick(product)}
                    size="sm"
                    className="rounded-full shrink-0"
                    data-testid={`button-purchase-${product.id}`}
                  >
                    Acheter
                  </Button>
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
                <h4 className="font-bold text-blue-600 text-lg">{confirmProduct.name}</h4>
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
