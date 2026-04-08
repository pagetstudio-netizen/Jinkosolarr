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
              <img src={jinkoLogo} alt="Jinko Solar" className="w-full h-full object-cover" />
            </div>
            À propos de Jinko Solar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Jinko Solar est l'un des plus grands fabricants de panneaux solaires au monde, présent dans plus de 160 pays avec une capacité installée dépassant 200 GW.
          </p>
          <p>
            Leader reconnu dans l'industrie de l'énergie solaire, Jinko Solar s'engage à fournir des solutions photovoltaïques innovantes et durables pour un avenir énergétique propre.
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
