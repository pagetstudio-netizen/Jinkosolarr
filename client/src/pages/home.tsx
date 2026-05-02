import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import ContactSheet from "@/components/contact-sheet";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCountryByCode, formatCurrency } from "@/lib/countries";
import { Loader2, X, BellRing, AlertTriangle } from "lucide-react";
import iconDeposit  from "@assets/atm_1777742458259.png";
import iconRetrait  from "@assets/app_1777742458291.png";
import iconCadeau   from "@assets/tarBar6_1777742458355.png";
import iconService  from "@assets/customer-service_1777742458188.png";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

import logoImg      from "@assets/EdwUP_fe_400x400_1777682768333.jpg";
import bannerImg    from "@assets/172052459377789_1777682768403.jpg";
import popupCharacters  from "@assets/20260411_151613_1775920729926.png";
import popupTelegramBtn from "@assets/20260411_144546_1775920729992.png";
import popupCloseBtn    from "@assets/20260411_144711_1775920729969.png";

import p1 from "@assets/panneaux-solaires-3d-realiste_625553-173_1775768333512.jpg";
import p2 from "@assets/images_(33)_1775768333811.jpeg";
import p3 from "@assets/panneau-solaire-detoure-min_1775768333844.png";
import p4 from "@assets/panneau-solaire-hybride_1775768333929.jpg";
import p5 from "@assets/images_(30)_1775768333959.jpeg";
import p6 from "@assets/images_(29)_1775768333985.jpeg";
import p7 from "@assets/images_(28)_1775768334009.jpeg";
import p8 from "@assets/images_(26)_1775768334029.jpeg";
import p9 from "@assets/1745844530190_1777682768364.jpeg";

const productImages: Record<number, string> = {
  2: p1, 3: p2, 4: p3, 5: p4, 6: p5, 7: p6, 8: p7, 9: p8, 10: p9,
};

const TELEGRAM_LINK = "https://t.me/Jinkosolarr";
const GREEN      = "#007054";
const GREEN_DARK = "#005040";
const CARD_BG    = "#b2dfdb"; /* light teal for product cards */

interface ProductWithOwnership extends Product {
  isOwned: boolean;
  canClaimFree: boolean;
  ownedCount?: number;
}

