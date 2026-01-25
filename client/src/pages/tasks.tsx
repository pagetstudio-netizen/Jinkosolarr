import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/countries";
import { Gift, Users, Check, Lock, Loader2 } from "lucide-react";
import type { Task } from "@shared/schema";

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

  return (
    <div className="flex flex-col min-h-full bg-white">
      <header className="bg-amber-500 px-4 py-4">
        <h1 className="text-xl font-bold text-white text-center">Centre de taches</h1>
      </header>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto pb-20">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))
        ) : tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <Card key={task.id} className={task.isCompleted ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      task.isCompleted 
                        ? "bg-green-500/20" 
                        : task.canClaim 
                          ? "bg-primary/20" 
                          : "bg-muted"
                    }`}>
                      {task.isCompleted ? (
                        <Check className="w-6 h-6 text-green-500" />
                      ) : (
                        <Users className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{task.name}</h3>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Progression: {task.currentInvites}/{task.requiredInvites}
                        </span>
                        <span className="text-xs font-medium text-primary">
                          +{formatCurrency(task.reward, user.country)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={task.isCompleted ? "secondary" : task.canClaim ? "default" : "outline"}
                    disabled={task.isCompleted || !task.canClaim || claimMutation.isPending}
                    onClick={() => claimMutation.mutate(task.id)}
                    data-testid={`button-claim-task-${task.id}`}
                  >
                    {claimMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : task.isCompleted ? (
                      "Réclamé"
                    ) : task.canClaim ? (
                      "Réclamer"
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune tâche disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}
