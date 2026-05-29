import { useRef } from 'react';
import toast from 'react-hot-toast';
import { Download, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { exportBackup, restoreBackup } from '../services/firestoreService.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';

export default function Settings() {
  const inputRef = useRef(null);
  const { user } = useAuth();

  async function backup() {
    const data = await exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `svtel-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function restore(event) {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    await restoreBackup(JSON.parse(text));
    toast.success('Backup restored');
  }

  return (
    <>
      <PageHeader title="Settings" description="Profile, backup, restore, and system controls." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="font-bold">Your Information</h3>
          <div className="mt-4 space-y-2 text-sm"><p>Name: {user?.name}</p><p>Email: {user?.email}</p><p>Mobile: {user?.mobile || '-'}</p><p>Role: {user?.role}</p><p>Status: {user?.status || 'active'}</p></div>
        </Card>
        <Card>
          <h3 className="font-bold">Data Backup / Restore</h3>
          <p className="mt-2 text-sm text-slate-500">Download all Firestore data as JSON or restore from a previous backup.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={backup}><Download size={16} /> Backup</Button>
            <Button variant="secondary" onClick={() => inputRef.current.click()}><Upload size={16} /> Restore</Button>
            <input ref={inputRef} onChange={restore} type="file" accept="application/json" className="hidden" />
          </div>
        </Card>
      </div>
    </>
  );
}
