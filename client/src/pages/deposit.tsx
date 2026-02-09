import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
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
    inpayBankCodes[selectedCountry] &&
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
          {paymentStatus === "processing" && (
            <>
              <Loader2 className="w-16 h-16 text-[#2196F3] animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Traitement en cours</h3>
              <p className="text-gray-600 text-sm">Veuillez patienter...</p>
            </>
          )}
          {paymentStatus === "pending" && (
            <>
              <Clock className="w-16 h-16 text-[#2196F3] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">En attente de validation</h3>
              <p className="text-gray-600 text-sm mb-4">
                Validez le paiement sur votre telephone mobile
              </p>
              <div className="flex items-center justify-center gap-2 text-[#2196F3]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Verification automatique...</span>
              </div>
            </>
          )}
          {paymentStatus === "approved" && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-green-700">Paiement reussi</h3>
              <p className="text-gray-600 text-sm mb-4">
                Votre compte a ete credite de {amount?.toLocaleString()} {currency}
              </p>
              <button
                onClick={resetForm}
                className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg"
                data-testid="button-close-success"
              >
                Fermer
              </button>
            </>
          )}
          {paymentStatus === "rejected" && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-red-700">Paiement echoue</h3>
              <p className="text-gray-600 text-sm mb-4">
                Le paiement a ete refuse ou annule
              </p>
              <button
                onClick={resetForm}
                className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg"
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
      <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#e0f7fa] to-white">
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
                className={`p-2.5 rounded-lg border text-center text-sm font-medium transition-colors ${
                  selectedCountry === country.code
                    ? "border-[#2196F3] bg-[#e3f2fd] text-[#2196F3]"
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
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-[#2196F3] rounded-full" />
              <h2 className="font-bold text-gray-800 text-sm">Canal de depot</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  onClick={() => setSelectedPaymentMethod(method)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    selectedPaymentMethod === method
                      ? "border-[#2196F3] bg-[#e3f2fd] text-[#2196F3]"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                  data-testid={`button-method-${method}`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
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
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    selectedChannel?.id === channel.id
                      ? "border-[#2196F3] bg-[#e3f2fd] text-[#2196F3]"
                      : "border-gray-300 bg-white text-gray-700"
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
          className="w-full py-3.5 bg-[#78c5d6] text-white font-semibold rounded-full disabled:opacity-50 text-base"
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
            <p>2. Selectionnez votre pays et votre moyen de paiement, puis renseignez vos informations pour effectuer le depot.</p>
            <p>3. Apres un depot reussi, le montant sera credite sur votre compte dans un delai de 1 a 5 minutes.</p>
            <p>4. Effectuez votre premiere recharge et achetez des produits ELF pour activer la fonction de retrait.</p>
          </div>
        </div>
      </div>

      {renderPaymentStatus()}
    </div>
  );
}
