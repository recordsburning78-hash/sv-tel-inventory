import { useState } from 'react';
import toast from 'react-hot-toast';
import { History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useInventory } from '../contexts/InventoryContext.jsx';
import { createStockTransaction } from '../services/firestoreService.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Modal from '../components/ui/Modal.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import { Field, inputClass } from '../components/ui/Form.jsx';
import { dateTime } from '../utils/format.js';

export default function Outward() {
  const { products, transactions } = useInventory();
  const { user } = useAuth();
  const [invoiceNo, setInvoiceNo] = useState('');
  const [dispatchThrough, setDispatchThrough] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  const [historyOpen, setHistoryOpen] = useState(false);

  async function submit(e) {
    e.preventDefault();
    for (const item of items) {
      await createStockTransaction({
        productId: item.productId,
        quantity: Number(item.quantity),
        type: 'OUT',
        user,
        notes: item.notes || '',
        meta: { invoiceNo, dispatchThrough },
      });
    }
    toast.success('Outward saved and stock updated');
    setInvoiceNo('');
    setDispatchThrough('');
    setItems([{ productId: '', quantity: 1 }]);
  }

  return (
    <>
      <PageHeader title="Material Outward" description="Invoice number and dispatch through are mandatory." actions={<button onClick={() => setHistoryOpen(true)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 dark:bg-slate-800" title="Outward History"><History size={18} /></button>} />
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Invoice Number" required><input className={inputClass} value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} required /></Field>
            <Field label="Dispatch Through" required><input className={inputClass} value={dispatchThrough} onChange={(e) => setDispatchThrough(e.target.value)} required /></Field>
          </div>
          {items.map((item, index) => {
            const product = products.find((p) => p.id === item.productId);
            return <div key={index} className="grid gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800 md:grid-cols-[1fr_1fr_110px_auto]">
              <select className={inputClass} value={item.productId} onChange={(e) => { const next = [...items]; next[index].productId = e.target.value; setItems(next); }} required><option value="">Search/select part no</option>{products.map((p) => <option key={p.id} value={p.id}>{p.partNo} - {p.productName}</option>)}</select>
              <select className={inputClass} value={item.productId} onChange={(e) => { const next = [...items]; next[index].productId = e.target.value; setItems(next); }} required><option value="">Search/select description</option>{products.map((p) => <option key={p.id} value={p.id}>{p.productName} - {p.partNo}</option>)}</select>
              <input type="number" min="1" max={product?.stockQuantity || undefined} className={inputClass} value={item.quantity} onChange={(e) => { const next = [...items]; next[index].quantity = e.target.value; setItems(next); }} required />
              <Button type="button" variant="danger" onClick={() => setItems(items.filter((_, i) => i !== index))}>Remove</Button>
            </div>;
          })}
          <Button type="button" variant="secondary" onClick={() => setItems([...items, { productId: '', quantity: 1 }])}>Add Item</Button>
          <div className="flex justify-end"><Button>Save Outward</Button></div>
        </form>
      </Card>
      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Outward History">
        {transactions.filter((t) => t.transactionType === 'OUT').map((item) => <div key={item.id} className="border-b border-slate-100 py-3 dark:border-slate-800"><p className="font-semibold">{item.invoiceNo} - {item.partNo} - {item.quantity}</p><p className="text-sm text-slate-500">{item.dispatchThrough} / {dateTime(item.timestamp || item.createdAt)}</p></div>)}
      </Modal>
    </>
  );
}
