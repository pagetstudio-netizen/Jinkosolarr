import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, getCountryByCode } from "@/lib/countries";
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, Clock, CheckCircle, XCircle, Loader2, Shield } from "lucide-react";
import { Link } from "wouter";

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return "Reussi";
      case "rejected":
        return "Rejete";
      case "pending":
        return "En attente";
      default:
        return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-[#2196F3] bg-blue-50 border-blue-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-[#2196F3]" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-full bg-white">
      <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#64B5F6] to-white">
        <Link href="/account">
          <button className="p-2" data-testid="button-back">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">Historique</h1>
        <div className="w-9" />
      </header>

      <div className="flex bg-white mx-4 mt-3 rounded-full border border-gray-200 p-1">
        <button
          onClick={() => setActiveTab("deposits")}
          className={`flex-1 py-2.5 text-center font-medium text-sm rounded-full transition-colors ${
            activeTab === "deposits"
              ? "bg-[#2196F3] text-white"
              : "text-gray-500"
          }`}
          data-testid="tab-deposits"
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowDownToLine className="w-4 h-4" />
            Depots
          </div>
        </button>
        <button
          onClick={() => setActiveTab("withdrawals")}
          className={`flex-1 py-2.5 text-center font-medium text-sm rounded-full transition-colors ${
            activeTab === "withdrawals"
              ? "bg-[#2196F3] text-white"
              : "text-gray-500"
          }`}
          data-testid="tab-withdrawals"
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowUpFromLine className="w-4 h-4" />
            Retraits
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
        {activeTab === "deposits" && (
          <div className="space-y-3">
            {depositsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#2196F3]" />
              </div>
            ) : deposits.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-[#e3f2fd] flex items-center justify-center mx-auto mb-4">
                  <ArrowDownToLine className="w-8 h-8 text-[#2196F3]" />
                </div>
                <p className="text-gray-500 text-sm">Aucun depot pour le moment</p>
              </div>
            ) : (
              deposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  data-testid={`deposit-item-${deposit.id}`}
                >
                  <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{formatDate(deposit.createdAt)}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${getStatusStyle(deposit.status)}`}>
                      {getStatusIcon(deposit.status)}
                      {getStatusText(deposit.status)}
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Montant</span>
                      <span className="font-bold text-gray-800 text-base">
                        {parseFloat(deposit.amount).toLocaleString()} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Methode</span>
                      <span className="text-sm font-medium text-gray-700">{deposit.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 bg-[#e3f2fd] flex items-center justify-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#2196F3]" />
                    <span className="text-xs font-medium text-[#2196F3]">Transaction securisee</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "withdrawals" && (
          <div className="space-y-3">
            {withdrawalsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#2196F3]" />
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-[#e3f2fd] flex items-center justify-center mx-auto mb-4">
                  <ArrowUpFromLine className="w-8 h-8 text-[#2196F3]" />
                </div>
                <p className="text-gray-500 text-sm">Aucun retrait pour le moment</p>
              </div>
            ) : (
              withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  data-testid={`withdrawal-item-${withdrawal.id}`}
                >
                  <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{formatDate(withdrawal.createdAt)}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${getStatusStyle(withdrawal.status)}`}>
                      {getStatusIcon(withdrawal.status)}
                      {getStatusText(withdrawal.status)}
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Montant</span>
                      <span className="font-bold text-gray-800 text-base">
                        {parseFloat(withdrawal.amount).toLocaleString()} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Taxe (15%)</span>
                      <span className="text-sm font-medium text-red-500">
                        -{(parseFloat(withdrawal.amount) * 0.15).toLocaleString()} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-sm font-semibold text-gray-700">Montant net</span>
                      <span className="font-bold text-green-600 text-base">
                        {(parseFloat(withdrawal.amount) * 0.85).toLocaleString()} {currency}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 bg-[#e3f2fd] flex items-center justify-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#2196F3]" />
                    <span className="text-xs font-medium text-[#2196F3]">Transaction securisee</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
