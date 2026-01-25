import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "wouter";
import { getCountryByCode } from "@/lib/countries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WithdrawalWallet {
  id: number;
  userId: number;
  name: string;
  phone: string;
  paymentMethod: string;
  isDefault: boolean;
}

export default function WithdrawalPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number | "">("");
  const [selectedWallet, setSelectedWallet] = useState<WithdrawalWallet | null>(null);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [showAddWalletDialog, setShowAddWalletDialog] = useState(false);
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletPhone, setNewWalletPhone] = useState("");
  const [newWalletMethod, setNewWalletMethod] = useState("");

  const countryInfo = user ? getCountryByCode(user.country) : null;
  const currency = countryInfo?.currency || "FCFA";
  const minWithdrawal = 1200;
  const withdrawalFee = 15;

  const { data: wallets = [] } = useQuery<WithdrawalWallet[]>({
    queryKey: ["/api/withdrawal-wallets"],
  });

  const { data: paymentChannels = [] } = useQuery<{ id: number; name: string; type: string }[]>({
    queryKey: ["/api/payment-channels", user?.country],
    queryFn: async () => {
      const res = await fetch(`/api/payment-channels?country=${user?.country}`);
      return res.json();
    },
    enabled: !!user?.country,
  });

  const addWalletMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string; paymentMethod: string }) => {
      const res = await apiRequest("POST", "/api/withdrawal-wallets", data);
      return res.json();
    },
    onSuccess: (newWallet) => {
      toast({ title: "Succes", description: "Portefeuille ajoute avec succes" });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawal-wallets"] });
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
      name: newWalletName,
      phone: newWalletPhone,
      paymentMethod: newWalletMethod,
    });
  };

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
            <button className="mt-2 px-4 py-1 bg-amber-500 text-white text-sm font-medium rounded-full">
              Enregistrement
            </button>
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
              <span className="text-gray-900 font-medium">{selectedWallet.name} - {selectedWallet.phone}</span>
            ) : (
              "Selectionnez votre portefeuille"
            )}
          </span>
          <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
        </button>

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
          <div className="border-t mt-3 pt-3" />
        </div>

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

        <button
          onClick={handleSubmit}
          disabled={withdrawMutation.isPending || !amount || !selectedWallet}
          className="w-full py-4 bg-amber-100 border-2 border-amber-400 text-amber-700 font-semibold rounded-full disabled:opacity-50"
          data-testid="button-submit-withdrawal"
        >
          {withdrawMutation.isPending ? "Envoi en cours..." : "Retirer de l'argent"}
        </button>
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
                <p className="font-medium">{wallet.name}</p>
                <p className="text-sm text-gray-500">{wallet.phone} - {wallet.paymentMethod}</p>
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
