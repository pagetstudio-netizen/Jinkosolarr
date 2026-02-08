import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, ChevronRight, Clock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { getCountryByCode, getPaymentMethodsForCountry } from "@/lib/countries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WalletData {
  id: number;
  userId: number;
  accountName: string;
  accountNumber: string;
  paymentMethod: string;
  country: string;
  isDefault: boolean;
}

interface UserProduct {
  id: number;
  status: string;
}

export default function WithdrawalPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number | "">("");
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [showAddWalletDialog, setShowAddWalletDialog] = useState(false);
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletPhone, setNewWalletPhone] = useState("");
  const [newWalletMethod, setNewWalletMethod] = useState("");

  const countryInfo = user ? getCountryByCode(user.country) : null;
  const currency = countryInfo?.currency || "FCFA";
  const minWithdrawal = 1200;

  const { data: withdrawalSettings } = useQuery<{
    withdrawalFees: number;
    withdrawalStartHour: number;
    withdrawalEndHour: number;
    maxWithdrawalsPerDay: number;
  }>({
    queryKey: ["/api/settings/withdrawal"],
    staleTime: 0,
    refetchOnMount: true,
  });

  const withdrawalFee = withdrawalSettings?.withdrawalFees ?? 15;
  const withdrawalStartHour = withdrawalSettings?.withdrawalStartHour ?? 8;
  const withdrawalEndHour = withdrawalSettings?.withdrawalEndHour ?? 17;

  const amountAfterFees = amount ? Math.floor(Number(amount) * (1 - withdrawalFee / 100)) : 0;

  const currentHour = new Date().getHours();
  const isWithinWithdrawalHours = currentHour >= withdrawalStartHour && currentHour < withdrawalEndHour;

  const { data: wallets = [] } = useQuery<WalletData[]>({
    queryKey: ["/api/wallets"],
  });

  const { data: userProducts = [] } = useQuery<UserProduct[]>({
    queryKey: ["/api/user/products"],
  });

  const hasActiveProduct = userProducts.some((p) => p.status === "active");
  const [, navigate] = useLocation();

  const paymentMethods = user?.country ? getPaymentMethodsForCountry(user.country) : [];

  const addWalletMutation = useMutation({
    mutationFn: async (data: { accountName: string; accountNumber: string; paymentMethod: string; country: string }) => {
      const res = await apiRequest("POST", "/api/wallets", data);
      return res.json();
    },
    onSuccess: (newWallet) => {
      toast({ title: "Succes", description: "Portefeuille ajoute avec succes" });
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      setSelectedWallet(newWallet);
      setShowAddWalletDialog(false);
      setNewWalletName("");
      setNewWalletPhone("");
      setNewWalletMethod("");
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; walletId: number }) => {
      const res = await apiRequest("POST", "/api/withdrawals", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Demande envoyee",
        description: "Votre demande de retrait a ete envoyee.",
      });
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals"] });
      setAmount("");
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!isWithinWithdrawalHours) {
      toast({
        title: "Horaires de retrait",
        description: `Les retraits sont disponibles de ${withdrawalStartHour}h a ${withdrawalEndHour}h`,
        variant: "destructive",
      });
      return;
    }
    if (!hasActiveProduct) {
      toast({
        title: "Produit requis",
        description: "Vous devez avoir un produit actif pour effectuer un retrait",
        variant: "destructive",
      });
      return;
    }
    if (!amount || amount < minWithdrawal) {
      toast({
        title: "Montant invalide",
        description: `Le montant minimum est de ${minWithdrawal} ${currency}`,
        variant: "destructive",
      });
      return;
    }
    if (!selectedWallet) {
      toast({
        title: "Selectionnez un portefeuille",
        description: "Veuillez selectionner ou ajouter un portefeuille de retrait",
        variant: "destructive",
      });
      return;
    }
    withdrawMutation.mutate({ amount, walletId: selectedWallet.id });
  };

  const handleAddWallet = () => {
    if (!newWalletName || !newWalletPhone || !newWalletMethod) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }
    addWalletMutation.mutate({
      accountName: newWalletName,
      accountNumber: newWalletPhone,
      paymentMethod: newWalletMethod,
      country: user?.country || "",
    });
  };

  if (wallets.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#e0f7fa] to-white">
          <Link href="/account">
            <button className="p-2" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">Les retraits</h1>
          <Link href="/history">
            <button className="p-2" data-testid="button-history">
              <Clock className="w-5 h-5 text-[#2196F3]" />
            </button>
          </Link>
        </header>

        <div className="flex flex-col items-center justify-center p-8 mt-20">
          <div className="w-20 h-20 bg-[#e0f7fa] rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#26a69a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Aucun portefeuille</h2>
          <p className="text-gray-500 text-center mb-6">
            Vous devez d'abord ajouter un compte de retrait pour effectuer des retraits.
          </p>
          <Button 
            onClick={() => navigate("/account")}
            className="bg-[#26a69a] text-white px-6"
            data-testid="button-go-to-wallet"
          >
            Ajouter un portefeuille
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#e0f7fa] to-white">
        <Link href="/account">
          <button className="p-2" data-testid="button-back">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">Les retraits</h1>
        <Link href="/history">
          <button className="p-2" data-testid="button-history">
            <Clock className="w-5 h-5 text-[#26a69a]" />
          </button>
        </Link>
      </header>

      <div className="px-4 pt-2 pb-4">
        <div className="bg-gradient-to-r from-[#b2dfdb] via-[#80cbc4] to-[#e0f2f1] rounded-xl p-5">
          <h2 className="text-2xl font-bold text-gray-800">{currency} {parseFloat(user?.balance || "0").toLocaleString()}</h2>
          <p className="text-sm text-gray-600 mt-1">Solde du compte</p>
        </div>
      </div>

      <div className="px-4 space-y-5">
        <button
          onClick={() => wallets.length > 0 ? setShowWalletDialog(true) : setShowAddWalletDialog(true)}
          className="w-full bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
          data-testid="button-select-wallet"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </div>
            <span className="text-gray-700 text-sm">
              {selectedWallet ? (
                <span className="font-medium">{selectedWallet.accountName} - {selectedWallet.accountNumber}</span>
              ) : (
                "Choisissez votre compte bancaire"
              )}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Montant du retrait</p>
          <div className="border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
            <span className="font-bold text-gray-800 text-sm">{currency}</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder="Veuillez entrer le montant de retrait"
              className="flex-1 text-sm outline-none text-gray-500 bg-transparent"
              data-testid="input-withdrawal-amount"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Montant a recevoir {currency} {amountAfterFees.toLocaleString()}</span>
          <span className="text-gray-500">La taxe {withdrawalFee}%</span>
        </div>

        {!isWithinWithdrawalHours && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-orange-700 text-sm">
            Horaires de retrait: {withdrawalStartHour}h - {withdrawalEndHour}h (Ferme actuellement)
          </div>
        )}

        {!hasActiveProduct && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            Vous devez avoir un produit actif pour effectuer un retrait.
          </div>
        )}

        <div>
          <h3 className="font-bold text-gray-800 text-sm mb-3">Instructions pour retraits</h3>
          <div className="space-y-2 text-sm text-gray-600 leading-relaxed">
            <p>1. L'heure de retrait est de {withdrawalStartHour}h00 a {withdrawalEndHour}h00 tous les jours et les retraits sont disponibles tous les jours.</p>
            <p>2. Vous pouvez retirer de l'argent une fois par jour.</p>
            <p>3. Le montant minimum de retrait est de {minWithdrawal} {currency}.</p>
            <p>4. Des frais de traitement de {withdrawalFee} % seront factures pour les retraits ;</p>
            <p>5. Retirez de l'argent aujourd'hui et il arrivera demain. Le delai d'arrivee ne depassera pas 48 heures ;</p>
            <p>6. Si le retrait echoue, veuillez verifier soigneusement si les informations bancaires que vous avez renseignees sont correctes, puis soumettez a nouveau la demande de retrait ou utilisez d'autres banques pour retirer de l'argent ;</p>
            <p>7. Effectuez la premiere recharge et achetez des produits ELF pour activer la fonction de retrait ;</p>
          </div>
        </div>

        <div className="pb-6">
          <button
            onClick={handleSubmit}
            disabled={withdrawMutation.isPending || !amount || !selectedWallet || !hasActiveProduct}
            className="w-full py-3.5 bg-[#78c5d6] text-white font-semibold rounded-full disabled:opacity-50 text-base"
            data-testid="button-submit-withdrawal"
          >
            {withdrawMutation.isPending ? "Envoi en cours..." : "Retirer de l'argent"}
          </button>
        </div>
      </div>

      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selectionnez un portefeuille</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => {
                  setSelectedWallet(wallet);
                  setShowWalletDialog(false);
                }}
                className={`w-full p-3 rounded-lg border text-left ${
                  selectedWallet?.id === wallet.id ? "border-[#26a69a] bg-[#e0f7fa]" : "border-gray-200"
                }`}
                data-testid={`button-wallet-${wallet.id}`}
              >
                <p className="font-medium">{wallet.accountName}</p>
                <p className="text-sm text-gray-500">{wallet.accountNumber} - {wallet.paymentMethod}</p>
              </button>
            ))}
            <button
              onClick={() => {
                setShowWalletDialog(false);
                setShowAddWalletDialog(true);
              }}
              className="w-full p-3 rounded-lg border border-dashed border-gray-300 flex items-center justify-center gap-2 text-gray-500"
              data-testid="button-add-new-wallet"
            >
              <Plus className="w-4 h-4" />
              Ajouter un portefeuille
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddWalletDialog} onOpenChange={setShowAddWalletDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un portefeuille</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom du titulaire</label>
              <input
                type="text"
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                placeholder="Votre nom complet"
                className="w-full p-3 border rounded-lg"
                data-testid="input-wallet-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Numero de telephone</label>
              <input
                type="tel"
                value={newWalletPhone}
                onChange={(e) => setNewWalletPhone(e.target.value)}
                placeholder="Ex: 99123456"
                className="w-full p-3 border rounded-lg"
                data-testid="input-wallet-phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mode de paiement</label>
              <select
                value={newWalletMethod}
                onChange={(e) => setNewWalletMethod(e.target.value)}
                className="w-full p-3 border rounded-lg"
                data-testid="select-wallet-method"
              >
                <option value="">Selectionnez</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddWallet}
              disabled={addWalletMutation.isPending}
              className="w-full py-3 bg-[#26a69a] text-white font-semibold rounded-lg disabled:opacity-50"
              data-testid="button-save-wallet"
            >
              {addWalletMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
