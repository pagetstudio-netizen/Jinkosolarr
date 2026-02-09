import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function RulesPage() {
  return (
    <div className="flex flex-col min-h-full bg-white">
      <header className="flex items-center px-4 py-3 border-b bg-white">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        </Link>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">Regles de la plateforme</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#2196F3] border-l-4 border-[#2196F3] pl-3">1. Investissement</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
            <li>Chaque utilisateur peut posseder plusieurs produits d'investissement simultanement.</li>
            <li>Les revenus sont generes quotidiennement et accredites sur votre solde de compte toutes les 24 heures.</li>
            <li>Le cycle d'investissement standard est de 80 jours, sauf indication contraire pour les produits speciaux.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#2196F3] border-l-4 border-[#2196F3] pl-3">2. Depots et Retraits</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
            <li>Le montant minimum de depot est de 3000 FCFA.</li>
            <li>Le montant minimum de retrait est de 1200 FCFA.</li>
            <li>Les frais de retrait sont fixes a 15% pour couvrir les frais de transaction et d'entretien.</li>
            <li>Les retraits sont traites entre 8h et 17h (GMT) les jours ouvrables.</li>
            <li>Limite de 2 retraits maximum par jour par utilisateur.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#2196F3] border-l-4 border-[#2196F3] pl-3">3. Systeme de Parrainage</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
            <li>Commission de niveau 1 : 27% sur le PREMIER investissement du filleul.</li>
            <li>Commission de niveau 2 : 2% sur le PREMIER investissement du filleul.</li>
            <li>Commission de niveau 3 : 1% sur le PREMIER investissement du filleul.</li>
            <li>Les activites frauduleuses ou la creation de comptes multiples pour manipuler le systeme entraineront la suspension du compte.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#2196F3] border-l-4 border-[#2196F3] pl-3">4. Securite</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
            <li>Vous etes responsable de la securite de votre mot de passe.</li>
            <li>Ne partagez jamais vos identifiants de connexion avec des tiers.</li>
            <li>Le service client officiel ne vous demandera jamais votre mot de passe.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
