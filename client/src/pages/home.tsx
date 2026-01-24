import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import DepositModal from "@/components/deposit-modal";
import WithdrawModal from "@/components/withdraw-modal";
import ServiceModal from "@/components/service-modal";
import { Download, DollarSign, HelpCircle, ClipboardList, Bell } from "lucide-react";
import heroBanner from "@/assets/images/hero-banner.jpg";
import productOil1 from "@/assets/images/product-oil-1.jpg";
import productOil2 from "@/assets/images/product-oil-2.jpg";

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showService, setShowService] = useState(false);

  const { data: settings } = useQuery<{ supportLink: string; channelLink: string; groupLink: string }>({
    queryKey: ["/api/settings/links"],
  });

  const { data: userProducts } = useQuery<any[]>({
    queryKey: ["/api/user/products"],
    enabled: !!user,
  });

  if (!user) return null;

  const balance = parseFloat(user.balance || "0");
  const cumulativeEarnings = parseFloat(user.totalEarnings || "0");

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="relative w-full">
        <img 
          src={heroBanner} 
          alt="Fanuc Industries" 
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded font-bold text-sm">
          Fanuc
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-2xl font-bold leading-tight">
            Maintenant lance<br />
            Nouveau projet<br />
            majeurs
          </h1>
        </div>
      </div>

      <div className="bg-green-600 px-4 py-3 flex items-start gap-3">
        <Bell className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
        <p className="text-white text-sm leading-tight">
          29 a recharger 100,000**** 0223 a recharger 90,000
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 px-4 py-6">
        <button
          onClick={() => setShowDeposit(true)}
          className="flex flex-col items-center gap-2"
          data-testid="button-deposit"
        >
          <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center">
            <Download className="w-6 h-6 text-gray-600" />
          </div>
          <span className="text-xs text-gray-700 font-medium">Recharge</span>
        </button>

        <button
          onClick={() => setShowWithdraw(true)}
          className="flex flex-col items-center gap-2"
          data-testid="button-withdraw"
        >
          <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-gray-600" />
          </div>
          <span className="text-xs text-gray-700 font-medium">Retirez</span>
        </button>

        <button
          onClick={() => setShowService(true)}
          className="flex flex-col items-center gap-2"
          data-testid="button-aide"
        >
          <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-gray-600" />
          </div>
          <span className="text-xs text-gray-700 font-medium">Aide</span>
        </button>

        <button
          onClick={() => navigate("/invest")}
          className="flex flex-col items-center gap-2"
          data-testid="button-enregistrement"
        >
          <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-gray-600" />
          </div>
          <span className="text-xs text-gray-700 font-medium">Enregistrement</span>
        </button>
      </div>

      <div className="px-4 space-y-4 pb-6">
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <img 
              src={productOil1} 
              alt="Produit" 
              className="w-20 h-20 object-cover rounded-lg"
            />
          </div>
          <div className="text-right">
            <span className="inline-block bg-white border border-gray-300 rounded-full px-4 py-1 text-sm font-medium text-gray-700 mb-2">
              Soldes
            </span>
            <p className="text-green-600 font-bold text-xl" data-testid="text-balance">
              FCFA {balance.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <img 
              src={productOil2} 
              alt="Produit" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <div className="text-right">
            <span className="inline-block bg-white border border-gray-300 rounded-full px-4 py-1 text-sm font-medium text-gray-700 mb-2">
              Cumulatif
            </span>
            <p className="text-green-600 font-bold text-xl" data-testid="text-cumulative">
              FCFA {cumulativeEarnings.toLocaleString()}
            </p>
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
