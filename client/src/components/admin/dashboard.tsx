import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, ArrowDownToLine, ArrowUpFromLine, ShoppingCart, Wallet, Clock, TrendingUp, Award, Calendar } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  todayUsers: number;
  periodUsers: number;
  totalDeposits: number;
  todayDeposits: number;
  periodDeposits: number;
  pendingDeposits: number;
  pendingDepositsCount: number;
  totalWithdrawals: number;
  todayWithdrawals: number;
  periodWithdrawals: number;
  pendingWithdrawals: number;
  pendingWithdrawalsCount: number;
  usersWithProducts: number;
  totalBalance: number;
  totalEarnings: number;
  totalActiveProducts: number;
  totalCommissions: number;
}

export default function AdminDashboard() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedDates, setAppliedDates] = useState<{start: string, end: string}>({start: "", end: ""});

  const queryParams = new URLSearchParams();
  if (appliedDates.start) queryParams.append("startDate", appliedDates.start);
  if (appliedDates.end) queryParams.append("endDate", appliedDates.end);
  const queryString = queryParams.toString();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats", queryString],
    queryFn: async () => {
      const url = queryString ? `/api/admin/stats?${queryString}` : "/api/admin/stats";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const applyDateFilter = () => {
    setAppliedDates({ start: startDate, end: endDate });
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setAppliedDates({ start: "", end: "" });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const mainStats = [
    {
      title: "Utilisateurs totaux",
      value: stats.totalUsers,
      subtitle: `+${stats.todayUsers} aujourd'hui`,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/20",
    },
    {
      title: "Investisseurs actifs",
      value: stats.usersWithProducts,
      subtitle: `${stats.totalActiveProducts} produits actifs`,
      icon: ShoppingCart,
      color: "text-purple-500",
      bg: "bg-purple-500/20",
    },
  ];

  const depositStats = [
    {
      title: "Total depots approuves",
      value: `${stats.totalDeposits.toLocaleString()} F`,
      subtitle: `+${stats.todayDeposits.toLocaleString()} F aujourd'hui`,
      icon: ArrowDownToLine,
      color: "text-green-500",
      bg: "bg-green-500/20",
    },
    {
      title: "Depots en attente",
      value: `${stats.pendingDeposits.toLocaleString()} F`,
      subtitle: `${stats.pendingDepositsCount} demande(s)`,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-500/20",
    },
  ];

  const withdrawalStats = [
    {
      title: "Total retraits approuves",
      value: `${stats.totalWithdrawals.toLocaleString()} F`,
      subtitle: `+${stats.todayWithdrawals.toLocaleString()} F aujourd'hui`,
      icon: ArrowUpFromLine,
      color: "text-red-500",
      bg: "bg-red-500/20",
    },
    {
      title: "Retraits en attente",
      value: `${stats.pendingWithdrawals.toLocaleString()} F`,
      subtitle: `${stats.pendingWithdrawalsCount} demande(s)`,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/20",
    },
  ];

  const financialStats = [
    {
      title: "Solde total plateforme",
      value: `${stats.totalBalance.toLocaleString()} F`,
      subtitle: "Tous les utilisateurs",
      icon: Wallet,
      color: "text-primary",
      bg: "bg-primary/20",
    },
    {
      title: "Gains totaux distribues",
      value: `${stats.totalEarnings.toLocaleString()} F`,
      subtitle: "Depuis le debut",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/20",
    },
    {
      title: "Commissions versees",
      value: `${stats.totalCommissions.toLocaleString()} F`,
      subtitle: "Parrainages",
      icon: Award,
      color: "text-indigo-500",
      bg: "bg-indigo-500/20",
    },
  ];

  const periodStats = appliedDates.start || appliedDates.end ? [
    {
      title: "Utilisateurs (periode)",
      value: stats.periodUsers,
      subtitle: `Du ${appliedDates.start || "debut"} au ${appliedDates.end || "aujourd'hui"}`,
      icon: Users,
      color: "text-cyan-500",
      bg: "bg-cyan-500/20",
    },
    {
      title: "Depots (periode)",
      value: `${stats.periodDeposits.toLocaleString()} F`,
      subtitle: "Approuves sur la periode",
      icon: ArrowDownToLine,
      color: "text-green-600",
      bg: "bg-green-600/20",
    },
    {
      title: "Retraits (periode)",
      value: `${stats.periodWithdrawals.toLocaleString()} F`,
      subtitle: "Approuves sur la periode",
      icon: ArrowUpFromLine,
      color: "text-red-600",
      bg: "bg-red-600/20",
    },
  ] : [];

  const StatCard = ({ stat, className = "" }: { stat: { title: string; value: string | number; subtitle: string; icon: any; color: string; bg: string }, className?: string }) => (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{stat.title}</p>
            <p className="text-lg font-bold text-foreground mt-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
          </div>
          <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center flex-shrink-0`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">Filtrer par date</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 min-w-32"
              placeholder="Date debut"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 min-w-32"
              placeholder="Date fin"
            />
            <Button onClick={applyDateFilter} size="sm">
              Appliquer
            </Button>
            {(appliedDates.start || appliedDates.end) && (
              <Button onClick={clearDateFilter} variant="outline" size="sm">
                Effacer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {periodStats.length > 0 && (
        <>
          <p className="text-sm font-medium text-muted-foreground">Statistiques de la periode</p>
          <div className="grid grid-cols-3 gap-3">
            {periodStats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </>
      )}

      <p className="text-sm font-medium text-muted-foreground">Vue generale</p>
      <div className="grid grid-cols-2 gap-3">
        {mainStats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      <p className="text-sm font-medium text-muted-foreground">Depots</p>
      <div className="grid grid-cols-2 gap-3">
        {depositStats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      <p className="text-sm font-medium text-muted-foreground">Retraits</p>
      <div className="grid grid-cols-2 gap-3">
        {withdrawalStats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      <p className="text-sm font-medium text-muted-foreground">Finances</p>
      <div className="grid grid-cols-1 gap-3">
        {financialStats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>
    </div>
  );
}
