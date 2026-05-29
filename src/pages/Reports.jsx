import { useMemo, useState } from 'react';
import { FileDown } from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext.jsx';
import { exportRows } from '../utils/exporters.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import { inputClass } from '../components/ui/Form.jsx';

export default function Reports() {
  const { products, categories, transactions } = useInventory();
  const [category, setCategory] = useState('');
  const [type, setType] = useState('stock');
  const rows = useMemo(() => {
    if (type === 'transactions') return transactions.filter((t) => !category || t.category === category);
    return products.filter((p) => !category || p.category === category);
  }, [products, transactions, category, type]);

  const columns = type === 'transactions'
    ? [{ header: 'Type', key: 'transactionType' }, { header: 'Part', key: 'partNo' }, { header: 'Qty', key: 'quantity' }, { header: 'PO', key: 'poNo' }, { header: 'Invoice', key: 'invoiceNo' }]
    : [{ header: 'Part No', key: 'partNo' }, { header: 'Description', key: 'productName' }, { header: 'Make', key: 'make' }, { header: 'Category', key: 'category' }, { header: 'Stock', key: 'stockQuantity' }];

  return (
    <>
      <PageHeader title="Reports" description="Export selected category and report type in XLS/PDF with timestamp." />
      <Card>
        <div className="grid gap-3 md:grid-cols-4">
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}><option value="stock">Stock report</option><option value="transactions">Transaction report</option></select>
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{categories.map((cat) => <option key={cat.id}>{cat.name}</option>)}</select>
          <Button onClick={() => exportRows(rows, columns, `${type}-report`, 'xlsx')}><FileDown size={16} /> Export XLS</Button>
          <Button variant="secondary" onClick={() => exportRows(rows, columns, `${type}-report`, 'pdf')}><FileDown size={16} /> Export PDF</Button>
        </div>
      </Card>
      <Card className="mt-4 overflow-auto"><table className="w-full min-w-[700px] text-sm"><thead><tr className="text-left text-slate-500">{columns.map((col) => <th className="p-2" key={col.key}>{col.header}</th>)}</tr></thead><tbody>{rows.slice(0, 50).map((row) => <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">{columns.map((col) => <td className="p-2" key={col.key}>{row[col.key]}</td>)}</tr>)}</tbody></table></Card>
    </>
  );
}
