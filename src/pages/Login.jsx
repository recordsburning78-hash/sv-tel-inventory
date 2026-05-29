import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { APP_NAME } from '../utils/constants';
import Button from '../components/ui/Button.jsx';
import { Field, inputClass } from '../components/ui/Form.jsx';

export default function Login() {
  const { firebaseUser, login, forgotPassword } = useAuth();
  const [email, setEmail] = useState('rohitkumar5480@gmail.com');
  const [password, setPassword] = useState('Rohit6919');
  const [busy, setBusy] = useState(false);

  if (firebaseUser) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success('Login successful');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (!email) return toast.error('Enter email first');
    await forgotPassword(email);
  }

  return (
    <main className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[1.1fr_.9fr]">
      <section className="flex min-h-[42vh] items-center bg-[radial-gradient(circle_at_20%_20%,#2563eb_0,#0f172a_35%,#111827_100%)] px-8 py-12">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">Realtime SaaS Inventory</div>
          <h1 className="text-4xl font-bold tracking-normal sm:text-6xl">{APP_NAME}</h1>
          <p className="mt-5 max-w-xl text-lg text-slate-200">
            PO entry, partial inward, outward dispatch, low-stock alerts, user permissions, and synchronized stock balance across desktop and mobile.
          </p>
        </div>
      </section>
      <section className="grid place-items-center bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold">Login</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Only admin-created users can access this app.</p>
          <div className="mt-6 space-y-4">
            <Field label="Email" required>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input className={`${inputClass} pl-10`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </Field>
            <Field label="Password" required>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input className={`${inputClass} pl-10`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </Field>
          </div>
          <Button className="mt-6 w-full" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</Button>
          <button type="button" onClick={reset} className="mt-4 w-full text-sm font-semibold text-brand-600 hover:underline">
            Forgot password? Send request to admin
          </button>
        </form>
      </section>
    </main>
  );
}
