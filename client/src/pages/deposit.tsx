import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ClipboardList } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getCountryByCode } from "@/lib/countries";

const PRESET_AMOUNTS = [3500, 8000, 15000, 35000, 80000, 150000];

export default function DepositPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [amount, setAmount] = useState<number | "">("");

  const countryInfo = getCountryByCode(user?.country || "");
  const currency = countryInfo?.currency || "XOF";
  const userCountry = user?.country || "BJ";
  const balance = parseFloat(user?.balance || "0");

  const { data: platformSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });
  const MIN_DEPOSIT = parseInt(platformSettings?.minDeposit || "3500");

  const handleRecharge = () => {
    const amt = typeof amount === "number" ? amount : 0;
    if (!amt || amt < MIN_DEPOSIT) {
      alert(`Le montant minimum est de ${MIN_DEPOSIT.toLocaleString()} ${currency}`);
      return;
    }
    navigate(`/pay?amount=${amt}&country=${userCountry}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f5f5" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <button onClick={() => navigate("/")} className="p-1" data-testid="button-back">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-base font-bold text-gray-800">Recharger</h1>
        <Link href="/deposit-orders">
          <button className="p-1" data-testid="button-history">
            <ClipboardList className="w-6 h-6 text-gray-700" />
          </button>
        </Link>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* ── White card ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* Preset amounts */}
          <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto">
            {PRESET_AMOUNTS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p)}
                className="shrink-0 rounded-lg px-4 py-2 text-sm font-bold transition-all"
                style={{
                  background: amount === p ? "#3db51d" : "white",
                  color: amount === p ? "white" : "#374151",
                  border: `1.5px solid ${amount === p ? "#3db51d" : "#e5e7eb"}`,
                }}
                data-testid={`button-preset-${p}`}
              >
                {p >= 1000 ? `${p / 1000}k` : p}
              </button>
            ))}
          </div>

          {/* Label */}
          <p className="text-xs px-4 pb-2" style={{ color: "#3db51d" }}>
            Veuillez saisir le montant de recharge
          </p>

          {/* Amount input */}
          <div className="flex items-center mx-4 mb-4 rounded-xl border border-gray-200 px-4 py-3 bg-white">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder={MIN_DEPOSIT.toLocaleString()}
              className="flex-1 text-xl font-semibold text-gray-700 outline-none bg-transparent"
              data-testid="input-deposit-amount"
            />
            <span className="text-gray-400 font-semibold text-base ml-2">{currency}</span>
          </div>
        </div>

        {/* ── Recharger maintenant button ── */}
        <button
          onClick={handleRecharge}
          className="w-full py-4 rounded-full text-white font-bold text-base shadow"
          style={{ background: "#3db51d" }}
          data-testid="button-submit-deposit"
        >
          Recharger maintenant
        </button>

        {/* ── Instructions ── */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
            💳 Instructions de Recharge :
          </p>
          <div className="space-y-2.5 text-sm text-gray-600 leading-relaxed">
            <div className="flex gap-2">
              <span style={{ color: "#3db51d" }}>◆</span>
              <span>
                <span className="font-bold">Montant minimum de recharge :</span>{" "}
                {MIN_DEPOSIT.toLocaleString()} {currency}
              </span>
            </div>
            <div className="flex gap-2">
              <span style={{ color: "#3db51d" }}>◆</span>
              <span>
                <span className="font-bold">Vérifiez attentivement vos informations de compte</span>{" "}
                lors du virement pour éviter toute erreur de paiement
              </span>
            </div>
            <div className="flex gap-2">
              <span style={{ color: "#3db51d" }}>◆</span>
              <span>
                <span className="font-bold">Chaque commande possède ses propres informations de paiement</span>{" "}
                ; ne réutilisez pas les informations précédentes pour un second paiement
              </span>
            </div>
            <div className="flex gap-2">
              <span style={{ color: "#3db51d" }}>◆</span>
              <span>
                <span className="font-bold">Après un virement réussi</span>, veuillez patienter 10 à 30 minutes.
                Si le montant n'est pas crédité après ce délai, contactez le service client.
              </span>
            </div>
            <div className="flex gap-2">
              <span style={{ color: "#3db51d" }}>◆</span>
              <span>
                Pour votre sécurité, ne transférez jamais de fonds à des personnes inconnues.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
