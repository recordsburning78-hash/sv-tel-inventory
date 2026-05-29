import { useAuth } from '../contexts/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';

export default function Suspended() {
  const { logout } = useAuth();
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4 dark:bg-slate-950">
      <section className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-rose-600">Account suspended</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Please contact with the Administrator.</p>
        <Button className="mt-5" onClick={logout}>Logout</Button>
      </section>
    </main>
  );
}
