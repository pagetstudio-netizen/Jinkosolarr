import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCountries } from "@/lib/countries";
import { Loader2 } from "lucide-react";

interface CountrySelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (countryCode: string) => void;
}

export function CountrySelector({ open, onClose, onSelect }: CountrySelectorProps) {
  const { data: countries = [], isLoading } = useCountries();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[280px] mx-auto rounded-xl bg-white dark:bg-gray-900 p-0 overflow-hidden border-0">
        <DialogTitle className="text-center text-sm font-semibold py-3 px-4 border-b border-gray-100 dark:border-gray-800">
          Sélectionner le pays
        </DialogTitle>
        <div className="py-0.5 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : countries.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">Aucun pays disponible</p>
          ) : (
            countries.map((country) => (
              <button
                key={country.code}
                onClick={() => { onSelect(country.code); onClose(); }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50"
                data-testid={`country-option-${country.code}`}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 20 }}>
                    {String.fromCodePoint(...([...country.code].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)))}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{country.name}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">+{country.phonePrefix}</span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
