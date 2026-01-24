import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function RulesModal({ open, onClose }: RulesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Règles de la plateforme</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <section>
              <h4 className="font-medium text-foreground mb-2">1. Dépôts</h4>
              <ul className="space-y-1">
                <li>- Montant minimum : 3 000 FCFA</li>
                <li>- Les dépôts sont traités dans les plus brefs délais</li>
                <li>- Assurez-vous que les informations de paiement sont correctes</li>
              </ul>
            </section>

            <section>
              <h4 className="font-medium text-foreground mb-2">2. Retraits</h4>
              <ul className="space-y-1">
                <li>- Montant minimum : 1 200 FCFA</li>
                <li>- Frais de retrait : 15%</li>
                <li>- Horaires : 8h - 17h (tous les pays)</li>
                <li>- Cameroun et Bénin : 9h - 18h</li>
                <li>- Maximum 2 retraits par jour</li>
                <li>- Un produit actif est requis pour retirer</li>
                <li>- Un portefeuille de retrait doit être enregistré</li>
              </ul>
            </section>

            <section>
              <h4 className="font-medium text-foreground mb-2">3. Produits</h4>
              <ul className="space-y-1">
                <li>- Cycle standard : 80 jours</li>
                <li>- Gains journaliers automatiques</li>
                <li>- Les gains sont crédités 24h après l'achat</li>
                <li>- Produit gratuit : réclamez 50 FCFA/jour</li>
              </ul>
            </section>

            <section>
              <h4 className="font-medium text-foreground mb-2">4. Parrainage</h4>
              <ul className="space-y-1">
                <li>- Niveau 1 : 27% de commission</li>
                <li>- Niveau 2 : 2% de commission</li>
                <li>- Niveau 3 : 1% de commission</li>
                <li>- Commissions sur les achats de produits</li>
              </ul>
            </section>

            <section>
              <h4 className="font-medium text-foreground mb-2">5. Bonus d'inscription</h4>
              <p>Chaque nouveau membre reçoit 500 FCFA de bonus à l'inscription.</p>
            </section>

            <section>
              <h4 className="font-medium text-foreground mb-2">6. Pays éligibles</h4>
              <ul className="space-y-1">
                <li>- Cameroun</li>
                <li>- Burkina Faso</li>
                <li>- Togo</li>
                <li>- Bénin</li>
                <li>- Côte d'Ivoire</li>
                <li>- Congo Brazzaville</li>
                <li>- RDC (1 FCFA = 4 CDF)</li>
              </ul>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
