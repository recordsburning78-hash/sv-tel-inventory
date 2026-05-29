import { Plus } from 'lucide-react';

export default function Fab({ onClick, label = 'Add' }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white shadow-soft transition hover:scale-105 hover:bg-brand-700"
      aria-label={label}
      title={label}
    >
      <Plus size={24} />
    </button>
  );
}
