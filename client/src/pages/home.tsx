import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import DepositModal from "@/components/deposit-modal";
import WithdrawModal from "@/components/withdraw-modal";
import ServiceModal from "@/components/service-modal";
import { Smartphone } from "lucide-react";
import fanucHeader from "@/assets/images/fanuc-header.jpg";
import btnRecharge from "@/assets/images/btn-recharge.png";
import btnRetirer from "@/assets/images/btn-retirer.png";
import btnAide from "@/assets/images/btn-aide.png";
import castrolProduct from "@/assets/images/castrol-product.jpg";
import fanucTeamWide from "@/assets/images/fanuc-team-wide.png";

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
  const cumulativeEarnings = parseFloat(user.totalEarnings || "0");

  return (
    <div className="flex flex-col min-h-full bg-amber-50">
      <div className="w-full">
        <img 
          src={fanucHeader} 
          alt="FANUC" 
          className="w-full h-44 object-cover"
        />
      </div>

      <div className="px-3 py-3 flex items-center justify-center gap-2">
        <button
          onClick={() => setShowDeposit(true)}
          className="flex-1 hover:opacity-90 transition-opacity"
          data-testid="button-recharge"
        >
          <img src={btnRecharge} alt="Recharge" className="w-full h-12 object-contain" />
        </button>

        <button
          onClick={() => setShowWithdraw(true)}
          className="flex-1 hover:opacity-90 transition-opacity"
          data-testid="button-retirer"
        >
          <img src={btnRetirer} alt="Retirer" className="w-full h-12 object-contain" />
        </button>

        <button
          onClick={() => setShowService(true)}
          className="flex-1 hover:opacity-90 transition-opacity"
          data-testid="button-aide"
        >
          <img src={btnAide} alt="Service Client" className="w-full h-12 object-contain" />
        </button>
      </div>

      <div className="mx-3 bg-amber-900 rounded-lg px-3 py-2 flex items-center gap-2">
        <Smartphone className="w-5 h-5 text-white flex-shrink-0" />
        <p className="text-white text-sm font-medium truncate">
          Rejoignez FANUC, la plateforme incontour...
        </p>
      </div>

      <div className="px-3 mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-24 h-24">
            <img 
              src={castrolProduct} 
              alt="Castrol" 
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="text-right">
            <span className="inline-block bg-yellow-400 text-gray-800 font-bold text-sm px-4 py-1 rounded-full mb-1">
              Soldes
            </span>
            <p className="text-red-600 font-bold text-xl" data-testid="text-balance">
              FCFA {balance.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="w-24">
            <div className="bg-white rounded-lg p-2 inline-block">
              <span className="text-green-600 font-bold text-lg italic">Castrol</span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block bg-yellow-400 text-gray-800 font-bold text-sm px-4 py-1 rounded-full mb-1">
              Cumulatif
            </span>
            <p className="text-red-600 font-bold text-xl" data-testid="text-cumulative">
              FCFA {cumulativeEarnings.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="px-3 mt-4 pb-4">
        <img 
          src={fanucTeamWide} 
          alt="FANUC Team" 
          className="w-full h-auto rounded-xl object-cover"
        />
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
