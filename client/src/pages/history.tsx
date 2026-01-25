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
    queryKey: ["/api/deposits/history"],
  });

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/withdrawals/history"],
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
    <div className="flex flex-col min-h-full bg-white">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
        </Link>
        <h1 className="text-lg font-bold text-gray-800 flex-1 text-center pr-8">Historique</h1>
      </div>

      <div className="flex border-b bg-white">
        <button
          onClick={() => setActiveTab("deposits")}
          className={`flex-1 py-3 text-center font-medium text-base transition-colors ${
            activeTab === "deposits"
              ? "text-orange-500"
              : "text-gray-500"
          }`}
          data-testid="tab-deposits"
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowDownToLine className="w-4 h-4" />
            Depots
          </div>
          {activeTab === "deposits" && <div className="h-0.5 bg-orange-500 w-full mt-2" />}
        </button>
        <button
          onClick={() => setActiveTab("withdrawals")}
          className={`flex-1 py-3 text-center font-medium text-base transition-colors ${
            activeTab === "withdrawals"
              ? "text-orange-500"
              : "text-gray-500"
          }`}
          data-testid="tab-withdrawals"
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowUpFromLine className="w-4 h-4" />
            Retraits
          </div>
          {activeTab === "withdrawals" && <div className="h-0.5 bg-yellow-400 w-full mt-2" />}
        </button>
      </div>

      <div className="flex-1 bg-gray-50 overflow-y-auto">
        {activeTab === "deposits" && (
          <div className="p-4 space-y-4">
            {depositsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : deposits.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ArrowDownToLine className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucun depot pour le moment</p>
              </div>
            ) : (
              deposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                  data-testid={`deposit-item-${deposit.id}`}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Statut du depot</span>
                      <span className={`font-bold ${
                        deposit.status === "completed" || deposit.status === "approved" 
                          ? "text-green-600" 
                          : deposit.status === "rejected" 
                            ? "text-red-600" 
                            : "text-orange-500"
                      }`}>
                        {getStatusText(deposit.status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Montant du depot</span>
                      <span className="font-bold text-gray-800">
                        {currency}{parseFloat(deposit.amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-bold text-lg">sécurisé</span>
                      <span className="text-gray-800 font-bold">Rapide</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-gray-600">Methode</span>
                      <span className="font-bold text-gray-800">{deposit.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "withdrawals" && (
          <div className="p-4 space-y-4">
            {withdrawalsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ArrowUpFromLine className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucun retrait pour le moment</p>
              </div>
            ) : (
              withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                  data-testid={`withdrawal-item-${withdrawal.id}`}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Statut du retrait</span>
                      <span className={`font-bold ${
                        withdrawal.status === "completed" || withdrawal.status === "approved" 
                          ? "text-green-600" 
                          : withdrawal.status === "rejected" 
                            ? "text-red-600" 
                            : "text-orange-500"
                      }`}>
                        {getStatusText(withdrawal.status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Montant du retrait</span>
                      <span className="font-bold text-gray-800">
                        {currency}{parseFloat(withdrawal.amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-bold text-lg">sécurisé</span>
                      <span className="text-gray-800 font-bold">Rapide</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-gray-600">Montant de la taxe</span>
                      <span className="font-bold text-gray-800">
                        {currency}{(parseFloat(withdrawal.amount) * 0.15).toFixed(2)}
                      </span>
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
