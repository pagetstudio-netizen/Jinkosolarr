import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-full bg-white">
      <header className="flex items-center px-4 py-3 border-b bg-white">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        </Link>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">A propos de nous</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#2196F3]">Qui sommes-nous ?</h2>
          <p className="text-gray-600 leading-relaxed">
            Fondée en 1969 à Columbus, dans l'État de l'Ohio aux États-Unis, Wendy's est l'une des plus grandes chaînes de restauration rapide au monde, reconnue pour ses hamburgers au bœuf frais jamais congelé et ses burgers carrés emblématiques. Créée par Dave Thomas, l'enseigne s'est rapidement imposée comme un acteur majeur du secteur du fast-food grâce à la qualité de ses produits et à son image de marque distinctive.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Grâce à notre expertise et à notre réseau mondial, nous offrons à nos utilisateurs des opportunités uniques de générer des revenus quotidiens en participant au financement et à l'expansion de la marque Wendy's à l'échelle internationale.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#2196F3]">Notre héritage</h2>
          <p className="text-gray-600 leading-relaxed">
            Aujourd'hui, Wendy's est présente dans de nombreux pays avec plus de 6 000 restaurants et propose un large choix de burgers, frites, nuggets et desserts populaires comme le Frosty, devenant ainsi une marque reconnue à l'échelle internationale.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#2196F3]">Sécurité et Fiabilité</h2>
          <p className="text-gray-600 leading-relaxed">
            La sécurité de vos fonds et la transparence de nos opérations sont nos priorités absolues. L'empreinte de Wendy's dans le domaine de la restauration rapide illustre parfaitement la capacité d'une entreprise à conjuguer qualité, innovation et stratégie de marque pérenne.
          </p>
        </div>
      </div>
    </div>
  );
}
