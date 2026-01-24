import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/countries";
import { ShoppingCart, Clock, TrendingUp, Gift, Loader2, Check } from "lucide-react";
import type { Product } from "@shared/schema";

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
      toast({ title: "Produit acheté!", description: "Vous commencerez à recevoir des gains demain." });
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
      toast({ title: "Bonus réclamé!", description: "50 FCFA ont été ajoutés à votre compte." });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  if (!user) return null;

  const balance = parseFloat(user.balance || "0");

  return (
    <div className="flex flex-col min-h-full bg-background">
      <header className="bg-secondary px-4 py-4">
        <h1 className="text-xl font-bold text-secondary-foreground text-center">Investir</h1>
        <p className="text-center text-muted-foreground text-sm mt-1">
          Solde: {formatCurrency(balance, user.country)}
        </p>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-20">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id} className={`overflow-hidden ${product.isOwned ? "border-primary/50" : ""}`}>
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-secondary to-secondary/80 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-secondary-foreground">{product.name}</h3>
                        {product.isFree && <Badge variant="secondary" className="text-xs">Gratuit</Badge>}
                        {product.isOwned && <Badge className="text-xs bg-primary text-primary-foreground">Actif</Badge>}
                      </div>
                      <p className="text-2xl font-bold text-primary mt-2">
                        {product.isFree ? "GRATUIT" : formatCurrency(product.price, user.country)}
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center">
                      {product.isFree ? (
                        <Gift className="w-8 h-8 text-primary" />
                      ) : (
                        <TrendingUp className="w-8 h-8 text-primary" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Gains/jour</p>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(product.dailyEarnings, user.country)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Durée</p>
                      <p className="font-semibold text-foreground">{product.cycleDays} jours</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-semibold text-primary">
                        {formatCurrency(product.totalReturn, user.country)}
                      </p>
                    </div>
                  </div>

                  {product.isFree ? (
                    <Button
                      className="w-full"
                      disabled={!product.canClaimFree || claimFreeMutation.isPending}
                      onClick={() => claimFreeMutation.mutate(product.id)}
                      variant={product.canClaimFree ? "default" : "secondary"}
                      data-testid={`button-claim-free-${product.id}`}
                    >
                      {claimFreeMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : product.canClaimFree ? (
                        <>
                          <Gift className="w-4 h-4 mr-2" />
                          Réclamer 50 FCFA
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Déjà réclamé aujourd'hui
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      disabled={product.isOwned || balance < product.price || purchaseMutation.isPending}
                      onClick={() => purchaseMutation.mutate(product.id)}
                      variant={product.isOwned ? "secondary" : "default"}
                      data-testid={`button-purchase-${product.id}`}
                    >
                      {purchaseMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : product.isOwned ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Produit actif
                        </>
                      ) : balance < product.price ? (
                        "Solde insuffisant"
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Acheter
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun produit disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}
