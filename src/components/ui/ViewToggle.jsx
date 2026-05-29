import { Grid2X2, List } from 'lucide-react';

export default function ViewToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
      <button className={`rounded-md p-2 ${value === 'list' ? 'bg-white shadow-sm dark:bg-slate-700' : ''}`} onClick={() => onChange('list')} title="List view">
        <List size={17} />
      </button>
      <button className={`rounded-md p-2 ${value === 'grid' ? 'bg-white shadow-sm dark:bg-slate-700' : ''}`} onClick={() => onChange('grid')} title="Grid view">
        <Grid2X2 size={17} />
      </button>
    </div>
  );
}
