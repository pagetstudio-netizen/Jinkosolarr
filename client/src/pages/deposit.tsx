import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock, ChevronRight, ChevronDown, X, Check, MapPin, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { getCountryByCode, COUNTRIES } from "@/lib/countries";

const PRESET_AMOUNTS = [3000, 5000, 10000, 20000, 50000, 100000, 200000, 300000, 800000];

interface PaymentChannel {
  id: number;
  name: string;
  redirectUrl: string;
  isActive: boolean;
}

interface SoleaspayServices {
  enabled: boolean;
  services: Record<string, Record<string, number>>;
}

interface InpayServices {
  enabled: boolean;
  bankCodes: Record<string, Record<string, string>>;
  configuredCountries: string[];
}

interface DepositResponse {
  deposit: {
    id: number;
    status: string;
    soleaspayReference?: string;
    soleaspayOrderId?: string;
    inpayOutTradeNo?: string;
    inpayOrderNumber?: string;
  };
  soleaspay?: boolean;
  inpay?: boolean;
  paymentUrl?: string;
  orderNumber?: string;
  reference?: string;
  status?: string;
  message?: string;
}

type PaymentStatus = "idle" | "processing" | "pending" | "approved" | "rejected";

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
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [currentDepositId, setCurrentDepositId] = useState<number | null>(null);
  const [showCountrySheet, setShowCountrySheet] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const countryInfo = user ? getCountryByCode(user.country) : null;
  const currency = countryInfo?.currency || "FCFA";
  const minDeposit = 3000;

  const { data: soleaspayData } = useQuery<SoleaspayServices>({
    queryKey: ["/api/soleaspay/services"],
  });

  const { data: inpayData } = useQuery<InpayServices>({
    queryKey: ["/api/inpay/services"],
  });

  const { data: paymentChannels = [] } = useQuery<PaymentChannel[]>({
    queryKey: ["/api/payment-channels"],
  });

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const soleaspayEnabled = soleaspayData?.enabled ?? false;
  const soleaspayServices = soleaspayData?.services ?? {};
  const inpayEnabled = inpayData?.enabled ?? false;
  const inpayBankCodes = inpayData?.bankCodes ?? {};
  const inpayConfiguredCountries = inpayData?.configuredCountries ?? [];
  const moneyFusionLink = settings?.congoPaymentLink || "https://my.moneyfusion.net/697e3d01869cdbb310f0d3e0";
  const moneyFusionCountries = ["CG", "BF"];
  const isMoneyFusionUser = user?.country ? moneyFusionCountries.includes(user.country) : false;

  const getPaymentMethodsForCountry = (countryCode: string): string[] => {
    if (soleaspayEnabled && soleaspayServices[countryCode]) {
      return Object.keys(soleaspayServices[countryCode]);
    }
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
  const isSoleaspayAvailable = Boolean(
    soleaspayEnabled && 
    selectedCountry && 
    !moneyFusionCountries.includes(selectedCountry) &&
    selectedPaymentMethod && 
    soleaspayServices[selectedCountry]?.[selectedPaymentMethod] !== undefined
  );

  const isInpayAvailable = Boolean(
    inpayEnabled &&
    selectedCountry &&
    selectedPaymentMethod &&
    inpayBankCodes[selectedCountry] &&
    inpayBankCodes[selectedCountry][selectedPaymentMethod] &&
    inpayConfiguredCountries.includes(selectedCountry)
  );

  const isAutoPaymentAvailable = isInpayAvailable || isSoleaspayAvailable;

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const startPolling = (depositId: number) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/deposits/${depositId}/verify`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data.status === "approved") {
          setPaymentStatus("approved");
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          refreshUser();
          queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
          toast({
            title: "Paiement reussi",
            description: "Votre compte a ete credite",
          });
        } else if (data.status === "rejected") {
          setPaymentStatus("rejected");
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          toast({
            title: "Paiement echoue",
            description: "Le paiement a ete refuse",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000);
  };

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
      return res.json() as Promise<DepositResponse>;
    },
    onSuccess: (data) => {
      if (data.inpay && data.paymentUrl) {
        setCurrentDepositId(data.deposit.id);
        setPaymentStatus("pending");
        startPolling(data.deposit.id);
        window.open(data.paymentUrl, "_blank");
        toast({
          title: "Paiement initie",
          description: "Completez le paiement dans la page ouverte",
        });
      } else if (data.soleaspay) {
        setCurrentDepositId(data.deposit.id);
        setPaymentStatus("pending");
        startPolling(data.deposit.id);
        toast({
          title: "Paiement initie",
          description: "Validez le paiement sur votre telephone",
        });
      } else {
        toast({
          title: "Demande envoyee",
          description: "Votre demande de depot est en attente de validation",
        });
        if (isMoneyFusionUser && moneyFusionLink) {
          window.open(moneyFusionLink, "_blank");
        } else if (selectedChannel?.redirectUrl) {
          window.open(selectedChannel.redirectUrl, "_blank");
        }
        resetForm();
      }
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
    },
    onError: (error: Error) => {
      setPaymentStatus("idle");
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
    setPaymentStatus("idle");
    setCurrentDepositId(null);
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

    const channelId = selectedChannel?.id || paymentChannels.find(c => c.isActive)?.id || 0;

    setPaymentStatus("processing");
    depositMutation.mutate({
      amount: amount as number,
      paymentMethod: selectedPaymentMethod,
      accountName,
      accountNumber,
      country: selectedCountry,
      paymentChannelId: channelId,
      useSoleaspay: isSoleaspayAvailable,
      useInpay: isInpayAvailable,
    });
  };

  const renderPaymentStatus = () => {
    if (paymentStatus === "idle") return null;

    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300 flex flex-col items-center px-6 pt-3 pb-8">
          <div className="w-10 h-1 bg-gray-300 rounded-full mb-6" />

          {paymentStatus === "processing" && (
            <>
              <div className="w-20 h-20 rounded-full bg-[#e3f2fd] flex items-center justify-center mb-5">
                <Loader2 className="w-10 h-10 text-[#2196F3] animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Traitement en cours</h3>
              <p className="text-gray-500 text-sm">Veuillez patienter...</p>
            </>
          )}

          {paymentStatus === "pending" && (
            <>
              <div className="w-20 h-20 rounded-full bg-[#e3f2fd] flex items-center justify-center mb-5">
                <Clock className="w-10 h-10 text-[#2196F3]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Validation requise</h3>
              <p className="text-gray-500 text-sm mb-5">Confirmez le paiement depuis votre telephone</p>
              <div className="w-full bg-[#e3f2fd] rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#2196F3] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">En attente de confirmation</p>
                    <p className="text-sm text-gray-600 mt-1">Un message a ete envoye sur votre numero. Composez votre code PIN pour valider.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#2196F3]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Verification en cours...</span>
              </div>
            </>
          )}

          {paymentStatus === "approved" && (
            <>
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Paiement reussi</h3>
              <p className="text-gray-500 text-sm mb-5">
                Votre compte a ete credite de {amount?.toLocaleString()} {currency}
              </p>
              <button
                onClick={resetForm}
                className="w-full py-3.5 bg-green-500 text-white font-bold rounded-full text-base"
                data-testid="button-close-success"
              >
                Fermer
              </button>
            </>
          )}

          {paymentStatus === "rejected" && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-5">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Paiement echoue</h3>
              <p className="text-gray-500 text-sm mb-5">
                Le paiement a ete refuse ou annule
              </p>
              <button
                onClick={resetForm}
                className="w-full py-3.5 bg-red-500 text-white font-bold rounded-full text-base"
                data-testid="button-close-error"
              >
                Reessayer
              </button>
            </>
          )}
        </div>
      </div>
    );
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
        <Link href="/deposits-history">
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
            <MapPin className="w-4 h-4 text-[#2196F3]" />
            <span className={`text-sm ${selectedCountry ? "text-gray-800 font-medium" : "text-gray-500"}`}>
              {selectedCountry
                ? COUNTRIES.find((c: { code: string }) => c.code === selectedCountry)?.name || "Pays"
                : "Selectionnez votre pays"}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
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

        {!isAutoPaymentAvailable && paymentChannels.filter(c => c.isActive).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-[#2196F3] rounded-full" />
              <h2 className="font-bold text-gray-800 text-sm">Canal de recharge</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {paymentChannels.filter(c => c.isActive).map((channel) => (
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
          disabled={depositMutation.isPending || paymentStatus !== "idle" || !amount || !selectedPaymentMethod || !accountName || !accountNumber}
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
            <div className="p-4 space-y-1">
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
                      ? "bg-[#e3f2fd] text-[#2196F3]"
                      : "text-gray-700"
                  }`}
                  data-testid={`button-country-${country.code}`}
                >
                  <span className="text-sm font-medium">{country.name}</span>
                  {selectedCountry === country.code && (
                    <Check className="w-5 h-5 text-[#2196F3]" />
                  )}
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
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl animate-in slide-in-from-bottom duration-300 max-h-[60vh] flex flex-col">
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
            <div className="overflow-y-auto p-4 space-y-1">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  onClick={() => {
                    setSelectedPaymentMethod(method);
                    setShowPaymentSheet(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors ${
                    selectedPaymentMethod === method
                      ? "bg-[#e3f2fd] text-[#2196F3]"
                      : "text-gray-700"
                  }`}
                  data-testid={`button-method-${method}`}
                >
                  <span className="text-sm font-medium">{method}</span>
                  {selectedPaymentMethod === method && (
                    <Check className="w-5 h-5 text-[#2196F3]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {renderPaymentStatus()}
    </div>
  );
}
