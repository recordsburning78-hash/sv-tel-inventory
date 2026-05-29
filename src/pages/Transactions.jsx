import { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext.jsx';
import Card from '../components/ui/Card.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import ViewToggle from '../components/ui/ViewToggle.jsx';
import { dateTime } from '../utils/format.js';

export default function Transactions() {
  const { transactions } = useInventory();
  const [view, setView] = useState('list');
  return (
    <>
      <PageHeader title="Stock History" description="Realtime logs for inward and outward movement." actions={<ViewToggle value={view} onChange={setView} />} />
      {view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{transactions.map((item) => <Card key={item.id}><p className="font-bold">{item.transactionType} {item.quantity}</p><p>{item.partNo} - {item.productName}</p><p className="text-sm text-slate-500">{dateTime(item.timestamp || item.createdAt)}</p></Card>)}</div>
      ) : (
        <Card className="overflow-auto"><table className="w-full min-w-[900px] text-sm"><thead><tr className="text-left text-slate-500"><th className="p-2">Type</th><th className="p-2">Part</th><th className="p-2">Qty</th><th className="p-2">Previous</th><th className="p-2">New</th><th className="p-2">Ref</th><th className="p-2">User</th><th className="p-2">Time</th></tr></thead><tbody>{transactions.map((item) => <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800"><td className="p-2">{item.transactionType}</td><td className="p-2">{item.partNo} - {item.productName}</td><td className="p-2">{item.quantity}</td><td className="p-2">{item.previousStock}</td><td className="p-2">{item.newStock}</td><td className="p-2">{item.poNo || item.invoiceNo || '-'}</td><td className="p-2">{item.userName}</td><td className="p-2">{dateTime(item.timestamp || item.createdAt)}</td></tr>)}</tbody></table></Card>
      )}
    </>
  );
}
