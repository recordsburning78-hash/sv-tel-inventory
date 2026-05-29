import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { History } from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext.jsx';
import { PO_PREFIX } from '../utils/constants.js';
import { saveDocument } from '../services/firestoreService.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Fab from '../components/ui/Fab.jsx';
import Modal from '../components/ui/Modal.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import ViewToggle from '../components/ui/ViewToggle.jsx';
import { Field, inputClass } from '../components/ui/Form.jsx';

const blank = { poNo: PO_PREFIX, date: new Date().toISOString().slice(0, 10), vendorId: '', remarks: '', items: [], status: 'open' };

export default function PurchaseOrders() {
  const { purchaseOrders, vendors, products } = useInventory();
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [view, setView] = useState('list');
  const vendorProducts = useMemo(() => products.filter((p) => !form.vendorId || p.vendorIds?.includes(form.vendorId)), [products, form.vendorId]);

  function edit(po) {
    setEditing(po);
    setForm({ ...blank, ...po, items: po?.items || [] });
    setOpen(true);
  }

  function addItem() {
    setForm({ ...form, items: [...form.items, { productId: '', quantity: 1, inwardQty: 0, remarks: '' }] });
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.poNo.startsWith(PO_PREFIX)) return toast.error(`PO No. must start with ${PO_PREFIX}`);
    if (purchaseOrders.some((po) => po.poNo === form.poNo && po.id !== editing?.id)) return toast.error('PO number already exists');
    const vendor = vendors.find((v) => v.id === form.vendorId);
    const items = form.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return { ...item, productName: product?.productName, partNo: product?.partNo, quantity: Number(item.quantity || 0) };
    });
    await saveDocument('purchase_orders', { ...form, vendorName: vendor?.companyName || '', items }, editing?.id);
    toast.success('Purchase order saved');
    setOpen(false);
  }

  async function markCancelled(po) {
    await saveDocument('purchase_orders', { ...po, status: 'cancelled' }, po.id);
    toast.success('PO marked cancelled');
  }

  const activeOrders = purchaseOrders.filter((po) => po.status !== 'cancelled');

  return (
    <>
      <PageHeader title="PO Entry" description="Enter PO first, then receive material partially or fully against it." actions={<><ViewToggle value={view} onChange={setView} /><button onClick={() => setHistoryOpen(true)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 dark:bg-slate-800" title="PO History"><History size={18} /></button><Button onClick={() => edit(null)}>New PO</Button></>} />
      <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
        {activeOrders.map((po) => <Card key={po.id} onClick={() => edit(po)}><div className="flex items-start justify-between"><div><p className="font-bold">{po.poNo}</p><p className="text-sm text-slate-500">{po.vendorName} / {po.date}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold dark:bg-slate-800">{po.status}</span></div><p className="mt-3 text-sm">{po.items?.length || 0} items</p><Button className="mt-3" variant="secondary" onClick={(e) => { e.stopPropagation(); markCancelled(po); }}>Cancel PO</Button></Card>)}
      </div>
      <Fab onClick={() => edit(null)} label="Add PO" />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Purchase Order' : 'New Purchase Order'} size="max-w-5xl">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="PO No." required><input className={inputClass} value={form.poNo} onChange={(e) => setForm({ ...form, poNo: e.target.value })} required /></Field>
            <Field label="Date" required><input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></Field>
            <Field label="Vendor" required><select className={inputClass} value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value, items: [] })} required><option value="">Choose vendor</option>{vendors.map((v) => <option key={v.id} value={v.id}>{v.companyName}</option>)}</select></Field>
          </div>
          <Field label="Remarks"><textarea className={inputClass} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></Field>
          <div className="space-y-3">
            {form.items.map((item, index) => <div key={index} className="grid gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800 md:grid-cols-[1fr_120px_1fr_auto]">
              <select className={inputClass} value={item.productId} onChange={(e) => { const next = [...form.items]; next[index].productId = e.target.value; setForm({ ...form, items: next }); }} required><option value="">Item mapped to vendor</option>{vendorProducts.map((p) => <option key={p.id} value={p.id}>{p.partNo} - {p.productName}</option>)}</select>
              <input type="number" min="1" className={inputClass} value={item.quantity} onChange={(e) => { const next = [...form.items]; next[index].quantity = e.target.value; setForm({ ...form, items: next }); }} required />
              <input className={inputClass} placeholder="Item remarks" value={item.remarks || ''} onChange={(e) => { const next = [...form.items]; next[index].remarks = e.target.value; setForm({ ...form, items: next }); }} />
              <Button type="button" variant="danger" onClick={() => setForm({ ...form, items: form.items.filter((_, i) => i !== index) })}>Remove</Button>
            </div>)}
          </div>
          <Button type="button" variant="secondary" onClick={addItem}>Add Item</Button>
          <div className="flex justify-end"><Button>Save PO</Button></div>
        </form>
      </Modal>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="PO History">
        {purchaseOrders.map((po) => <div key={po.id} className="border-b border-slate-100 py-3 dark:border-slate-800"><p className="font-semibold">{po.poNo} - {po.vendorName}</p><p className="text-sm text-slate-500">{po.status} / {po.items?.length || 0} items</p></div>)}
      </Modal>
    </>
  );
}
