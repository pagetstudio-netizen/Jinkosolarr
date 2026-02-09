import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getPaymentMethodsForCountry } from "@/lib/countries";
import { Loader2, Plus, Trash2, CreditCard, Check, ArrowLeft, ChevronRight, Wallet, User, Phone, Shield } from "lucide-react";
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
    <div className="flex flex-col min-h-full bg-white">
      <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#64B5F6] to-white">
        <Link href={backLink}>
          <button className="p-2" data-testid="button-back">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">
          {selectMode ? "Selectionner" : "Compte de retrait"}
        </h1>
        <div className="w-9" />
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-24">
        {!selectMode && !showForm && (
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-[#e3f2fd] flex items-center justify-center">
              <Wallet className="w-10 h-10 text-[#2196F3]" />
            </div>
          </div>
        )}

        {selectMode && (
          <p className="text-sm text-gray-500 text-center mb-4">
            Appuyez sur un portefeuille pour le selectionner
          </p>
        )}

        {!showForm && (
          <h2 className="text-center text-lg font-bold text-gray-800 mb-1">
            {selectMode ? "Vos portefeuilles" : "Gestion des portefeuilles"}
          </h2>
        )}
        {!showForm && !selectMode && (
          <p className="text-center text-sm text-gray-500 mb-6">Gerez vos comptes de retrait</p>
        )}

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#2196F3]" />
            </div>
          ) : wallets && wallets.length > 0 && !showForm ? (
            wallets.map((wallet) => (
              <div
                key={wallet.id}
                className={`rounded-2xl border overflow-hidden ${
                  wallet.isDefault ? "border-[#2196F3] bg-[#f8fbff]" : "border-gray-100 bg-white"
                } ${selectMode ? "cursor-pointer" : ""} shadow-sm`}
                onClick={() => selectMode && handleSelectWallet(wallet)}
                data-testid={`wallet-card-${wallet.id}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        wallet.isDefault ? "bg-[#2196F3]" : "bg-[#e3f2fd]"
                      }`}>
                        <CreditCard className={`w-5 h-5 ${wallet.isDefault ? "text-white" : "text-[#2196F3]"}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{wallet.accountName}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{wallet.accountNumber}</p>
                        <span className="inline-block text-xs text-[#2196F3] bg-[#e3f2fd] px-2 py-0.5 rounded-full mt-1.5 font-medium">
                          {wallet.paymentMethod}
                        </span>
                      </div>
                    </div>
                    {!selectMode && (
                      <div className="flex items-center gap-1">
                        {!wallet.isDefault && (
                          <button
                            onClick={() => setDefaultMutation.mutate(wallet.id)}
                            disabled={setDefaultMutation.isPending}
                            className="p-2 rounded-full"
                            data-testid={`button-set-default-${wallet.id}`}
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteMutation.mutate(wallet.id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 rounded-full"
                          data-testid={`button-delete-wallet-${wallet.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    )}
                    {selectMode && (
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  {wallet.isDefault && (
                    <div className="mt-3 pt-3 border-t border-blue-100 flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-[#2196F3]" />
                      <span className="text-xs font-medium text-[#2196F3]">Portefeuille par defaut</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : !showForm ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#e3f2fd] flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-[#2196F3]" />
              </div>
              <p className="text-gray-500 text-sm mb-1">Aucun portefeuille enregistre</p>
              <p className="text-gray-400 text-xs">Ajoutez un portefeuille pour effectuer des retraits</p>
            </div>
          ) : null}

          {showForm ? (
            <div>
              <h2 className="text-center text-lg font-bold text-gray-800 mb-1">Nouveau portefeuille</h2>
              <p className="text-center text-sm text-gray-500 mb-6">Ajoutez un compte de retrait</p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => addMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du compte</label>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                              <User className="w-4 h-4 text-[#2196F3]" />
                            </div>
                            <input
                              {...field}
                              placeholder="Votre nom complet"
                              className="w-full border border-gray-200 rounded-full pl-10 pr-4 py-3 text-sm outline-none focus:border-[#2196F3] bg-white"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Numero</label>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                              <Phone className="w-4 h-4 text-[#2196F3]" />
                            </div>
                            <input
                              {...field}
                              type="tel"
                              placeholder="Votre numero"
                              className="w-full border border-gray-200 rounded-full pl-10 pr-4 py-3 text-sm outline-none focus:border-[#2196F3] bg-white"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Moyen de paiement</label>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-full border-gray-200 h-12" data-testid="select-wallet-method">
                              <SelectValue placeholder="Choisir le moyen de paiement" />
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

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-3 border border-gray-200 rounded-full text-sm font-medium text-gray-700"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={addMutation.isPending}
                      className="flex-1 py-3 bg-[#2196F3] text-white rounded-full text-sm font-bold disabled:opacity-40 shadow-md shadow-blue-200"
                    >
                      {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Ajouter"}
                    </button>
                  </div>
                </form>
              </Form>
            </div>
          ) : (
            <button
              className="w-full py-3.5 bg-[#2196F3] text-white font-bold rounded-full text-base shadow-md shadow-blue-200 flex items-center justify-center gap-2"
              onClick={() => setShowForm(true)}
              data-testid="button-add-wallet"
            >
              <Plus className="w-4 h-4" />
              Ajouter un portefeuille
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
