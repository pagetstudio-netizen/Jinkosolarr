import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getCountryByCode } from "@/lib/countries";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";

import elfStation from "@/assets/images/elf-station-1.jpg";

export default function CheckinPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: bonusStatus } = useQuery<{ canClaim: boolean; hoursRemaining: number }>({
    queryKey: ["/api/daily-bonus-status"],
    refetchInterval: 60000,
  });

  const { data: transactions } = useQuery<any[]>({
    queryKey: ["/api/transactions"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: "Bonus recu!", description: "50 FCFA ajoutes a votre solde" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  if (!user) return null;

  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";

  const bonusTransactions = transactions?.filter(
    (t: any) => t.type === "daily_bonus" || t.description?.includes("bonus")
  ) || [];
  const totalBonusClaimed = bonusTransactions.length * 50;
  const daysPointed = bonusTransactions.length;

  return (
    <div className="flex flex-col min-h-full bg-black">
      <div className="flex-1 overflow-y-auto pb-24">

        <header className="flex items-center gap-3 px-4 py-3 relative z-10">
          <Link href="/">
            <button className="p-1" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
          <h1 className="text-white text-base font-medium">Pointage</h1>
        </header>

        <div className="relative">
          <img
            src={elfStation}
            alt="ELF"
            className="w-full h-80 object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />

          <div className="absolute inset-0 flex flex-col items-end justify-center pr-8 gap-6">
            <div>
              <p className="text-white text-3xl font-black text-right">
                {currency} {totalBonusClaimed}
              </p>
              <p className="text-gray-300 text-sm text-right mt-1">Bonus cumule</p>
              <div className="h-px bg-gray-500 mt-3 w-48" />
            </div>

            <div>
              <p className="text-white text-3xl font-black text-right">
                {currency} 50
              </p>
              <p className="text-gray-300 text-sm text-right mt-1">Bonus quotidien</p>
              <div className="h-px bg-gray-500 mt-3 w-48" />
            </div>

            <div>
              <p className="text-white text-3xl font-black text-right">
                {daysPointed}
              </p>
              <p className="text-gray-300 text-sm text-right mt-1">Jours de pointage</p>
            </div>
          </div>
        </div>

        <div className="px-8 mt-8">
          {bonusStatus?.canClaim ? (
            <button
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
              className="w-full py-4 bg-[#2196F3] text-white font-bold text-lg rounded-full shadow-lg shadow-blue-500/30 disabled:opacity-50"
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
              className="w-full py-4 bg-gray-600 text-gray-300 font-bold text-lg rounded-full opacity-60"
              data-testid="button-pointer-disabled"
            >
              Revenir dans {bonusStatus?.hoursRemaining || 0}h
            </button>
          )}
        </div>

        <div className="px-8 mt-6 space-y-2">
          <p className="text-gray-400 text-sm">
            1. Recompense de connexion quotidienne : 50 {currency}
          </p>
          <p className="text-gray-400 text-sm">
            2. Connectez-vous une fois par jour.
          </p>
        </div>
      </div>
    </div>
  );
}
