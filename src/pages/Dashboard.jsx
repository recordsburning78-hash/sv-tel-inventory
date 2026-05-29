import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, Boxes, IndianRupee, Layers, MoveRight } from 'lucide-react';
import { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext.jsx';
import Card from '../components/ui/Card.jsx';
import Modal from '../components/ui/Modal.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import { currency, dateTime } from '../utils/format';

export default function Dashboard() {
  const { metrics, products, transactions, purchaseOrders } = useInventory();
  const [detail, setDetail] = useState(null);
  const chart = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((name, index) => ({
    name,
    inward: transactions.filter((t) => t.transactionType === 'IN').slice(index * 2, index * 2 + 3).reduce((a, b) => a + Number(b.quantity || 0), 0),
    outward: transactions.filter((t) => t.transactionType === 'OUT').slice(index * 2, index * 2 + 3).reduce((a, b) => a + Number(b.quantity || 0), 0),
  }));

  const cards = [
    { title: 'Total Items', value: metrics.totalProducts, icon: Boxes, rows: products },
    { title: 'Stock Value', value: currency(metrics.stockValue), icon: IndianRupee, rows: products },
    { title: 'Low Stock', value: metrics.lowStock.length, icon: AlertTriangle, rows: metrics.lowStock },
    { title: 'Categories', value: metrics.totalCategories, icon: Layers, rows: [] },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Live stock summary and movement overview." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, icon: Icon, rows }) => (
          <Card key={title} onClick={() => setDetail({ title, rows })}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                <p className="mt-2 text-2xl font-bold">{value}</p>
              </div>
              <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-950"><Icon size={22} /></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <Card>
          <h3 className="mb-4 font-bold">Monthly Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="inward" fill="#2563eb" radius={[5, 5, 0, 0]} />
                <Bar dataKey="outward" fill="#f97316" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="mb-4 font-bold">Recent Transactions</h3>
          <div className="space-y-3">
            {metrics.recentTransactions.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <div>
                  <p className="font-semibold">{item.partNo || item.productName}</p>
                  <p className="text-xs text-slate-500">{dateTime(item.timestamp || item.createdAt)}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${item.transactionType === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {item.transactionType} {item.quantity}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-bold">Open Purchase Orders</h3>
          {purchaseOrders.filter((po) => !['complete', 'cancelled'].includes(po.status)).slice(0, 6).map((po) => (
            <button key={po.id} className="flex w-full items-center justify-between border-b border-slate-100 py-3 text-left dark:border-slate-800">
              <span>{po.poNo} - {po.vendorName}</span><MoveRight size={16} />
            </button>
          ))}
        </Card>
        <Card>
          <h3 className="mb-3 font-bold">Top Selling Products</h3>
          {products.slice(0, 6).map((product) => (
            <div key={product.id} className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-slate-800">
              <span>{product.partNo} - {product.productName}</span>
              <span className="font-bold">{product.stockQuantity || 0}</span>
            </div>
          ))}
        </Card>
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.title || 'Details'}>
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="text-left text-slate-500"><th className="p-2">Part No.</th><th className="p-2">Item</th><th className="p-2">Make</th><th className="p-2">Category</th><th className="p-2">Stock</th></tr></thead>
            <tbody>{(detail?.rows || []).map((row) => <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800"><td className="p-2">{row.partNo}</td><td className="p-2">{row.productName}</td><td className="p-2">{row.make}</td><td className="p-2">{row.category}</td><td className="p-2">{row.stockQuantity}</td></tr>)}</tbody>
          </table>
        </div>
      </Modal>
    </>
  );
}
