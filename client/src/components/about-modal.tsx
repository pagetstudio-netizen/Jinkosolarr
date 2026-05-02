import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import jinkoLogo from "@assets/jinko-solar-logo-png_seeklogo-265492_1775671142176.png";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
              <img src={jinkoLogo} alt="State Grid" className="w-full h-full object-cover" />
            </div>
            À propos de State Grid
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            State Grid est reconnu comme l'un des leaders mondiaux dans le domaine de la production, du transport et de la distribution d'électricité. L'entreprise assure un approvisionnement énergétique fiable et continu pour des millions de foyers, d'entreprises et d'industries.
          </p>
          <p>
            State Grid se distingue par son engagement dans le développement des énergies renouvelables et la mise en place de réseaux intelligents (smart grids) permettant une gestion plus efficace et durable de l'électricité.
          </p>
          <div className="bg-secondary rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-foreground">Nos avantages :</h4>
            <ul className="space-y-1">
              <li>- Revenus quotidiens automatiques</li>
              <li>- Investissements dans l'énergie solaire</li>
              <li>- Système de parrainage attractif</li>
              <li>- Support client disponible</li>
            </ul>
          </div>
          <p className="text-xs">
            Version 1.0.0 - Tous droits réservés
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
