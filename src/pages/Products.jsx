import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Edit, FileDown, Search, Trash2 } from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext.jsx';
import { removeDocument, saveDocument, uploadProductImage } from '../services/firestoreService.js';
import { exportRows } from '../utils/exporters.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Fab from '../components/ui/Fab.jsx';
import Modal from '../components/ui/Modal.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import ViewToggle from '../components/ui/ViewToggle.jsx';
import { Field, inputClass } from '../components/ui/Form.jsx';

const emptyProduct = {
  productName: '',
  partNo: '',
  sku: '',
  barcode: '',
  make: '',
  category: '',
  supplier: '',
  vendorIds: [],
  stockQuantity: 0,
  minimumStock: 0,
  buyingPrice: 0,
  sellingPrice: 0,
  productImage: '',
};

export default function Products() {
  const { products, categories, vendors } = useInventory();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [make, setMake] = useState('');
  const [view, setView] = useState('list');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => products.filter((item) => {
    const hay = `${item.productName} ${item.partNo} ${item.sku} ${item.barcode} ${item.make}`.toLowerCase();
    return hay.includes(query.toLowerCase()) && (!category || item.category === category) && (!make || item.make === make);
  }), [products, query, category, make]);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const makes = [...new Set(products.map((item) => item.make).filter(Boolean))];

  function startEdit(product = emptyProduct) {
    setEditing(product.id ? product : null);
    setForm({ ...emptyProduct, ...product });
    setOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    try {
      const file = event.currentTarget.productImageFile.files[0];
      const imageUrl = file ? await uploadProductImage(file) : form.productImage;
      await saveDocument('products', { ...form, productImage: imageUrl, stockQuantity: Number(form.stockQuantity), minimumStock: Number(form.minimumStock) }, editing?.id);
      toast.success('Part saved');
      setOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function remove(product) {
    if (!confirm(`Delete ${product.productName}?`)) return;
    await removeDocument('products', product.id);
    toast.success('Part deleted');
  }

  const exportColumns = [
    { header: 'Part No', key: 'partNo' },
    { header: 'Item Description', key: 'productName' },
    { header: 'Make', key: 'make' },
    { header: 'Category', key: 'category' },
    { header: 'Stock', key: 'stockQuantity' },
    { header: 'Minimum Stock', key: 'minimumStock' },
  ];

  return (
    <>
      <PageHeader title="Parts" description="Tap any part to view and edit full information." actions={<>
        <ViewToggle value={view} onChange={setView} />
        <Button variant="secondary" onClick={() => exportRows(filtered, exportColumns, 'parts-stock', 'xlsx')}><FileDown size={16} /> XLS</Button>
        <Button variant="secondary" onClick={() => exportRows(filtered, exportColumns, 'parts-stock', 'pdf')}><FileDown size={16} /> PDF</Button>
        <Button onClick={() => startEdit()}><Edit size={16} /> Add Part</Button>
      </>} />

      <Card className="mb-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2"><Search className="absolute left-3 top-2.5 text-slate-400" size={17} /><input className={`${inputClass} pl-10`} placeholder="Search part no, item description, SKU, barcode" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{categories.map((cat) => <option key={cat.id}>{cat.name}</option>)}</select>
          <select className={inputClass} value={make} onChange={(e) => setMake(e.target.value)}><option value="">All make</option>{makes.map((name) => <option key={name}>{name}</option>)}</select>
        </div>
      </Card>

      {view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {paged.map((product) => <Card key={product.id} onClick={() => startEdit(product)}><p className="font-bold">{product.partNo}</p><p>{product.productName}</p><p className="text-sm text-slate-500">{product.make} / {product.category}</p><p className="mt-3 text-2xl font-bold">{product.stockQuantity || 0}</p></Card>)}
        </div>
      ) : (
        <Card className="overflow-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead><tr className="text-left text-slate-500"><th className="p-2">Part No</th><th className="p-2">Description</th><th className="p-2">Make</th><th className="p-2">Category</th><th className="p-2">Stock</th><th className="p-2">Min</th><th className="p-2">Actions</th></tr></thead>
            <tbody>{paged.map((product) => <tr key={product.id} onClick={() => startEdit(product)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"><td className="p-2 font-semibold">{product.partNo}</td><td className="p-2">{product.productName}</td><td className="p-2">{product.make}</td><td className="p-2">{product.category}</td><td className="p-2">{product.stockQuantity}</td><td className="p-2">{product.minimumStock}</td><td className="p-2"><button onClick={(e) => { e.stopPropagation(); remove(product); }} className="text-rose-600"><Trash2 size={16} /></button></td></tr>)}</tbody>
          </table>
        </Card>
      )}
      <div className="mt-4 flex justify-end gap-2"><Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button><Button variant="secondary" disabled={page * pageSize >= filtered.length} onClick={() => setPage(page + 1)}>Next</Button></div>
      <Fab onClick={() => startEdit()} label="Add part" />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Part' : 'Add Part'}>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Field label="Part No." required><input className={inputClass} value={form.partNo} onChange={(e) => setForm({ ...form, partNo: e.target.value })} required /></Field>
          <Field label="Item Description" required><input className={inputClass} value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} required /></Field>
          <Field label="Make"><input className={inputClass} value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} /></Field>
          <Field label="Category"><input className={inputClass} list="categories" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /><datalist id="categories">{categories.map((cat) => <option key={cat.id} value={cat.name} />)}</datalist></Field>
          <Field label="Mapped Vendors"><select multiple className={inputClass} value={form.vendorIds} onChange={(e) => setForm({ ...form, vendorIds: [...e.target.selectedOptions].map((o) => o.value) })}>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.companyName}</option>)}</select></Field>
          <Field label="SKU"><input className={inputClass} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Field>
          <Field label="Barcode"><input className={inputClass} value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} /></Field>
          <Field label="Opening Stock"><input type="number" className={inputClass} value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} /></Field>
          <Field label="Minimum Stock"><input type="number" className={inputClass} value={form.minimumStock} onChange={(e) => setForm({ ...form, minimumStock: e.target.value })} /></Field>
          <Field label="Buying Price"><input type="number" className={inputClass} value={form.buyingPrice} onChange={(e) => setForm({ ...form, buyingPrice: e.target.value })} /></Field>
          <Field label="Selling Price"><input type="number" className={inputClass} value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} /></Field>
          <Field label="Product Image"><input name="productImageFile" type="file" accept="image/*" className={inputClass} /></Field>
          <div className="md:col-span-2 flex justify-end gap-2"><Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button><Button>Save Part</Button></div>
        </form>
      </Modal>
    </>
  );
}
