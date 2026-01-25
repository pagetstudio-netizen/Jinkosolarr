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
  const [ordersTab, setOrdersTab] = useState<"active" | "completed">("active");

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
      <header className="px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-700">Available Products</h1>
      </header>

      <div className="flex justify-between px-4 mb-4">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-6 py-2 text-sm font-bold uppercase rounded-md transition-colors ${
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
          className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "orders"
              ? "bg-red-100 text-red-600 border-2 border-red-500"
              : "bg-white text-gray-700 border border-gray-300"
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

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <p className="text-red-500 font-bold text-[13px] leading-tight">
                              Prix : {product.price.toLocaleString()} Fcfa
                            </p>
                            <p className="text-red-500 font-medium text-[13px] leading-tight">
                              Gains journalieres : {product.dailyEarnings.toLocaleString()} Fcfa
                            </p>
                            <p className="text-gray-500 text-[13px] leading-tight">
                              Duree : <span className="text-blue-500 font-medium">{product.cycleDays} Jours</span>
                            </p>
                            <p className="text-gray-500 text-[13px] leading-tight">
                              Gains total : <span className="text-blue-500 font-medium">{product.totalReturn.toLocaleString()} Fcfa</span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleBuyClick(product)}
                            className="px-4 py-1.5 text-[13px] font-medium text-red-500 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 transition-colors flex-shrink-0"
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
          <div>
            <div className="flex justify-between mb-4 border-b">
              <button
                onClick={() => setOrdersTab("active")}
                className={`flex items-center gap-2 pb-2 px-4 text-sm font-medium transition-colors ${
                  ordersTab === "active"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500"
                }`}
                data-testid="orders-tab-active"
              >
                <span className="text-orange-400">&#9673;</span> En cours
              </button>
              <button
                onClick={() => setOrdersTab("completed")}
                className={`flex items-center gap-2 pb-2 px-4 text-sm font-medium transition-colors ${
                  ordersTab === "completed"
                    ? "text-gray-700 border-b-2 border-gray-500"
                    : "text-gray-500"
                }`}
                data-testid="orders-tab-completed"
              >
                <span className="text-gray-400">&#10003;</span> Termine
              </button>
            </div>

            <div className="space-y-4">
              {(() => {
                const filteredProducts = userProducts?.filter((up: any) => 
                  ordersTab === "active" ? up.status === "active" : up.status !== "active"
                ) || [];
                
                if (filteredProducts.length > 0) {
                  return filteredProducts.map((up: any, index: number) => {
                    const daysCompleted = (up.product?.cycleDays || 0) - (up.daysRemaining || 0);
                    const totalEarned = daysCompleted * (up.product?.dailyEarnings || 0);
                    const purchaseDateTime = up.purchasedAt ? new Date(up.purchasedAt) : null;
                    const purchaseDate = purchaseDateTime ? purchaseDateTime.toLocaleDateString('fr-FR') : '-';
                    const purchaseTime = purchaseDateTime ? purchaseDateTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-';
                    
                    return (
                      <div 
                        key={up.id} 
                        className="bg-white rounded-xl p-4 shadow-sm"
                        data-testid={`order-card-${up.id}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-24 h-24 flex-shrink-0">
                            <img 
                              src={getProductImage(up.productId ? up.productId % productImages.length : index)} 
                              alt={up.product?.name || "Produit"}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-red-500 font-bold text-sm">
                                {up.product?.name || "Produit"}
                              </p>
                              <span className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                                up.status === 'active' 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {up.status === 'active' ? 'Actif' : 'Termine'}
                              </span>
                            </div>
                            
                            <div className="space-y-0.5 text-[12px]">
                              <p className="text-gray-600">
                                Prix : <span className="text-blue-500 font-medium">{up.product?.price?.toLocaleString() || 0} Fcfa</span>
                              </p>
                              <p className="text-gray-600">
                                Gains/jour : <span className="text-green-500 font-medium">{up.product?.dailyEarnings?.toLocaleString() || 0} Fcfa</span>
                              </p>
                              <p className="text-gray-600">
                                Duree : <span className="text-blue-500 font-medium">{up.product?.cycleDays || 0} Jours</span>
                              </p>
                              <p className="text-gray-600">
                                Jours restants : <span className="text-orange-500 font-medium">{up.daysRemaining || 0}</span>
                              </p>
                              <p className="text-gray-600">
                                Total gagne : <span className="text-green-600 font-bold">{totalEarned.toLocaleString()} Fcfa</span>
                              </p>
                              <p className="text-gray-600">
                                Date : <span className="text-gray-700 font-medium">{purchaseDate}</span> a <span className="text-gray-700 font-medium">{purchaseTime}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                } else {
                  return (
                    <div className="text-center py-16">
                      <div className="w-32 h-32 mx-auto mb-4 opacity-50">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-gray-300">
                          <ellipse cx="50" cy="85" rx="35" ry="8" fill="currentColor" opacity="0.3"/>
                          <circle cx="50" cy="45" r="25" fill="none" stroke="currentColor" strokeWidth="3"/>
                          <path d="M50 25 L50 20 M50 65 L50 70" stroke="currentColor" strokeWidth="3"/>
                          <circle cx="50" cy="45" r="8" fill="currentColor"/>
                          <path d="M30 75 L70 75 L75 85 L25 85 Z" fill="currentColor" opacity="0.5"/>
                          <path d="M45 30 Q50 15 55 30" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">Aucun contenu pour le moment !</p>
                    </div>
                  );
                }
              })()}
            </div>
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
