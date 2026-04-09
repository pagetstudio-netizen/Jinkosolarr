import { useAuth } from "@/lib/auth";
import { SiTelegram } from "react-icons/si";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { Loader2, MessageCircleMore } from "lucide-react";
import iconGratuit from "@assets/20260409_174413_1775756828265.png";
import iconPreuve from "@assets/20260409_174658_1775756828223.png";
import iconRecharger from "@assets/20260409_133235_1775749369916.png";
import iconRetrait from "@assets/20260409_133935_1775749370458.png";
import iconContact from "@assets/20260409_152753_1775749370488.png";
import type { Product } from "@shared/schema";

import p1 from "@/assets/images/product-1.jpg";
import p2 from "@/assets/images/product-2.webp";
import p3 from "@/assets/images/product-3.webp";
import p4 from "@/assets/images/product-4.webp";
import p5 from "@/assets/images/product-5.webp";
import p6 from "@/assets/images/product-6.webp";
import p7 from "@/assets/images/product-7.webp";
import p8 from "@/assets/images/product-8.webp";
import p9 from "@/assets/images/product-9.jpg";
import jinkoLogoText from "@assets/JinkoSolarLOGO_1775671142017.png";
import jinkoLogoSquare from "@assets/jinko-solar-logo-png_seeklogo-265492_1775671142176.png";
import heroImg from "@assets/20260408_191813_1775675938233.jpg";

const productImages: Record<number, string> = { 2: p1, 3: p2, 4: p3, 5: p4, 6: p5, 7: p6, 8: p7, 9: p8, 10: p9 };
const TELEGRAM_LINK = "https://t.me/wendysappgroup";

interface ProductWithOwnership extends Product {
  isOwned: boolean;
  canClaimFree: boolean;
  ownedCount?: number;
}

export default function HomePage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [showPopup, setShowPopup] = useState(true);
  const { data: products, isLoading: productsLoading } = useQuery<ProductWithOwnership[]>({
    queryKey: ["/api/products"],
    enabled: !!user,
  });

  useEffect(() => {
    setShowPopup(true);
  }, [location]);

  if (!user) return <div className="min-h-screen bg-gray-100" />;

  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";
  const paidProducts = products?.filter(p => !p.isFree) || [];

  const quickActions = [
    { label: "Recharger", img: iconRecharger, onClick: () => navigate("/deposit") },
    { label: "Retrait", img: iconRetrait, onClick: () => navigate("/withdrawal") },
    { label: "Nous contacter", img: iconContact, onClick: () => navigate("/service") },
    { label: "Argent gratuit", img: iconGratuit, onClick: () => navigate("/gift-code") },
    { label: "Preuve de retrait", img: iconPreuve, onClick: () => navigate("/withdrawal-history") },
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
            <img src={iconRecharger} alt="" style={{ width: 20, height: 20, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
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
            <span style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "#2a8d13",
              display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <img src={iconRetrait} alt="" style={{ width: 14, height: 14, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            </span>
            Retrait
          </button>
        </div>
      </div>

      {/* Green Quick Actions Bar */}
      <div className="px-3 pt-3">
        <div
          className="rounded-2xl px-2 py-4 shadow-sm"
          style={{ background: "linear-gradient(135deg, #3db51d 0%, #2a8d13 100%)" }}
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
                  <img
                    src={action.img}
                    alt={action.label}
                    className="w-7 h-7 object-contain"
                  />
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
      <div className="px-3 mt-4 pb-24 space-y-3">
        {productsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#3db51d" }} />
          </div>
        ) : (
          paidProducts.map((product) => {
            const price = Number(product.price);
            const total = Number(product.totalReturn);
            const daily = Number(product.dailyEarnings);
            const taux = price > 0 ? Math.round((total / price) * 100) : 0;
            const imgSrc = productImages[product.id] || p1;
            return (
              <button
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="w-full text-left rounded-2xl overflow-hidden shadow-md"
                style={{ backgroundColor: "#1a1a2e" }}
                data-testid={`card-product-${product.id}`}
              >
                {/* Top row: image + info */}
                <div className="flex gap-3 p-3 pb-2">
                  <div className="w-[110px] h-[110px] rounded-xl overflow-hidden shrink-0">
                    <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <p className="text-white font-bold text-base">{product.name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">cycles {product.cycleDays}</p>
                    </div>
                    <div>
                      <span className="text-cyan-400 text-xs font-semibold">Prix </span>
                      <span className="font-extrabold text-base" style={{ color: "#f59e0b" }}>
                        {price.toLocaleString("fr-FR")} {currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 12px" }} />

                {/* Stats row */}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex-1">
                    <p className="text-gray-500 text-[10px] mb-0.5">Revenu quotidien</p>
                    <p className="text-white font-bold text-sm">{daily.toLocaleString("fr-FR")} {currency}</p>
                  </div>
                  <div className="w-px h-7" style={{ background: "rgba(255,255,255,0.1)" }} />
                  <div className="flex-1 text-center">
                    <p className="text-gray-500 text-[10px] mb-0.5">Total des gains</p>
                    <p className="text-white font-bold text-sm">{total.toLocaleString("fr-FR")} {currency}</p>
                  </div>
                  <div className="w-px h-7" style={{ background: "rgba(255,255,255,0.1)" }} />
                  <div className="flex-1 text-right">
                    <p className="text-gray-500 text-[10px] mb-0.5">Taux de réponse</p>
                    <p className="font-bold text-sm" style={{ color: "#3db51d" }}>{taux}%</p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
