import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import wendysLogo from "@assets/wendys_logo.png";

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
            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
              <img src={wendysLogo} alt="Wendy's" className="w-10 h-10 object-contain" />
            </div>
            À propos de Wendy's
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Fondée en 1969 à Columbus, dans l'État de l'Ohio aux États-Unis, Wendy's est l'une des plus grandes chaînes de restauration rapide au monde, reconnue pour ses hamburgers au bœuf frais jamais congelé et ses burgers carrés emblématiques.
          </p>
          <p>
            Créée par Dave Thomas, l'enseigne s'est rapidement imposée comme un acteur majeur du secteur du fast-food grâce à la qualité de ses produits et à son image de marque distinctive.
          </p>
          <div className="bg-secondary rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-foreground">Nos avantages :</h4>
            <ul className="space-y-1">
              <li>- Revenus quotidiens automatiques</li>
              <li>- Produits de restauration rapide de qualité</li>
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
