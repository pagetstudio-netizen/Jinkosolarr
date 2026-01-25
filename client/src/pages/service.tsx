import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
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
      <header className="flex items-center px-4 py-3 border-b bg-white">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        </Link>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">Service en ligne</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2 className="text-white text-xl font-bold mb-2">Bonjour, bienvenue chez FANUC</h2>
                <p className="text-white/90 text-sm leading-relaxed">
                  Votre satisfaction est notre priorite. Si vous avez des questions sur votre Compte ou nos services, n'hesitez pas a nous contacter.
                </p>
              </div>
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-4xl">👩‍💼</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-pink-500 text-xl font-medium">9h a 17h GMT</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => openLink(settings?.supportLink || "https://t.me/+DOnUcJs7idVmN2E0")}
            className="w-full bg-gray-100 rounded-xl p-4 flex items-center gap-4 hover:bg-gray-200 transition-colors"
            data-testid="button-support-link"
          >
            <img src={telegramIcon} alt="Telegram" className="w-12 h-12 rounded-lg" />
            <span className="flex-1 text-left text-gray-700 font-medium">Service Client</span>
            <span className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Connecter</span>
          </button>

          <button
            onClick={() => openLink(settings?.groupLink || "https://t.me/+DOnUcJs7idVmN2E0")}
            className="w-full bg-gray-100 rounded-xl p-4 flex items-center gap-4 hover:bg-gray-200 transition-colors"
            data-testid="button-group-link"
          >
            <img src={telegramIcon} alt="Telegram" className="w-12 h-12 rounded-lg" />
            <span className="flex-1 text-left text-gray-700 font-medium">Groupe de discussion</span>
            <span className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Connecter</span>
          </button>

          <button
            onClick={() => openLink(settings?.channelLink || "https://t.me/+DOnUcJs7idVmN2E0")}
            className="w-full bg-gray-100 rounded-xl p-4 flex items-center gap-4 hover:bg-gray-200 transition-colors"
            data-testid="button-channel-link"
          >
            <img src={telegramIcon} alt="Telegram" className="w-12 h-12 rounded-lg" />
            <span className="flex-1 text-left text-gray-700 font-medium">Chaine officielle de FANUC</span>
            <span className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Connecter</span>
          </button>
        </div>

        <div className="text-center px-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            Contactez notre service client pour obtenir des conseils d'investissement et maximiser vos revenus quotidiens ! Ne manquez pas les opportunites de croissance.
          </p>
        </div>
      </div>
    </div>
  );
}
