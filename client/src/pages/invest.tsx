import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/countries";
import { Loader2, AlertTriangle, Gift } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");

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

  const claimFreeMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest("POST", `/api/products/${productId}/claim-free`, {});
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
      toast({ title: "Bonus reclame!", description: "50 FCFA ont ete ajoutes a votre compte." });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  if (!user) return null;

  const balance = parseFloat(user.balance || "0");

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
    <div className="flex flex-col min-h-full" style={{ backgroundColor: "#f5f0e8" }}>
      <header className="px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-700">Available Products</h1>
      </header>

      <div className="flex px-4 mb-4 gap-0">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-6 py-2 text-sm font-bold uppercase rounded-l-md transition-colors ${
            activeTab === "products"
              ? "bg-green-600 text-white"
              : "bg-white text-gray-700 border border-gray-300"
          }`}
          data-testid="tab-products"
        >
          PRODUITS
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-6 py-2 text-sm font-medium rounded-r-md transition-colors ${
            activeTab === "orders"
              ? "bg-red-100 text-red-600 border-2 border-red-500"
              : "bg-white text-gray-700 border border-gray-300 border-l-0"
          }`}
          data-testid="tab-orders"
        >
          Mes commandes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 px-4">
        {activeTab === "products" ? (
          <>
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
                    className="bg-white rounded-xl p-4 shadow-sm"
                    data-testid={`product-card-${product.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-28 h-28 flex-shrink-0">
                        <img 
                          src={getProductImage(index)} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className="text-red-500 font-bold text-sm">
                              Prix : {product.price.toLocaleString()} Fcfa
                            </p>
                            <p className="text-red-500 font-medium text-sm">
                              Par jour : {product.dailyEarnings.toLocaleString()} Fcfa
                            </p>
                            <p className="text-gray-600 text-sm">
                              Duree <span className="text-blue-500 font-medium">{product.cycleDays} Jours</span>
                            </p>
                            <p className="text-gray-600 text-sm">
                              Gain Total <span className="text-blue-500 font-medium">{product.totalReturn.toLocaleString()} Fcfa</span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleBuyClick(product)}
                            className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 border-2 border-red-400 rounded-lg hover:bg-red-200 transition-colors shadow-sm flex-shrink-0"
                            data-testid={`button-purchase-${product.id}`}
                          >
                            Acheter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun produit disponible</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {userProducts && userProducts.length > 0 ? (
              userProducts.map((up: any, index: number) => (
                <div 
                  key={up.id} 
                  className="bg-white rounded-xl p-4 shadow-sm"
                  data-testid={`order-card-${up.id}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 flex-shrink-0">
                      <img 
                        src={getProductImage(index)} 
                        alt={up.product?.name || "Produit"}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-red-500 font-bold text-base mb-1">
                        {up.product?.name || "Produit"}
                      </p>
                      <div className="space-y-0.5 text-sm">
                        <p className="text-gray-600">
                          Prix: <span className="text-blue-500 font-medium">{up.product?.price?.toLocaleString() || 0} Fcfa</span>
                        </p>
                        <p className="text-gray-600">
                          Gains/jour: <span className="text-green-500 font-medium">{up.product?.dailyEarnings?.toLocaleString() || 0} Fcfa</span>
                        </p>
                        <p className="text-gray-600">
                          Jours restants: <span className="text-blue-500 font-medium">{up.daysRemaining || 0}</span>
                        </p>
                        <p className="text-gray-600">
                          Statut: <span className={`font-medium ${up.status === 'active' ? 'text-green-500' : 'text-gray-500'}`}>
                            {up.status === 'active' ? 'Actif' : 'Termine'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune commande</p>
              </div>
            )}
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
