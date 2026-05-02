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
            State Grid est reconnu comme l'un des leaders mondiaux dans le domaine de la production, du transport et de la distribution d'électricité. Grâce à un vaste réseau d'infrastructures modernes et à l'utilisation de technologies avancées, l'entreprise assure un approvisionnement énergétique fiable et continu pour des millions de foyers, d'entreprises et d'industries.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold" style={{ color: "#3db51d" }}>Innovation & Durabilité</h2>
          <p className="text-gray-600 leading-relaxed">
            L'entreprise se distingue également par son engagement dans le développement des énergies renouvelables, notamment le solaire et l'éolien, ainsi que par la mise en place de réseaux intelligents (smart grids) permettant une gestion plus efficace et durable de l'électricité. Ces innovations contribuent à améliorer la qualité de service tout en réduisant l'impact environnemental.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold" style={{ color: "#3db51d" }}>Sécurité et Fiabilité</h2>
          <p className="text-gray-600 leading-relaxed">
            La sécurité de vos fonds et la transparence de nos opérations sont nos priorités absolues. Notre plateforme vous offre des opportunités uniques de générer des revenus quotidiens en participant au financement et à l'expansion de State Grid à l'échelle internationale.
          </p>
        </div>
      </div>
    </div>
  );
}
