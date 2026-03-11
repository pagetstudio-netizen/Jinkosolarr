import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getCountryByCode } from "@/lib/countries";
import { ChevronLeft, Copy } from "lucide-react";
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
  const referralLink = `${window.location.origin}/invitation?reg=${user.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Lien copié!", description: "Partagez ce lien avec vos amis." });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast({ title: "Code copié!", description: "Partagez ce code avec vos amis." });
  };

  const totalPeople = (stats?.level1Count || 0) + (stats?.level2Count || 0) + (stats?.level3Count || 0);
  const totalCommission = stats?.totalCommission || 0;

  const levels = [
    { num: 1, label: "LV1", rate: "27%", count: stats?.level1Count || 0, commission: stats?.level1Commission || 0 },
    { num: 2, label: "LV2", rate: "2%",  count: stats?.level2Count || 0, commission: stats?.level2Commission || 0 },
    { num: 3, label: "LV3", rate: "1%",  count: stats?.level3Count || 0, commission: stats?.level3Commission || 0 },
  ];

  return (
    <div className="flex flex-col min-h-full bg-gray-100">
      <div className="flex items-center px-4 py-3 bg-white shadow-sm">
        <button onClick={() => navigate("/")} className="mr-3 text-gray-600" data-testid="button-back">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-semibold text-gray-800 flex-1 text-center pr-6">
          Invitations &amp; Récompenses
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm px-4 py-4 flex justify-around">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800" data-testid="text-total-invited">{totalPeople}</p>
            <p className="text-xs text-gray-500 mt-1">Nombre d'invités</p>
          </div>
          <div className="w-px bg-gray-200" />
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800" data-testid="text-total-commission">{totalCommission.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1">Commission gagner</p>
          </div>
        </div>

        <div className="rounded-2xl shadow-sm p-4" style={{ background: "linear-gradient(135deg, #c8102e 0%, #a00d25 100%)" }}>
          <h2 className="text-white font-bold text-base mb-1">Inviter des amis</h2>
          <p className="text-white/80 text-xs mb-3 leading-relaxed">
            Invitez plus d'utilisateurs et vous pourrez profiter de récompenses d'invitation plus généreuses et d'autres récompenses
          </p>

          <div className="border-t border-white/25 pt-3 pb-3 flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-3">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Copy className="w-3 h-3 text-white/60 flex-shrink-0" />
                <span className="text-white/70 text-xs">Code d'invitation</span>
              </div>
              <p className="text-white font-semibold text-sm" data-testid="text-referral-code">{user.referralCode}</p>
            </div>
            <button
              onClick={copyCode}
              className="bg-white rounded-full px-4 py-1.5 text-xs font-semibold shrink-0"
              style={{ color: "#c8102e" }}
              data-testid="button-copy-code"
            >
              Copier
            </button>
          </div>

          <div className="border-t border-white/25 pt-3 flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-3">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Copy className="w-3 h-3 text-white/60 flex-shrink-0" />
                <span className="text-white/70 text-xs">Lien d'invitation</span>
              </div>
              <p className="text-white/90 text-xs truncate" data-testid="text-referral-link">{referralLink}</p>
            </div>
            <button
              onClick={copyLink}
              className="bg-white rounded-full px-4 py-1.5 text-xs font-semibold shrink-0"
              style={{ color: "#c8102e" }}
              data-testid="button-copy-link"
            >
              Copier
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {levels.map((level) => (
            <div key={level.num} className="bg-white rounded-2xl shadow-sm overflow-hidden" data-testid={`card-level-${level.num}`}>
              <div className="flex justify-center py-2">
                <span
                  className="px-5 py-1 rounded-full text-white text-sm font-bold"
                  style={{ background: "#c8102e" }}
                >
                  {level.label}
                </span>
              </div>
              <div className="flex justify-around pb-4 pt-1">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800">{level.rate}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Taux de commission</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800" data-testid={`text-level${level.num}-count`}>{level.count}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Utilisateur valide</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800" data-testid={`text-level${level.num}-commission`}>{level.commission.toFixed(0)}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Commission</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-800 text-base mb-3">Cadeau de parrainage</h2>
          <div className="text-sm text-gray-600 leading-relaxed space-y-2">
            <p>
              Lorsque vos amis invités s'inscrivent et finalisent leur investissement, vous recevez immédiatement <span className="font-semibold text-[#c8102e]">27%</span> de remise en argent.
            </p>
            <p>
              Lorsque les membres de votre équipe de niveau 2 investissent, vous recevez <span className="font-semibold text-[#c8102e]">2%</span> de remise en argent.
            </p>
            <p>
              Lorsque les membres de votre équipe de niveau 3 investissent, vous recevez <span className="font-semibold text-[#c8102e]">1%</span> de remise en argent.
            </p>
            <p>
              Une fois que les membres de votre équipe investissent, la récompense en espèces est immédiatement versée sur votre compte.
            </p>
            <p>
              Par exemple : si votre ami invité investit 3 000 {currency} pour la première fois, vous recevez immédiatement une récompense en espèces de 810 {currency}. La récompense est directement retirable !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
