import { useAuth } from "@/lib/auth";
import { Bell } from "lucide-react";
import { Link, useLocation } from "wouter";
import fanucHeader from "@/assets/images/fanuc-header.png";
import btnRecharge from "@/assets/images/btn-recharge.png";
import btnRetirer from "@/assets/images/btn-retirer.png";
import btnAide from "@/assets/images/btn-aide.png";
import robotSoldes from "@/assets/images/robot-soldes.png";
import robotCumulatif from "@/assets/images/robot-cumulatif.png";
import fanucTeamWide from "@/assets/images/fanuc-team-wide.png";

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

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

      <div className="px-3 py-3 flex items-end justify-center gap-1">
        <Link href="/deposit" className="flex-1 hover:opacity-90 transition-opacity mb-0">
          <button
            className="w-full"
            data-testid="button-recharge"
          >
            <img src={btnRecharge} alt="Recharge" className="w-full h-10 object-contain" />
          </button>
        </Link>

        <Link href="/withdrawal" className="flex-1 hover:opacity-90 transition-opacity mb-2">
          <button
            className="w-full"
            data-testid="button-retirer"
          >
            <img src={btnRetirer} alt="Retirer" className="w-full h-10 object-contain" />
          </button>
        </Link>

        <button
          onClick={() => navigate("/service")}
          className="flex-1 hover:opacity-90 transition-opacity mb-4"
          data-testid="button-aide"
        >
          <img src={btnAide} alt="Service Client" className="w-full h-10 object-contain" />
        </button>
      </div>

      <div className="mx-3 bg-amber-900 rounded-lg px-3 py-2 flex items-center gap-2 overflow-hidden">
        <Bell className="w-5 h-5 text-white flex-shrink-0" />
        <div className="overflow-hidden flex-1">
          <p className="text-white text-sm font-medium whitespace-nowrap animate-marquee">
            Rejoignez FANUC, la plateforme incontournable pour investir dans l'industrie et gagner des revenus quotidiens!
          </p>
        </div>
      </div>

      <div className="px-3 mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-24 h-24">
            <img 
              src={robotSoldes} 
              alt="Robot" 
              className="w-full h-full object-contain"
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
          <div className="w-24 h-24">
            <img 
              src={robotCumulatif} 
              alt="Robot" 
              className="w-full h-full object-contain"
            />
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
    </div>
  );
}
