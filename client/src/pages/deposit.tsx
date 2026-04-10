import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getCountryByCode } from "@/lib/countries";

const PRESET_AMOUNTS = [3500, 8000, 15000, 35000, 80000, 150000];

const GREEN = "#3db51d";

export default function DepositPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [amount, setAmount] = useState<number | "">("");

  const countryInfo = getCountryByCode(user?.country || "");
  const currency = countryInfo?.currency || "XOF";
  const userCountry = user?.country || "BJ";

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
    <div className="min-h-screen flex flex-col" style={{ background: GREEN }}>

      {/* Header — sur fond vert */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4">
        <button onClick={() => navigate("/")} data-testid="button-back">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">Recharger</h1>
        <Link href="/deposit-orders">
          <button data-testid="button-history">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="3" rx="1.5" fill="white" />
              <rect x="3" y="10.5" width="18" height="3" rx="1.5" fill="white" />
              <rect x="3" y="17" width="18" height="3" rx="1.5" fill="white" />
            </svg>
          </button>
        </Link>
      </div>

      {/* Carte blanche */}
      <div className="mx-4 bg-white rounded-3xl shadow-lg p-5">

        {/* Boutons montants prédéfinis */}
        <div className="flex gap-3 flex-wrap mb-4">
          {PRESET_AMOUNTS.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              className="rounded-xl px-4 py-2 text-sm font-semibold border transition-all"
              style={{
                background: amount === p ? GREEN : "white",
                color: amount === p ? "white" : "#374151",
                borderColor: amount === p ? GREEN : "#d1d5db",
              }}
              data-testid={`button-preset-${p}`}
            >
              {p.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Label */}
        <p className="text-sm mb-3" style={{ color: GREEN }}>
          Veuillez saisir le montant de recharge
        </p>

        {/* Champ montant */}
        <div
          className="flex items-center rounded-xl px-4 py-3 border"
          style={{ borderColor: "#e5e7eb" }}
        >
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            placeholder={MIN_DEPOSIT.toLocaleString()}
            className="flex-1 text-lg text-gray-700 outline-none bg-transparent"
            data-testid="input-deposit-amount"
          />
          <span className="text-gray-400 font-semibold ml-2">{currency}</span>
        </div>
      </div>

      {/* Bouton Recharger maintenant */}
      <div className="flex justify-center mt-6 mb-2">
        <button
          onClick={handleRecharge}
          className="px-14 py-4 rounded-full text-white font-bold text-base shadow-md"
          style={{ background: GREEN }}
          data-testid="button-submit-deposit"
        >
          Recharger maintenant
        </button>
      </div>

      {/* Zone instructions — fond gris clair */}
      <div className="flex-1 bg-gray-50 mt-4 px-5 pt-5 pb-10 space-y-4">

        <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
          💳 Instructions de Recharge :
        </p>

        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <div className="flex gap-2 items-start">
            <span className="mt-0.5 font-bold" style={{ color: "#1565C0" }}>◆</span>
            <p>
              <span className="font-bold">Montant minimum de recharge :</span>{" "}
              {MIN_DEPOSIT.toLocaleString()} {currency}
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="mt-0.5 font-bold" style={{ color: "#1565C0" }}>◆</span>
            <p>
              <span className="font-bold">Vérifiez attentivement vos informations de compte</span>{" "}
              lors du virement pour éviter toute erreur de paiement
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="mt-0.5 font-bold" style={{ color: "#1565C0" }}>◆</span>
            <p>
              <span className="font-bold">Chaque commande possède ses propres informations de paiement</span>{" "}
              ; ne réutilisez pas les informations précédentes pour un second paiement
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="mt-0.5 font-bold" style={{ color: "#1565C0" }}>◆</span>
            <p>
              <span className="font-bold">Après un virement réussi</span>, veuillez patienter 10 à 30 minutes.
              Si le montant n'est pas crédité après ce délai, contactez le service client.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
