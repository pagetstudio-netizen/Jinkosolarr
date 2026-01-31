import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Link } from "wouter";
import { getCountryByCode, COUNTRIES } from "@/lib/countries";

const PRESET_AMOUNTS = [3000, 5000, 15000, 25000, 50000, 100000];

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

interface DepositResponse {
  deposit: {
    id: number;
    status: string;
    soleaspayReference?: string;
    soleaspayOrderId?: string;
  };
  soleaspay: boolean;
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

  const { data: paymentChannels = [] } = useQuery<PaymentChannel[]>({
    queryKey: ["/api/payment-channels"],
  });

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const soleaspayEnabled = soleaspayData?.enabled ?? false;
  const soleaspayServices = soleaspayData?.services ?? {};
  const congoPaymentLink = settings?.congoPaymentLink || "https://my.moneyfusion.net/697e3d01869cdbb310f0d3e0";
  const isCongoUser = user?.country === "CG";

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
      CG: ["MTN", "Airtel Money"],
      CD: ["Vodacom", "Airtel Money", "Orange Money"],
    };
    return countryMethods[countryCode] || [];
  };

  const paymentMethods = selectedCountry ? getPaymentMethodsForCountry(selectedCountry) : [];
  const isSoleaspayAvailable = Boolean(
    soleaspayEnabled && 
    selectedCountry && 
    selectedPaymentMethod && 
    soleaspayServices[selectedCountry]?.[selectedPaymentMethod] !== undefined
  );

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
    }) => {
      const res = await apiRequest("POST", "/api/deposits", data);
      return res.json() as Promise<DepositResponse>;
    },
    onSuccess: (data) => {
      if (data.soleaspay) {
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
        if (selectedChannel?.redirectUrl) {
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
    });
  };

  const renderPaymentStatus = () => {
    if (paymentStatus === "idle") return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
          {paymentStatus === "processing" && (
            <>
              <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Traitement en cours</h3>
              <p className="text-gray-600 text-sm">Veuillez patienter...</p>
            </>
          )}
          {paymentStatus === "pending" && (
            <>
              <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">En attente de validation</h3>
              <p className="text-gray-600 text-sm mb-4">
                Validez le paiement sur votre telephone mobile
              </p>
              <div className="flex items-center justify-center gap-2 text-amber-600">
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

        {soleaspayEnabled && !isCongoUser && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700 font-medium">Paiement automatique active</p>
            <p className="text-xs text-green-600 mt-1">Le paiement sera traite instantanement</p>
          </div>
        )}

        {isCongoUser && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <p className="text-sm text-amber-800 font-medium">Congo Brazzaville - Paiement via MoneyFusion</p>
            <p className="text-xs text-amber-700">
              Les depots pour le Congo Brazzaville sont traites via MoneyFusion. 
              Cliquez sur le bouton ci-dessous pour effectuer votre paiement.
            </p>
            <a
              href={congoPaymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-amber-500 text-white font-semibold rounded-lg text-center"
              data-testid="link-congo-payment"
            >
              Payer via MoneyFusion
            </a>
            <p className="text-xs text-amber-600 text-center">
              Apres le paiement, creez un depot manuel et l'administrateur validera votre paiement.
            </p>
          </div>
        )}

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

        {!isSoleaspayAvailable && paymentChannels.filter(c => c.isActive).length > 0 && (
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
        )}

        <button
          onClick={handleSubmit}
          disabled={depositMutation.isPending || paymentStatus !== "idle" || !amount || !selectedPaymentMethod || !accountName || !accountNumber}
          className="w-full py-4 bg-gray-900 text-white font-semibold rounded-lg disabled:opacity-50"
          data-testid="button-submit-deposit"
        >
          {depositMutation.isPending ? "Envoi en cours..." : isSoleaspayAvailable ? "Payer maintenant" : "Recharger"}
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

      {renderPaymentStatus()}
    </div>
  );
}
