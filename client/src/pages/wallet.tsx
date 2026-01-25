import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getPaymentMethodsForCountry } from "@/lib/countries";
import { Loader2, Plus, Trash2, CreditCard, Check, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import type { WithdrawalWallet } from "@shared/schema";
import bankIcon from "@/assets/images/bank-icon.png";

const walletSchema = z.object({
  accountName: z.string().min(2, "Nom du compte requis"),
  accountNumber: z.string().min(8, "Numero requis"),
  paymentMethod: z.string().min(2, "Moyen de paiement requis"),
});

type WalletForm = z.infer<typeof walletSchema>;

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const { data: wallets, isLoading } = useQuery<WithdrawalWallet[]>({
    queryKey: ["/api/wallets"],
  });

  const form = useForm<WalletForm>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      accountName: "",
      accountNumber: "",
      paymentMethod: "",
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: WalletForm) => {
      const response = await apiRequest("POST", "/api/wallets", {
        ...data,
        country: user!.country,
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      toast({ title: "Portefeuille ajoute!" });
      form.reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (walletId: number) => {
      const response = await apiRequest("DELETE", `/api/wallets/${walletId}`, {});
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      toast({ title: "Portefeuille supprime!" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (walletId: number) => {
      const response = await apiRequest("PATCH", `/api/wallets/${walletId}/default`, {});
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      toast({ title: "Portefeuille par defaut mis a jour!" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  if (!user) return null;

  const paymentMethods = getPaymentMethodsForCountry(user.country);

  return (
    <div className="flex flex-col min-h-full bg-white">
      <header className="flex items-center px-4 py-3 border-b bg-white">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        </Link>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">Compte de retrait</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        <div className="flex justify-center mb-6">
          <img src={bankIcon} alt="Bank" className="w-32 h-32 object-contain" />
        </div>

        <h2 className="text-center text-xl font-bold text-gray-800 mb-6">Gestion des portefeuilles</h2>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          ) : wallets && wallets.length > 0 ? (
            wallets.map((wallet) => (
              <Card key={wallet.id} className={wallet.isDefault ? "border-amber-500 border-2" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{wallet.accountName}</p>
                        <p className="text-sm text-gray-500">{wallet.accountNumber}</p>
                        <p className="text-xs text-gray-400">{wallet.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!wallet.isDefault && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDefaultMutation.mutate(wallet.id)}
                          disabled={setDefaultMutation.isPending}
                          data-testid={`button-set-default-${wallet.id}`}
                        >
                          <Check className="w-4 h-4 text-green-500" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(wallet.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-wallet-${wallet.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {wallet.isDefault && (
                    <div className="mt-2">
                      <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded">Par defaut</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : !showForm ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Aucun portefeuille enregistre</p>
            </div>
          ) : null}

          {showForm ? (
            <Card>
              <CardContent className="p-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => addMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du compte</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Votre nom complet" data-testid="input-wallet-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numero</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" placeholder="Votre numero" data-testid="input-wallet-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Moyen de paiement</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-wallet-method">
                                <SelectValue placeholder="Choisir" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {paymentMethods.map((method) => (
                                <SelectItem key={method} value={method}>
                                  {method}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                        Annuler
                      </Button>
                      <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600" disabled={addMutation.isPending}>
                        {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ajouter"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Button className="w-full bg-amber-500 hover:bg-amber-600" onClick={() => setShowForm(true)} data-testid="button-add-wallet">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un portefeuille
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
