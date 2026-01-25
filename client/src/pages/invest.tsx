import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/countries";
import { Clock, Gift, Loader2, Check } from "lucide-react";
import type { Product } from "@shared/schema";

import robotSoldes from "@/assets/images/robot-soldes.png";
import robotCumulatif from "@/assets/images/robot-cumulatif.png";

interface ProductWithOwnership extends Product {
  isOwned: boolean;
  canClaimFree: boolean;
}

export default function InvestPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

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
      toast({ title: "Produit achete!", description: "Vous commencerez a recevoir des gains demain." });
    },
    onError: (error: any) => {
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
    return index % 2 === 0 ? robotSoldes : robotCumulatif;
  };

  return (
    <div className="flex flex-col min-h-full bg-card">
      <header className="bg-primary px-4 py-4">
        <h1 className="text-xl font-bold text-primary-foreground text-center">Produits</h1>
        <p className="text-center text-primary-foreground/80 text-sm mt-1">
          Solde: {formatCurrency(balance, user.country)}
        </p>
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
              <div key={product.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-lg font-bold text-primary">{product.name}</h3>
                      {product.isOwned && (
                        <Badge className="text-xs bg-primary text-primary-foreground">Actif</Badge>
                      )}
                    </div>

                    <div className="space-y-1.5 text-sm">
                      <div className="flex">
                        <span className="text-muted-foreground w-32">Prix :</span>
                        <span className="font-medium text-foreground">
                          {product.isFree ? "GRATUIT" : `FCFA ${product.price.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-muted-foreground w-32">Duree :</span>
                        <span className="font-medium text-foreground">{product.cycleDays}-jour</span>
                      </div>
                      <div className="flex">
                        <span className="text-muted-foreground w-32">Revenu quotidien :</span>
                        <span className="font-medium text-foreground">FCFA {product.dailyEarnings.toLocaleString()}</span>
                      </div>
                      <div className="flex">
                        <span className="text-muted-foreground w-32">Revenu total :</span>
                        <span className="font-medium text-foreground">FCFA {product.totalReturn.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden p-2">
                      {product.isFree ? (
                        <Gift className="w-12 h-12 text-primary" />
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
                        className="text-xs px-4 py-2 h-auto leading-tight"
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
                        className="text-xs px-4 py-2 h-auto leading-tight"
                        disabled={product.isOwned || balance < product.price || purchaseMutation.isPending}
                        onClick={() => purchaseMutation.mutate(product.id)}
                        variant={product.isOwned ? "secondary" : "default"}
                        data-testid={`button-purchase-${product.id}`}
                      >
                        {purchaseMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : product.isOwned ? (
                          <span className="text-center flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            ACTIF
                          </span>
                        ) : balance < product.price ? (
                          <span className="text-center">SOLDE<br/>INSUFFISANT</span>
                        ) : (
                          <span className="text-center">ACHETER<br/>MAINTENANT</span>
                        )}
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
    </div>
  );
}
