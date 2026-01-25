import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, getCountryByCode } from "@/lib/countries";
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
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
    queryKey: ["/api/deposits"],
  });

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/withdrawals"],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-orange-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return "Approuve";
      case "rejected":
        return "Rejete";
      case "pending":
        return "En attente";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return "text-green-600 bg-green-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      default:
        return "text-orange-600 bg-orange-50";
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
    <div className="flex flex-col min-h-full bg-amber-50">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">Historique</h1>
      </div>

      <div className="flex border-b bg-white">
        <button
          onClick={() => setActiveTab("deposits")}
          className={`flex-1 py-3 text-center font-medium text-sm transition-colors ${
            activeTab === "deposits"
              ? "text-amber-600 border-b-2 border-amber-500"
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
          className={`flex-1 py-3 text-center font-medium text-sm transition-colors ${
            activeTab === "withdrawals"
              ? "text-amber-600 border-b-2 border-amber-500"
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

      <div className="flex-1 p-4 pb-24 overflow-y-auto">
        {activeTab === "deposits" && (
          <div className="space-y-3">
            {depositsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : deposits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ArrowDownToLine className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucun depot pour le moment</p>
              </div>
            ) : (
              deposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="bg-white rounded-xl p-4 shadow-sm"
                  data-testid={`deposit-item-${deposit.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <ArrowDownToLine className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          +{parseFloat(deposit.amount).toLocaleString()} {currency}
                        </p>
                        <p className="text-xs text-gray-500">{deposit.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                        {getStatusText(deposit.status)}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(deposit.createdAt)}</p>
                    </div>
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
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ArrowUpFromLine className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucun retrait pour le moment</p>
              </div>
            ) : (
              withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="bg-white rounded-xl p-4 shadow-sm"
                  data-testid={`withdrawal-item-${withdrawal.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <ArrowUpFromLine className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          -{parseFloat(withdrawal.amount).toLocaleString()} {currency}
                        </p>
                        <p className="text-xs text-gray-500">
                          Net: {parseFloat(withdrawal.netAmount).toLocaleString()} {currency}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                        {getStatusText(withdrawal.status)}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(withdrawal.createdAt)}</p>
                    </div>
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
