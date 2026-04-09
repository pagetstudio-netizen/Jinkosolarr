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
}

const DARK_BG = "#181818";
const CARD_BG = "#242424";
const CARD_DARK = "#111111";
const GREEN = "#3db51d";
const GREEN_DARK = "#2a8d13";

const textureBg = {
  backgroundColor: DARK_BG,
  backgroundImage: `
    repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 10px),
    repeating-linear-gradient(-45deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 10px)
  `,
} as React.CSSProperties;

export default function TeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: stats } = useQuery<TeamStats>({
    queryKey: ["/api/team/stats"],
  });

  if (!user) return null;

  const referralLink = `${window.location.origin}/rejoindre?money=${user.referralCode}`;
  const totalCommission = stats?.totalCommission || 0;
  const totalFilleuls =
    (stats?.level1Count || 0) + (stats?.level2Count || 0) + (stats?.level3Count || 0);

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

  const levels = [
    { num: 1, rate: "27%", count: stats?.level1Count || 0, commission: stats?.level1Commission || 0 },
    { num: 2, rate: "2%",  count: stats?.level2Count || 0, commission: stats?.level2Commission || 0 },
    { num: 3, rate: "1%",  count: stats?.level3Count || 0, commission: stats?.level3Commission || 0 },
  ];

  return (
    <div className="flex flex-col min-h-full" style={textureBg}>
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-5 space-y-4">

        {/* Agent button + subtitle */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <button
            className="w-full py-3 rounded-full font-bold text-white text-sm shadow-lg"
            style={{ background: "linear-gradient(90deg, #f97316 0%, #ea580c 100%)" }}
            data-testid="button-agent"
          >
            Postulez pour devenir agent maintenant
          </button>
          <p className="text-gray-400 text-xs text-center leading-snug">
            Profitez du partage des bénéfices de l'équipe + services exclusifs
          </p>
        </div>

        {/* Referral link card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {/* Top row */}
          <div className="flex items-start justify-between mb-2">
            <p className="text-gray-400 text-xs">Lien de partage</p>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-xs font-bold shadow"
              style={{ background: "#1a1a2e", whiteSpace: "nowrap" }}
              data-testid="button-copy-link"
            >
              <Copy size={12} />
              Copier
            </button>
          </div>

          {/* Bold text */}
          <p className="font-extrabold text-gray-900 text-[17px] leading-snug mb-2">
            Invitez vos amis pour gagner<br />de l'argent gratuit !
          </p>

          {/* Bottom row */}
          <div className="flex items-end justify-between">
            <p className="text-gray-400 text-xs truncate flex-1 mr-2" data-testid="text-referral-link">
              {referralLink}
            </p>
            <button
              onClick={shareLink}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-xs font-bold shadow flex-shrink-0"
              style={{ background: `linear-gradient(90deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` }}
              data-testid="button-share-link"
            >
              <Share2 size={12} />
              Partager
            </button>
          </div>
        </div>

        {/* Mon cashback */}
        <div>
          <h2 className="text-white font-bold text-base mb-3">Mon cashback</h2>

          <div className="grid grid-cols-2 gap-3">
            {/* Mes filleuls */}
            <div
              className="rounded-2xl p-4"
              style={{ background: CARD_BG }}
              data-testid="card-filleuls"
            >
              <div className="flex items-center gap-2 mb-3">
                <Users size={18} color={GREEN} />
                <span className="text-gray-300 text-xs font-semibold">Mes filleuls</span>
              </div>
              <p className="text-white text-3xl font-bold" data-testid="text-filleuls-count">
                {totalFilleuls}
              </p>
            </div>

            {/* Bonus de parrainage */}
            <div
              className="rounded-2xl p-4"
              style={{ background: CARD_BG }}
              data-testid="card-bonus"
            >
              <div className="flex items-center gap-2 mb-3">
                <Coins size={18} color={GREEN} />
                <span className="text-gray-300 text-xs font-semibold">Bonus de parrainage</span>
              </div>
              <p className="text-white text-3xl font-bold mb-3" data-testid="text-bonus-amount">
                {totalCommission.toFixed(0)}
              </p>
              <button
                onClick={() => navigate("/withdrawal")}
                className="px-4 py-1.5 rounded-full text-white text-xs font-bold"
                style={{ background: `linear-gradient(90deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` }}
                data-testid="button-retrait-bonus"
              >
                Retrait
              </button>
            </div>
          </div>
        </div>

        {/* Level cards — each as a separate block */}
        <div className="space-y-3">
          {levels.map((level) => (
            <div
              key={level.num}
              className="rounded-2xl overflow-hidden flex shadow-sm"
              style={{ background: "#2e2e2e" }}
              data-testid={`card-level-${level.num}`}
            >
              {/* Left dark block */}
              <div
                className="flex flex-col items-center justify-center px-5 py-5 min-w-[90px]"
                style={{ background: CARD_DARK }}
              >
                <span className="text-gray-400 text-[11px] font-medium mb-1">
                  Niveau {level.num}
                </span>
                <span
                  className="font-extrabold text-2xl"
                  style={{ color: GREEN }}
                >
                  {level.rate}
                </span>
              </div>

              {/* Right content */}
              <div className="flex-1 flex flex-col justify-center px-5 py-5 gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Filleuls</span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: GREEN }}
                    data-testid={`text-level${level.num}-count`}
                  >
                    {level.count}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Remboursement du dépôt</span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: GREEN }}
                    data-testid={`text-level${level.num}-commission`}
                  >
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
