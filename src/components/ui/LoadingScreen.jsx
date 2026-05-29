export default function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
        <p className="font-semibold text-slate-700 dark:text-slate-200">Loading S V TEL Inventory</p>
      </div>
    </div>
  );
}
