import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Send, Users, Megaphone, Headphones, Clock, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import serviceImg from "@/assets/images/elf-service-client.png";

export default function ServicePage() {
  const { data: settings } = useQuery<{ supportLink: string; channelLink: string; groupLink: string }>({
    queryKey: ["/api/settings/links"],
  });

  const openLink = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <Link href="/account">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">Support</h1>
        <div className="w-9" />
      </header>

      <div className="px-4 pt-4">
        <div className="rounded-2xl overflow-hidden shadow-sm">
          <img src={serviceImg} alt="ELF Service Client" className="w-full h-auto object-cover" />
        </div>
      </div>

      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 justify-center mb-1">
          <Clock className="w-4 h-4 text-[#2196F3]" />
          <p className="text-sm font-medium text-gray-600">Disponible 7j/7</p>
        </div>
      </div>

      <div className="px-4 space-y-3 pb-8">
        <button
          onClick={() => openLink(settings?.supportLink || "https://t.me/+DOnUcJs7idVmN2E0")}
          className="w-full bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-4"
          data-testid="button-support-link"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1976D2] to-[#42A5F5] flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-gray-900 text-sm">Service Client</p>
            <p className="text-xs text-gray-400 mt-0.5">Assistance personnalisee</p>
          </div>
          <div className="flex items-center gap-1 text-[#2196F3] shrink-0">
            <span className="text-xs font-medium">Ouvrir</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          onClick={() => openLink(settings?.groupLink || "https://t.me/+DOnUcJs7idVmN2E0")}
          className="w-full bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-4"
          data-testid="button-group-link"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-gray-900 text-sm">Groupe de discussion</p>
            <p className="text-xs text-gray-400 mt-0.5">Echangez avec la communaute</p>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 shrink-0">
            <span className="text-xs font-medium">Rejoindre</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          onClick={() => openLink(settings?.channelLink || "https://t.me/+DOnUcJs7idVmN2E0")}
          className="w-full bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-4"
          data-testid="button-channel-link"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0088cc] to-[#00bbff] flex items-center justify-center shrink-0">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-gray-900 text-sm">Chaine officielle</p>
            <p className="text-xs text-gray-400 mt-0.5">Actualites et annonces</p>
          </div>
          <div className="flex items-center gap-1 text-[#0088cc] shrink-0">
            <span className="text-xs font-medium">Suivre</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </button>

        <div className="bg-blue-50 rounded-xl p-4 mt-4">
          <p className="text-gray-600 text-xs leading-relaxed text-center">
            Notre equipe est a votre disposition pour repondre a toutes vos questions concernant vos investissements, depots et retraits.
          </p>
        </div>
      </div>
    </div>
  );
}
