import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, getCountryByCode } from "@/lib/countries";
import { ArrowLeft, Copy, Share2 } from "lucide-react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [showShareDialog, setShowShareDialog] = useState(false);

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
    <div className="flex flex-col min-h-full bg-[#fdf5f0]">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">Mon equipe</h1>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto pb-24">
        <div className="bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400 rounded-xl p-4 text-white">
          <div className="flex justify-center mb-3">
            <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-semibold">
              LV1
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold">35%</p>
              <p className="text-xs opacity-80">Taux de commission</p>
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-level1-count">
                {stats?.level1Count || 0}
              </p>
              <p className="text-xs opacity-80">Utilisateur valide</p>
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-level1-commission">
                {stats?.level1Commission || 0}
              </p>
              <p className="text-xs opacity-80">Commission</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 via-purple-400 to-violet-400 rounded-xl p-4 text-white">
          <div className="flex justify-center mb-3">
            <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-semibold">
              LV2
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold">2%</p>
              <p className="text-xs opacity-80">Taux de commission</p>
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-level2-count">
                {stats?.level2Count || 0}
              </p>
              <p className="text-xs opacity-80">Utilisateur valide</p>
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-level2-commission">
                {stats?.level2Commission || 0}
              </p>
              <p className="text-xs opacity-80">Commission</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300 rounded-xl p-4 text-white">
          <div className="flex justify-center mb-3">
            <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-semibold">
              LV3
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold">1%</p>
              <p className="text-xs opacity-80">Taux de commission</p>
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-level3-count">
                {stats?.level3Count || 0}
              </p>
              <p className="text-xs opacity-80">Utilisateur valide</p>
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-level3-commission">
                {stats?.level3Commission || 0}
              </p>
              <p className="text-xs opacity-80">Commission</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-xl p-5 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-90">Mes revenus</p>
            <p className="text-3xl font-bold mt-1" data-testid="text-total-commission">
              {stats?.totalCommission || 0}
            </p>
            <p className="text-sm font-medium opacity-90 mt-4">Nombre de personnes</p>
            <p className="text-3xl font-bold mt-1" data-testid="text-total-people">
              {totalPeople}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Cadeau d'invitation</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            Lorsque vos amis s'inscrivent et effectuent leur investissement, vous recevez immediatement <span className="font-bold">35 % de cashback</span>.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Lorsque les membres de votre equipe de niveau 2 investissent, vous recevez <span className="font-bold">2 % de cashback</span>.
          </p>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-[#fdf5f0] z-10">
        <button
          onClick={() => setShowShareDialog(true)}
          className="w-full py-4 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-semibold rounded-xl text-lg"
          data-testid="button-add-member"
        >
          Ajouter
        </button>
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Inviter des amis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre code de parrainage
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3 font-mono text-center text-lg font-bold">
                  {user.referralCode}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyCode}
                  className="h-12 w-12"
                  data-testid="button-copy-code"
                >
                  <Copy className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lien d'invitation
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-100 rounded-lg px-3 py-3 text-xs text-gray-600 truncate">
                  {referralLink}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyLink}
                  className="h-12 w-12"
                  data-testid="button-copy-link"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <p className="text-xs text-center text-gray-500">
              Partagez ce lien ou code avec vos amis pour les inviter
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
