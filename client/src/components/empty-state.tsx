import emptyImg from "@assets/none_order_(1)_1775750945087.png";

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = "Aucune donnée disponible" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <img
        src={emptyImg}
        alt="Vide"
        className="w-48 h-48 object-contain mb-4 opacity-90"
      />
      <p className="text-gray-400 text-base font-medium text-center">{message}</p>
    </div>
  );
}
