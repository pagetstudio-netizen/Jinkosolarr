import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getCountryByCode } from "@/lib/countries";
import { Copy, Share2, Users, Coins } from "lucide-react";
import { useLocation } from "wouter";

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
  const [, navigate] = useLocation();

  const { data: stats } = useQuery<TeamStats>({
    queryKey: ["/api/team/stats"],
  });

  if (!user) return null;

  const countryInfo = getCountryByCode(user.country);
  const currency = countryInfo?.currency || "FCFA";
  const referralLink = `${window.location.origin}/rejoindre?money=${user.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Lien copié !" });
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({ title: "Rejoins Jinko Solar", url: referralLink });
    } else {
      navigator.clipboard.writeText(referralLink);
      toast({ title: "Lien copié !" });
    }
  };

  const totalCommission = stats?.totalCommission || 0;

  const levels = [
    { num: 1, rate: "27%", count: stats?.level1Count || 0, commission: stats?.level1Commission || 0 },
    { num: 2, rate: "2%",  count: stats?.level2Count || 0, commission: stats?.level2Commission || 0 },
    { num: 3, rate: "1%",  count: stats?.level3Count || 0, commission: stats?.level3Commission || 0 },
  ];

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#1c1c2e" }}>
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-5 space-y-4">

        {/* Agent button */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            className="w-full py-3 rounded-full font-bold text-white text-sm shadow-lg"
            style={{ background: "linear-gradient(90deg, #f97316 0%, #ea580c 100%)" }}
            data-testid="button-agent"
          >
            Postulez pour devenir agent maintenant
          </button>
          <p className="text-gray-400 text-xs text-center px-4 leading-snug">
            Profitez du partage des bénéfices de l'équipe + services exclusifs
          </p>
        </div>

        {/* Referral link card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-400 text-xs mb-1">Lien de partage</p>
          <p className="font-extrabold text-gray-900 text-base leading-snug mb-1">
            Invitez vos amis pour gagner<br />de l'argent gratuit !
          </p>
          <p className="text-gray-400 text-xs mb-3 truncate" data-testid="text-referral-link">
            {referralLink}
          </p>
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-white text-xs"
              style={{ background: "#1a1a2e" }}
              data-testid="button-copy-link"
            >
              <Copy size={13} />
              Copier
            </button>
            <button
              onClick={shareLink}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-gray-900 text-xs"
              style={{ background: "#f59e0b" }}
              data-testid="button-share-link"
            >
              <Share2 size={13} />
              Partager
            </button>
          </div>
        </div>

        {/* Mon cashback */}
        <div>
          <h2 className="text-white font-bold text-base mb-2">Mon cashback</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Mes filleuls */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "#2a2a3e" }}
              data-testid="card-filleuls"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} color="#f59e0b" />
                <span className="text-gray-300 text-xs font-medium">Mes filleuls</span>
              </div>
              <p className="text-white text-2xl font-bold" data-testid="text-filleuls-count">
                {(stats?.level1Count || 0) + (stats?.level2Count || 0) + (stats?.level3Count || 0)}
              </p>
            </div>

            {/* Bonus de parrainage */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "#2a2a3e" }}
              data-testid="card-bonus"
            >
              <div className="flex items-center gap-2 mb-2">
                <Coins size={16} color="#f59e0b" />
                <span className="text-gray-300 text-xs font-medium">Bonus de parrainage</span>
              </div>
              <p className="text-white text-2xl font-bold mb-2" data-testid="text-bonus-amount">
                {totalCommission.toFixed(0)}
              </p>
              <button
                onClick={() => navigate("/withdrawal")}
                className="px-3 py-1 rounded-full text-gray-900 text-xs font-bold"
                style={{ background: "#f59e0b" }}
                data-testid="button-retrait-bonus"
              >
                Retrait
              </button>
            </div>
          </div>
        </div>

        {/* Level cards */}
        <div className="space-y-2">
          {levels.map((level) => (
            <div
              key={level.num}
              className="rounded-2xl overflow-hidden flex"
              style={{ background: "#2a2a3e" }}
              data-testid={`card-level-${level.num}`}
            >
              {/* Left: level + rate */}
              <div
                className="flex flex-col items-center justify-center px-4 py-4 min-w-[80px]"
                style={{ background: "#1a1a2e" }}
              >
                <span className="text-gray-400 text-xs font-medium mb-0.5">Niveau {level.num}</span>
                <span className="font-extrabold text-lg" style={{ color: "#f59e0b" }}>
                  {level.rate}
                </span>
              </div>

              {/* Right: stats */}
              <div className="flex-1 flex flex-col justify-center px-4 py-4 gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Filleuls</span>
                  <span className="text-white text-xs font-bold" data-testid={`text-level${level.num}-count`}>
                    {level.count}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Remboursement du dépôt</span>
                  <span className="text-white text-xs font-bold" data-testid={`text-level${level.num}-commission`}>
                    {level.commission.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
