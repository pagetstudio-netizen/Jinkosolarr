import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import DepositModal from "@/components/deposit-modal";
import WithdrawModal from "@/components/withdraw-modal";
import ServiceModal from "@/components/service-modal";
import { Database, ArrowRightFromLine, Download, Building2, Volume2 } from "lucide-react";
import fanucBuilding from "@/assets/images/fanuc-building.webp";
import fanucTeam from "@/assets/images/fanuc-team.webp";

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showService, setShowService] = useState(false);

  const { data: settings } = useQuery<{ supportLink: string; channelLink: string; groupLink: string }>({
    queryKey: ["/api/settings/links"],
  });

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-full bg-red-600">
      <div className="relative w-full">
        <img 
          src={fanucBuilding} 
          alt="FANUC" 
          className="w-full h-44 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-2xl font-bold leading-tight">
            Lance un nouveau<br />
            projet majeurs
          </h1>
        </div>
      </div>

      <div className="mx-4 my-3 bg-red-700/60 rounded-full px-4 py-2 flex items-center gap-3">
        <Volume2 className="w-5 h-5 text-white flex-shrink-0" />
        <p className="text-white text-sm truncate">
          Rejoignez FANUC, la plateforme incontournable
        </p>
      </div>

      <div className="px-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowDeposit(true)}
          className="bg-red-400/90 hover:bg-red-400 rounded-3xl h-20 px-5 flex items-center justify-between transition-colors"
          data-testid="button-depot"
        >
          <span className="text-white font-semibold text-base">Depot</span>
          <div className="w-11 h-11 bg-white/25 rounded-2xl flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
        </button>

        <button
          onClick={() => setShowWithdraw(true)}
          className="bg-red-400/90 hover:bg-red-400 rounded-3xl h-20 px-5 flex items-center justify-between transition-colors"
          data-testid="button-retrait"
        >
          <span className="text-white font-semibold text-base">Retrait</span>
          <div className="w-11 h-11 bg-white/25 rounded-2xl flex items-center justify-center">
            <ArrowRightFromLine className="w-5 h-5 text-white" />
          </div>
        </button>

        <button
          onClick={() => window.open(settings?.channelLink || "https://t.me/+DOnUcJs7idVmN2E0", "_blank")}
          className="bg-red-400/90 hover:bg-red-400 rounded-3xl h-20 px-5 flex items-center justify-between transition-colors"
          data-testid="button-telecharger"
        >
          <span className="text-white font-semibold text-base">Telechar...</span>
          <div className="w-11 h-11 bg-white/25 rounded-2xl flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
        </button>

        <button
          onClick={() => setShowService(true)}
          className="bg-red-400/90 hover:bg-red-400 rounded-3xl h-20 px-5 flex items-center justify-between transition-colors"
          data-testid="button-agent"
        >
          <span className="text-white font-semibold text-base">Agent</span>
          <div className="w-11 h-11 bg-white/25 rounded-2xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
        </button>
      </div>

      <div className="px-4 mt-4">
        <div className="rounded-xl overflow-hidden">
          <img 
            src={fanucTeam} 
            alt="FANUC Team" 
            className="w-full h-48 object-cover"
          />
        </div>
      </div>

      <div className="px-4 mt-4">
        <h2 className="text-white text-xl font-semibold">Salle de mission</h2>
      </div>

      <div className="px-4 mt-3 pb-4">
        <div className="bg-white rounded-t-xl p-4">
          <p className="text-gray-700 font-medium">Montant</p>
        </div>
      </div>

      <a
        href={settings?.groupLink || "https://t.me/+DOnUcJs7idVmN2E0"}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed left-4 bottom-24 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-40"
        data-testid="button-telegram"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/>
        </svg>
      </a>

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
