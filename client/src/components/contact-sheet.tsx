import { useQuery } from "@tanstack/react-query";
import { ChevronRight, X } from "lucide-react";
import { SiTelegram } from "react-icons/si";

interface ContactSheetProps {
  open: boolean;
  onClose: () => void;
}

const TELEGRAM_BLUE = "#229ED9";
const GREEN = "#3db51d";

export default function ContactSheet({ open, onClose }: ContactSheetProps) {
  const { data: settings } = useQuery<{
    supportLink: string;
    support2Link: string;
    channelLink: string;
    groupLink: string;
  }>({
    queryKey: ["/api/settings/links"],
    enabled: open,
  });

  const openLink = (url: string) => {
    window.open(url, "_blank");
  };

  const items = [
    {
      label: "Canal Telegram",
      sublabel: "Rejoignez notre chaîne officielle",
      url: settings?.channelLink || "https://t.me/wendysappgroup",
      testId: "button-contact-channel",
    },
    {
      label: "Service client 1",
      sublabel: "Disponible de 09h00 à 20h00",
      url: settings?.supportLink || "https://t.me/wendysappgroup",
      testId: "button-contact-support1",
    },
    {
      label: "Service client 2",
      sublabel: "Disponible de 09h00 à 20h00",
      url: settings?.support2Link || "https://t.me/wendysappgroup",
      testId: "button-contact-support2",
    },
  ];

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl overflow-hidden"
        style={{ animation: "slideUp 0.25s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <p className="font-bold text-gray-800 text-base">Nous contacter</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#f5f5f5" }}
            data-testid="button-contact-close"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="px-4 pb-8 space-y-3">
          {items.map((item) => (
            <button
              key={item.testId}
              onClick={() => openLink(item.url)}
              className="w-full flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-4 text-left"
              style={{ border: "1px solid #f0f0f0" }}
              data-testid={item.testId}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: TELEGRAM_BLUE }}
              >
                <SiTelegram className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sublabel}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
