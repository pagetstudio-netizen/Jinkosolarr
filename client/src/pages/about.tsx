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
          <h2 className="text-xl font-bold" style={{ color: "#3db51d" }}>Qui sommes-nous ?</h2>
          <p className="text-gray-600 leading-relaxed">
            State Grid est l'une des plus grandes entreprises d'énergie au monde, présente dans plus de 160 pays. Reconnue pour la qualité et la fiabilité de ses services, State Grid est un leader incontesté dans le secteur de l'énergie mondiale.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Grâce à notre expertise et à notre réseau mondial, nous offrons à nos utilisateurs des opportunités uniques de générer des revenus quotidiens en participant au financement et à l'expansion de State Grid à l'échelle internationale.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold" style={{ color: "#3db51d" }}>Notre héritage</h2>
          <p className="text-gray-600 leading-relaxed">
            Aujourd'hui, State Grid est présent dans de nombreux pays avec plus de 200 GW de capacité installée et propose une large gamme de solutions énergétiques haute performance, devenant ainsi une marque reconnue à l'échelle internationale dans le secteur de l'énergie.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold" style={{ color: "#3db51d" }}>Sécurité et Fiabilité</h2>
          <p className="text-gray-600 leading-relaxed">
            La sécurité de vos fonds et la transparence de nos opérations sont nos priorités absolues. L'empreinte de State Grid dans le domaine de l'énergie illustre parfaitement la capacité d'une entreprise à conjuguer qualité, innovation et stratégie de marque pérenne.
          </p>
        </div>
      </div>
    </div>
  );
}
