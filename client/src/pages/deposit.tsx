import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronDown, Loader2, CheckCircle, XCircle, Clock, Wallet } from "lucide-react";
import { Link } from "wouter";
import { COUNTRIES, getCountryByCode } from "@/lib/countries";

const MIN_DEPOSIT = 3500;
const PRESET_AMOUNTS = [3500, 5000, 10000, 20000, 50000, 100000, 250000, 500000];

const COUNTRY_FLAGS: Record<string, string> = {
  CM: "🇨🇲", BF: "🇧🇫", TG: "🇹🇬", BJ: "🇧🇯", CI: "🇨🇮", CG: "🇨🇬",
};

type PaymentStatus = "idle" | "processing" | "pending" | "approved" | "rejected";

interface DepositResponse {
  deposit: { id: number; status: string };
  soleaspay?: boolean;
  omnipay?: boolean;
  paymentUrl?: string;
}

export default function DepositPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState<number | "">("");
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState(user?.country || "");
  const [selectedOperator, setSelectedOperator] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showOperatorPicker, setShowOperatorPicker] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // OTP rules per country + operator
  const isOrangeOperator = selectedOperator.toLowerCase().includes("orange");
  const needsOtp = isOrangeOperator && (selectedCountry === "CI" || selectedCountry === "BF");
  const otpAutoFilled = isOrangeOperator && selectedCountry === "CM"; // Cameroun: no OTP from user
  const showOtpField = needsOtp && !otpAutoFilled;

  const countryInfo = getCountryByCode(selectedCountry || user?.country || "");
  const currency = countryInfo?.currency || "FCFA";
  const balance = parseFloat(user?.balance || "0");
  const operators = countryInfo?.paymentMethods || [];

  // Reset operator and OTP when country changes
  useEffect(() => { setSelectedOperator(""); setOtpCode(""); }, [selectedCountry]);
  // Reset OTP when operator changes
  useEffect(() => { setOtpCode(""); }, [selectedOperator]);

  const { data: paymentChannels = [] } = useQuery<{ id: number; name: string; isActive: boolean; gateway: string | null }[]>({
    queryKey: ["/api/payment-channels"],
  });
  // Only use real (positive-id) channels as fallback for DB record
  const defaultChannelId = paymentChannels.find(c => c.id > 0)?.id ?? null;

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const startPolling = (depositId: number) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/deposits/${depositId}/verify`, { credentials: "include" });
        const data = await res.json();
        if (data.status === "approved") {
          setPaymentStatus("approved");
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          refreshUser();
          queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
        } else if (data.status === "rejected") {
          setPaymentStatus("rejected");
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
        }
      } catch {}
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
      useOmnipay: boolean;
      otpCode?: string;
    }) => {
      const res = await apiRequest("POST", "/api/deposits", data);
      return res.json() as Promise<DepositResponse>;
    },
    onSuccess: (data) => {
      if (data.soleaspay || data.omnipay) {
        setCurrentDepositId(data.deposit.id);
        setPaymentStatus("pending");
        startPolling(data.deposit.id);
        if (data.paymentUrl) window.open(data.paymentUrl, "_blank");
        toast({ title: "Paiement initié", description: "Validez le paiement sur votre téléphone" });
      } else {
        toast({ title: "Demande envoyée", description: "Votre dépôt est en attente de validation" });
        resetForm();
      }
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
    },
    onError: (error: Error) => {
      setPaymentStatus("idle");
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const [currentDepositId, setCurrentDepositId] = useState<number | null>(null);

  const resetForm = () => {
    setAmount("");
    setSelectedChannel(null);
    setSelectedOperator("");
    setAccountName("");
    setAccountNumber("");
    setPaymentStatus("idle");
    setCurrentDepositId(null);
  };

  const handleSubmit = () => {
    if (!amount || amount < MIN_DEPOSIT) {
      toast({ title: "Montant invalide", description: `Le minimum est de ${MIN_DEPOSIT.toLocaleString()} ${currency}`, variant: "destructive" });
      return;
    }
    if (!selectedCountry) {
      toast({ title: "Pays requis", description: "Veuillez sélectionner votre pays", variant: "destructive" });
      return;
    }
    if (!selectedOperator) {
      toast({ title: "Opérateur requis", description: "Veuillez sélectionner votre opérateur", variant: "destructive" });
      return;
    }
    if (!selectedChannel) {
      toast({ title: "Canal requis", description: "Veuillez sélectionner un canal de recharge", variant: "destructive" });
      return;
    }
    if (!accountName.trim()) {
      toast({ title: "Nom requis", description: "Veuillez entrer le nom du titulaire", variant: "destructive" });
      return;
    }
    if (!accountNumber.trim()) {
      toast({ title: "Numéro requis", description: "Veuillez entrer votre numéro de téléphone", variant: "destructive" });
      return;
    }
    if (showOtpField && !otpCode.trim()) {
      toast({ title: "Code OTP requis", description: "Veuillez saisir votre code OTP Orange", variant: "destructive" });
      return;
    }

    setPaymentStatus("processing");
    const chosenChannel = paymentChannels.find(c => c.id === selectedChannel);
    // For virtual gateway channels (id < 0), use first real channel for DB record (or null)
    const channelIdForRecord = selectedChannel && selectedChannel > 0 ? selectedChannel : defaultChannelId;
    depositMutation.mutate({
      amount: amount as number,
      paymentMethod: selectedOperator,
      accountName,
      accountNumber,
      country: selectedCountry,
      paymentChannelId: channelIdForRecord,
      useSoleaspay: chosenChannel?.gateway === "soleaspay",
      useOmnipay: chosenChannel?.gateway === "omnipay",
      otpCode: showOtpField ? otpCode.trim() : undefined,
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-[#c8102e]" />
          </button>
        </Link>
        <h1 className="text-base font-bold text-[#c8102e]">Recharger</h1>
        <Link href="/history">
          <button className="p-1" data-testid="button-history">
            <ChevronLeft className="w-6 h-6 text-[#c8102e] rotate-180" />
          </button>
        </Link>
      </header>

      {/* Balance Banner */}
      <div className="bg-[#c8102e] px-5 py-4 flex items-center gap-4">
        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-white text-2xl font-bold">{currency} {balance.toFixed(2)}</p>
          <p className="text-white/75 text-xs mt-0.5">Solde du compte</p>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* Amount section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#c8102e] rounded-full" />
            <h2 className="font-bold text-gray-800 text-sm">
              Montant de la recharge{" "}
              <span className="text-gray-400 font-normal text-xs">(Minimum {currency} {MIN_DEPOSIT.toLocaleString()})</span>
            </h2>
          </div>

          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset)}
                className={`py-2.5 rounded-lg border text-center text-sm font-medium transition-colors ${
                  amount === preset
                    ? "border-[#c8102e] bg-red-50 text-[#c8102e]"
                    : "border-gray-200 bg-white text-gray-700"
                }`}
                data-testid={`button-preset-${preset}`}
              >
                {preset.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Country picker */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 bg-[#c8102e] rounded-full" />
            <h2 className="font-bold text-gray-800 text-sm">Pays</h2>
          </div>
          <button
            onClick={() => setShowCountryPicker(true)}
            className="w-full border border-gray-200 rounded-full px-4 py-3 flex items-center justify-between bg-white"
            data-testid="button-open-country"
          >
            <span className={`text-sm flex items-center gap-2 ${selectedCountry ? "text-gray-800 font-medium" : "text-gray-400"}`}>
              {selectedCountry ? (
                <>
                  <span>{COUNTRY_FLAGS[selectedCountry] || ""}</span>
                  <span>{COUNTRIES.find(c => c.code === selectedCountry)?.name}</span>
                </>
              ) : "Sélectionnez votre pays"}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Operator picker */}
        {selectedCountry && operators.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 bg-[#c8102e] rounded-full" />
              <h2 className="font-bold text-gray-800 text-sm">Opérateur</h2>
            </div>
            <button
              onClick={() => setShowOperatorPicker(true)}
              className="w-full border border-gray-200 rounded-full px-4 py-3 flex items-center justify-between bg-white"
              data-testid="button-open-operator"
            >
              <span className={`text-sm ${selectedOperator ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                {selectedOperator || "Sélectionnez votre opérateur"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}

        {/* Channel selection */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#c8102e] rounded-full" />
            <h2 className="font-bold text-gray-800 text-sm">Canaux de recharge</h2>
          </div>

          <div className="space-y-2">
            {paymentChannels.map((channel, idx) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                  selectedChannel === channel.id
                    ? "bg-[#c8102e] text-white shadow-md"
                    : idx === 0
                      ? "bg-white border-2 border-[#c8102e] text-[#c8102e]"
                      : "bg-white border-2 border-gray-200 text-gray-700"
                }`}
                data-testid={`button-channel-${channel.id}`}
              >
                Canaux {channel.name}
              </button>
            ))}
            {paymentChannels.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-2">Aucun canal disponible</p>
            )}
          </div>
        </div>

        {/* Amount input */}
        <div className="border border-gray-200 rounded-full px-4 py-3 flex items-center gap-3 bg-white">
          <span className="font-bold text-[#c8102e] text-sm">{currency}</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            placeholder="Veuillez saisir le montant de la recharge"
            className="flex-1 text-sm outline-none text-gray-500 bg-transparent"
            data-testid="input-deposit-amount"
          />
        </div>

        {/* Account name */}
        <div className="border border-gray-200 rounded-full px-4 py-3 flex items-center gap-3 bg-white">
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Nom du titulaire du compte"
            className="flex-1 text-sm outline-none text-gray-500 bg-transparent"
            data-testid="input-account-name"
          />
        </div>

        {/* Phone number */}
        <div className="border border-gray-200 rounded-full px-4 py-3 flex items-center gap-3 bg-white">
          <input
            type="tel"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder={`Numéro ${selectedOperator || "Mobile Money"}`}
            className="flex-1 text-sm outline-none text-gray-500 bg-transparent"
            data-testid="input-account-number"
          />
        </div>

        {/* OTP field — visible only for Orange CI and Orange BF */}
        {showOtpField && (
          <div className="space-y-2">
            {selectedCountry === "BF" && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
                <p className="text-orange-700 text-xs font-semibold mb-1">Comment générer votre code OTP Orange Burkina :</p>
                <p className="text-orange-600 text-xs">Composez <strong>*144*4*6*{amount || "montant"}#</strong> sur votre téléphone, puis entrez le code reçu ci-dessous.</p>
              </div>
            )}
            {selectedCountry === "CI" && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
                <p className="text-orange-700 text-xs font-semibold mb-1">Code OTP Orange Côte d'Ivoire</p>
                <p className="text-orange-600 text-xs">Saisissez le code OTP généré par votre application Orange Money ou reçu par SMS.</p>
              </div>
            )}
            <div className="border border-orange-300 rounded-full px-4 py-3 flex items-center gap-3 bg-white">
              <input
                type="number"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Code OTP Orange"
                className="flex-1 text-sm outline-none text-gray-500 bg-transparent tracking-widest"
                maxLength={8}
                data-testid="input-otp-code"
              />
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={depositMutation.isPending || paymentStatus !== "idle"}
          className="w-full py-4 rounded-full text-white font-bold text-base disabled:opacity-40 shadow-md"
          style={{ background: "linear-gradient(135deg, #c8102e, #a00d25)" }}
          data-testid="button-submit-deposit"
        >
          {depositMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Envoi en cours...
            </span>
          ) : (
            "Rechargez maintenant"
          )}
        </button>

        {/* Instructions */}
        <div className="pt-2 pb-8">
          <p className="font-bold text-[#c8102e] text-sm mb-3">Instructions de recharge</p>
          <div className="space-y-2.5 text-sm text-[#c8102e] leading-relaxed">
            <p>1. Le dépôt minimum est de {MIN_DEPOSIT.toLocaleString()} {currency}.</p>
            <p>2. Assurez-vous que les informations saisies correspondent exactement à votre compte Mobile Money pour éviter tout rejet de paiement.</p>
            <p>3. Une fois votre paiement effectué, le crédit sera automatiquement appliqué à votre compte dans un délai de 1 à 30 minutes.</p>
            <p>4. Si vous n'avez pas reçu vos fonds après un délai anormalement long, veuillez contacter le service client en ligne.</p>
            <p>5. Pour votre sécurité financière, ne transférez jamais de fonds à des inconnus.</p>
            <p>6. Le personnel officiel ne vous demandera jamais votre mot de passe ou informations personnelles.</p>
          </div>
        </div>
      </div>

      {/* Country Picker Sheet */}
      {showCountryPicker && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCountryPicker(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">Sélectionnez votre pays</h3>
              <button onClick={() => setShowCountryPicker(false)} className="text-gray-400 font-bold text-lg">✕</button>
            </div>
            <div className="overflow-y-auto max-h-64">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setSelectedCountry(c.code); setShowCountryPicker(false); }}
                  className={`w-full px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    selectedCountry === c.code ? "bg-red-50" : ""
                  }`}
                  data-testid={`button-country-${c.code}`}
                >
                  <span className="text-2xl">{COUNTRY_FLAGS[c.code] || "🌍"}</span>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${selectedCountry === c.code ? "text-[#c8102e]" : "text-gray-800"}`}>{c.name}</p>
                    <p className="text-xs text-gray-400">{c.currency}</p>
                  </div>
                  {selectedCountry === c.code && <span className="text-[#c8102e] font-bold">✓</span>}
                </button>
              ))}
            </div>
            <div className="h-6" />
          </div>
        </div>
      )}

      {/* Operator Picker Sheet */}
      {showOperatorPicker && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowOperatorPicker(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">Sélectionnez votre opérateur</h3>
              <button onClick={() => setShowOperatorPicker(false)} className="text-gray-400 font-bold text-lg">✕</button>
            </div>
            <div className="overflow-y-auto max-h-64">
              {operators.map((op) => (
                <button
                  key={op}
                  onClick={() => { setSelectedOperator(op); setShowOperatorPicker(false); }}
                  className={`w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    selectedOperator === op ? "bg-red-50" : ""
                  }`}
                  data-testid={`button-operator-${op}`}
                >
                  <span className={`text-sm font-medium ${selectedOperator === op ? "text-[#c8102e]" : "text-gray-800"}`}>{op}</span>
                  {selectedOperator === op && <span className="text-[#c8102e] font-bold">✓</span>}
                </button>
              ))}
            </div>
            <div className="h-6" />
          </div>
        </div>
      )}

      {/* Payment Status Overlay */}
      {paymentStatus !== "idle" && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300 flex flex-col items-center px-6 pt-3 pb-10">
            <div className="w-10 h-1 bg-gray-300 rounded-full mb-6" />

            {paymentStatus === "processing" && (
              <>
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
                  <Loader2 className="w-10 h-10 text-[#c8102e] animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Traitement en cours</h3>
                <p className="text-gray-500 text-sm">Veuillez patienter...</p>
              </>
            )}

            {paymentStatus === "pending" && (
              <>
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
                  <Clock className="w-10 h-10 text-[#c8102e]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Validation requise</h3>
                <p className="text-gray-500 text-sm mb-5">Confirmez le paiement depuis votre téléphone</p>
                <div className="w-full bg-red-50 rounded-xl p-4 mb-5">
                  <p className="text-sm text-[#c8102e] text-center">
                    Un message a été envoyé sur votre numéro. Composez votre code PIN pour valider.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[#c8102e]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Vérification en cours...</span>
                </div>
              </>
            )}

            {paymentStatus === "approved" && (
              <>
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Paiement réussi !</h3>
                <p className="text-gray-500 text-sm mb-5">
                  Votre compte a été crédité de {typeof amount === "number" ? amount.toLocaleString() : ""} {currency}
                </p>
                <button
                  onClick={resetForm}
                  className="w-full py-3.5 bg-green-500 text-white font-bold rounded-full"
                  data-testid="button-close-success"
                >
                  Fermer
                </button>
              </>
            )}

            {paymentStatus === "rejected" && (
              <>
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-5">
                  <XCircle className="w-10 h-10 text-[#c8102e]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Paiement échoué</h3>
                <p className="text-gray-500 text-sm mb-5">Le paiement a été refusé ou annulé</p>
                <button
                  onClick={resetForm}
                  className="w-full py-3.5 text-white font-bold rounded-full"
                  style={{ background: "#c8102e" }}
                  data-testid="button-close-error"
                >
                  Réessayer
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
