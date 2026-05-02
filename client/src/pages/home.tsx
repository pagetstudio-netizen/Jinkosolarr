import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import ContactSheet from "@/components/contact-sheet";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { Loader2, X, Volume2, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import iconGratuit  from "@assets/20260409_174413_1775756828265.png";
import iconTache    from "@assets/20260409_174658_1775756828223.png";
import iconCommande from "@assets/20260409_133235_1775749369916.png";
import iconRetrait  from "@assets/20260409_133935_1775749370458.png";
import popupCharacters  from "@assets/20260411_151613_1775920729926.png";
import popupTelegramBtn from "@assets/20260411_144546_1775920729992.png";
import popupCloseBtn    from "@assets/20260411_144711_1775920729969.png";
import type { Product } from "@shared/schema";

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
const GREEN = "#007054";
const GREEN_DARK = "#005040";

interface ProductWithOwnership extends Product {
  isOwned: boolean;
  canClaimFree: boolean;
  ownedCount?: number;
}

export default function HomePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  useEffect(() => { document.title = "Accueil | State Grid"; }, []);

  const [showPopup,       setShowPopup]       = useState(true);
  const [showGiftModal,   setShowGiftModal]   = useState(false);
  const [showContactSheet,setShowContactSheet]= useState(false);
  const [giftCode,        setGiftCode]        = useState("");
  const [activeTab,       setActiveTab]       = useState(0);

  const claimMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/gift-codes/claim", { code });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erreur"); }
      return res.json();
    },
    onSuccess: (data) => {
      refreshUser();
      setGiftCode("");
      setShowGiftModal(false);
      toast({ title: "Félicitations !", description: data.message });
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const { data: products, isLoading: productsLoading } = useQuery<ProductWithOwnership[]>({
    queryKey: ["/api/products"],
    enabled: !!user,
  });

  useEffect(() => { setShowPopup(true); }, [location]);

  if (!user) return <div className="min-h-screen bg-gray-100" />;

  const country      = getCountryByCode(user.country);
  const currency     = country?.currency || "FCFA";
  const paidProducts = products?.filter(p => !p.isFree) || [];
  const ownedPaid    = products?.filter(p => p.isOwned && !p.isFree) || [];
  const totalDaily   = ownedPaid.reduce((s, p) => s + Number(p.dailyEarnings), 0);
  const totalReturn  = ownedPaid.reduce((s, p) => s + Number(p.totalReturn),   0);

  /* Super Mine = half the list (last products), Bien-être = first half */
  const mid          = Math.ceil(paidProducts.length / 2);
  const tabProducts  = activeTab === 0 ? paidProducts.slice(0, mid) : paidProducts.slice(mid);

  return (
    <div className="flex flex-col min-h-full" style={{ backgroundColor: "#f2f2f7" }}>
      <ContactSheet open={showContactSheet} onClose={() => setShowContactSheet(false)} />

      {/* ── POPUP ─────────────────────────────────────────── */}
      {showPopup && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 animate-in fade-in duration-200"
          onClick={() => setShowPopup(false)}
        >
          <div
            style={{ width: "92vw", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
            onClick={e => e.stopPropagation()}
          >
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

      {/* ── MARQUEE BAR ───────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` }}>
        <div className="flex items-center px-3 py-2 gap-2 overflow-hidden">
          <Volume2 className="w-4 h-4 text-white shrink-0" />
          <div className="flex-1 overflow-hidden">
            <p className="text-white text-xs font-medium animate-marquee whitespace-nowrap">
              Bienvenue sur State Grid — Investissez et gagnez des revenus quotidiens ! Plateforme sécurisée et fiable.
            </p>
          </div>
        </div>
      </div>

      {/* ── BALANCE CARD ──────────────────────────────────── */}
      <div className="mx-3 mt-3">
        <div className="bg-white rounded-2xl shadow-sm px-4 pt-4 pb-3">
          {/* Row 1: label + retrait link */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <img src={iconRetrait} alt="" className="w-6 h-6 object-contain" />
              <span className="text-gray-500 text-sm">Solde({currency})</span>
            </div>
            <button
              onClick={() => navigate("/withdrawal")}
              className="flex items-center text-gray-400 text-sm"
              data-testid="button-go-retrait"
            >
              Retrait<ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Row 2: balance + dépôt button */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl font-extrabold text-gray-900" data-testid="text-balance">
              {Number(user.balance).toLocaleString("fr-FR")}
            </span>
            <button
              onClick={() => navigate("/deposit")}
              className="px-6 py-2.5 rounded-full text-white font-bold text-sm shadow-sm"
              style={{ background: GREEN }}
              data-testid="button-depot"
            >
              Dépôt
            </button>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-100 mb-3" />

          {/* Row 3: two stats */}
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-gray-400 text-[11px] leading-tight">Revenus quotidiens ({currency})</p>
              <p className="font-bold text-gray-800 mt-0.5" data-testid="text-daily-total">
                {totalDaily.toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-[11px] leading-tight">Revenus totaux ({currency})</p>
              <p className="font-bold text-gray-800 mt-0.5" data-testid="text-return-total">
                {totalReturn.toLocaleString("fr-FR")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS (3 icons) ───────────────────────── */}
      <div className="mx-3 mt-3">
        <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
          <div className="flex justify-around">
            {/* Argent gratuit */}
            <button
              onClick={() => { setGiftCode(""); setShowGiftModal(true); }}
              className="flex flex-col items-center gap-1.5"
              data-testid="button-action-argent-gratuit"
            >
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
                <img src={iconGratuit} alt="Argent gratuit" className="w-10 h-10 object-contain" />
              </div>
              <span className="text-[11px] text-gray-600 font-medium text-center">Argent gratuit</span>
            </button>

            {/* Bonus de tâche */}
            <button
              onClick={() => navigate("/tasks")}
              className="flex flex-col items-center gap-1.5"
              data-testid="button-action-bonus-tache"
            >
              <div className="w-14 h-14 rounded-full bg-yellow-50 flex items-center justify-center">
                <img src={iconTache} alt="Bonus de tâche" className="w-10 h-10 object-contain" />
              </div>
              <span className="text-[11px] text-gray-600 font-medium text-center">Bonus de tâche</span>
            </button>

            {/* Commande */}
            <button
              onClick={() => navigate("/invest")}
              className="flex flex-col items-center gap-1.5"
              data-testid="button-action-commande"
            >
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <img src={iconCommande} alt="Commande" className="w-10 h-10 object-contain" />
              </div>
              <span className="text-[11px] text-gray-600 font-medium text-center">Commande</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── CATEGORY TABS ────────────────────────────────── */}
      <div className="mx-3 mt-3">
        <div className="flex gap-1 bg-gray-200 rounded-full p-1">
          <button
            onClick={() => setActiveTab(0)}
            className="flex-1 py-2 rounded-full text-sm font-bold transition-all"
            style={activeTab === 0
              ? { background: GREEN, color: "white" }
              : { background: "transparent", color: "#6b7280" }}
            data-testid="tab-bien-etre"
          >
            Produits de bien-être
          </button>
          <button
            onClick={() => setActiveTab(1)}
            className="flex-1 py-2 rounded-full text-sm font-bold transition-all"
            style={activeTab === 1
              ? { background: GREEN, color: "white" }
              : { background: "transparent", color: "#6b7280" }}
            data-testid="tab-super-mine"
          >
            💎 Super Mine
          </button>
        </div>
      </div>

      {/* ── PRODUCT CARDS ────────────────────────────────── */}
      <div className="mx-3 mt-3 pb-6 space-y-3">
        {productsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: GREEN }} />
          </div>
        ) : tabProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">Aucun produit disponible</div>
        ) : (
          tabProducts.map((product) => {
            const price = Number(product.price);
            const total = Number(product.totalReturn);
            const daily = Number(product.dailyEarnings);
            const profit = total - price;
            const imgSrc = productImages[product.id] || p1;

            return (
              <div
                key={product.id}
                className="rounded-2xl overflow-hidden shadow-md"
                style={{ background: `linear-gradient(145deg, ${GREEN} 0%, #009688 100%)` }}
                data-testid={`card-product-${product.id}`}
              >
                {/* Card title */}
                <div className="px-4 pt-4 pb-2">
                  <p className="text-white font-bold text-base">Produits VIP {product.name}</p>
                </div>

                {/* Product image */}
                <div className="mx-4 rounded-xl overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={product.name}
                    className="w-full object-cover"
                    style={{ height: 170 }}
                  />
                </div>

                {/* Stats */}
                <div className="px-4 pt-3 pb-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">Cycle(Jours)</span>
                    <span className="text-white font-bold text-sm">{product.cycleDays}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">Revenu quotidien({currency})</span>
                    <span className="font-bold text-sm" style={{ color: "#f59e0b" }}>
                      {daily.toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">Revenu total({currency})</span>
                    <span className="font-bold text-sm" style={{ color: "#f59e0b" }}>
                      {price.toLocaleString("fr-FR")}+{profit.toLocaleString("fr-FR")}
                    </span>
                  </div>
                </div>

                {/* Separator */}
                <div className="mx-4 border-t border-white/20 my-1" />

                {/* Footer: price + Investir button */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-white text-sm">Prix({currency}) </span>
                    <span className="text-white font-extrabold text-base" style={{ color: "#f59e0b" }}>
                      {price.toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="px-6 py-2 bg-white rounded-full font-bold text-sm shadow-sm"
                    style={{ color: GREEN }}
                    data-testid={`button-investir-${product.id}`}
                  >
                    Investir
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── PROJET PRINCIPAL ─────────────────────────────── */}
      {!productsLoading && paidProducts.length > 0 && (
        <div className="pb-24">
          <div className="px-3 mb-2">
            <h2 className="text-gray-800 font-bold text-base">Projet principal</h2>
          </div>
          <div className="flex gap-3 px-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {paidProducts.map((product) => {
              const price = Number(product.price);
              const imgSrc = productImages[product.id] || p1;
              return (
                <button
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-sm flex items-center gap-3 px-3 py-2"
                  style={{ minWidth: 210 }}
                  data-testid={`card-main-${product.id}`}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                    <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <p className="text-gray-800 font-semibold text-xs leading-tight line-clamp-2">{product.name}</p>
                    <p className="font-bold text-sm mt-1" style={{ color: GREEN }}>
                      {price.toLocaleString("fr-FR")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── GIFT CODE MODAL ──────────────────────────────── */}
      {showGiftModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowGiftModal(false); }}
        >
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
                data-testid="button-confirm-gift"
              >
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
                  Les codes bonus seront publiés sur la chaîne officielle Telegram tous les jours à 11h30 et 18h00. Suivez notre chaîne pour ne rien manquer!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
