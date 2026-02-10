import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, Headphones } from "lucide-react";
import { Link } from "wouter";
import telegramIcon from "@/assets/images/telegram-icon.png";

export default function ServicePage() {
  const { data: settings } = useQuery<{ supportLink: string; channelLink: string; groupLink: string }>({
    queryKey: ["/api/settings/links"],
  });

  const openLink = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col min-h-full bg-white">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ArrowLeft className="w-5 h-5 text-[#2196F3]" />
          </button>
        </Link>
        <h1 className="text-[#2196F3] text-base font-semibold">Service client</h1>
        <div className="w-7" />
      </header>

      <div className="flex-1 overflow-y-auto pb-24">

        <div className="bg-[#2196F3] px-6 py-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-white text-xl font-bold text-center">Bienvenue sur</h2>
          <h2 className="text-white text-xl font-bold text-center">Service client</h2>
        </div>

        <div className="px-5 py-4 space-y-0">
          <button
            onClick={() => openLink(settings?.supportLink || "https://t.me/+DOnUcJs7idVmN2E0")}
            className="w-full flex items-center gap-4 py-5 border-b border-gray-100"
            data-testid="button-support-link"
          >
            <img src={telegramIcon} alt="Telegram" className="w-11 h-11 rounded-full" />
            <span className="flex-1 text-left text-gray-800 font-medium text-base">Telegram</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => openLink(settings?.channelLink || "https://t.me/+DOnUcJs7idVmN2E0")}
            className="w-full flex items-center gap-4 py-5 border-b border-gray-100"
            data-testid="button-channel-link"
          >
            <img src={telegramIcon} alt="Telegram" className="w-11 h-11 rounded-full" />
            <span className="flex-1 text-left text-gray-800 font-medium text-base">chaine Telegram</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => openLink(settings?.groupLink || "https://t.me/+DOnUcJs7idVmN2E0")}
            className="w-full flex items-center gap-4 py-5 border-b border-gray-100"
            data-testid="button-group-link"
          >
            <img src={telegramIcon} alt="Telegram" className="w-11 h-11 rounded-full" />
            <span className="flex-1 text-left text-gray-800 font-medium text-base">Groupe Telegram</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="mx-5 mt-4 bg-gray-50 rounded-2xl p-5">
          <p className="text-gray-900 text-xl font-bold text-center mb-1">9:00-20:00</p>
          <p className="text-gray-500 text-sm text-center mb-4">Service client en ligne</p>

          <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
            <p>1. Si vous ne parvenez pas a ouvrir l'application Telegram officielle ci-dessus, veuillez utiliser un autre navigateur.</p>
            <p>2. Pour toute question concernant notre plateforme, veuillez contacter notre service client en ligne. Ils repondront a toutes vos questions.</p>
            <p>3. Si notre service client en ligne ne repond pas immediatement a votre message, veuillez patienter. Nous recevons actuellement un grand nombre de messages. Notre service client en ligne vous repondra des que possible. Merci de votre comprehension et de votre soutien !</p>
            <p>4. Pour gagner plus d'argent, rejoignez notre chaine Telegram officielle !</p>
          </div>
        </div>
      </div>
    </div>
  );
}
