import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Boxes, ClipboardList, LayoutDashboard, LogOut, Menu, Moon, PackagePlus, Settings,
  ShieldCheck, Sun, Tags, Truck, Users, FileBarChart, History, UploadCloud,
} from 'lucide-react';
import { useState } from 'react';
import { APP_NAME } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useInventory } from '../../contexts/InventoryContext.jsx';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard' },
  { to: '/purchase-orders', label: 'PO Entry', icon: ClipboardList, permission: 'po' },
  { to: '/inward', label: 'Inward', icon: UploadCloud, permission: 'inward' },
  { to: '/outward', label: 'Outward', icon: PackagePlus, permission: 'outward' },
  { to: '/products', label: 'Parts', icon: Boxes, permission: 'parts' },
  { to: '/vendors', label: 'Vendors', icon: Truck, permission: 'vendors' },
  { to: '/categories', label: 'Categories', icon: Tags, permission: 'settings' },
  { to: '/transactions', label: 'History', icon: History, permission: 'transactions' },
  { to: '/reports', label: 'Reports', icon: FileBarChart, permission: 'reports' },
  { to: '/users', label: 'Users', icon: Users, permission: 'users' },
  { to: '/settings', label: 'Settings', icon: Settings, permission: 'settings' },
];

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const { user, logout, can, isAdmin } = useAuth();
  const { dark, toggleDark } = useTheme();
  const { metrics } = useInventory();
  const navigate = useNavigate();
  const allowedLinks = links.filter((link) => isAdmin || can(link.permission));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white/95 p-4 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} transition`}>
        <div className="mb-7 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-600 font-bold text-white">SV</div>
          <div>
            <p className="text-lg font-bold">{APP_NAME}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Realtime stock control</p>
          </div>
        </div>
        <nav className="space-y-1">
          {allowedLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
          <div className="flex items-center justify-between gap-3">
            <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back</p>
              <h1 className="text-xl font-bold">{user?.name || user?.email}</h1>
            </div>
            <div className="flex items-center gap-2">
              {metrics.pendingResetRequests.length > 0 && isAdmin && (
                <button onClick={() => navigate('/users')} className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800">
                  {metrics.pendingResetRequests.length} reset
                </button>
              )}
              <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={toggleDark} aria-label="Toggle dark mode">
                {dark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => navigate('/settings')} aria-label="Profile and settings">
                <ShieldCheck size={20} />
              </button>
              <button className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950" onClick={logout} aria-label="Logout">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 pb-28 pt-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-3 left-1/2 z-40 flex -translate-x-1/2 items-end gap-1 rounded-2xl border border-slate-200 bg-white/90 px-2 py-2 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 lg:hidden">
        {allowedLinks.slice(0, 5).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `dock-item ${isActive ? 'active bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-300'} grid h-11 w-12 place-items-center rounded-xl`
            }
            title={label}
          >
            <Icon size={20} />
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
