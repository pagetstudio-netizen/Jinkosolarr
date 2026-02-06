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
            Fondee en 1966 sous le nom d'Elf Aquitaine, ELF est l'une des marques les plus emblematiques du secteur petrochimique francais, specialisee dans la formulation de lubrifiants moteurs de haute technicite et de carburants de performance. Issue de la fusion de societes petrolieres regionales, ELF s'est rapidement imposee comme un acteur majeur de l'exploitation et de la valorisation des hydrocarbures.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Grace a notre expertise et a notre technologie de pointe, nous offrons a nos utilisateurs des opportunites uniques de generer des revenus quotidiens en participant au financement et a l'exploitation d'equipements petroliers et energetiques reels.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-orange-500">Notre heritage</h2>
          <p className="text-gray-600 leading-relaxed">
            ELF a consolide sa reputation via des programmes ambitieux dans le sport mecanique, notamment la Formule 1, le rallye automobile et les championnats de motocyclisme. Son partenariat historique avec Renault F1 et Yamaha MotoGP a permis le developpement de lubrifiants optimises pour des conditions extremes.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-orange-500">Securite et Fiabilite</h2>
          <p className="text-gray-600 leading-relaxed">
            La securite de vos fonds et la transparence de nos operations sont nos priorites absolues. L'empreinte d'ELF dans le domaine energetique et technologique illustre parfaitement la capacite d'une entreprise a conjuguer ingenierie avancee, innovation scientifique et strategie de marque perenne.
          </p>
        </div>
      </div>
    </div>
  );
}
