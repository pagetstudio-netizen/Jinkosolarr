import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import giftBanner from "@/assets/images/gift-banner.webp";
import telegramIcon from "@/assets/images/telegram-icon.png";

export default function GiftCodePage() {
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState("");

  const claimMutation = useMutation({
    mutationFn: async (giftCode: string) => {
      const response = await apiRequest("POST", "/api/gift-codes/claim", { code: giftCode });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: (data) => {
      refreshUser();
      setCode("");
      toast({
        title: "Felicitations!",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!code.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un code",
        variant: "destructive",
      });
      return;
    }
    claimMutation.mutate(code.trim());
  };

  const openTelegramGroup = () => {
    window.open("https://t.me/elfgroup", "_blank");
  };

  return (
    <div className="flex flex-col min-h-full bg-white">
      <header className="flex items-center px-4 py-3 border-b bg-white">
        <Link href="/account">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-blue-500" />
          </Button>
        </Link>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6" data-testid="text-page-title">Echanger des cadeaux</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full">
          <img 
            src={giftBanner} 
            alt="Gift Banner" 
            className="w-full h-72 object-cover"
            data-testid="img-gift-banner"
          />
        </div>

        <div className="px-6 py-6 space-y-6">
          <p className="text-center text-gray-600" data-testid="text-instruction">
            Vous pouvez obtenir des codes cadeaux dans le groupe
          </p>

          <Button
            variant="outline"
            onClick={openTelegramGroup}
            className="w-full flex items-center justify-between rounded-full px-4 py-6"
            data-testid="button-telegram-group"
          >
            <div className="flex items-center gap-3">
              <img src={telegramIcon} alt="Telegram" className="w-10 h-10 rounded-full" data-testid="img-telegram-icon" />
              <span className="text-gray-800 font-medium" data-testid="text-telegram-label">Groupes Telegram</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
          </Button>

          <div className="space-y-4">
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Veuillez saisir le code d'echange de cadeau"
              className="w-full text-center rounded-xl"
              data-testid="input-gift-code"
            />

            <Button
              onClick={handleSubmit}
              disabled={claimMutation.isPending}
              className="w-full bg-[#2196F3] text-white rounded-xl"
              data-testid="button-submit-code"
            >
              {claimMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Recevoir"
              )}
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500" data-testid="text-availability-info">
            Les codes sont disponibles chaque soir a 17h GMT
          </p>
        </div>
      </div>
    </div>
  );
}
