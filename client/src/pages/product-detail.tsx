import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getCountryByCode } from "@/lib/countries";
import { ChevronLeft, X, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Product } from "@shared/schema";

import fallbackImg from "@assets/EdwUP_fe_400x400_1777682768333.jpg";

interface ProductWithOwnership extends Product {
  isOwned: boolean;
  canClaimFree: boolean;
  ownedCount?: number;
}

const descriptions: Record<string, string> = {
  "VIP 1": "Les produits VIP 1 de State Grid sont des solutions d'entrée de gamme idéales pour débuter dans l'investissement. Ces produits génèrent de l'électricité propre chaque jour et produisent des revenus passifs stables. Investissez dès maintenant pour profiter de l'énergie.",
  "VIP 2": "Le VIP 2 de State Grid offre une puissance accrue et des rendements supérieurs. Idéal pour les investisseurs souhaitant optimiser leurs gains journaliers tout en contribuant à la transition énergétique.",
  "VIP 3": "Le VIP 3 est un panneau haute performance qui maximise la production d'énergie solaire. Avec un excellent taux de retour sur investissement, il représente un choix stratégique pour votre portefeuille.",
  "VIP 4": "Le VIP 4 State Grid est conçu pour les investisseurs ambitieux. Sa technologie avancée garantit une production d'énergie optimale et des revenus quotidiens attractifs sur toute la durée du cycle.",
  "VIP 5": "Le VIP 5 allie performance et rentabilité. Avec ce produit premium, bénéficiez d'un revenu quotidien élevé et d'un retour total exceptionnel sur votre investissement solaire.",
  "VIP 6": "Le VIP 6 est réservé aux investisseurs expérimentés cherchant des rendements maximum. La technologie State Grid de pointe assure une production d'énergie constante et des gains substantiels.",
  "VIP 7": "Le VIP 7 représente l'excellence de l'investissement solaire. Profitez de revenus journaliers très élevés et d'un cycle d'investissement optimisé pour maximiser vos bénéfices.",
  "VIP 8": "Le VIP 8 est notre produit phare pour les grands investisseurs. Il combine technologie de pointe et rendements exceptionnels pour une expérience d'investissement solaire unique et très profitable.",
  "VIP 9": "Le VIP 9 est le summum de l'investissement chez State Grid. Réservé aux investisseurs premium, il offre les meilleurs rendements du marché avec une fiabilité et une performance incomparables.",
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: products } = useQuery<ProductWithOwnership[]>({
    queryKey: ["/api/products"],
  });

  const product = products?.find(p => p.id === Number(id));

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/products/${product!.id}/purchase`, {});
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-products"] });
      refreshUser();
      setShowConfirm(false);
      toast({ title: "Produit acheté !", description: "Vous commencerez à recevoir des gains demain." });
      navigate("/");
    },
    onError: (error: any) => {
      setShowConfirm(false);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  if (!user || !product) return null;

  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";
  const price = Number(product.price);
  const totalReturn = Number(product.totalReturn);
  const dailyEarnings = Number(product.dailyEarnings);
  const tauxReponse = price > 0 ? Math.round((totalReturn / price) * 100) : 0;
  const imgSrc = product.imageUrl || fallbackImg;
  const desc = descriptions[product.name] || `${product.name} est un produit d'investissement State Grid offrant des revenus quotidiens attractifs et un excellent retour sur investissement.`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0f0f1a" }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3">
        <button onClick={() => navigate("/")} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} data-testid="button-back">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="flex-1 text-center text-white font-bold text-base pr-9">Détails du produit</h1>
      </div>

      {/* Product image */}
      <div className="w-full" style={{ height: 220 }}>
        <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
      </div>

      {/* Product info */}
      <div className="px-4 pt-4">
        <h2 className="text-white font-extrabold text-2xl mb-1">{product.name}</h2>
        <p className="font-bold text-xl mb-4" style={{ color: "#f59e0b" }}>
          {price.toLocaleString("fr-FR")} {currency}
        </p>

        {/* Daily + Total */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">Revenu quotidien:</span>
            <span className="font-bold" style={{ color: "#f59e0b" }}>
              {dailyEarnings.toLocaleString("fr-FR")} {currency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">Total des gains:</span>
            <span className="font-bold" style={{ color: "#f59e0b" }}>
              {totalReturn.toLocaleString("fr-FR")} {currency}
            </span>
          </div>
        </div>

        {/* 3-stat bar */}
        <div className="flex items-center justify-between py-3 mb-5 rounded-xl" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex-1 text-center">
            <p className="text-gray-500 text-[11px] mb-1">Taux de réponse</p>
            <p className="font-bold text-sm" style={{ color: "#007054" }}>{tauxReponse}%</p>
          </div>
          <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="flex-1 text-center">
            <p className="text-gray-500 text-[11px] mb-1">Durée de détention</p>
            <p className="text-white font-bold text-sm">{product.cycleDays} Jours</p>
          </div>
          <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="flex-1 text-center">
            <p className="text-gray-500 text-[11px] mb-1">Achat limité</p>
            <p className="text-white font-bold text-sm">1</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => navigate("/deposit")}
            className="flex-1 py-3.5 rounded-full text-white font-bold text-sm"
            style={{ background: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)" }}
            data-testid="button-recharger"
          >
            Recharger le compte
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex-1 py-3.5 rounded-full text-white font-bold text-sm"
            style={{ background: "linear-gradient(90deg, #06b6d4 0%, #0284c7 100%)" }}
            data-testid="button-acheter"
          >
            Acheter le produit
          </button>
        </div>

        {/* Description */}
        <div className="pb-10">
          <h3 className="text-white font-bold text-base text-center mb-3">Description du produit</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
        </div>
      </div>

      {/* Conseil confirmation popup */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="mx-6 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3" style={{ background: "linear-gradient(90deg, #06b6d4 0%, #0284c7 100%)" }}>
              <span className="text-white font-bold text-base">Conseil</span>
              <button onClick={() => setShowConfirm(false)} data-testid="button-close-confirm">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            {/* Body */}
            <div className="bg-white px-6 py-5">
              <p className="text-gray-800 font-semibold text-center text-sm mb-5">
                Êtes-vous sûr de vouloir acheter ce produit
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-full text-white font-bold text-sm"
                  style={{ background: "linear-gradient(90deg, #06b6d4 0%, #0284c7 100%)" }}
                  data-testid="button-annuler"
                >
                  Annuler
                </button>
                <button
                  onClick={() => purchaseMutation.mutate()}
                  disabled={purchaseMutation.isPending}
                  className="flex-1 py-3 rounded-full text-white font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(90deg, #06b6d4 0%, #0284c7 100%)" }}
                  data-testid="button-confirmer"
                >
                  {purchaseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
