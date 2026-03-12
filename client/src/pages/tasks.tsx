import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getCountryByCode } from "@/lib/countries";
import { ChevronLeft, Loader2, Gift, Users, Trophy, CheckCircle2, Clock } from "lucide-react";
import { Link } from "wouter";
import type { Task } from "@shared/schema";
import wendysImg from "@assets/PWeaver-FF-240519-10jpg-JS903570773_1773317315694.webp";
import wendysLogo from "@assets/wendys_logo.png";

interface DailyBonusStatus {
  canClaim: boolean;
  nextClaimTime: string | null;
  bonusAmount: number;
}

interface TaskWithStatus extends Task {
  isCompleted: boolean;
  canClaim: boolean;
  currentInvites: number;
}

const TIER_LABELS = [
  "Parrain Bronze",
  "Parrain Argent",
  "Parrain Or",
  "Parrain Platine",
  "Parrain Diamant",
  "Parrain Elite",
];

const TIER_COLORS = [
  { bg: "from-amber-700 to-amber-500", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  { bg: "from-gray-400 to-gray-300", badge: "bg-gray-100 text-gray-700", dot: "bg-gray-400" },
  { bg: "from-yellow-500 to-yellow-400", badge: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-500" },
  { bg: "from-cyan-500 to-cyan-400", badge: "bg-cyan-100 text-cyan-800", dot: "bg-cyan-500" },
  { bg: "from-blue-600 to-blue-400", badge: "bg-blue-100 text-blue-800", dot: "bg-blue-600" },
  { bg: "from-purple-600 to-purple-400", badge: "bg-purple-100 text-purple-800", dot: "bg-purple-600" },
];

export default function TasksPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const { data: tasks, isLoading } = useQuery<TaskWithStatus[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: dailyBonusStatus } = useQuery<DailyBonusStatus>({
    queryKey: ["/api/daily-bonus-status"],
  });

  const claimDailyBonusMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/claim-daily-bonus", {});
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-bonus-status"] });
      refreshUser();
      toast({ title: "Bonus quotidien!", description: "50 FCFA ont été ajoutés à votre compte." });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const claimMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/claim`, {});
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      refreshUser();
      toast({ title: "Récompense réclamée!", description: "Le bonus a été ajouté à votre compte." });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  if (!user) return null;

  const countryInfo = getCountryByCode(user.country);
  const currency = countryInfo?.currency || "FCFA";
  const totalTaskRewards = tasks?.filter(t => t.isCompleted).reduce((sum, t) => sum + t.reward, 0) || 0;
  const completedCount = tasks?.filter(t => t.isCompleted).length || 0;
  const claimableCount = tasks?.filter(t => t.canClaim && !t.isCompleted).length || 0;

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={wendysImg}
          alt="Wendy's"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#c8102e]/70 via-[#c8102e]/50 to-[#a00d25]/80" />

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center px-4 pt-4">
          <Link href="/">
            <button className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center" data-testid="button-back">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
          <div className="flex-1 flex justify-center">
            <img src={wendysLogo} alt="Wendy's" className="h-8 object-contain" />
          </div>
          <div className="w-9" />
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-white text-xl font-bold mb-1">Programme de Parrainage</h1>
          <p className="text-white/80 text-xs">Invitez des amis et gagnez des récompenses</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mx-4 -mt-5 z-10 relative">
        <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center justify-between">
          <div className="flex-1 text-center border-r border-gray-100">
            <p className="text-[#c8102e] text-xl font-bold" data-testid="text-total-rewards">
              {totalTaskRewards.toLocaleString()}
            </p>
            <p className="text-gray-500 text-[11px] mt-0.5">{currency} gagnés</p>
          </div>
          <div className="flex-1 text-center border-r border-gray-100">
            <p className="text-[#c8102e] text-xl font-bold">{completedCount}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">Tâches terminées</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-[#c8102e] text-xl font-bold">{claimableCount}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">À réclamer</p>
          </div>
        </div>
      </div>

      {/* Daily Bonus Card */}
      <div className="mx-4 mt-3">
        <div className="bg-gradient-to-r from-[#c8102e] to-[#a00d25] rounded-2xl p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Bonus quotidien</p>
              <p className="text-white/70 text-xs">
                {dailyBonusStatus?.canClaim
                  ? "Disponible maintenant !"
                  : "Revient demain"}
              </p>
            </div>
          </div>
          <button
            onClick={() => dailyBonusStatus?.canClaim && claimDailyBonusMutation.mutate()}
            disabled={!dailyBonusStatus?.canClaim || claimDailyBonusMutation.isPending}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              dailyBonusStatus?.canClaim
                ? "bg-white text-[#c8102e] shadow-sm active:scale-95"
                : "bg-white/20 text-white/60 cursor-not-allowed"
            }`}
            data-testid="button-daily-bonus"
          >
            {claimDailyBonusMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              dailyBonusStatus?.canClaim ? "+ 50 F" : <Clock className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="mx-4 mt-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#c8102e]" />
            <h2 className="text-gray-800 font-bold text-sm">Paliers de parrainage</h2>
          </div>
          {claimableCount > 0 && (
            <button
              onClick={async () => {
                const claimable = tasks?.filter(t => t.canClaim && !t.isCompleted) || [];
                for (const task of claimable) {
                  try { await claimMutation.mutateAsync(task.id); } catch {}
                }
              }}
              disabled={claimMutation.isPending}
              className="text-xs text-[#c8102e] font-semibold bg-red-50 px-3 py-1.5 rounded-full"
              data-testid="button-claim-rewards"
            >
              Tout réclamer ({claimableCount})
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task, index) => {
              const tier = TIER_COLORS[index] || TIER_COLORS[0];
              const label = TIER_LABELS[index] || `Palier ${index + 1}`;
              const progress = Math.min((task.currentInvites / task.requiredInvites) * 100, 100);

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border ${
                    task.isCompleted ? "border-green-200" : task.canClaim ? "border-[#c8102e]/30" : "border-gray-100"
                  }`}
                  data-testid={`task-item-${task.id}`}
                >
                  {/* Tier Header */}
                  <div className={`bg-gradient-to-r ${tier.bg} px-4 py-2 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-white" />
                      <span className="text-white font-bold text-sm">{label}</span>
                    </div>
                    {task.isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Task Body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-gray-700 text-sm">
                          Inviter <span className="font-bold text-gray-900">{task.requiredInvites}</span> personnes à recharger
                        </p>
                        <p className="text-[#c8102e] font-bold text-lg mt-0.5">
                          {task.reward.toLocaleString()} {currency}
                        </p>
                      </div>

                      {/* Claim / Status Button */}
                      {task.isCompleted ? (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                          Complété
                        </span>
                      ) : task.canClaim ? (
                        <button
                          onClick={() => !claimMutation.isPending && claimMutation.mutate(task.id)}
                          disabled={claimMutation.isPending}
                          className="bg-[#c8102e] text-white text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-transform shadow-sm"
                          data-testid={`button-claim-${task.id}`}
                        >
                          {claimMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Réclamer"}
                        </button>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-full">
                          En cours
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-gray-500 text-xs">{task.currentInvites} / {task.requiredInvites} invitations</span>
                        <span className="text-gray-500 text-xs font-medium">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            task.isCompleted ? "bg-green-500" : "bg-[#c8102e]"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune tâche disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}
