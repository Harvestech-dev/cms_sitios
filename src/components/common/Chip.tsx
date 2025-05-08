interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export function Chip({ label, selected = false, onClick }: ChipProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir cualquier comportamiento por defecto
    e.stopPropagation(); // Evitar propagación del evento
    onClick?.();
  };

  return (
    <button
      type="button" // Importante: especificar type="button" para evitar submit del form
      onClick={handleClick}
      className={`px-3 py-1 rounded-full text-sm transition-colors ${
        selected
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
} 