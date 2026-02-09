import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getPaymentMethodsForCountry } from "@/lib/countries";
import { Loader2, Plus, Trash2, Wallet, ChevronRight, X, Star, ArrowLeft } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import type { WithdrawalWallet } from "@shared/schema";

const walletSchema = z.object({
  accountName: z.string().min(2, "Nom du compte requis"),
  accountNumber: z.string().min(8, "Numero requis"),
  paymentMethod: z.string().min(2, "Moyen de paiement requis"),
});

type WalletForm = z.infer<typeof walletSchema>;

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const selectMode = params.get("from") === "withdrawal";
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

  const handleSelectWallet = (wallet: WithdrawalWallet) => {
    if (selectMode) {
      localStorage.setItem("selectedWalletId", wallet.id.toString());
      navigate("/withdrawal");
    }
  };

  if (!user) return null;

  const paymentMethods = getPaymentMethodsForCountry(user.country);
  const backLink = selectMode ? "/withdrawal" : "/account";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <Link href={backLink}>
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">
          {selectMode ? "Choisir un compte" : "Mes comptes"}
        </h1>
        <div className="w-9" />
      </header>

      <div className="px-4 pt-4 pb-4">
        <div className="bg-gradient-to-r from-[#1565C0] to-[#1E88E5] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/80">Comptes de retrait</p>
              <p className="text-2xl font-bold text-white">{wallets?.length || 0}</p>
            </div>
          </div>
          <p className="text-xs text-white/60">Gerez vos comptes mobile money pour les retraits</p>
        </div>
      </div>

      {selectMode && (
        <div className="px-4 mb-3">
          <p className="text-sm text-gray-500 text-center">
            Appuyez sur un compte pour le selectionner
          </p>
        </div>
      )}

      <div className="px-4 pb-32">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#2196F3]" />
          </div>
        ) : wallets && wallets.length > 0 ? (
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className={`bg-white rounded-xl border p-4 ${
                  wallet.isDefault ? "border-[#2196F3]" : "border-gray-100"
                } ${selectMode ? "cursor-pointer" : ""} shadow-sm`}
                onClick={() => selectMode && handleSelectWallet(wallet)}
                data-testid={`wallet-card-${wallet.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                      wallet.isDefault
                        ? "bg-gradient-to-br from-[#1976D2] to-[#42A5F5]"
                        : "bg-gray-100"
                    }`}>
                      <Wallet className={`w-5 h-5 ${wallet.isDefault ? "text-white" : "text-gray-500"}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm truncate">{wallet.accountName}</p>
                        {wallet.isDefault && (
                          <Star className="w-3.5 h-3.5 text-[#2196F3] fill-[#2196F3] shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{wallet.accountNumber}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{wallet.paymentMethod}</p>
                    </div>
                  </div>

                  {!selectMode && (
                    <div className="flex items-center gap-1 shrink-0">
                      {!wallet.isDefault && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setDefaultMutation.mutate(wallet.id); }}
                          disabled={setDefaultMutation.isPending}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400"
                          data-testid={`button-set-default-${wallet.id}`}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(wallet.id); }}
                        disabled={deleteMutation.isPending}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-red-400"
                        data-testid={`button-delete-wallet-${wallet.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {selectMode && (
                    <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm mb-1">Aucun compte enregistre</p>
            <p className="text-gray-400 text-xs">Ajoutez un compte pour effectuer des retraits</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <Button
          className="w-full py-3 bg-[#2196F3] rounded-full text-base"
          onClick={() => setShowForm(true)}
          data-testid="button-add-wallet"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un compte
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowForm(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3" />
            <div className="flex items-center justify-between px-5 py-4">
              <h3 className="text-lg font-bold text-gray-800">Nouveau compte</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowForm(false)}
                data-testid="button-close-form"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="px-5 pb-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => addMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                            <p className="text-[10px] text-gray-400 mb-0.5">Nom du titulaire</p>
                            <input
                              {...field}
                              placeholder="Votre nom complet"
                              className="w-full text-sm outline-none text-gray-800 bg-transparent"
                              data-testid="input-wallet-name"
                            />
                          </div>
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
                        <FormControl>
                          <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                            <p className="text-[10px] text-gray-400 mb-0.5">Numero de telephone</p>
                            <input
                              {...field}
                              type="tel"
                              placeholder="Ex: 99123456"
                              className="w-full text-sm outline-none text-gray-800 bg-transparent"
                              data-testid="input-wallet-number"
                            />
                          </div>
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
                        <div className="border border-gray-200 rounded-xl px-4 py-1 bg-gray-50">
                          <p className="text-[10px] text-gray-400 mt-2">Moyen de paiement</p>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-0 p-0 h-8 shadow-none focus:ring-0" data-testid="select-wallet-method">
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
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="flex-1 rounded-full"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-[#2196F3] rounded-full"
                      disabled={addMutation.isPending}
                    >
                      {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
