import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, ChevronRight, Wallet } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { getCountryByCode } from "@/lib/countries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Wallet {
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
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
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

  const { data: wallets = [] } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
  });

  const { data: userProducts = [] } = useQuery<UserProduct[]>({
    queryKey: ["/api/user/products"],
  });

  const hasActiveProduct = userProducts.some((p) => p.status === "active");
  const [, navigate] = useLocation();

  const { data: paymentChannels = [] } = useQuery<{ id: number; name: string; type: string }[]>({
    queryKey: ["/api/payment-channels", user?.country],
    queryFn: async () => {
      const res = await fetch(`/api/payment-channels?country=${user?.country}`);
      return res.json();
    },
    enabled: !!user?.country,
  });

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
      <div className="min-h-screen" style={{ backgroundColor: "#f5f0e8" }}>
        <header className="flex items-center px-4 py-3 border-b bg-white">
          <Link href="/account">
            <button className="p-2" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-8">Retrait</h1>
        </header>

        <div className="flex flex-col items-center justify-center p-8 mt-20">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <Wallet className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Aucun portefeuille</h2>
          <p className="text-gray-500 text-center mb-6">
            Vous devez d'abord ajouter un compte de retrait pour effectuer des retraits.
          </p>
          <Button 
            onClick={() => navigate("/account")}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6"
            data-testid="button-go-to-wallet"
          >
            Ajouter un portefeuille
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f0e8" }}>
      <header className="flex items-center px-4 py-3 border-b bg-white">
        <Link href="/account">
          <button className="p-2" data-testid="button-back">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        </Link>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-8">Retrait</h1>
      </header>

      <div className="p-4 space-y-6">
        <div 
          className="rounded-lg p-4 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)" }}
        >
          <div>
            <p className="text-3xl font-bold text-white">{parseFloat(user?.balance || "0").toLocaleString()}</p>
            <p className="text-sm text-blue-200">Solde restant ({currency})</p>
            <Link href="/deposit-history">
              <button className="mt-2 px-4 py-1 bg-amber-500 text-white text-sm font-medium rounded-full">
                Enregistrement
              </button>
            </Link>
          </div>
          <div className="w-16 h-16 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-amber-800">$</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => wallets.length > 0 ? setShowWalletDialog(true) : setShowAddWalletDialog(true)}
          className="w-full bg-white rounded-lg border p-4 flex items-center justify-between"
          data-testid="button-select-wallet"
        >
          <span className="text-gray-600">
            {selectedWallet ? (
              <span className="text-gray-900 font-medium">{selectedWallet.accountName} - {selectedWallet.accountNumber}</span>
            ) : (
              "Selectionnez votre portefeuille"
            )}
          </span>
          <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
        </button>

        <div className={`rounded-lg p-3 text-sm ${isWithinWithdrawalHours ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-orange-50 border border-orange-200 text-orange-700'}`}>
          Horaires de retrait: {withdrawalStartHour}h - {withdrawalEndHour}h
          {!isWithinWithdrawalHours && " (Ferme actuellement)"}
        </div>

        {!hasActiveProduct && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            Vous devez avoir un produit actif pour effectuer un retrait.
          </div>
        )}

        <div className="bg-white rounded-lg border p-4">
          <label className="block text-sm text-gray-500 mb-2">Montant ({currency})</label>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">{currency}</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder="5000"
              className="flex-1 text-xl outline-none"
              data-testid="input-withdrawal-amount"
            />
          </div>
          {amount && Number(amount) > 0 && (
            <div className="border-t mt-3 pt-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Frais ({withdrawalFee}%)</span>
                <span className="text-red-500">-{Math.floor(Number(amount) * withdrawalFee / 100).toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-700 font-medium">Montant a recevoir</span>
                <span className="text-green-600 font-bold text-lg">{amountAfterFees.toLocaleString()} {currency}</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={withdrawMutation.isPending || !amount || !selectedWallet || !hasActiveProduct}
          className="w-full py-4 bg-amber-100 border-2 border-amber-400 text-amber-700 font-semibold rounded-full disabled:opacity-50"
          data-testid="button-submit-withdrawal"
        >
          {withdrawMutation.isPending ? "Envoi en cours..." : "Retirer de l'argent"}
        </button>

        <div className="bg-white rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-800">Conseils</h3>
          <p className="text-sm text-gray-600">
            1. Les retraits sont disponibles de 9h00 a 18h00.
          </p>
          <p className="text-sm text-gray-600">
            2. Le montant minimum par retrait est de {minWithdrawal} {currency}, avec des frais de {withdrawalFee}%.
          </p>
          <p className="text-sm text-gray-600">
            3. Les fonds seront credites sur votre compte dans un delai de 1h a 24h apres la demande de retrait.
          </p>
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
                  selectedWallet?.id === wallet.id ? "border-amber-500 bg-amber-50" : "border-gray-200"
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
                {paymentChannels.map((channel) => (
                  <option key={channel.id} value={channel.name}>
                    {channel.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddWallet}
              disabled={addWalletMutation.isPending}
              className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg disabled:opacity-50"
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
