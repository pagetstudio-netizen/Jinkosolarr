import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCountryByCode } from "@/lib/countries";
import { Copy, Users, Gift } from "lucide-react";
import { Link } from "wouter";
import elfTeam from "@/assets/images/elf-team-wide.png";

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

  const { data: stats } = useQuery<TeamStats>({
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
  const totalRevenue = (stats?.totalCommission || 0);

  const levels = [
    { num: 1, rate: "27%", count: stats?.level1Count || 0, bonus: stats?.level1Commission || 0 },
    { num: 2, rate: "2%", count: stats?.level2Count || 0, bonus: stats?.level2Commission || 0 },
    { num: 3, rate: "1%", count: stats?.level3Count || 0, bonus: stats?.level3Commission || 0 },
  ];

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="bg-gradient-to-b from-blue-400 to-blue-300 px-4 pt-4 pb-0 relative">
          <h1 className="text-white font-bold text-lg mb-3">L'equipe</h1>
          <div className="rounded-t-2xl overflow-hidden">
            <img src={elfTeam} alt="Team" className="w-full h-32 object-cover" />
          </div>
        </div>

        <div className="bg-white mx-0 px-4 pt-3 pb-4">
          <div className="bg-blue-50/80 rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-base" data-testid="text-referral-code">{user.referralCode}</p>
                <p className="text-xs text-gray-500">Code d'invitation</p>
              </div>
              <Button 
                onClick={copyCode} 
                size="sm"
                className="rounded-full"
                data-testid="button-copy-code"
              >
                Copier
              </Button>
            </div>
          </div>

          <div className="bg-blue-50/80 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-700 text-sm truncate pr-3" data-testid="text-referral-link">
                  {referralLink}
                </p>
                <p className="text-xs text-gray-500">Liens d'invitation</p>
              </div>
              <Button 
                onClick={copyLink} 
                size="sm"
                className="rounded-full shrink-0"
                data-testid="button-copy-link"
              >
                Copier
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              <h2 className="font-semibold text-gray-800 text-sm">Mon equipe</h2>
            </div>
            <Link href="/team-details">
              <span className="text-xs text-blue-500 font-medium" data-testid="link-team-details">
                Details de l'equipe &gt;
              </span>
            </Link>
          </div>

          <div className="space-y-0">
            {levels.map((level) => (
              <div key={level.num} className="flex items-center py-3 border-b border-gray-100 last:border-0">
                <div className="w-10 text-center">
                  <span className="text-2xl font-bold text-gray-800">{level.num}</span>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xs text-gray-800 font-semibold">{level.rate}</p>
                  <p className="text-[10px] text-gray-400">Taux de commission</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-base font-bold text-gray-800" data-testid={`text-level${level.num}-count`}>
                    {level.count}
                  </p>
                  <p className="text-[10px] text-gray-400">Quantite valide</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-base font-bold text-gray-800" data-testid={`text-level${level.num}-bonus`}>
                    {level.bonus.toFixed(0)}
                  </p>
                  <p className="text-[10px] text-gray-400">Bonus</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800" data-testid="text-total-people">{totalPeople}</p>
                <p className="text-[10px] text-gray-400 leading-tight">Nombre total de personnes</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Gift className="w-4 h-4 text-[#2196F3]" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800" data-testid="text-total-revenue">{currency}{totalRevenue.toFixed(0)}</p>
                <p className="text-[10px] text-gray-400 leading-tight">Revenu total</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              <h2 className="font-semibold text-gray-800 text-sm">Prix invitation</h2>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Invitez vos amis a s'inscrire et gagner des commissions.
                Niveau 1: <span className="font-bold text-blue-500">27%</span> de commission, 
                Niveau 2: <span className="font-bold text-blue-500">2%</span>, 
                Niveau 3: <span className="font-bold text-blue-500">1%</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
