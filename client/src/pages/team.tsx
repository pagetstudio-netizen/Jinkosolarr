import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/countries";
import { Users, Copy, Link, TrendingUp, User } from "lucide-react";

interface TeamStats {
  level1Count: number;
  level2Count: number;
  level3Count: number;
  totalCommission: number;
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

  const referralLink = `${window.location.origin}/invitation?reg=${user.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Lien copié!", description: "Partagez ce lien avec vos amis." });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast({ title: "Code copié!", description: "Partagez ce code avec vos amis." });
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      <header className="bg-secondary px-4 py-4">
        <h1 className="text-xl font-bold text-secondary-foreground text-center">Mon équipe</h1>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-20">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-foreground mb-2">Système de parrainage</h3>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <Badge className="mb-1">Niveau 1</Badge>
                  <p className="text-lg font-bold text-primary">27%</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="mb-1">Niveau 2</Badge>
                  <p className="text-lg font-bold text-foreground">2%</p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="mb-1">Niveau 3</Badge>
                  <p className="text-lg font-bold text-foreground">1%</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Votre code de parrainage</label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 bg-secondary rounded-md px-3 py-2 text-sm font-mono text-foreground">
                    {user.referralCode}
                  </div>
                  <Button size="icon" variant="secondary" onClick={copyCode} data-testid="button-copy-code">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Lien de parrainage</label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 bg-secondary rounded-md px-3 py-2 text-xs font-mono text-foreground truncate">
                    {referralLink}
                  </div>
                  <Button size="icon" variant="secondary" onClick={copyLink} data-testid="button-copy-link">
                    <Link className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-lg" />
        ) : stats ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Total des commissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary" data-testid="text-total-commission">
                  {formatCurrency(stats.totalCommission, user.country)}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Niveau 1</p>
                  <p className="text-xl font-bold text-foreground">{stats.level1Count}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.level1Invested} investis
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
                    <Users className="w-5 h-5 text-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Niveau 2</p>
                  <p className="text-xl font-bold text-foreground">{stats.level2Count}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.level2Invested} investis
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Niveau 3</p>
                  <p className="text-xl font-bold text-foreground">{stats.level3Count}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.level3Invested} investis
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Invitez vos amis pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}
