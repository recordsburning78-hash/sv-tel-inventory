import { useState } from 'react';
import toast from 'react-hot-toast';
import { useInventory } from '../contexts/InventoryContext.jsx';
import { removeDocument, saveDocument } from '../services/firestoreService.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Fab from '../components/ui/Fab.jsx';
import Modal from '../components/ui/Modal.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import ViewToggle from '../components/ui/ViewToggle.jsx';
import { Field, inputClass } from '../components/ui/Form.jsx';

export default function Vendors() {
  const { vendors } = useInventory();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('list');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ companyName: '', contactPerson: '', mobile: '', email: '', gst: '', address: '', status: 'active' });

  function edit(vendor) {
    setEditing(vendor);
    setForm({ companyName: '', contactPerson: '', mobile: '', email: '', gst: '', address: '', status: 'active', ...vendor });
    setOpen(true);
  }

  async function submit(e) {
    e.preventDefault();
    await saveDocument('vendors', form, editing?.id);
    toast.success('Vendor saved');
    setOpen(false);
  }

  return (
    <>
      <PageHeader title="Vendors" description="Create and edit vendor/company information." actions={<><ViewToggle value={view} onChange={setView} /><Button onClick={() => edit(null)}>Add Company</Button></>} />
      <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4' : 'space-y-3'}>
        {vendors.map((vendor) => <Card key={vendor.id} onClick={() => edit(vendor)} className="flex items-center justify-between"><div><p className="font-bold">{vendor.companyName}</p><p className="text-sm text-slate-500">{vendor.contactPerson} {vendor.mobile}</p></div><button className="text-rose-600" onClick={(e) => { e.stopPropagation(); removeDocument('vendors', vendor.id); }}>Delete</button></Card>)}
      </div>
      <Fab onClick={() => edit(null)} label="Add company" />
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Vendor' : 'Add Company'}>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Field label="Company Name" required><input className={inputClass} value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required /></Field>
          <Field label="Contact Person"><input className={inputClass} value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></Field>
          <Field label="Mobile"><input className={inputClass} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></Field>
          <Field label="Email"><input className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="GST"><input className={inputClass} value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} /></Field>
          <Field label="Status"><select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>active</option><option>suspended</option></select></Field>
          <Field label="Address"><textarea className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <div className="md:col-span-2"><Button>Save Vendor</Button></div>
        </form>
      </Modal>
    </>
  );
}
