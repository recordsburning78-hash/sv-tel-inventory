export default function Card({ children, className = '', onClick }) {
  return (
    <section
      onClick={onClick}
      className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${onClick ? 'cursor-pointer transition hover:-translate-y-0.5 hover:shadow-soft' : ''} ${className}`}
    >
      {children}
    </section>
  );
}
