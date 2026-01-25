import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { getCountryByCode, COUNTRIES } from "@/lib/countries";

const PRESET_AMOUNTS = [3000, 5000, 10000, 15000, 25000, 50000, 100000, 250000, 500000];

const PAYMENT_METHODS_BY_COUNTRY: Record<string, string[]> = {
  CM: ["Orange Money", "MTN Mobile Money"],
  BF: ["Orange Money", "Moov Money"],
  TG: ["TMoney", "Moov Money", "Mixx by Yas"],
  BJ: ["Celtis", "Moov Money", "MTN Mobile Money", "Momo"],
  CI: ["Wave", "MTN Mobile Money", "Orange Money", "Moov Money"],
  CG: ["MTN Mobile Money", "Airtel Money"],
};

interface PaymentChannel {
  id: number;
  name: string;
  redirectUrl: string;
  isActive: boolean;
}

export default function DepositPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number | "">("");
  const [selectedCountry, setSelectedCountry] = useState(user?.country || "");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(null);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const countryInfo = user ? getCountryByCode(user.country) : null;
  const currency = countryInfo?.currency || "FCFA";
  const minDeposit = 3000;

  const paymentMethods = selectedCountry ? PAYMENT_METHODS_BY_COUNTRY[selectedCountry] || [] : [];

  const { data: paymentChannels = [] } = useQuery<PaymentChannel[]>({
    queryKey: ["/api/payment-channels"],
    queryFn: async () => {
      const res = await fetch("/api/payment-channels");
      return res.json();
    },
  });

  const depositMutation = useMutation({
    mutationFn: async (data: { amount: number; paymentMethod: string; accountName: string; accountNumber: string; country: string; paymentChannelId: number }) => {
      const res = await apiRequest("POST", "/api/deposits", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Demande envoyee",
        description: "Redirection vers le paiement...",
      });
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
      
      if (selectedChannel?.redirectUrl) {
        window.open(selectedChannel.redirectUrl, "_blank");
      }
      
      setAmount("");
      setSelectedPaymentMethod("");
      setSelectedChannel(null);
      setAccountName("");
      setAccountNumber("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePresetClick = (presetAmount: number) => {
    setAmount(presetAmount);
  };

  const handleSubmit = () => {
    if (!amount || amount < minDeposit) {
      toast({
        title: "Montant invalide",
        description: `Le montant minimum est de ${minDeposit} ${currency}`,
        variant: "destructive",
      });
      return;
    }
    if (!selectedCountry) {
      toast({
        title: "Pays requis",
        description: "Veuillez selectionner votre pays",
        variant: "destructive",
      });
      return;
    }
    if (!selectedPaymentMethod) {
      toast({
        title: "Moyen de paiement requis",
        description: "Veuillez selectionner votre moyen de paiement",
        variant: "destructive",
      });
      return;
    }
    if (!accountName) {
      toast({
        title: "Nom requis",
        description: "Veuillez entrer le nom du titulaire du compte",
        variant: "destructive",
      });
      return;
    }
    if (!accountNumber) {
      toast({
        title: "Numero requis",
        description: "Veuillez entrer votre numero de telephone",
        variant: "destructive",
      });
      return;
    }
    if (!selectedChannel) {
      toast({
        title: "Canal requis",
        description: "Veuillez selectionner un canal de recharge",
        variant: "destructive",
      });
      return;
    }
    depositMutation.mutate({
      amount: amount as number,
      paymentMethod: selectedPaymentMethod,
      accountName,
      accountNumber,
      country: selectedCountry,
      paymentChannelId: selectedChannel.id,
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
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-8">Recharger</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Actifs totaux({currency})</p>
            <p className="text-3xl font-bold text-gray-900">{parseFloat(user?.balance || "0").toLocaleString()}</p>
          </div>
          <Link href="/deposits-history">
            <button className="flex items-center gap-1 px-3 py-1 border rounded-full text-sm text-gray-600" data-testid="button-facture">
              Facture
              <span className="text-amber-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {PRESET_AMOUNTS.map((presetAmount) => (
            <button
              key={presetAmount}
              onClick={() => handlePresetClick(presetAmount)}
              className={`py-3 px-2 rounded-lg border-2 text-center font-medium transition-colors ${
                amount === presetAmount
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-gray-800 hover:border-gray-400"
              }`}
              data-testid={`button-preset-${presetAmount}`}
            >
              {presetAmount.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg border p-4">
          <label className="block text-sm text-gray-500 mb-2">Montant de recharge</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            placeholder="Entrez le montant de recharge"
            className="w-full text-lg outline-none"
            data-testid="input-deposit-amount"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
          <div className="grid grid-cols-2 gap-2">
            {COUNTRIES.map((country: { code: string; name: string }) => (
              <button
                key={country.code}
                onClick={() => {
                  setSelectedCountry(country.code);
                  setSelectedPaymentMethod("");
                }}
                className={`p-3 rounded-lg border text-center font-medium transition-colors ${
                  selectedCountry === country.code
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-gray-200 bg-white text-gray-700"
                }`}
                data-testid={`button-country-${country.code}`}
              >
                {country.name}
              </button>
            ))}
          </div>
        </div>

        {selectedCountry && paymentMethods.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Moyen de paiement</label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  onClick={() => setSelectedPaymentMethod(method)}
                  className={`p-3 rounded-lg border text-center font-medium transition-colors ${
                    selectedPaymentMethod === method
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                  data-testid={`button-method-${method}`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border p-4">
          <label className="block text-sm text-gray-500 mb-2">Nom du titulaire du compte</label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Ex: Jean Dupont"
            className="w-full text-lg outline-none"
            data-testid="input-account-name"
          />
        </div>

        <div className="bg-white rounded-lg border p-4">
          <label className="block text-sm text-gray-500 mb-2">Numero de telephone ({selectedPaymentMethod || "Mobile Money"})</label>
          <input
            type="tel"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Ex: 99123456"
            className="w-full text-lg outline-none"
            data-testid="input-account-number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Canal de recharge</label>
          <div className="grid grid-cols-2 gap-2">
            {paymentChannels.filter(c => c.isActive).map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`p-3 rounded-lg border text-center font-medium transition-colors ${
                  selectedChannel?.id === channel.id
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-700"
                }`}
                data-testid={`button-channel-${channel.id}`}
              >
                {channel.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={depositMutation.isPending || !amount || !selectedPaymentMethod || !accountName || !accountNumber || !selectedChannel}
          className="w-full py-4 bg-gray-900 text-white font-semibold rounded-lg disabled:opacity-50"
          data-testid="button-submit-deposit"
        >
          {depositMutation.isPending ? "Envoi en cours..." : "Recharger"}
        </button>

        <div className="bg-white rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Conseils de recharge</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-bold">1. Montant minimum de depot : {currency}{minDeposit}.</span> A chaque depot, 
            vous devez saisir le mode de paiement fourni par la plateforme pour recevoir les informations 
            relatives a votre commande, et effectuer le depot et le paiement conformement au montant demande ; 
            dans le cas contraire, le montant de la commande ne sera pas pris en compte et ne pourra pas etre 
            credite sur votre compte.
          </p>
        </div>
      </div>
    </div>
  );
}
