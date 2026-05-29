import { useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, Edit } from 'lucide-react';
import { DEFAULT_PERMISSIONS, PERMISSIONS } from '../utils/constants.js';
import { useInventory } from '../contexts/InventoryContext.jsx';
import { markNotificationForPassword, saveDocument } from '../services/firestoreService.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Modal from '../components/ui/Modal.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import { Field, inputClass } from '../components/ui/Form.jsx';
import { dateTime } from '../utils/format.js';

export default function UserManagement() {
  const { users, activityLogs, resetRequests } = useInventory();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ uid: '', name: '', email: '', mobile: '', role: 'staff', status: 'active', permissions: DEFAULT_PERMISSIONS });

  function edit(user) {
    setEditing(user);
    setForm({
      uid: user?.uid || user?.id || '',
      name: user?.name || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      role: user?.role || 'staff',
      status: user?.status || 'active',
      permissions: { ...DEFAULT_PERMISSIONS, ...user?.permissions },
    });
    setOpen(true);
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.uid) return toast.error('Firebase Auth UID is required for login profile mapping');
    await saveDocument('users', form, form.uid);
    toast.success('User profile and permissions saved');
    setOpen(false);
  }

  async function notifyPassword(user) {
    await markNotificationForPassword(user.uid || user.id);
    toast.success('Password change notification sent');
  }

  return (
    <>
      <PageHeader title="User Management" description="Admin can create profile records, suspend users, edit permissions, and monitor activity." actions={<Button onClick={() => edit(null)}><Edit size={16} /> Add User</Button>} />
      {resetRequests.filter((r) => r.status === 'pending').length > 0 && <Card className="mb-5 border-amber-300 bg-amber-50 dark:bg-amber-950"><h3 className="font-bold">Password Reset Requests</h3>{resetRequests.filter((r) => r.status === 'pending').map((req) => <div key={req.id} className="mt-2 flex items-center justify-between"><span>{req.email}</span><Button variant="secondary" onClick={() => saveDocument('password_reset_requests', { ...req, status: 'completed' }, req.id)}>Mark Done</Button></div>)}</Card>}
      <div className="grid gap-5 xl:grid-cols-[1fr_.9fr]">
        <Card className="overflow-auto">
          <table className="w-full min-w-[760px] text-sm"><thead><tr className="text-left text-slate-500"><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Mobile</th><th className="p-2">Role</th><th className="p-2">Status</th><th className="p-2">Action</th></tr></thead><tbody>{users.map((u) => <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800"><td className="p-2">{u.name}</td><td className="p-2">{u.email}</td><td className="p-2">{u.mobile}</td><td className="p-2">{u.role}</td><td className="p-2">{u.status}</td><td className="p-2 flex gap-2"><Button variant="secondary" onClick={() => edit(u)}>Edit</Button><Button variant="secondary" onClick={() => notifyPassword(u)}><Bell size={15} /> Notify</Button></td></tr>)}</tbody></table>
        </Card>
        <Card>
          <h3 className="font-bold">Activity Monitor</h3>
          <div className="mt-3 max-h-[520px] space-y-3 overflow-auto">{activityLogs.map((log) => <div key={log.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><p className="font-semibold">{log.action}</p><p className="text-sm text-slate-500">{log.userName} / {dateTime(log.timestamp || log.createdAt)}</p></div>)}</div>
        </Card>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit User' : 'Create User Profile'} size="max-w-4xl">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Field label="Firebase Auth UID" required><input className={inputClass} value={form.uid} onChange={(e) => setForm({ ...form, uid: e.target.value })} required /></Field>
          <Field label="Name" required><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="Email" required><input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Field>
          <Field label="Mobile Number"><input className={inputClass} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></Field>
          <Field label="Role"><select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="admin">Admin</option><option value="staff">Staff</option></select></Field>
          <Field label="Status"><select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="suspended">Suspended</option></select></Field>
          <div className="md:col-span-2">
            <h3 className="mb-3 font-bold">Permissions</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {PERMISSIONS.map((permission) => <label key={permission.key} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><span className="text-sm font-medium">{permission.label}</span><input type="checkbox" className="h-5 w-5" checked={!!form.permissions?.[permission.key]} onChange={(e) => setForm({ ...form, permissions: { ...form.permissions, [permission.key]: e.target.checked } })} /></label>)}
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end"><Button>Save User</Button></div>
        </form>
      </Modal>
    </>
  );
}
