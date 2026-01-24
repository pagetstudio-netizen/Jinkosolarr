import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ArrowDownToLine, ArrowUpFromLine, TrendingUp, ShoppingCart, Wallet } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  todayUsers: number;
  totalDeposits: number;
  todayDeposits: number;
  totalWithdrawals: number;
  todayWithdrawals: number;
  usersWithProducts: number;
  totalBalance: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Utilisateurs totaux",
      value: stats.totalUsers,
      subtitle: `+${stats.todayUsers} aujourd'hui`,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/20",
    },
    {
      title: "Total dépôts",
      value: `${stats.totalDeposits.toLocaleString()} F`,
      subtitle: `+${stats.todayDeposits.toLocaleString()} F aujourd'hui`,
      icon: ArrowDownToLine,
      color: "text-green-500",
      bg: "bg-green-500/20",
    },
    {
      title: "Total retraits",
      value: `${stats.totalWithdrawals.toLocaleString()} F`,
      subtitle: "Traités",
      icon: ArrowUpFromLine,
      color: "text-red-500",
      bg: "bg-red-500/20",
    },
    {
      title: "Utilisateurs avec produits",
      value: stats.usersWithProducts,
      subtitle: "Investisseurs actifs",
      icon: ShoppingCart,
      color: "text-purple-500",
      bg: "bg-purple-500/20",
    },
    {
      title: "Solde total plateforme",
      value: `${stats.totalBalance.toLocaleString()} F`,
      subtitle: "Tous les utilisateurs",
      icon: Wallet,
      color: "text-primary",
      bg: "bg-primary/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className={index === statCards.length - 1 ? "col-span-2" : ""}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                <p className="text-xl font-bold text-foreground mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </div>
              <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
