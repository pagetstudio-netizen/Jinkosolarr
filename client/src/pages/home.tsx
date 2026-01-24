import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/countries";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Headphones, MessageCircle, Users } from "lucide-react";
import { useState } from "react";
import DepositModal from "@/components/deposit-modal";
import WithdrawModal from "@/components/withdraw-modal";
import ServiceModal from "@/components/service-modal";

export default function HomePage() {
  const { user } = useAuth();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showService, setShowService] = useState(false);

  const { data: settings } = useQuery<{ supportLink: string; channelLink: string; groupLink: string }>({
    queryKey: ["/api/settings/links"],
  });

  if (!user) return null;

  const balance = parseFloat(user.balance || "0");
  const todayEarnings = parseFloat(user.todayEarnings || "0");

  return (
    <div className="flex flex-col min-h-full bg-background">
      <header className="bg-secondary px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-secondary-foreground">FANUC</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <span className="font-bold text-primary-foreground">F</span>
        </div>
      </header>

      <div className="w-full aspect-[16/7] bg-gradient-to-br from-primary/20 via-primary/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmYWNjMTUiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Investissement Industriel</h2>
            <p className="text-muted-foreground">Gagnez des revenus quotidiens</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 flex-1">
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="secondary"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => setShowDeposit(true)}
            data-testid="button-deposit"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <ArrowDownToLine className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium">Recharger</span>
          </Button>

          <Button
            variant="secondary"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => setShowWithdraw(true)}
            data-testid="button-withdraw"
          >
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <ArrowUpFromLine className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-xs font-medium">Retrait</span>
          </Button>

          <Button
            variant="secondary"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => setShowService(true)}
            data-testid="button-service"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-xs font-medium">Service</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Solde du compte</span>
              </div>
              <p className="text-xl font-bold text-foreground" data-testid="text-balance">
                {formatCurrency(balance, user.country)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpFromLine className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Revenus du jour</span>
              </div>
              <p className="text-xl font-bold text-foreground" data-testid="text-today-earnings">
                {formatCurrency(todayEarnings, user.country)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="w-full aspect-[16/6] rounded-lg bg-gradient-to-r from-secondary to-secondary/80 flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmYWNjMTUiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTIwIDIwYzAtMi4yIDEuOC00IDQtNHM0IDEuOCA0IDQtMS44IDQtNCA0LTQtMS44LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
          <div className="text-center z-10">
            <p className="text-primary font-bold text-lg">FANUC Industries</p>
            <p className="text-muted-foreground text-sm">Leader mondial en robotique</p>
          </div>
        </div>
      </div>

      <DepositModal open={showDeposit} onClose={() => setShowDeposit(false)} />
      <WithdrawModal open={showWithdraw} onClose={() => setShowWithdraw(false)} />
      <ServiceModal 
        open={showService} 
        onClose={() => setShowService(false)}
        supportLink={settings?.supportLink || "https://t.me/+DOnUcJs7idVmN2E0"}
        channelLink={settings?.channelLink || "https://t.me/+DOnUcJs7idVmN2E0"}
        groupLink={settings?.groupLink || "https://t.me/+DOnUcJs7idVmN2E0"}
      />
    </div>
  );
}
