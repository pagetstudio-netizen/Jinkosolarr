import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, getCountryByCode } from "@/lib/countries";
import { Copy, Users } from "lucide-react";

interface TeamStats {
  level1Count: number;
  level2Count: number;
  level3Count: number;
  totalCommission: number;
  level1Commission: number;
  level2Commission: number;
  level3Commission: number;
  level1Invested: number;
  level2Invested: number;
  level3Invested: number;
}

export default function TeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery<TeamStats>({
    queryKey: ["/api/team/stats"],
  });

  if (!user) return null;

  const countryInfo = getCountryByCode(user.country);
  const currency = countryInfo?.currency || "FCFA";
  const referralLink = `${window.location.origin}/invitation?reg=${user.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Lien copie!", description: "Partagez ce lien avec vos amis." });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast({ title: "Code copie!", description: "Partagez ce code avec vos amis." });
  };

  const totalPeople = (stats?.level1Count || 0) + (stats?.level2Count || 0) + (stats?.level3Count || 0);

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="text-center py-4 border-b">
          <p className="text-gray-600">— Centre de promotion —</p>
        </div>

        <div className="bg-gradient-to-r from-gray-800 to-gray-700 mx-4 mt-4 rounded-xl p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-3xl font-bold" data-testid="text-total-commission">
                {(stats?.totalCommission || 0).toFixed(2)}
              </p>
              <p className="text-sm opacity-80">Commission cumulee({currency})</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold" data-testid="text-total-people">
                {totalPeople}
              </p>
              <p className="text-sm opacity-80">Personnes promues</p>
            </div>
          </div>
        </div>

        <div className="mx-4 mt-4 flex gap-3">
          <div className="flex-1 bg-gray-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800" data-testid="text-referral-code">{user.referralCode}</p>
              <p className="text-xs text-gray-500">Code d'invitation</p>
              <button onClick={copyCode} className="text-red-500 text-xs font-medium" data-testid="button-copy-code">
                « Copier »
              </button>
            </div>
          </div>
          <div className="flex-1 bg-gray-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Copy className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 truncate text-sm">https://ww...</p>
              <p className="text-xs text-gray-500">Lien d'invitation</p>
              <button onClick={copyLink} className="text-red-500 text-xs font-medium" data-testid="button-copy-link">
                « Copier »
              </button>
            </div>
          </div>
        </div>

        <div className="mx-4 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-red-500 rounded-full"></div>
            <h2 className="font-semibold text-gray-800">Infos de l'equipe</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 relative">
              <div className="absolute -top-3 left-4">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'%3E%3Ctext x='0' y='30' font-size='24' fill='%23FFD700'%3E1st%3C/text%3E%3C/svg%3E" alt="1st" className="h-8" />
              </div>
              <div className="text-right mb-2">
                <span className="text-sm text-gray-600">Taux de commission </span>
                <span className="text-red-500 font-bold">27%</span>
              </div>
              <div className="flex items-center">
                <div className="w-24">
                  <p className="text-amber-600 font-semibold text-sm">Premier</p>
                  <p className="text-amber-600 font-semibold text-sm">niveau</p>
                </div>
                <div className="flex-1 text-center border-l border-gray-200 px-4">
                  <p className="text-xl font-bold text-gray-800" data-testid="text-level1-commission">
                    {(stats?.level1Commission || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Commission cumulee</p>
                </div>
                <div className="flex-1 text-center border-l border-gray-200 px-4">
                  <p className="text-xl font-bold text-gray-800" data-testid="text-level1-count">
                    {stats?.level1Count || 0}
                  </p>
                  <p className="text-xs text-gray-500">Personnes cumulees</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 relative">
              <div className="absolute -top-3 left-4">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'%3E%3Ctext x='0' y='30' font-size='24' fill='%23C0C0C0'%3E2nd%3C/text%3E%3C/svg%3E" alt="2nd" className="h-8" />
              </div>
              <div className="text-right mb-2">
                <span className="text-sm text-gray-600">Taux de commission </span>
                <span className="text-red-500 font-bold">2%</span>
              </div>
              <div className="flex items-center">
                <div className="w-24">
                  <p className="text-gray-500 font-semibold text-sm">Deuxieme</p>
                  <p className="text-gray-500 font-semibold text-sm">niveau</p>
                </div>
                <div className="flex-1 text-center border-l border-gray-200 px-4">
                  <p className="text-xl font-bold text-gray-800" data-testid="text-level2-commission">
                    {(stats?.level2Commission || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Commission cumulee</p>
                </div>
                <div className="flex-1 text-center border-l border-gray-200 px-4">
                  <p className="text-xl font-bold text-gray-800" data-testid="text-level2-count">
                    {stats?.level2Count || 0}
                  </p>
                  <p className="text-xs text-gray-500">Personnes cumulees</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 relative">
              <div className="absolute -top-3 left-4">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'%3E%3Ctext x='0' y='30' font-size='24' fill='%23CD7F32'%3E3rd%3C/text%3E%3C/svg%3E" alt="3rd" className="h-8" />
              </div>
              <div className="text-right mb-2">
                <span className="text-sm text-gray-600">Taux de commission </span>
                <span className="text-red-500 font-bold">1%</span>
              </div>
              <div className="flex items-center">
                <div className="w-24">
                  <p className="text-amber-700 font-semibold text-sm">Troisieme</p>
                  <p className="text-amber-700 font-semibold text-sm">niveau</p>
                </div>
                <div className="flex-1 text-center border-l border-gray-200 px-4">
                  <p className="text-xl font-bold text-gray-800" data-testid="text-level3-commission">
                    {(stats?.level3Commission || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Commission cumulee</p>
                </div>
                <div className="flex-1 text-center border-l border-gray-200 px-4">
                  <p className="text-xl font-bold text-gray-800" data-testid="text-level3-count">
                    {stats?.level3Count || 0}
                  </p>
                  <p className="text-xs text-gray-500">Personnes cumulees</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-4 mt-6 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-red-500 rounded-full"></div>
            <h2 className="font-semibold text-gray-800">Description des commissions d'equipe</h2>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Regles du parrainage !</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Si vous recherchez une source de revenus plus stable, vous pouvez inviter vos amis a s'inscrire et gagner des commissions de parrainage. 
              Lorsque vos amis s'inscrivent et effectuent leur premier investissement, vous recevez immediatement <span className="font-bold text-red-500">27%</span> de commission sur cet investissement.
              Pour les membres de niveau 2, vous recevez <span className="font-bold text-red-500">2%</span>, et pour le niveau 3, <span className="font-bold text-red-500">1%</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
