import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getCountryByCode } from "@/lib/countries";
import { ChevronLeft, Loader2, Gift } from "lucide-react";
import { Link } from "wouter";
import type { Task } from "@shared/schema";
import tasksBanner from "@/assets/images/tasks-banner.webp";

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
      toast({ title: "Bonus quotidien!", description: "50 FCFA ont ete ajoutes a votre compte." });
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
      toast({ title: "Recompense reclamee!", description: "Le bonus a ete ajoute a votre compte." });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const claimAllRewards = async () => {
    const claimableTasks = tasks?.filter(t => t.canClaim && !t.isCompleted) || [];
    if (claimableTasks.length === 0) {
      toast({ title: "Aucune recompense", description: "Vous n'avez pas de recompenses a reclamer pour le moment.", variant: "destructive" });
      return;
    }
    for (const task of claimableTasks) {
      try {
        await claimMutation.mutateAsync(task.id);
      } catch (e) {
        // Continue with next task
      }
    }
  };

  if (!user) return null;

  const countryInfo = getCountryByCode(user.country);
  const currency = countryInfo?.currency || "FCFA";

  const totalTaskRewards = tasks?.filter(t => t.isCompleted).reduce((sum, t) => sum + t.reward, 0) || 0;

  return (
    <div className="flex flex-col min-h-full bg-white">
      <header className="flex items-center px-4 py-3 border-b bg-white">
        <Link href="/">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-orange-500" />
          </button>
        </Link>
        <h1 className="flex-1 text-center text-lg font-semibold text-orange-500 pr-6">Liste des taches</h1>
      </header>

      <div className="relative">
        <img src={tasksBanner} alt="Banner" className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="text-white">
            <p className="text-sm opacity-90">{currency}</p>
            <p className="text-3xl font-bold" data-testid="text-total-rewards">{totalTaskRewards.toFixed(0)}</p>
            <p className="text-sm opacity-90">Revenu total</p>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg ${
                dailyBonusStatus?.canClaim 
                  ? "bg-green-500 text-white" 
                  : "bg-gray-400 text-white"
              }`}
              data-testid="button-daily-bonus"
              onClick={() => dailyBonusStatus?.canClaim && claimDailyBonusMutation.mutate()}
              disabled={!dailyBonusStatus?.canClaim || claimDailyBonusMutation.isPending}
            >
              {claimDailyBonusMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Gift className="w-4 h-4" />
              )}
              {dailyBonusStatus?.canClaim ? "Bonus 50F" : "Bonus 50F"}
            </button>
            <button 
              className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
              data-testid="button-claim-rewards"
              onClick={claimAllRewards}
              disabled={claimMutation.isPending}
            >
              {claimMutation.isPending ? "Chargement..." : "Reclamez vos recompenses"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : tasks && tasks.length > 0 ? (
          <div className="divide-y">
            {tasks.map((task, index) => (
              <div 
                key={task.id} 
                className={`bg-white p-4 ${task.isCompleted ? "opacity-60" : ""}`}
                onClick={() => {
                  if (task.canClaim && !task.isCompleted && !claimMutation.isPending) {
                    claimMutation.mutate(task.id);
                  }
                }}
                data-testid={`task-item-${task.id}`}
              >
                <p className="text-gray-800 mb-2">
                  {index + 1}.Invitez {task.requiredInvites} personnes a recharger leur compte et recevez {task.reward} {currency}
                </p>
                <p className={`text-center font-semibold ${
                  task.isCompleted 
                    ? "text-green-500" 
                    : task.canClaim 
                      ? "text-orange-500" 
                      : "text-orange-500"
                }`}>
                  {task.isCompleted ? (
                    "Termine"
                  ) : claimMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    `${task.currentInvites}/${task.requiredInvites}`
                  )}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune tache disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}
