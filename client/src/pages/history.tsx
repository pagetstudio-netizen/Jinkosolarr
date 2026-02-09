import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Loader2, Receipt } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface Deposit {
  id: number;
  userId: number;
  amount: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

interface Withdrawal {
  id: number;
  userId: number;
  amount: string;
  netAmount: string;
  status: string;
  createdAt: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals">("deposits");

  const countryInfo = user ? getCountryByCode(user.country) : null;
  const currency = countryInfo?.currency || "FCFA";

  const { data: deposits = [], isLoading: depositsLoading } = useQuery<Deposit[]>({
    queryKey: ["/api/deposits/history"],
  });

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/withdrawals/history"],
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return { text: "Approuve", dotColor: "bg-emerald-500", bgColor: "bg-emerald-50", textColor: "text-emerald-700" };
      case "rejected":
        return { text: "Rejete", dotColor: "bg-red-500", bgColor: "bg-red-50", textColor: "text-red-700" };
      default:
        return { text: "En cours", dotColor: "bg-[#2196F3]", bgColor: "bg-blue-50", textColor: "text-[#1976D2]" };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "A l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) return null;

  const depositCount = deposits.length;
  const withdrawalCount = withdrawals.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <Link href="/account">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">Historique</h1>
        <div className="w-9" />
      </header>

      <div className="px-4 pt-4 pb-3">
        <div className="bg-white rounded-2xl p-1.5 flex gap-1 border border-gray-100 shadow-sm">
          <button
            onClick={() => setActiveTab("deposits")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "deposits"
                ? "bg-[#2196F3] text-white shadow-sm"
                : "text-gray-500"
            }`}
            data-testid="tab-deposits"
          >
            Depots {depositCount > 0 && <span className={`ml-1 text-xs ${activeTab === "deposits" ? "text-white/80" : "text-gray-400"}`}>({depositCount})</span>}
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "withdrawals"
                ? "bg-[#2196F3] text-white shadow-sm"
                : "text-gray-500"
            }`}
            data-testid="tab-withdrawals"
          >
            Retraits {withdrawalCount > 0 && <span className={`ml-1 text-xs ${activeTab === "withdrawals" ? "text-white/80" : "text-gray-400"}`}>({withdrawalCount})</span>}
          </button>
        </div>
      </div>

      <div className="px-4 pb-24">
        {activeTab === "deposits" && (
          <>
            {depositsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-[#2196F3]" />
              </div>
            ) : deposits.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Receipt className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm mb-1">Aucun depot</p>
                <p className="text-gray-400 text-xs">Vos depots apparaitront ici</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {deposits.map((deposit) => {
                  const status = getStatusLabel(deposit.status);
                  return (
                    <div
                      key={deposit.id}
                      className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                      data-testid={`deposit-item-${deposit.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                          <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-gray-900 text-sm">Depot</p>
                            <p className="font-bold text-gray-900 text-sm">+{parseFloat(deposit.amount).toLocaleString()} {currency}</p>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <p className="text-xs text-gray-400">{deposit.paymentMethod}</p>
                            <p className="text-xs text-gray-400">{formatDate(deposit.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                          <span className={`text-xs font-medium ${status.textColor}`}>{status.text}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{formatTime(deposit.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "withdrawals" && (
          <>
            {withdrawalsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-[#2196F3]" />
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Receipt className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm mb-1">Aucun retrait</p>
                <p className="text-gray-400 text-xs">Vos retraits apparaitront ici</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {withdrawals.map((withdrawal) => {
                  const status = getStatusLabel(withdrawal.status);
                  const fee = parseFloat(withdrawal.amount) * 0.15;
                  const net = parseFloat(withdrawal.amount) - fee;
                  return (
                    <div
                      key={withdrawal.id}
                      className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                      data-testid={`withdrawal-item-${withdrawal.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                          <ArrowUpRight className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-gray-900 text-sm">Retrait</p>
                            <p className="font-bold text-gray-900 text-sm">-{parseFloat(withdrawal.amount).toLocaleString()} {currency}</p>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <p className="text-xs text-gray-400">Frais: {fee.toLocaleString()} {currency}</p>
                            <p className="text-xs text-gray-400">{formatDate(withdrawal.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                          <span className={`text-xs font-medium ${status.textColor}`}>{status.text}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">Net: {net.toLocaleString()} {currency}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
