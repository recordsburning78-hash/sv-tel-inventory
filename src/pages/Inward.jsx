import { useState } from 'react';
import toast from 'react-hot-toast';
import { History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useInventory } from '../contexts/InventoryContext.jsx';
import { createInwardAgainstPo } from '../services/firestoreService.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Modal from '../components/ui/Modal.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import { Field, inputClass } from '../components/ui/Form.jsx';
import { dateTime } from '../utils/format.js';

export default function Inward() {
  const { purchaseOrders, transactions } = useInventory();
  const { user } = useAuth();
  const [poId, setPoId] = useState('');
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const po = purchaseOrders.find((item) => item.id === poId);
  const openItems = po?.items?.filter((item) => Number(item.inwardQty || 0) < Number(item.quantity || 0)) || [];
  const selectedItem = openItems.find((item) => item.productId === itemId);

  async function submit(e) {
    e.preventDefault();
    if (!po || !selectedItem) return toast.error('Choose PO and item');
    const remaining = Number(selectedItem.quantity || 0) - Number(selectedItem.inwardQty || 0);
    if (Number(quantity) > remaining) return toast.error(`Only ${remaining} pending`);
    await createInwardAgainstPo({ po, item: selectedItem, quantity: Number(quantity), user, remarks });
    toast.success('Material inward saved and stock updated');
    setQuantity('');
    setRemarks('');
  }

  return (
    <>
      <PageHeader title="Material Inward" description="Mandatory PO No. and company are captured from purchase order." actions={<button onClick={() => setHistoryOpen(true)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 dark:bg-slate-800" title="Inward History"><History size={18} /></button>} />
      <Card>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Field label="PO No." required><select className={inputClass} value={poId} onChange={(e) => { setPoId(e.target.value); setItemId(''); }} required><option value="">Select PO</option>{purchaseOrders.filter((p) => !['complete', 'cancelled'].includes(p.status)).map((p) => <option key={p.id} value={p.id}>{p.poNo} - {p.vendorName}</option>)}</select></Field>
          <Field label="Company Name" required><input className={inputClass} value={po?.vendorName || ''} readOnly required /></Field>
          <Field label="Item" required><select className={inputClass} value={itemId} onChange={(e) => setItemId(e.target.value)} required><option value="">Select item</option>{openItems.map((item) => <option key={item.productId} value={item.productId}>{item.partNo} - {item.productName} pending {Number(item.quantity) - Number(item.inwardQty || 0)}</option>)}</select></Field>
          <Field label="Inward Quantity" required><input type="number" min="1" className={inputClass} value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></Field>
          <Field label="Remarks"><textarea className={inputClass} value={remarks} onChange={(e) => setRemarks(e.target.value)} /></Field>
          <div className="md:col-span-2"><Button>Save Inward</Button></div>
        </form>
      </Card>
      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Inward History">
        {transactions.filter((t) => t.transactionType === 'IN').map((item) => <div key={item.id} className="border-b border-slate-100 py-3 dark:border-slate-800"><p className="font-semibold">{item.poNo} - {item.partNo} - {item.quantity}</p><p className="text-sm text-slate-500">{item.companyName} / {dateTime(item.timestamp || item.createdAt)}</p></div>)}
      </Modal>
    </>
  );
}
