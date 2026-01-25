import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/countries";
import { Clock, Gift, Loader2, AlertTriangle } from "lucide-react";
import type { Product } from "@shared/schema";

import product1 from "@/assets/images/product-1.jpg";
import product2 from "@/assets/images/product-2.webp";
import product3 from "@/assets/images/product-3.webp";
import product4 from "@/assets/images/product-4.webp";
import product5 from "@/assets/images/product-5.webp";
import product6 from "@/assets/images/product-6.webp";
import product7 from "@/assets/images/product-7.webp";
import product8 from "@/assets/images/product-8.webp";
import product9 from "@/assets/images/product-9.jpg";

const productImages = [product1, product2, product3, product4, product5, product6, product7, product8, product9];

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

  return (
    <div className="flex flex-col min-h-full bg-card">
      <header className="px-4 py-3 border-b">
        <h1 className="text-lg font-bold text-foreground text-center">Plan d'investissement</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="divide-y divide-border">
            {products.map((product, index) => (
              <div key={product.id} className="px-3 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      <h3 className="text-sm font-bold text-primary">{product.name}</h3>
                      {product.isOwned && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-primary text-primary-foreground">
                          Actif {product.ownedCount && product.ownedCount > 1 ? `x${product.ownedCount}` : ""}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-[13px]">
                      <div className="flex">
                        <span className="text-muted-foreground w-32">Prix :</span>
                        <span className="font-semibold text-foreground">
                          {product.isFree ? "GRATUIT" : `FCFA ${product.price.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-muted-foreground w-32">Duree :</span>
                        <span className="font-semibold text-foreground">{product.cycleDays}-jour</span>
                      </div>
                      <div className="flex">
                        <span className="text-muted-foreground w-32">Revenu quotidien :</span>
                        <span className="font-semibold text-foreground">FCFA {product.dailyEarnings.toLocaleString()}</span>
                      </div>
                      <div className="flex">
                        <span className="text-muted-foreground w-32">Revenu total :</span>
                        <span className="font-semibold text-foreground">FCFA {product.totalReturn.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden p-1.5">
                      {product.isFree ? (
                        <Gift className="w-10 h-10 text-primary" />
                      ) : (
                        <img 
                          src={getProductImage(index)} 
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>

                    {product.isFree ? (
                      <Button
                        size="sm"
                        className="text-[10px] px-3 py-1.5 h-auto leading-tight"
                        disabled={!product.canClaimFree || claimFreeMutation.isPending}
                        onClick={() => claimFreeMutation.mutate(product.id)}
                        variant={product.canClaimFree ? "default" : "secondary"}
                        data-testid={`button-claim-free-${product.id}`}
                      >
                        {claimFreeMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : product.canClaimFree ? (
                          <span className="text-center">RECLAMER<br/>MAINTENANT</span>
                        ) : (
                          <span className="text-center flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            DEJA FAIT
                          </span>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="text-[10px] px-3 py-1.5 h-auto leading-tight"
                        onClick={() => handleBuyClick(product)}
                        data-testid={`button-purchase-${product.id}`}
                      >
                        <span className="text-center">ACHETER<br/>MAINTENANT</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun produit disponible</p>
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
              <div className="bg-secondary rounded-lg p-4">
                <h4 className="font-bold text-primary text-lg">{confirmProduct.name}</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prix:</span>
                    <span className="font-medium">FCFA {confirmProduct.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gains quotidiens:</span>
                    <span className="font-medium text-primary">FCFA {confirmProduct.dailyEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenu total:</span>
                    <span className="font-medium text-primary">FCFA {confirmProduct.totalReturn.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-card border rounded-lg">
                <span className="text-muted-foreground">Votre solde:</span>
                <span className={`font-bold ${balance >= confirmProduct.price ? "text-primary" : "text-destructive"}`}>
                  {formatCurrency(balance, user.country)}
                </span>
              </div>

              {balance < confirmProduct.price && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">
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
              disabled={purchaseMutation.isPending || (confirmProduct && balance < confirmProduct.price)}
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
