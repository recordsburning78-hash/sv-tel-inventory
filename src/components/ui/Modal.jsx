import { X } from 'lucide-react';

export default function Modal({ title, children, open, onClose, size = 'max-w-3xl' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4">
      <div className={`max-h-[90vh] w-full ${size} overflow-auto rounded-lg bg-white p-5 shadow-soft dark:bg-slate-900`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
