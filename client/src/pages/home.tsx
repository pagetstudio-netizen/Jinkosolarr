import { useAuth } from "@/lib/auth";
import { SiTelegram } from "react-icons/si";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageCircleMore, DollarSign, Wallet, Headphones, Gift, FileText } from "lucide-react";
import iconDeposit from "@assets/20260312_105135_1773312869115.png";
import iconWithdraw from "@assets/20260312_105153_1773312869170.png";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

import jinkoLogoText from "@assets/JinkoSolarLOGO_1775671142017.png";
import jinkoLogoSquare from "@assets/jinko-solar-logo-png_seeklogo-265492_1775671142176.png";
import heroImg from "@assets/20260408_191813_1775675938233.jpg";

const TELEGRAM_LINK = "https://t.me/wendysappgroup";

interface ProductWithOwnership extends Product {
  isOwned: boolean;
  canClaimFree: boolean;
  ownedCount?: number;
}

export default function HomePage() {
  const { user, refreshUser } = useAuth();
  const [location, navigate] = useLocation();
  const [showPopup, setShowPopup] = useState(true);
  const { toast } = useToast();
  const [confirmProduct, setConfirmProduct] = useState<ProductWithOwnership | null>(null);

  const { data: products, isLoading: productsLoading } = useQuery<ProductWithOwnership[]>({
    queryKey: ["/api/products"],
    enabled: !!user,
  });

  useEffect(() => {
    setShowPopup(true);
  }, [location]);

  const purchaseMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest("POST", `/api/products/${productId}/purchase`, {});
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/products"] });
      refreshUser();
      setConfirmProduct(null);
      toast({ title: "Produit acheté !", description: "Vous commencerez à recevoir des gains demain." });
    },
    onError: (error: any) => {
      setConfirmProduct(null);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  if (!user) return null;

  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";
  const paidProducts = products?.filter(p => !p.isFree) || [];

  const quickActions = [
    { label: "Recharger", icon: DollarSign, onClick: () => navigate("/deposit"), color: "#f59e0b" },
    { label: "Retrait", icon: Wallet, onClick: () => navigate("/withdrawal"), color: "#f59e0b" },
    { label: "Nous contacter", icon: Headphones, onClick: () => navigate("/service"), color: "#f59e0b" },
    { label: "Argent gratuit", icon: Gift, onClick: () => navigate("/gift-code"), color: "#f59e0b" },
    { label: "Preuve de retrait", icon: FileText, onClick: () => navigate("/withdrawal-history"), color: "#f59e0b" },
  ];

  return (
    <div className="flex flex-col min-h-full bg-gray-100">

      {/* Popup */}
      {showPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5 animate-in fade-in duration-200"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="w-full max-w-[340px] rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ background: "linear-gradient(160deg, #3db51d 0%, #1e7a0e 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-7 pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-lg">
                  <img src={jinkoLogoSquare} alt="Jinko Solar" className="w-full h-full object-cover" />
                </div>
              </div>
              <h2 className="text-white text-2xl font-extrabold text-center tracking-widest mb-4">AVERTIR</h2>
              <p className="text-white/90 text-sm leading-relaxed mb-4">
                Jinko Solar est l'un des plus grands fabricants de panneaux solaires au monde, présent dans plus de 160 pays.
              </p>
              <div className="space-y-2 text-white/90 text-sm mb-6">
                <p>1. Bonus d'inscription : <span className="font-bold text-white">700 FCFA</span>.</p>
                <p>2. Bonus quotidien : <span className="font-bold text-white">50 FCFA</span>.</p>
                <p>3. Parrainage : jusqu'à <span className="font-bold text-white">27 %</span> de commission.</p>
                <p>4. Rejoignez notre groupe pour les codes bonus.</p>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="w-full py-3.5 bg-white rounded-full font-extrabold text-base tracking-wide mb-3"
                style={{ color: "#3db51d" }}
                data-testid="button-popup-agree"
              >
                D'ACCORD
              </button>
              <a
                href={TELEGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-3 bg-white rounded-full text-gray-700 font-semibold text-sm"
                data-testid="button-popup-telegram"
                onClick={() => setShowPopup(false)}
              >
                <SiTelegram className="w-5 h-5 text-[#229ED9]" />
                Cliquez ici pour rejoindre le groupe Telegram
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Purchase Modal */}
      {confirmProduct && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5"
          onClick={() => setConfirmProduct(null)}
        >
          <div
            className="w-full max-w-[320px] rounded-3xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Confirmer l'achat</h3>
            <p className="text-gray-600 text-sm text-center mb-1">{confirmProduct.name}</p>
            <p className="text-center text-2xl font-bold mb-4" style={{ color: "#f59e0b" }}>
              {Number(confirmProduct.price).toLocaleString("fr-FR")} {currency}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmProduct(null)}
                className="flex-1 py-3 rounded-full border border-gray-300 text-gray-600 font-semibold text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => purchaseMutation.mutate(confirmProduct.id)}
                disabled={purchaseMutation.isPending}
                className="flex-1 py-3 rounded-full text-white font-bold text-sm disabled:opacity-50"
                style={{ background: "#3db51d" }}
              >
                {purchaseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm">
        <img src={jinkoLogoText} alt="Jinko Solar" className="h-10 w-auto object-contain" data-testid="text-brand-name" />
        <button onClick={() => navigate("/service")} data-testid="button-service-header" className="p-1">
          <MessageCircleMore className="w-7 h-7 text-gray-700" />
        </button>
      </div>

      {/* Hero Image with overlaid buttons */}
      <div style={{ position: "relative", lineHeight: 0 }}>
        <img
          src={heroImg}
          alt="Jinko Solar"
          style={{ width: "100%", display: "block", height: "auto" }}
          data-testid="img-hero"
        />
        {/* Overlay buttons — 10% from bottom, right half only (avoid solar panel) */}
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "36%",
            right: "3%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <button
            onClick={() => navigate("/deposit")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              paddingLeft: 10,
              paddingRight: 13,
              paddingTop: 6,
              paddingBottom: 6,
              borderRadius: 999,
              background: "#e53935",
              border: "2px solid rgba(255,255,255,0.45)",
              color: "white",
              fontWeight: 700,
              fontSize: 12,
              boxShadow: "0 3px 8px rgba(0,0,0,0.35)",
              cursor: "pointer",
            }}
            data-testid="button-hero-recharger"
          >
            <img src={iconDeposit} alt="" style={{ width: 20, height: 20, objectFit: "contain" }} />
            Recharger
          </button>

          <button
            onClick={() => navigate("/withdrawal")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              paddingLeft: 10,
              paddingRight: 13,
              paddingTop: 6,
              paddingBottom: 6,
              borderRadius: 999,
              background: "rgba(255,255,255,0.92)",
              border: "2px solid rgba(255,255,255,0.7)",
              color: "#3db51d",
              fontWeight: 700,
              fontSize: 12,
              boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
              cursor: "pointer",
            }}
            data-testid="button-hero-retrait"
          >
            <img src={iconWithdraw} alt="" style={{ width: 20, height: 20, objectFit: "contain" }} />
            Retrait
          </button>
        </div>
      </div>

      {/* Yellow Quick Actions Bar */}
      <div className="px-3 pt-3">
        <div
          className="rounded-2xl px-2 py-4 shadow-sm"
          style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }}
        >
          <div className="flex justify-around items-start">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="flex flex-col items-center gap-1.5 flex-1"
                data-testid={`button-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                  style={{ background: "rgba(255,255,255,0.25)", border: "2px solid rgba(255,255,255,0.5)" }}
                >
                  <action.icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <span className="text-white text-[10px] font-semibold text-center leading-tight max-w-[52px]">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="px-3 mt-4 pb-24">
        {productsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#3db51d" }} />
          </div>
        ) : (
          <div className="space-y-4">
            {paidProducts.map((product) => (
              <div key={product.id} data-testid={`card-product-${product.id}`}>
                {/* Product name label */}
                <p className="font-bold text-gray-800 text-base mb-2 px-1">{product.name}</p>

                {/* Product card */}
                <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "#f28b82" }}>
                  {/* Product image */}
                  <div className="p-3 pb-0">
                    <div className="rounded-xl overflow-hidden" style={{ height: 140 }}>
                      <img
                        src={jinkoLogoSquare}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Product details */}
                  <div className="px-4 py-3 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-white/90 text-sm">Cycle(Jours)</span>
                      <span className="text-white font-bold text-sm">{product.cycleDays}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/90 text-sm">Revenu quotidien({currency})</span>
                      <span className="text-white font-bold text-sm">{Number(product.dailyEarnings).toLocaleString("fr-FR")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/90 text-sm">Revenu total({currency})</span>
                      <span className="text-white font-bold text-sm">
                        {Number(product.price).toLocaleString("fr-FR")}+{Number(product.totalReturn).toLocaleString("fr-FR")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price + Buy button */}
                <div className="flex items-center justify-between mt-3 px-1">
                  <div>
                    <p className="text-xs text-gray-500">Prix({currency})</p>
                    <p className="text-xl font-bold" style={{ color: "#f59e0b" }}>
                      {Number(product.price).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <button
                    onClick={() => setConfirmProduct(product)}
                    className="px-8 py-3 rounded-full text-white font-bold text-base shadow-md"
                    style={{ background: "#3db51d" }}
                    data-testid={`button-invest-${product.id}`}
                  >
                    Investir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
