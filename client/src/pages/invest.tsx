import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency, getCountryByCode } from "@/lib/countries";
import { Loader2, AlertTriangle, Gift, Wallet } from "lucide-react";
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
  const totalEarnings = parseFloat(user.totalEarnings || "0");
  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";

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
    <div className="flex flex-col min-h-full bg-white">
      <header className="px-4 py-3 border-b">
        <h1 className="text-sm font-semibold text-gray-700 text-center">Investissement dans les machines fanuc</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        <div className="bg-gradient-to-r from-pink-400 to-pink-300 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xl font-bold" data-testid="text-invest-balance">
              {balance.toLocaleString()} {currency}
            </p>
            <p className="text-xs opacity-90 mt-1">Solde du compte</p>
          </div>
          <div className="absolute right-2 bottom-2 opacity-80">
            <Wallet className="w-10 h-10" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-400 to-green-300 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xl font-bold" data-testid="text-invest-earnings">
              {totalEarnings.toLocaleString()} {currency}
            </p>
            <p className="text-xs opacity-90 mt-1">Revenus accumules</p>
          </div>
          <div className="absolute right-2 bottom-2 opacity-80">
            <Wallet className="w-10 h-10" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : paidProducts.length > 0 ? (
          <div className="space-y-4">
            {paidProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl p-4 shadow-sm border"
                data-testid={`product-card-${product.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 flex-shrink-0">
                    <img 
                      src={getProductImage(index)} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-gray-600 text-[13px]">Prix : <span className="text-red-500 font-bold">{product.price.toLocaleString()} Fcfa</span></p>
                    <p className="text-gray-600 text-[13px]">Gains/jour : <span className="text-green-500 font-medium">{product.dailyEarnings.toLocaleString()} Fcfa</span></p>
                    <p className="text-gray-600 text-[13px]">Duree : <span className="text-blue-500 font-medium">{product.cycleDays} Jours</span></p>
                    <p className="text-gray-600 text-[13px]">Gains total : <span className="text-orange-500 font-medium">{product.totalReturn.toLocaleString()} Fcfa</span></p>
                  </div>
                </div>
                <button
                  onClick={() => handleBuyClick(product)}
                  className="w-full mt-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                  data-testid={`button-purchase-${product.id}`}
                >
                  Acheter
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun produit disponible</p>
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
                <h4 className="font-bold text-red-500 text-lg">{confirmProduct.name}</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Prix:</span>
                    <span className="font-medium">{confirmProduct.price.toLocaleString()} Fcfa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gains quotidiens:</span>
                    <span className="font-medium text-green-500">{confirmProduct.dailyEarnings.toLocaleString()} Fcfa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Revenu total:</span>
                    <span className="font-medium text-green-500">{confirmProduct.totalReturn.toLocaleString()} Fcfa</span>
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
            <Button variant="outline" onClick={() => setConfirmProduct(null)}>
              Annuler
            </Button>
            <Button 
              onClick={confirmPurchase}
              disabled={purchaseMutation.isPending || !!(confirmProduct && balance < confirmProduct.price)}
              className="bg-green-600 hover:bg-green-700"
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
