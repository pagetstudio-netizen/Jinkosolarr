import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle2, XCircle, Phone } from "lucide-react";

const GREEN = "#3db51d";

const COUNTRIES = [
  { code: "BJ", name: "Bénin",         dialCode: "+229", currency: "XOF" },
  { code: "CI", name: "Côte d'Ivoire", dialCode: "+225", currency: "XOF" },
  { code: "CM", name: "Cameroun",      dialCode: "+237", currency: "XAF" },
  { code: "BF", name: "Burkina Faso",  dialCode: "+226", currency: "XOF" },
];

const OPERATORS: Record<string, string[]> = {
  BJ: ["Moov Money", "MTN Mobile Money"],
  CM: ["MTN Mobile Money", "Orange Money"],
  BF: ["Moov Money", "Orange Money"],
  CI: ["Moov Money", "MTN Mobile Money", "Orange Money", "Wave"],
};

type Step = 1 | 2 | 3;
type FlowType = "ussd_push" | "otp_sms" | "otp_ussd" | "wave";

function StepBar({ current }: { current: Step }) {
  const steps = [
    { n: 1 as Step, label: "Informations" },
    { n: 2 as Step, label: "Validation" },
    { n: 3 as Step, label: "Confirmation" },
  ];

  const progress = ((current - 1) / (steps.length - 1)) * 100;

  return (
    <div className="px-5 pt-4 pb-2">
      <div className="flex items-center justify-between mb-3">
        <div className="relative flex-1 h-1 bg-gray-200 rounded-full mr-4">
          <div
            className="absolute left-0 top-0 h-1 rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: GREEN }}
          />
        </div>
        <span className="text-xs text-gray-400 shrink-0">Etape {current} sur 3</span>
      </div>
      <div className="flex items-start justify-between">
        {steps.map((s, i) => (
          <div key={s.n} className="flex flex-col items-center" style={{ flex: 1 }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all"
              style={
                current > s.n
                  ? { background: GREEN, borderColor: GREEN, color: "white" }
                  : current === s.n
                  ? { background: "white", borderColor: GREEN, color: GREEN }
                  : { background: "white", borderColor: "#d1d5db", color: "#9ca3af" }
              }
            >
              {current > s.n ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                s.n
              )}
            </div>
            <span
              className="text-xs mt-1 font-medium text-center"
              style={{ color: current >= s.n ? GREEN : "#9ca3af" }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PayPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

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

  const [depositId, setDepositId] = useState<number | null>(null);
  const [flow, setFlow] = useState<FlowType | null>(null);
  const [waveUrl, setWaveUrl] = useState<string | null>(null);
  const [ussdCode, setUssdCode] = useState<string | null>(null);
  const [finalStatus, setFinalStatus] = useState<"approved" | "rejected" | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const countryInfo = COUNTRIES.find((c) => c.code === country)!;
  const currency = countryInfo?.currency || "XOF";
  const operators = OPERATORS[country] || [];

  useEffect(() => {
    setOperator(operators[0] || "");
  }, [country]);

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

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

  async function handleStep1Submit() {
    setError("");
    if (!phone.trim()) { setError("Entrez votre numéro de téléphone"); return; }
    if (!operator) { setError("Sélectionnez une méthode de paiement"); return; }
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/ashtechpay/initiate", {
        amount: amountParam,
        phone: phone.replace(/\D/g, ""),
        operator,
        country_code: country,
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "Erreur lors de l'initiation");
        return;
      }
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
      setError(e.message || "Erreur réseau");
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
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "Code OTP incorrect");
        return;
      }
      const data = await res.json();
      if (data.depositId) {
        setDepositId(data.depositId);
        startPolling(data.depositId);
      }
    } catch (e: any) {
      setError(e.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  if (!amountParam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Montant invalide</p>
          <button onClick={() => navigate("/deposit")} className="font-semibold" style={{ color: GREEN }}>
            ← Retour au dépôt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: GREEN }}>

      {/* ── Green header ── */}
      <div className="px-5 pt-8 pb-6">
        <p className="text-white font-extrabold text-xl leading-tight">Jinko Solar</p>
        <p className="text-white/80 text-sm mt-0.5">Paiement sécurisé</p>
        <p className="text-white/70 text-sm mt-4">Montant :</p>
        <p className="text-white font-extrabold text-4xl leading-tight mt-0.5">
          {amountParam.toLocaleString("fr-FR")}
          <span className="text-2xl font-bold ml-2 opacity-90">{currency}</span>
        </p>
      </div>

      {/* ── White card ── */}
      <div className="flex-1 bg-white rounded-t-3xl overflow-hidden flex flex-col">
        <StepBar current={step} />

        <div className="px-5 pb-8 flex-1">

          {/* ─── Step 1: Informations ─── */}
          {step === 1 && (
            <div className="space-y-5 pt-2">

              {/* Phone */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Numéro de téléphone mobile :</p>
                <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                  <div
                    className="flex items-center justify-center px-3 shrink-0 text-white text-sm font-bold min-w-[56px]"
                    style={{ background: GREEN }}
                  >
                    {countryInfo?.dialCode}
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 90123456"
                    className="flex-1 px-3 py-3 text-sm text-gray-800 focus:outline-none bg-white"
                    data-testid="input-phone-pay"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Pays :</p>
                <div className="relative">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none appearance-none pr-10"
                    data-testid="select-country"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Operator */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Méthode de paiement :</p>
                <div className="space-y-2">
                  {operators.map((op) => (
                    <label
                      key={op}
                      className="flex items-center gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition-all"
                      style={{ borderColor: operator === op ? GREEN : "#e5e7eb" }}
                      onClick={() => setOperator(op)}
                    >
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                        style={{ borderColor: operator === op ? GREEN : "#d1d5db" }}
                      >
                        {operator === op && (
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: GREEN }} />
                        )}
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{op}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <button
                onClick={handleStep1Submit}
                disabled={loading}
                className="w-full rounded-xl py-4 text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
                style={{ background: loading ? "#9ca3af" : GREEN }}
                data-testid="button-pay-now"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement en cours...</>
                  : "Payer maintenant  ›"}
              </button>
            </div>
          )}

          {/* ─── Step 2: Validation ─── */}
          {step === 2 && (
            <div className="space-y-5 pt-2">

              {/* USSD Push */}
              {flow === "ussd_push" && (
                <>
                  {/* Yellow alert */}
                  <div
                    className="rounded-xl px-4 py-3 text-center"
                    style={{ background: "#FFF8E1", border: "1px solid #FFE082" }}
                  >
                    <p className="text-sm font-semibold" style={{ color: "#E65100" }}>
                      Une demande de paiement a été envoyée sur votre téléphone
                    </p>
                  </div>

                  {/* Phone icon */}
                  <div className="flex flex-col items-center py-3">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                      style={{ background: `${GREEN}22` }}
                    >
                      <Phone className="w-9 h-9" style={{ color: GREEN }} />
                    </div>
                    <p className="font-bold text-gray-800 text-base text-center">
                      Validez le paiement sur votre téléphone
                    </p>
                    <p className="text-gray-500 text-sm text-center mt-2 leading-relaxed">
                      Composez votre code secret pour confirmer la transaction de{" "}
                      {amountParam.toLocaleString("fr-FR")} {currency}
                    </p>
                  </div>

                  {/* Spinner */}
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Vérification en cours...
                  </div>

                  {/* Back button */}
                  <button
                    onClick={() => { if (pollingRef.current) clearInterval(pollingRef.current); setStep(1); setFlow(null); }}
                    className="w-full rounded-xl py-4 text-white font-bold text-sm"
                    style={{ background: "#1565C0" }}
                    data-testid="button-back-step2"
                  >
                    Retour
                  </button>
                </>
              )}

              {/* Wave */}
              {flow === "wave" && waveUrl && (
                <>
                  <div
                    className="rounded-xl px-4 py-3 text-center"
                    style={{ background: "#FFF8E1", border: "1px solid #FFE082" }}
                  >
                    <p className="text-sm font-semibold" style={{ color: "#E65100" }}>
                      Ouvrez Wave pour confirmer votre paiement de {amountParam.toLocaleString("fr-FR")} {currency}
                    </p>
                  </div>
                  <div className="flex flex-col items-center py-3">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                      style={{ background: `${GREEN}22` }}
                    >
                      <Phone className="w-9 h-9" style={{ color: GREEN }} />
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Vérification en cours...
                    </div>
                  </div>
                  <a
                    href={waveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-xl py-4 text-white font-bold text-sm text-center"
                    style={{ background: "#1a9bd7" }}
                    data-testid="button-wave-pay"
                  >
                    Ouvrir Wave
                  </a>
                  <button
                    onClick={() => { if (pollingRef.current) clearInterval(pollingRef.current); setStep(1); setFlow(null); }}
                    className="w-full rounded-xl py-4 text-white font-bold text-sm"
                    style={{ background: "#1565C0" }}
                    data-testid="button-back-wave"
                  >
                    Retour
                  </button>
                </>
              )}

              {/* OTP SMS */}
              {flow === "otp_sms" && (
                <>
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{ background: "#FFF8E1", border: "1px solid #FFE082" }}
                  >
                    <p className="text-sm font-semibold text-center" style={{ color: "#E65100" }}>
                      Un SMS avec votre code OTP a été envoyé sur votre téléphone
                    </p>
                  </div>
                  <div className="flex flex-col items-center py-2">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                      style={{ background: `${GREEN}22` }}
                    >
                      <Phone className="w-9 h-9" style={{ color: GREEN }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Code OTP reçu par SMS :</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Ex: 123456"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-xl tracking-[0.4em] font-bold focus:outline-none"
                      data-testid="input-otp"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                  <button
                    onClick={handleOtpSubmit}
                    disabled={loading}
                    className="w-full rounded-xl py-4 text-white font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: loading ? "#9ca3af" : GREEN }}
                    data-testid="button-confirm-otp"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Validation...</> : "Valider le paiement  ›"}
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full rounded-xl py-4 text-white font-bold text-sm"
                    style={{ background: "#1565C0" }}
                    data-testid="button-back-otp"
                  >
                    Retour
                  </button>
                </>
              )}

              {/* OTP USSD */}
              {flow === "otp_ussd" && (
                <>
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{ background: "#FFF8E1", border: "1px solid #FFE082" }}
                  >
                    <p className="text-sm font-semibold text-center" style={{ color: "#E65100" }}>
                      Composez le code ci-dessous sur votre téléphone pour recevoir votre OTP
                    </p>
                    {ussdCode && (
                      <p className="font-extrabold text-lg text-center mt-2" style={{ color: "#E65100" }}>
                        {ussdCode}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-center py-2">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                      style={{ background: `${GREEN}22` }}
                    >
                      <Phone className="w-9 h-9" style={{ color: GREEN }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Code OTP reçu :</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Ex: 123456"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-xl tracking-[0.4em] font-bold focus:outline-none"
                      data-testid="input-otp-ussd"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                  <button
                    onClick={handleOtpSubmit}
                    disabled={loading}
                    className="w-full rounded-xl py-4 text-white font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: loading ? "#9ca3af" : GREEN }}
                    data-testid="button-confirm-otp-ussd"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Validation...</> : "Valider le paiement  ›"}
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full rounded-xl py-4 text-white font-bold text-sm"
                    style={{ background: "#1565C0" }}
                    data-testid="button-back-otp-ussd"
                  >
                    Retour
                  </button>
                </>
              )}
            </div>
          )}

          {/* ─── Step 3: Confirmation ─── */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center py-6 space-y-4 pt-4">
              {finalStatus === "approved" ? (
                <>
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: `${GREEN}20` }}
                  >
                    <CheckCircle2 className="w-12 h-12" style={{ color: GREEN }} />
                  </div>
                  <p className="font-extrabold text-xl text-gray-800">Paiement réussi !</p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Votre dépôt de {amountParam.toLocaleString("fr-FR")} {currency} a été crédité sur votre compte Jinko Solar.
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="w-full rounded-xl py-4 text-white font-bold text-sm mt-2"
                    style={{ background: GREEN }}
                    data-testid="button-go-home"
                  >
                    Retour à l'accueil
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-red-50">
                    <XCircle className="w-12 h-12 text-red-500" />
                  </div>
                  <p className="font-extrabold text-xl text-gray-800">Paiement échoué</p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Le paiement a été refusé ou annulé. Veuillez réessayer.
                  </p>
                  <button
                    onClick={() => { setStep(1); setFlow(null); setOtp(""); setError(""); }}
                    className="w-full rounded-xl py-4 text-white font-bold text-sm mt-2"
                    style={{ background: GREEN }}
                    data-testid="button-retry"
                  >
                    Réessayer
                  </button>
                  <button
                    onClick={() => navigate("/deposit")}
                    className="w-full rounded-xl py-4 text-white font-bold text-sm"
                    style={{ background: "#1565C0" }}
                    data-testid="button-back-fail"
                  >
                    Retour
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-3 px-5 border-t border-gray-100">
          <p className="text-gray-400 text-xs">Paiement sécurisé via Jinko Solar</p>
        </div>
      </div>
    </div>
  );
}
