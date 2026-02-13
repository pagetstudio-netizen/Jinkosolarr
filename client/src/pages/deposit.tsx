import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, ChevronRight, ChevronDown, X, Check, MapPin, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { getCountryByCode, COUNTRIES } from "@/lib/countries";

const PRESET_AMOUNTS = [3000, 5000, 10000, 20000, 50000, 100000, 200000, 300000, 800000];

const COUNTRY_FLAGS: Record<string, string> = {
  CM: "\u{1F1E8}\u{1F1F2}",
  BF: "\u{1F1E7}\u{1F1EB}",
  TG: "\u{1F1F9}\u{1F1EC}",
  BJ: "\u{1F1E7}\u{1F1EF}",
  CI: "\u{1F1E8}\u{1F1EE}",
  CG: "\u{1F1E8}\u{1F1EC}",
  CD: "\u{1F1E8}\u{1F1E9}",
};

interface PaymentChannel {
  id: number;
  name: string;
  redirectUrl: string;
  isActive: boolean;
}

export default function DepositPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number | "">("");
  const [selectedCountry, setSelectedCountry] = useState(user?.country || "");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(null);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [showCountrySheet, setShowCountrySheet] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);

  const countryInfo = user ? getCountryByCode(user.country) : null;
  const currency = countryInfo?.currency || "FCFA";
  const minDeposit = 3000;

  const { data: paymentChannels = [] } = useQuery<PaymentChannel[]>({
    queryKey: ["/api/payment-channels"],
  });

  const activeChannels = paymentChannels.filter(c => c.isActive);

  const getPaymentMethodsForCountry = (countryCode: string): string[] => {
    const countryMethods: Record<string, string[]> = {
      CM: ["Orange Money", "MTN"],
      BF: ["Orange Money", "Moov Money"],
      TG: ["Moov Money", "T-Money"],
      BJ: ["MTN", "Moov Money"],
      CI: ["Wave", "MTN", "Orange Money", "Moov Money"],
      CG: ["MTN"],
      CD: ["Vodacom", "Airtel Money", "Orange Money"],
    };
    return countryMethods[countryCode] || [];
  };

  const paymentMethods = selectedCountry ? getPaymentMethodsForCountry(selectedCountry) : [];

  const depositMutation = useMutation({
    mutationFn: async (data: {
      amount: number;
      paymentMethod: string;
      accountName: string;
      accountNumber: string;
      country: string;
      paymentChannelId: number;
      useSoleaspay: boolean;
      useInpay: boolean;
    }) => {
      const res = await apiRequest("POST", "/api/deposits", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Demande envoyee",
        description: "Votre demande de depot est en attente de validation",
      });
      if (selectedChannel?.redirectUrl) {
        window.open(selectedChannel.redirectUrl, "_blank");
      }
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setAmount("");
    setSelectedPaymentMethod("");
    setSelectedChannel(null);
    setAccountName("");
    setAccountNumber("");
  };

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
    if (!selectedChannel) {
      toast({
        title: "Canal requis",
        description: "Veuillez selectionner un canal de recharge",
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

    depositMutation.mutate({
      amount: amount as number,
      paymentMethod: selectedPaymentMethod,
      accountName,
      accountNumber,
      country: selectedCountry,
      paymentChannelId: selectedChannel.id,
      useSoleaspay: false,
      useInpay: false,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#64B5F6] to-white">
        <Link href="/account">
          <button className="p-2" data-testid="button-back">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">Economiser</h1>
        <Link href="/history">
          <button className="p-2" data-testid="button-history">
            <Clock className="w-5 h-5 text-[#2196F3]" />
          </button>
        </Link>
      </header>

      <div className="p-4 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#2196F3] rounded-full" />
            <h2 className="font-bold text-gray-800 text-sm">
              Montant du depot le plus bas ( {currency} {minDeposit.toLocaleString()} )
            </h2>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((presetAmount) => (
                <button
                  key={presetAmount}
                  onClick={() => handlePresetClick(presetAmount)}
                  className={`py-2.5 px-2 rounded-full border text-center text-sm font-medium transition-colors ${
                    amount === presetAmount
                      ? "border-[#2196F3] bg-[#e3f2fd] text-[#2196F3]"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                  data-testid={`button-preset-${presetAmount}`}
                >
                  {presetAmount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-full px-4 py-3 flex items-center gap-3">
          <span className="font-bold text-gray-800 text-sm">{currency}</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            placeholder="Veuillez entrer le montant de la recharge"
            className="flex-1 text-sm outline-none text-gray-500 bg-transparent"
            data-testid="input-deposit-amount"
          />
        </div>

        <button
          onClick={() => setShowCountrySheet(true)}
          className="w-full border border-gray-200 rounded-full px-4 py-3 flex items-center justify-between"
          data-testid="button-open-country"
        >
          <div className="flex items-center gap-3">
            {selectedCountry ? (
              <span className="text-xl">{COUNTRY_FLAGS[selectedCountry] || ""}</span>
            ) : (
              <MapPin className="w-4 h-4 text-[#2196F3]" />
            )}
            <span className={`text-sm ${selectedCountry ? "text-gray-800 font-medium" : "text-gray-500"}`}>
              {selectedCountry
                ? COUNTRIES.find((c: { code: string }) => c.code === selectedCountry)?.name || "Pays"
                : "Selectionnez votre pays"}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {selectedCountry && paymentMethods.length > 0 && (
          <button
            onClick={() => setShowPaymentSheet(true)}
            className="w-full border border-gray-200 rounded-full px-4 py-3 flex items-center justify-between"
            data-testid="button-open-payment"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-[#2196F3]" />
              <span className={`text-sm ${selectedPaymentMethod ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                {selectedPaymentMethod || "Selectionnez le mode de paiement"}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        )}

        <div className="border border-gray-200 rounded-full px-4 py-3 flex items-center gap-3">
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Nom du titulaire du compte"
            className="flex-1 text-sm outline-none text-gray-500 bg-transparent"
            data-testid="input-account-name"
          />
        </div>

        <div className="border border-gray-200 rounded-full px-4 py-3 flex items-center gap-3">
          <input
            type="tel"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder={`Numero ${selectedPaymentMethod || "Mobile Money"}`}
            className="flex-1 text-sm outline-none text-gray-500 bg-transparent"
            data-testid="input-account-number"
          />
        </div>

        {activeChannels.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-[#2196F3] rounded-full" />
              <h2 className="font-bold text-gray-800 text-sm">Canal de recharge</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`px-4 py-2.5 rounded-full border-2 text-sm font-semibold transition-colors ${
                    selectedChannel?.id === channel.id
                      ? "border-[#2196F3] bg-[#2196F3] text-white shadow-sm"
                      : "border-gray-300 bg-white text-gray-800"
                  }`}
                  data-testid={`button-channel-${channel.id}`}
                >
                  {channel.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={depositMutation.isPending || !amount || !selectedPaymentMethod || !accountName || !accountNumber || !selectedChannel}
          className="w-full py-3.5 bg-[#2196F3] text-white font-bold rounded-full disabled:opacity-40 text-base shadow-md shadow-blue-200"
          data-testid="button-submit-deposit"
        >
          {depositMutation.isPending ? "Envoi en cours..." : "Depot immediat"}
        </button>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#2196F3] rounded-full" />
            <h2 className="font-bold text-gray-800 text-sm">Description du depot</h2>
          </div>
          <div className="space-y-2 text-sm text-gray-600 leading-relaxed">
            <p className="font-medium text-gray-700">*Instructions de depot:</p>
            <p>1. Le montant minimum de depot est de {minDeposit.toLocaleString()} {currency}. Les virements inferieurs a {minDeposit.toLocaleString()} {currency} ne pourront pas etre credites sur le compte.</p>
            <p>2. Apres un depot reussi, le montant sera credite sur votre compte dans un delai de 1 minute a 30 minutes maximum.</p>
            <p>3. Effectuez votre premiere recharge et achetez des produits ELF pour activer la fonction de retrait.</p>
          </div>
        </div>
      </div>

      {showCountrySheet && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCountrySheet(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl animate-in slide-in-from-bottom duration-300 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">Selectionnez votre pays</h3>
              <button
                onClick={() => setShowCountrySheet(false)}
                className="p-1"
                data-testid="button-close-country-sheet"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {COUNTRIES.map((country: { code: string; name: string }) => (
                <button
                  key={country.code}
                  onClick={() => {
                    setSelectedCountry(country.code);
                    setSelectedPaymentMethod("");
                    setShowCountrySheet(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors ${
                    selectedCountry === country.code
                      ? "bg-[#2196F3] text-white"
                      : "bg-gray-50 text-gray-700"
                  }`}
                  data-testid={`button-country-${country.code}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{COUNTRY_FLAGS[country.code] || ""}</span>
                    <span className="text-sm font-medium">{country.name}</span>
                  </div>
                  {selectedCountry === country.code && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPaymentSheet && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowPaymentSheet(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl animate-in slide-in-from-bottom duration-300 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">Mode de paiement</h3>
              <button
                onClick={() => setShowPaymentSheet(false)}
                className="p-1"
                data-testid="button-close-payment-sheet"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  onClick={() => {
                    setSelectedPaymentMethod(method);
                    setShowPaymentSheet(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors ${
                    selectedPaymentMethod === method
                      ? "bg-[#2196F3] text-white"
                      : "bg-gray-50 text-gray-700"
                  }`}
                  data-testid={`button-method-${method}`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm font-medium">{method}</span>
                  </div>
                  {selectedPaymentMethod === method && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
