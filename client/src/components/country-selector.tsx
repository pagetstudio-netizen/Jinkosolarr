import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ELIGIBLE_COUNTRIES } from "@/lib/countries";

interface CountrySelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (countryCode: string) => void;
}

export function CountrySelector({ open, onClose, onSelect }: CountrySelectorProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl bg-white dark:bg-gray-900 p-0 overflow-hidden border-0">
        <DialogTitle className="text-center text-base font-semibold py-4 px-6 border-b border-gray-100 dark:border-gray-800">
          Selectionner l'indicatif pays
        </DialogTitle>
        <div className="py-1">
          {ELIGIBLE_COUNTRIES.map((country, index) => (
            <button
              key={country.code}
              onClick={() => {
                onSelect(country.code);
                onClose();
              }}
              className="w-full flex items-center justify-between px-6 py-3.5 text-left hover-elevate active-elevate-2"
              data-testid={`country-option-${country.code}`}
            >
              <span className="text-base font-medium text-gray-900 dark:text-gray-100">{country.name}</span>
              <span className="text-base text-gray-500 dark:text-gray-400">+{country.phonePrefix}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
