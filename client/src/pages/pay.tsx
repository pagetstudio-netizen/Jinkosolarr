import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle2, XCircle, ShieldCheck, ChevronLeft } from "lucide-react";
import jinkoLogoText from "@assets/JinkoSolarLOGO_1775671142017.png";

const GREEN = "#3db51d";
const GREEN_DARK = "#2a8d13";

const COUNTRIES = [
  { code: "BJ", name: "Bénin", flag: "🇧🇯", currency: "XOF" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", currency: "XOF" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲", currency: "XAF" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", currency: "XOF" },
  { code: "TG", name: "Togo", flag: "🇹🇬", currency: "XOF" },
  { code: "CG", name: "Congo", flag: "🇨🇬", currency: "XAF" },
];

const OPERATORS: Record<string, string[]> = {
  BJ: ["Moov Money", "MTN Mobile Money"],
  CM: ["MTN Mobile Money", "Orange Money"],
  BF: ["Moov Money", "Orange Money"],
  CI: ["Moov Money", "MTN Mobile Money", "Orange Money", "Wave"],
  TG: ["Flooz (Moov)", "T-Money"],
  CG: ["MTN Mobile Money"],
};

type Step = 1 | 2 | 3;
type FlowType = "ussd_push" | "otp_sms" | "otp_ussd" | "wave";

function StepBar({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: "Informations" },
    { n: 2, label: "Validation" },
    { n: 3, label: "Confirmation" },
  ];
  return (
    <div className="flex items-center justify-between px-4 py-4">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
              style={{
                background: current >= s.n ? GREEN : "#e5e7eb",
                color: current >= s.n ? "white" : "#9ca3af",
              }}
            >
              {s.n}
            </div>
            <span
              className="text-xs mt-1 font-medium"
              style={{ color: current >= s.n ? GREEN : "#9ca3af" }}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="flex-1 h-0.5 mx-2 mb-5"
              style={{ background: current > s.n ? GREEN : "#e5e7eb" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function PayPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Read URL params
  const params = new URLSearchParams(window.location.search);
  const amountParam = parseInt(params.get("amount") || "0");
  const countryParam = params.get("country") || user?.country || "BJ";

  const [step, setStep] = useState<Step>(1);
  const [country, setCountry] = useState(countryParam);
  const [phone, setPhone] = useState("");
  const [operator, setOperator] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Result state
  const [depositId, setDepositId] = useState<number | null>(null);
  const [flow, setFlow] = useState<FlowType | null>(null);
  const [waveUrl, setWaveUrl] = useState<string | null>(null);
  const [ussdCode, setUssdCode] = useState<string | null>(null);
  const [finalStatus, setFinalStatus] = useState<"approved" | "rejected" | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const countryInfo = COUNTRIES.find((c) => c.code === country);
  const currency = countryInfo?.currency || "XOF";
  const operators = OPERATORS[country] || [];

  // Auto-select first operator when country changes
  useEffect(() => {
    setOperator(operators[0] || "");
  }, [country]);

  // Polling for status
  function startPolling(id: number) {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/ashtechpay/deposit/${id}/status`, { credentials: "include" });
        const data = await res.json();
        if (data.status === "approved") {
          clearInterval(pollingRef.current!);
          setFinalStatus("approved");
          setStep(3);
        } else if (data.status === "rejected") {
          clearInterval(pollingRef.current!);
          setFinalStatus("rejected");
          setStep(3);
        }
      } catch {}
    }, 4000);
  }

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  async function handleStep1Submit() {
    setError("");
    if (!phone.trim()) { setError("Entrez votre numéro de téléphone"); return; }
    if (!operator) { setError("Sélectionnez un opérateur"); return; }
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/ashtechpay/initiate", {
        amount: amountParam,
        phone: phone.replace(/\D/g, ""),
        operator,
        country_code: country,
      });
      const data = await res.json();
      setDepositId(data.depositId);
      setFlow(data.flow);
      setWaveUrl(data.waveUrl);
      setUssdCode(data.ussdCode);
      setStep(2);
      if (data.flow === "ussd_push" || data.flow === "wave") {
        startPolling(data.depositId);
      }
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'initiation du paiement");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit() {
    setError("");
    if (!otp.trim()) { setError("Entrez le code OTP reçu"); return; }
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/ashtechpay/initiate", {
        amount: amountParam,
        phone: phone.replace(/\D/g, ""),
        operator,
        country_code: country,
        otp: otp.trim(),
      });
      const data = await res.json();
      if (data.depositId) {
        setDepositId(data.depositId);
        setFlow(data.flow);
        startPolling(data.depositId);
      }
    } catch (e: any) {
      setError(e.message || "Code OTP incorrect");
    } finally {
      setLoading(false);
    }
  }

  if (!amountParam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Montant invalide</p>
          <button onClick={() => navigate("/deposit")} className="text-green-600 font-semibold">
            ← Retour au dépôt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div
        className="px-4 py-4 flex items-center gap-3"
        style={{ background: `linear-gradient(90deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` }}
      >
        <button
          onClick={() => navigate("/deposit")}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.2)" }}
          data-testid="button-back-pay"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <ShieldCheck className="w-5 h-5 text-white/80" />
          <span className="text-white font-semibold text-sm">Paiement sécurisé</span>
        </div>
        <img src={jinkoLogoText} alt="Jinko Solar" className="h-7 w-auto object-contain brightness-0 invert" />
      </div>

      {/* Amount display */}
      <div
        className="px-4 pb-5 pt-3 text-center"
        style={{ background: `linear-gradient(180deg, ${GREEN_DARK} 0%, ${GREEN} 100%)` }}
      >
        <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Montant à payer</p>
        <p className="text-white font-extrabold text-4xl tracking-tight">
          {amountParam.toLocaleString("fr-FR")}
          <span className="text-xl ml-2 font-semibold opacity-80">{currency}</span>
        </p>
      </div>

      {/* Card */}
      <div className="flex-1 px-4 -mt-3">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <StepBar current={step} />
          <div className="px-4 pb-6">

            {/* ─── Step 1: Informations ─── */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Country */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Pays</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2"
                    style={{ focusRingColor: GREEN } as any}
                    data-testid="select-country"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Numéro de téléphone
                  </label>
                  <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                    <div
                      className="flex items-center px-3 text-white text-sm font-bold shrink-0"
                      style={{ background: GREEN }}
                    >
                      {countryInfo?.flag}
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex: 97000000"
                      className="flex-1 px-3 py-3 text-sm text-gray-800 focus:outline-none bg-white"
                      data-testid="input-phone-pay"
                    />
                  </div>
                </div>

                {/* Operator */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Méthode de paiement
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {operators.map((op) => (
                      <button
                        key={op}
                        onClick={() => setOperator(op)}
                        className="rounded-xl border py-3 px-3 text-sm font-semibold text-left transition-all"
                        style={{
                          borderColor: operator === op ? GREEN : "#e5e7eb",
                          background: operator === op ? `${GREEN}15` : "white",
                          color: operator === op ? GREEN : "#374151",
                        }}
                        data-testid={`button-op-${op}`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button
                  onClick={handleStep1Submit}
                  disabled={loading}
                  className="w-full rounded-xl py-4 text-white font-extrabold text-base flex items-center justify-center gap-2 mt-2 active:scale-[0.98] transition-transform"
                  style={{ background: loading ? "#9ca3af" : `linear-gradient(90deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` }}
                  data-testid="button-pay-now"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {loading ? "Traitement..." : "Payer maintenant"}
                </button>
              </div>
            )}

            {/* ─── Step 2: Validation ─── */}
            {step === 2 && (
              <div className="space-y-5">
                {/* USSD Push — waiting */}
                {(flow === "ussd_push") && (
                  <div className="text-center py-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: `${GREEN}20` }}
                    >
                      <Loader2 className="w-8 h-8 animate-spin" style={{ color: GREEN }} />
                    </div>
                    <p className="font-bold text-gray-800 text-base mb-2">Confirmez sur votre téléphone</p>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Vous allez recevoir une demande de confirmation sur votre téléphone. Validez avec votre PIN {operator} pour finaliser le paiement.
                    </p>
                  </div>
                )}

                {/* Wave */}
                {flow === "wave" && waveUrl && (
                  <div className="text-center py-4 space-y-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                      style={{ background: `${GREEN}20` }}
                    >
                      <Loader2 className="w-8 h-8 animate-spin" style={{ color: GREEN }} />
                    </div>
                    <p className="font-bold text-gray-800">Payer avec Wave</p>
                    <p className="text-gray-500 text-sm">Appuyez sur le bouton pour ouvrir l'application Wave et confirmer le paiement.</p>
                    <a
                      href={waveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-xl py-4 text-white font-bold text-center"
                      style={{ background: "#1a9bd7" }}
                      data-testid="button-wave-pay"
                    >
                      Ouvrir Wave →
                    </a>
                  </div>
                )}

                {/* OTP SMS */}
                {flow === "otp_sms" && (
                  <div className="space-y-4">
                    <div className="bg-orange-50 rounded-xl px-4 py-3">
                      <p className="text-orange-700 text-sm font-semibold">Code OTP requis</p>
                      <p className="text-orange-600 text-xs mt-1">
                        Orange Money a envoyé un SMS avec votre code OTP. Saisissez-le ci-dessous pour valider.
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Code OTP (reçu par SMS)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Ex: 123456"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-xl tracking-widest font-bold focus:outline-none"
                        data-testid="input-otp"
                      />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                      onClick={handleOtpSubmit}
                      disabled={loading}
                      className="w-full rounded-xl py-4 text-white font-extrabold flex items-center justify-center gap-2"
                      style={{ background: loading ? "#9ca3af" : `linear-gradient(90deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` }}
                      data-testid="button-confirm-otp"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                      {loading ? "Validation..." : "Valider le paiement"}
                    </button>
                  </div>
                )}

                {/* OTP USSD (Burkina Faso Orange) */}
                {flow === "otp_ussd" && (
                  <div className="space-y-4">
                    <div className="bg-orange-50 rounded-xl px-4 py-3">
                      <p className="text-orange-700 text-sm font-semibold">Code USSD à composer</p>
                      <p className="text-orange-600 text-xs mt-1">
                        Composez ce code sur votre téléphone pour recevoir l'OTP par SMS :
                      </p>
                      {ussdCode && (
                        <p className="text-orange-800 font-extrabold text-lg mt-2 text-center tracking-widest">
                          {ussdCode}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Code OTP reçu</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Ex: 123456"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-xl tracking-widest font-bold focus:outline-none"
                        data-testid="input-otp-ussd"
                      />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                      onClick={handleOtpSubmit}
                      disabled={loading}
                      className="w-full rounded-xl py-4 text-white font-extrabold flex items-center justify-center gap-2"
                      style={{ background: loading ? "#9ca3af" : `linear-gradient(90deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` }}
                      data-testid="button-confirm-otp-ussd"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                      {loading ? "Validation..." : "Valider le paiement"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ─── Step 3: Confirmation ─── */}
            {step === 3 && (
              <div className="text-center py-6 space-y-4">
                {finalStatus === "approved" ? (
                  <>
                    <CheckCircle2 className="w-16 h-16 mx-auto" style={{ color: GREEN }} />
                    <p className="font-extrabold text-xl text-gray-800">Paiement réussi !</p>
                    <p className="text-gray-500 text-sm">
                      Votre dépôt de {amountParam.toLocaleString("fr-FR")} {currency} a été crédité sur votre compte Jinko Solar.
                    </p>
                    <button
                      onClick={() => navigate("/")}
                      className="w-full rounded-xl py-4 text-white font-extrabold mt-2"
                      style={{ background: `linear-gradient(90deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` }}
                      data-testid="button-go-home"
                    >
                      Retour à l'accueil
                    </button>
                  </>
                ) : (
                  <>
                    <XCircle className="w-16 h-16 mx-auto text-red-500" />
                    <p className="font-extrabold text-xl text-gray-800">Paiement échoué</p>
                    <p className="text-gray-500 text-sm">
                      Le paiement a été refusé ou annulé. Veuillez réessayer.
                    </p>
                    <button
                      onClick={() => { setStep(1); setFlow(null); setOtp(""); setError(""); }}
                      className="w-full rounded-xl py-4 text-white font-extrabold mt-2"
                      style={{ background: `linear-gradient(90deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` }}
                      data-testid="button-retry"
                    >
                      Réessayer
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 px-4">
        <p className="text-gray-400 text-xs flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Paiement sécurisé via Ashtech Pay · Jinko Solar
        </p>
      </div>
    </div>
  );
}
