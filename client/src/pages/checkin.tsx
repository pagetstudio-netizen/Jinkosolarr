import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getCountryByCode } from "@/lib/countries";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";

import elfStation from "@/assets/images/elf-station-1.jpg";

interface BonusStatus {
  canClaim: boolean;
  hoursRemaining: number;
  totalBonusClaimed: number;
  daysPointed: number;
}

export default function CheckinPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: bonusStatus } = useQuery<BonusStatus>({
    queryKey: ["/api/daily-bonus-status"],
    refetchInterval: 60000,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/claim-daily-bonus", {});
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-bonus-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Bonus recu!", description: "50 FCFA ajoutes a votre solde" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  if (!user) return null;

  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";
  const totalBonusClaimed = bonusStatus?.totalBonusClaimed || 0;
  const daysPointed = bonusStatus?.daysPointed || 0;

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="flex-1 overflow-y-auto pb-24">

        <header className="flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-[#64B5F6] to-white">
          <Link href="/">
            <button className="p-1" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          </Link>
          <h1 className="text-gray-800 text-base font-semibold">Pointage</h1>
        </header>

        <div className="relative">
          <img
            src={elfStation}
            alt="ELF"
            className="w-full h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white" />

          <div className="absolute inset-0 flex flex-col items-end justify-center pr-8 gap-5">
            <div>
              <p className="text-gray-900 text-3xl font-black text-right">
                {currency} {totalBonusClaimed}
              </p>
              <p className="text-gray-600 text-sm text-right mt-1">Bonus cumule</p>
              <div className="h-px bg-gray-300 mt-3 w-48" />
            </div>

            <div>
              <p className="text-gray-900 text-3xl font-black text-right">
                {currency} 50
              </p>
              <p className="text-gray-600 text-sm text-right mt-1">Bonus quotidien</p>
              <div className="h-px bg-gray-300 mt-3 w-48" />
            </div>

            <div>
              <p className="text-gray-900 text-3xl font-black text-right">
                {daysPointed}
              </p>
              <p className="text-gray-600 text-sm text-right mt-1">Jours de pointage</p>
            </div>
          </div>
        </div>

        <div className="px-8 mt-6">
          {bonusStatus?.canClaim ? (
            <button
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
              className="w-full py-4 bg-[#2196F3] text-white font-bold text-lg rounded-full shadow-md shadow-blue-200 disabled:opacity-50"
              data-testid="button-pointer"
            >
              {claimMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Chargement...
                </span>
              ) : (
                "Pointer"
              )}
            </button>
          ) : (
            <button
              disabled
              className="w-full py-4 bg-gray-200 text-gray-500 font-bold text-lg rounded-full opacity-70"
              data-testid="button-pointer-disabled"
            >
              Revenir dans {bonusStatus?.hoursRemaining || 0}h
            </button>
          )}
        </div>

        <div className="px-8 mt-6 space-y-2">
          <p className="text-gray-500 text-sm">
            1. Recompense de connexion quotidienne : 50 {currency}
          </p>
          <p className="text-gray-500 text-sm">
            2. Connectez-vous une fois par jour.
          </p>
        </div>
      </div>
    </div>
  );
}
