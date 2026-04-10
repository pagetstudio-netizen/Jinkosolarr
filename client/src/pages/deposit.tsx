import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Loader2, CheckCircle, XCircle, Clock, ClipboardList } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getCountryByCode } from "@/lib/countries";
import type { PaymentChannel } from "@shared/schema";

const PRESET_AMOUNTS = [3500, 8000, 15000, 35000, 80000, 150000, 300000, 500000];

type PaymentStatus = "idle" | "processing" | "pending" | "approved" | "rejected";

interface DepositResponse {
  deposit: { id: number; status: string };
  soleaspay?: boolean;
  paymentUrl?: string;
}

// Channels augmented with virtual gateway entries
interface Channel {
  id: number;
  name: string;
  isActive: boolean;
  gateway?: string | null;
  countries?: string[] | null;
}

export default function DepositPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Step: "channel" | "form"
  const [step, setStep] = useState<"channel" | "form">("channel");
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const [amount, setAmount] = useState<number | "">("");
  const [accountNumber, setAccountNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [currentDepositId, setCurrentDepositId] = useState<number | null>(null);
  const [showOperatorPicker, setShowOperatorPicker] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState("");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const countryInfo = getCountryByCode(user?.country || "");
  const currency = countryInfo?.currency || "FCFA";
  const balance = parseFloat(user?.balance || "0");
  const operators = countryInfo?.paymentMethods || [];

  // OTP logic
  const isOrangeOperator = (selectedChannel?.name || selectedOperator).toLowerCase().includes("orange");
  const needsOtp = isOrangeOperator && (user?.country === "CI" || user?.country === "BF");
  const otpAutoFilled = isOrangeOperator && user?.country === "CM";
  const showOtpField = needsOtp && !otpAutoFilled;

  // Reset OTP when channel changes
  useEffect(() => { setOtpCode(""); setSelectedOperator(""); }, [selectedChannel]);

  const { data: platformSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });
  const MIN_DEPOSIT = parseInt(platformSettings?.minDeposit || "3500");

  const { data: rawChannels = [] } = useQuery<Channel[]>({
    queryKey: ["/api/payment-channels"],
  });

  // Filter channels by user's country
  const userCountry = user?.country || "";
  const availableChannels = rawChannels.filter((ch) => {
    if (!ch.isActive) return false;
    const countries = ch.countries as string[] | null;
    // If no countries configured → show to all
    if (!countries || countries.length === 0) return true;
    return countries.includes(userCountry);
  });

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
      otpCode?: string;
    }) => {
      const res = await apiRequest("POST", "/api/deposits", data);
      return res.json() as Promise<DepositResponse>;
    },
    onSuccess: (data) => {
      if (data.soleaspay) {
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

  const resetForm = () => {
    setAmount("");
    setSelectedChannel(null);
    setSelectedOperator("");
    setAccountNumber("");
    setOtpCode("");
    setPaymentStatus("idle");
    setCurrentDepositId(null);
    setStep("channel");
  };

  const handleSelectChannel = (ch: Channel) => {
    setSelectedChannel(ch);
    setStep("form");
  };

  const handleSubmit = () => {
    if (!amount || amount < MIN_DEPOSIT) {
      toast({ title: "Montant invalide", description: `Le minimum est de ${MIN_DEPOSIT.toLocaleString()} ${currency}`, variant: "destructive" });
      return;
    }

    // AshtechPay: redirect to dedicated payment page
    if (selectedChannel?.gateway === "ashtechpay") {
      navigate(`/pay?amount=${amount}&country=${userCountry}`);
      return;
    }

    if (!accountNumber.trim()) {
      toast({ title: "Numéro requis", description: "Veuillez entrer votre numéro Mobile Money", variant: "destructive" });
      return;
    }
    if (showOtpField && !otpCode.trim()) {
      toast({ title: "Code OTP requis", description: "Veuillez saisir votre code OTP Orange", variant: "destructive" });
      return;
    }

    const channelId = selectedChannel && selectedChannel.id > 0 ? selectedChannel.id : (rawChannels.find(c => c.id > 0)?.id ?? 1);
    const operator = selectedOperator || selectedChannel?.name || operators[0] || "Mobile Money";

    setPaymentStatus("processing");
    depositMutation.mutate({
      amount: amount as number,
      paymentMethod: operator,
      accountName: user?.fullName || "",
      accountNumber,
      country: userCountry,
      paymentChannelId: channelId,
      useSoleaspay: selectedChannel?.gateway === "soleaspay",
      otpCode: showOtpField ? otpCode.trim() : undefined,
    });
  };

  if (!user) return null;

  // ─── STEP 1: Channel Selection ────────────────────────────────────────────
  if (step === "channel") {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={() => navigate("/")} className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-base font-bold text-gray-800">Dépôt en ligne</h1>
          <Link href="/deposit-orders">
            <button className="p-1" data-testid="button-history">
              <ClipboardList className="w-6 h-6 text-gray-700" />
            </button>
          </Link>
        </div>

        {/* Balance Banner */}
        <div
          className="px-5 py-5"
          style={{ background: "linear-gradient(135deg, #c8c8d0 0%, #a8a8b8 100%)" }}
        >
          <p className="text-white text-3xl font-bold">{currency} {balance.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}</p>
          <p className="text-white/80 text-sm mt-1">Solde du compte</p>
        </div>

        <div className="p-5 space-y-5">
          {/* Section title */}
          <div>
            <p className="text-gray-800 font-semibold text-sm mb-1">Choisissez votre canal de recharge</p>
            <p className="text-gray-400 text-xs">
              Canaux disponibles pour{" "}
              <span className="font-medium text-gray-600">{countryInfo?.name || userCountry}</span>
            </p>
          </div>

          {/* Channel list */}
          {availableChannels.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Aucun canal disponible</p>
              <p className="text-gray-400 text-xs mt-1">Contactez l'administrateur pour configurer les canaux de paiement.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableChannels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChannel(ch)}
                  className="w-full rounded-2xl py-4 px-5 text-center font-bold text-base text-white transition-all active:scale-95"
                  style={{ background: "#111827" }}
                  data-testid={`button-channel-${ch.id}`}
                >
                  {ch.name}
                </button>
              ))}
            </div>
          )}

          {/* Instructions */}
          <div className="pt-4">
            <p className="font-bold text-gray-800 text-sm mb-3">Instructions de dépôt</p>
            <div className="space-y-2 text-sm text-gray-500 leading-relaxed">
              <p>1. Le dépôt minimum est de {MIN_DEPOSIT.toLocaleString()} {currency}. Les dépôts inférieurs à ce montant ne seront pas crédités.</p>
              <p>2. Assurez-vous que les informations saisies correspondent exactement à votre compte Mobile Money.</p>
              <p>3. Une fois votre paiement effectué, le crédit sera appliqué dans un délai de 1 à 30 minutes.</p>
              <p>4. En cas de problème, contactez le service client.</p>
              <p>5. Pour votre sécurité, ne transférez jamais de fonds à des inconnus.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 2: Deposit Form ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button onClick={() => { setStep("channel"); setAmount(""); setAccountNumber(""); setOtpCode(""); }} className="p-1" data-testid="button-back">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-base font-bold text-gray-800">Dépôt en ligne</h1>
        <Link href="/deposit-orders">
          <button className="p-1" data-testid="button-history">
            <ClipboardList className="w-6 h-6 text-gray-700" />
          </button>
        </Link>
      </div>

      {/* Balance Banner */}
      <div
        className="px-5 py-5"
        style={{ background: "linear-gradient(135deg, #c8c8d0 0%, #a8a8b8 100%)" }}
      >
        <p className="text-white text-3xl font-bold">{currency} {balance.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}</p>
        <p className="text-white/80 text-sm mt-1">Solde du compte</p>
      </div>

      <div className="px-5 py-5 space-y-0">

        {/* Selected channel badge */}
        <div className="mb-4 inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-gray-700">{selectedChannel?.name}</span>
        </div>

        {/* Preset Amounts */}
        <div>
          <p className="text-gray-800 font-semibold text-sm mb-3">
            Montant du dépôt{" "}
            <span className="text-gray-400 font-normal">( {MIN_DEPOSIT.toLocaleString()} {currency} )</span>
          </p>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset)}
                className="rounded-xl py-3 text-center text-sm font-bold transition-all active:scale-95"
                style={{
                  background: amount === preset ? "#3db51d" : "#111827",
                  color: "white",
                }}
                data-testid={`button-preset-${preset}`}
              >
                {preset >= 1000 ? `${preset / 1000}k` : preset}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-4" />

        {/* Custom amount input */}
        <div className="flex items-center gap-3 border-b border-gray-100 py-3">
          <span className="text-gray-500 font-bold text-sm w-14 shrink-0">{currency}</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            placeholder="Veuillez saisir le montant de la recharge"
            className="flex-1 text-sm outline-none text-gray-500 bg-transparent"
            data-testid="input-deposit-amount"
          />
        </div>

        {/* AshtechPay info banner */}
        {selectedChannel?.gateway === "ashtechpay" && (
          <div className="my-3 rounded-xl px-4 py-3 text-sm text-green-800" style={{ background: "#3db51d20" }}>
            Vous serez redirigé vers notre page de paiement sécurisée pour choisir votre opérateur et finaliser le paiement.
          </div>
        )}

        {/* Phone number — hidden for AshtechPay */}
        {selectedChannel?.gateway !== "ashtechpay" && (
          <div className="flex items-center gap-3 border-b border-gray-100 py-3">
            <input
              type="tel"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder={`Numéro ${selectedChannel?.name || "Mobile Money"}`}
              className="flex-1 text-sm outline-none text-gray-500 bg-transparent"
              data-testid="input-account-number"
            />
          </div>
        )}

        {/* Operator picker — shown if channel name doesn't match a single operator */}
        {selectedChannel?.gateway !== "ashtechpay" && operators.length > 1 && (
          <div className="border-b border-gray-100 py-3">
            <button
              onClick={() => setShowOperatorPicker(true)}
              className="w-full flex items-center justify-between text-sm text-gray-500"
              data-testid="button-open-operator"
            >
              <span>{selectedOperator || `Sélectionnez l'opérateur (${countryInfo?.name})`}</span>
              <ChevronLeft className="w-4 h-4 rotate-180 text-gray-400" />
            </button>
          </div>
        )}

        {/* OTP field */}
        {selectedChannel?.gateway !== "ashtechpay" && showOtpField && (
          <div className="space-y-2 pt-1">
            {user?.country === "BF" && (
              <div className="bg-orange-50 rounded-xl px-4 py-3">
                <p className="text-orange-700 text-xs font-semibold mb-1">Code OTP Orange Burkina :</p>
                <p className="text-orange-600 text-xs">Composez <strong>*144*4*6*{amount || "montant"}#</strong> sur votre téléphone.</p>
              </div>
            )}
            {user?.country === "CI" && (
              <div className="bg-orange-50 rounded-xl px-4 py-3">
                <p className="text-orange-700 text-xs font-semibold mb-1">Code OTP Orange Côte d'Ivoire :</p>
                <p className="text-orange-600 text-xs">Composez <strong>#144*82#</strong> pour générer votre code OTP.</p>
              </div>
            )}
            <div className="flex items-center gap-3 border-b border-orange-200 py-3">
              <input
                type="number"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Code OTP Orange"
                className="flex-1 text-sm outline-none text-gray-500 bg-transparent tracking-widest"
                data-testid="input-otp-code"
              />
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 mt-2 mb-5" />

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={depositMutation.isPending || paymentStatus !== "idle"}
          className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-40"
          style={{ background: "#111827" }}
          data-testid="button-submit-deposit"
        >
          {depositMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Envoi en cours...
            </span>
          ) : selectedChannel?.gateway === "ashtechpay" ? (
            "Continuer vers le paiement →"
          ) : (
            "Déposez maintenant"
          )}
        </button>

        {/* Instructions */}
        <div className="pt-6 pb-10">
          <p className="font-bold text-gray-800 text-sm mb-3">Instructions de dépôt</p>
          <div className="space-y-2 text-sm text-gray-500 leading-relaxed">
            <p>1. Le dépôt minimum est de {MIN_DEPOSIT.toLocaleString()} {currency}. Les dépôts inférieurs à ce montant ne seront pas crédités.</p>
            <p>2. Assurez-vous que les informations saisies correspondent exactement à votre compte Mobile Money pour éviter tout rejet de paiement.</p>
            <p>3. Une fois votre paiement effectué, le crédit sera automatiquement appliqué à votre compte dans un délai de 1 à 30 minutes.</p>
            <p>4. Si vous n'avez pas reçu vos fonds après un délai anormalement long, veuillez contacter le service client en ligne.</p>
            <p>5. Pour votre sécurité financière, ne transférez jamais de fonds à des inconnus.</p>
            <p>6. Le personnel officiel ne vous demandera jamais votre mot de passe ou informations personnelles.</p>
          </div>
        </div>
      </div>

      {/* Operator Picker Sheet */}
      {showOperatorPicker && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowOperatorPicker(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">Sélectionnez votre opérateur</h3>
              <button onClick={() => setShowOperatorPicker(false)} className="text-gray-400 font-bold text-lg">✕</button>
            </div>
            <div className="overflow-y-auto max-h-64">
              {operators.map((op) => (
                <button
                  key={op}
                  onClick={() => { setSelectedOperator(op); setShowOperatorPicker(false); }}
                  className={`w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 ${selectedOperator === op ? "bg-green-50" : ""}`}
                  data-testid={`button-operator-${op}`}
                >
                  <span className={`text-sm font-medium ${selectedOperator === op ? "text-[#3db51d]" : "text-gray-800"}`}>{op}</span>
                  {selectedOperator === op && <span className="text-[#3db51d] font-bold">✓</span>}
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
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl flex flex-col items-center px-6 pt-3 pb-10">
            <div className="w-10 h-1 bg-gray-300 rounded-full mb-6" />

            {paymentStatus === "processing" && (
              <>
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
                  <Loader2 className="w-10 h-10 text-[#3db51d] animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Traitement en cours</h3>
                <p className="text-gray-500 text-sm">Veuillez patienter...</p>
              </>
            )}

            {paymentStatus === "pending" && (
              <>
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
                  <Clock className="w-10 h-10 text-[#3db51d]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Validation requise</h3>
                <p className="text-gray-500 text-sm mb-5">Confirmez le paiement depuis votre téléphone</p>
                <div className="flex items-center gap-2 text-[#3db51d]">
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
                  className="w-full py-3.5 rounded-xl text-white font-bold"
                  style={{ background: "#3db51d" }}
                  data-testid="button-done"
                >
                  Terminer
                </button>
              </>
            )}

            {paymentStatus === "rejected" && (
              <>
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
                  <XCircle className="w-10 h-10 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Paiement refusé</h3>
                <p className="text-gray-500 text-sm mb-5">Votre dépôt n'a pas pu être traité. Réessayez.</p>
                <button
                  onClick={resetForm}
                  className="w-full py-3.5 rounded-xl text-white font-bold"
                  style={{ background: "#111827" }}
                  data-testid="button-retry"
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