export default function HomePage() {
  const { user, refreshUser } = useAuth();
  const { toast }             = useToast();
  const [location, navigate]  = useLocation();
  useEffect(() => { document.title = "Accueil | State Grid"; }, []);

  const [showPopup,        setShowPopup]        = useState(true);
  const [showGiftModal,    setShowGiftModal]    = useState(false);
  const [showContactSheet, setShowContactSheet] = useState(false);
  const [giftCode,         setGiftCode]         = useState("");
  const [activeTab,        setActiveTab]        = useState<"plans" | "tasks">("plans");
  const [confirmProduct,   setConfirmProduct]   = useState<ProductWithOwnership | null>(null);

  const purchaseMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await apiRequest("POST", `/api/products/${productId}/purchase`, {});
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erreur"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/products"] });
      refreshUser();
      setConfirmProduct(null);
      toast({ title: "Produit acheté !", description: "Vous commencerez à recevoir des gains demain." });
    },
    onError: (err: any) => {
      setConfirmProduct(null);
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const claimMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/gift-codes/claim", { code });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erreur"); }
      return res.json();
    },
    onSuccess: (data) => {
      refreshUser(); setGiftCode(""); setShowGiftModal(false);
      toast({ title: "Félicitations !", description: data.message });
    },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const { data: products, isLoading: productsLoading } = useQuery<ProductWithOwnership[]>({
    queryKey: ["/api/products"],
    enabled: !!user,
  });

  useEffect(() => { setShowPopup(true); }, [location]);

  if (!user) return <div style={{ minHeight: "100vh", background: GREEN }} />;

  const country   = getCountryByCode(user.country);
  const currency  = country?.currency || "FCFA";
  const balance   = Number(user.balance);

  const paidProducts = products?.filter(p => !p.isFree) || [];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f2f2f7" }}>
      <ContactSheet open={showContactSheet} onClose={() => setShowContactSheet(false)} />

      {/* ── POPUP ─────────────────────────────────────────── */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80"
          onClick={() => setShowPopup(false)}>
          <div style={{ width: "92vw", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
            onClick={e => e.stopPropagation()}>
            <img src={popupCharacters} alt="Bienvenue" style={{ width: "100%", borderRadius: 20 }} data-testid="img-popup" />
            <a href={TELEGRAM_LINK} target="_blank" rel="noopener noreferrer" style={{ width: "90%", display: "block" }} data-testid="button-popup-telegram">
              <img src={popupTelegramBtn} alt="Télégram" style={{ width: "100%", borderRadius: 50 }} />
            </a>
            <button onClick={() => setShowPopup(false)} data-testid="button-popup-close"
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, width: 64, height: 64 }}>
              <img src={popupCloseBtn} alt="Fermer" style={{ width: "100%", height: "100%" }} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TOP SECTION — teal gradient background
      ══════════════════════════════════════════════════ */}
      <div style={{ background: `linear-gradient(160deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`, paddingBottom: 20 }}>

        {/* ── Logo row ──────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 16px 10px" }}>
          <p style={{ color: "white", fontWeight: 800, fontSize: 20, margin: 0, letterSpacing: 0.5 }}>State Grid</p>
        </div>

        {/* ── Banner image ──────────────────────────────── */}
        <div style={{ margin: "0 16px 16px", borderRadius: 16, overflow: "hidden" }}>
          <img src={bannerImg} alt="State Grid" style={{ width: "100%", height: 170, objectFit: "cover", display: "block" }} />
        </div>

        {/* ── 4 Quick Actions ───────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-around", padding: "0 8px" }}>
          {[
            { img: iconDeposit,  label: "Recharger", action: () => navigate("/deposit") },
            { img: iconRetrait,  label: "Retrait",   action: () => navigate("/withdrawal") },
            { img: iconCadeau,   label: "Cadeau",    action: () => { setGiftCode(""); setShowGiftModal(true); } },
            { img: iconService,  label: "Service",   action: () => setShowContactSheet(true) },
          ].map((item, i) => (
            <button key={i} onClick={item.action} data-testid={`button-quick-${i}`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer" }}>
              <img src={item.img} alt={item.label} style={{ width: 52, height: 52, objectFit: "contain" }} />
              <span style={{ color: "white", fontSize: 11, fontWeight: 600 }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          PRODUCT CARDS — new VIP style
      ══════════════════════════════════════════════════ */}
      <div style={{ padding: "0 16px 100px", display: "flex", flexDirection: "column", gap: 14 }}>
        {productsLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Loader2 style={{ width: 32, height: 32, color: GREEN, animation: "spin 1s linear infinite" }} />
          </div>
        ) : paidProducts.length === 0 ? (
          <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 14, padding: 40 }}>Aucun produit disponible</p>
        ) : (
          paidProducts.map((product, idx) => {
            const price  = Number(product.price);
            const daily  = Number(product.dailyEarnings);
            const days   = Number(product.cycleDays);
            const total  = Number(product.totalReturn);
            const imgSrc = productImages[product.id] || p1;
            const vipNum = idx + 1;

            return (
              <div key={product.id}
                style={{ background: CARD_BG, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,112,84,0.15)" }}
                data-testid={`card-product-${product.id}`}>

                {/* VIP label */}
                <div style={{ padding: "10px 14px 6px" }}>
                  <span style={{ fontWeight: 800, fontSize: 17, color: "#003d2e" }}>VIP{vipNum}</span>
                </div>

                {/* Image + white info card */}
                <div style={{ display: "flex", gap: 10, padding: "0 12px" }}>
                  {/* Product image */}
                  <div style={{ width: 90, height: 90, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.4)" }}>
                    <img src={imgSrc} alt={product.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>

                  {/* White info card */}
                  <div style={{ flex: 1, background: "white", borderRadius: 12, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>Revenu Quotidien</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>{daily.toLocaleString("fr-FR")}</span>
                    </div>
                    <div style={{ height: 1, background: "#f0f0f0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>Période de validité</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>{days} journées</span>
                    </div>
                    <div style={{ height: 1, background: "#f0f0f0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>Prix</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>{price.toLocaleString("fr-FR")}</span>
                    </div>
                  </div>
                </div>

                {/* Acheter button */}
                <div style={{ padding: "12px 12px 12px" }}>
                  <button
                    onClick={() => setConfirmProduct(product)}
                    data-testid={`button-acheter-${product.id}`}
                    style={{
                      width: "100%", height: 44, borderRadius: 999,
                      background: `linear-gradient(90deg, ${GREEN} 0%, #009688 100%)`,
                      color: "white", fontWeight: 700, fontSize: 15,
                      border: "none", cursor: "pointer",
                      boxShadow: "0 3px 10px rgba(0,112,84,0.3)",
                    }}
                  >
                    Acheter
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── CONFIRM PURCHASE MODAL ───────────────────────── */}
      {confirmProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => setConfirmProduct(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}>

            <div className="pt-6 pb-4 px-6 text-center">
              <p className="text-base font-semibold text-gray-800">
                Êtes-vous sûr de vouloir acheter ce produit ?
              </p>
              <p className="text-sm text-gray-500 mt-1 font-medium">{confirmProduct.name}</p>
            </div>

            {balance < confirmProduct.price && (
              <div className="flex items-center gap-2 mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-500">
                  Solde insuffisant. Il vous manque {formatCurrency(confirmProduct.price - balance, user.country)}.
                </p>
              </div>
            )}

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setConfirmProduct(null)}
                className="flex-1 py-3 rounded-full font-semibold text-sm text-gray-600"
                style={{ background: "#f3f4f6" }}
                data-testid="button-cancel-purchase">
                Annuler
              </button>
              <button
                onClick={() => purchaseMutation.mutate(confirmProduct.id)}
                disabled={purchaseMutation.isPending || balance < confirmProduct.price}
                className="flex-1 py-3 rounded-full text-white font-semibold text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})` }}
                data-testid="button-confirm-purchase">
                {purchaseMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GIFT CODE MODAL ──────────────────────────────── */}
      {showGiftModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowGiftModal(false); }}>
          <div className="w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl" style={{ background: GREEN }}>
            <div className="flex justify-end px-4 pt-4">
              <button onClick={() => setShowGiftModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: "rgba(0,0,0,0.15)" }}
                data-testid="button-close-gift">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="px-6 pb-2 pt-1">
              <h2 className="text-white font-extrabold text-2xl italic leading-tight">
                Recevez de<br />l'argent gratuit
              </h2>
            </div>
            <div className="flex justify-center py-4">
              <span style={{ fontSize: 52 }}>💰</span>
            </div>
            <div className="px-6 pb-4">
              <input
                type="text"
                value={giftCode}
                onChange={e => setGiftCode(e.target.value.toUpperCase())}
                placeholder="Votre code bonus"
                className="w-full px-4 py-3.5 rounded-xl text-center font-mono tracking-widest text-gray-800 text-sm outline-none"
                style={{ borderWidth: 2.5, borderStyle: "solid", borderColor: giftCode ? GREEN_DARK : "white", background: "white" }}
                data-testid="input-gift-code-modal"
              />
            </div>
            <div className="px-6 pb-5">
              <button
                onClick={() => {
                  if (!giftCode.trim()) { toast({ title: "Erreur", description: "Veuillez saisir un code", variant: "destructive" }); return; }
                  claimMutation.mutate(giftCode.trim());
                }}
                disabled={claimMutation.isPending}
                className="w-full py-4 rounded-xl font-extrabold text-sm tracking-widest flex items-center justify-center gap-2"
                style={{ background: "#111827", color: "#f59e0b" }}
                data-testid="button-confirm-gift">
                {claimMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin text-yellow-400" /> : "CONFIRMER"}
              </button>
            </div>
            <div className="mx-5 mb-5 rounded-2xl p-4 space-y-2" style={{ background: "rgba(0,0,0,0.15)" }}>
              <div className="flex items-start gap-2">
                <span className="text-base mt-0.5">💡</span>
                <p className="text-white text-xs font-medium leading-relaxed">
                  <span className="font-bold">Récompenses Cash!</span><br />
                  Entrez le code bonus pour recevoir un montant aléatoire! Jusqu'à 10 000 FCFA!
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base mt-0.5">💡</span>
                <p className="text-white text-xs leading-relaxed">
                  Les codes bonus seront publiés sur la chaîne officielle Telegram tous les jours à 11h30 et 18h00.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
