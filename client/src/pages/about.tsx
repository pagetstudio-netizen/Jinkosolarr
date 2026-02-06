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
          <h2 className="text-xl font-bold text-orange-500">Qui sommes-nous ?</h2>
          <p className="text-gray-600 leading-relaxed">
            ELF est une plateforme d'investissement leader, specialisee dans l'equipement industriel et la robotique. Notre mission est de democratiser l'acces aux investissements industriels de haute technologie pour les utilisateurs en Afrique francophone.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Grace a notre technologie de pointe et a notre expertise sectorielle, nous offrons a nos utilisateurs des opportunites uniques de generer des revenus quotidiens en participant au financement et a l'exploitation d'equipements industriels reels.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-orange-500">Notre vision</h2>
          <p className="text-gray-600 leading-relaxed">
            Nous croyons en un avenir ou chacun peut beneficier de la croissance industrielle. ELF s'engage a fournir une plateforme transparente, securisee et rentable pour tous nos partenaires et investisseurs.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-orange-500">Securite et Fiabilite</h2>
          <p className="text-gray-600 leading-relaxed">
            La securite de vos fonds et la transparence de nos operations sont nos priorites absolues. Nous utilisons les technologies les plus avancees pour garantir la protection de vos donnees et la regularite de vos gains.
          </p>
        </div>
      </div>
    </div>
  );
}
