import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Check, X, Search, Loader2, Zap, Wallet } from "lucide-react";
import type { Withdrawal } from "@shared/schema";

interface WithdrawalWithUser extends Withdrawal {
  user: {
    id: number;
    fullName: string;
    phone: string;
    country: string;
    isPromoter: boolean;
  };
}

interface OmnipayBalanceEntry {
  countryName: string;
  countryCode: string;
  amount: number;
  currency: string;
}

const OMNIPAY_COUNTRIES = ["CI", "TG", "BF", "SN", "BJ", "CM", "CG"];

export default function AdminWithdrawals() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected" | "processing">("pending");
  const [showOmnipayBalance, setShowOmnipayBalance] = useState(false);

  const { data: allWithdrawals, isLoading } = useQuery<WithdrawalWithUser[]>({
    queryKey: ["/api/admin/withdrawals"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/withdrawals?status=all`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch withdrawals");
      return res.json();
    },
  });

  const withdrawals = allWithdrawals?.filter(w => 
    statusFilter === "all" ? true : w.status === statusFilter
  );

  const processMutation = useMutation({
    mutationFn: async ({ id, action, useOmnipayPayout }: { id: number; action: "approve" | "reject"; useOmnipayPayout?: boolean }) => {
      const body = useOmnipayPayout ? { useOmnipayPayout: true } : {};
      const response = await apiRequest("POST", `/api/admin/withdrawals/${id}/${action}`, body);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      if (data?.omnipayPayout) {
        toast({ title: "Envoyé via OmniPay", description: "Le transfert est en cours de traitement" });
      } else {
        toast({ title: "Retrait traite!" });
      }
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const balanceMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/omnipay/balance", { credentials: "include" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur");
      }
      return res.json() as Promise<{ balance: OmnipayBalanceEntry[] }>;
    },
    onError: (error: any) => {
      toast({ title: "Erreur OmniPay", description: error.message, variant: "destructive" });
    },
  });

  const filteredWithdrawals = withdrawals?.filter(w => 
    w.accountNumber.includes(filter) || 
    w.user.phone.includes(filter) ||
    w.user.fullName.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  const isOmnipayCountry = (country: string) => OMNIPAY_COUNTRIES.includes(country);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <p className="font-semibold text-sm text-foreground">Solde OmniPay</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { balanceMutation.mutate(); setShowOmnipayBalance(true); }}
              disabled={balanceMutation.isPending}
              data-testid="button-omnipay-balance"
            >
              {balanceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Voir solde"}
            </Button>
          </div>
          {showOmnipayBalance && (
            <div className="mt-2 p-3 bg-muted rounded-md">
              {balanceMutation.isPending ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
                </div>
              ) : balanceMutation.data?.balance ? (
                <div className="space-y-1">
                  {balanceMutation.data.balance.map((b) => (
                    <div key={b.countryCode} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{b.countryName}:</span>
                      <span className="font-bold text-foreground">{b.amount.toLocaleString()} {b.currency}</span>
                    </div>
                  ))}
                </div>
              ) : balanceMutation.error ? (
                <p className="text-sm text-destructive">Erreur: {(balanceMutation.error as any).message}</p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numero ou nom..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {(["all", "pending", "processing", "approved", "rejected"] as const).map((status) => (
          <Button
            key={status}
            size="sm"
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
          >
            {status === "all" ? "Tous" : status === "pending" ? "En attente" : status === "processing" ? "En cours" : status === "approved" ? "Approuves" : "Rejetes"}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40" />)
        ) : filteredWithdrawals.length > 0 ? (
          filteredWithdrawals.map((withdrawal) => (
            <Card key={withdrawal.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">{withdrawal.user.fullName}</p>
                      {withdrawal.user.isPromoter && <Badge className="text-xs">Promoteur</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{withdrawal.user.phone}</p>
                    <p className="text-sm text-muted-foreground">Pays: {withdrawal.user.country}</p>
                  </div>
                  <Badge variant={
                    withdrawal.status === "pending" ? "secondary" : 
                    withdrawal.status === "processing" ? "secondary" :
                    withdrawal.status === "approved" ? "default" : "destructive"
                  }>
                    {withdrawal.status === "processing" ? "En cours" : withdrawal.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Montant demande</p>
                    <p className="font-medium text-foreground">{withdrawal.amount.toLocaleString()} F</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Montant net</p>
                    <p className="font-medium text-primary">{withdrawal.netAmount.toLocaleString()} F</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Frais</p>
                    <p className="font-medium text-destructive">{withdrawal.fees.toLocaleString()} F</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Moyen</p>
                    <p className="font-medium text-foreground">{withdrawal.paymentMethod}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Numero de reception</p>
                    <p className="font-medium text-foreground">{withdrawal.accountNumber} - {withdrawal.accountName}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Date et heure</p>
                    <p className="font-medium text-foreground">
                      {new Date(withdrawal.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit", 
                        year: "numeric"
                      })} a {new Date(withdrawal.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>

                {withdrawal.status === "pending" && (
                  <div className="flex flex-col gap-2">
                    {isOmnipayCountry(withdrawal.user.country) && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => processMutation.mutate({ id: withdrawal.id, action: "approve", useOmnipayPayout: true })}
                        disabled={processMutation.isPending}
                        data-testid={`button-omnipay-approve-${withdrawal.id}`}
                      >
                        {processMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4 mr-1" /> Envoyer via OmniPay</>}
                      </Button>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => processMutation.mutate({ id: withdrawal.id, action: "approve" })}
                        disabled={processMutation.isPending}
                        data-testid={`button-manual-approve-${withdrawal.id}`}
                      >
                        {processMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" /> Valider</>}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => processMutation.mutate({ id: withdrawal.id, action: "reject" })}
                        disabled={processMutation.isPending}
                        data-testid={`button-reject-${withdrawal.id}`}
                      >
                        <X className="w-4 h-4 mr-1" /> Rejeter
                      </Button>
                    </div>
                  </div>
                )}
                {withdrawal.status === "processing" && (
                  <div className="p-2 bg-muted rounded-md text-sm text-muted-foreground text-center">
                    Transfert OmniPay en cours de traitement...
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Aucun retrait trouve
          </div>
        )}
      </div>
    </div>
  );
}
