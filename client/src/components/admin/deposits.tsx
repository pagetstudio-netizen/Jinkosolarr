import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Check, X, Ban, Search, Loader2 } from "lucide-react";
import type { Deposit } from "@shared/schema";

interface DepositWithUser extends Deposit {
  user: {
    id: number;
    fullName: string;
    phone: string;
    country: string;
    isPromoter: boolean;
  };
}

export default function AdminDeposits() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const { data: allDeposits, isLoading } = useQuery<DepositWithUser[]>({
    queryKey: ["/api/admin/deposits"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/deposits?status=all`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch deposits");
      return res.json();
    },
  });

  const deposits = allDeposits?.filter(d => 
    statusFilter === "all" ? true : d.status === statusFilter
  );

  const processMutation = useMutation({
    mutationFn: async ({ id, action, ban }: { id: number; action: "approve" | "reject"; ban?: boolean }) => {
      const response = await apiRequest("POST", `/api/admin/deposits/${id}/${action}`, { ban });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Dépôt traité!" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const filteredDeposits = deposits?.filter(d => 
    d.accountNumber.includes(filter) || 
    d.user.phone.includes(filter) ||
    d.user.fullName.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro ou nom..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <Button
            key={status}
            size="sm"
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
          >
            {status === "all" ? "Tous" : status === "pending" ? "En attente" : status === "approved" ? "Approuvés" : "Rejetés"}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40" />)
        ) : filteredDeposits.length > 0 ? (
          filteredDeposits.map((deposit) => (
            <Card key={deposit.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{deposit.user.fullName}</p>
                      {deposit.user.isPromoter && <Badge className="text-xs">Promoteur</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{deposit.user.phone}</p>
                  </div>
                  <Badge variant={deposit.status === "pending" ? "secondary" : deposit.status === "approved" ? "default" : "destructive"}>
                    {deposit.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Montant</p>
                    <p className="font-medium text-foreground">{deposit.amount.toLocaleString()} F</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Moyen</p>
                    <p className="font-medium text-foreground">{deposit.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Numero</p>
                    <p className="font-medium text-foreground">{deposit.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pays</p>
                    <p className="font-medium text-foreground">{deposit.country}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Date et heure</p>
                    <p className="font-medium text-foreground">
                      {new Date(deposit.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit", 
                        year: "numeric"
                      })} a {new Date(deposit.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>

                {deposit.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => processMutation.mutate({ id: deposit.id, action: "approve" })}
                      disabled={processMutation.isPending}
                    >
                      {processMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" /> Valider</>}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => processMutation.mutate({ id: deposit.id, action: "reject" })}
                      disabled={processMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-1" /> Rejeter
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => processMutation.mutate({ id: deposit.id, action: "reject", ban: true })}
                      disabled={processMutation.isPending}
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Aucun dépôt trouvé
          </div>
        )}
      </div>
    </div>
  );
}
