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

export default function Categories() {
  const { categories } = useInventory();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('list');
  const [form, setForm] = useState({ name: '', type: 'parts', description: '' });
  const [editing, setEditing] = useState(null);

  function edit(category) {
    setEditing(category);
    setForm({ name: category?.name || '', type: category?.type || 'parts', description: category?.description || '' });
    setOpen(true);
  }

  async function submit(e) {
    e.preventDefault();
    await saveDocument('categories', form, editing?.id);
    toast.success('Category saved');
    setOpen(false);
  }

  return (
    <>
      <PageHeader title="Categories" description="Admin editable dropdown options for parts and filters." actions={<><ViewToggle value={view} onChange={setView} /><Button onClick={() => edit(null)}>Add Category</Button></>} />
      <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4' : 'space-y-3'}>
        {categories.map((cat) => <Card key={cat.id} onClick={() => edit(cat)} className="flex items-center justify-between"><div><p className="font-bold">{cat.name}</p><p className="text-sm text-slate-500">{cat.type}</p></div><button className="text-rose-600" onClick={(e) => { e.stopPropagation(); removeDocument('categories', cat.id); }}>Delete</button></Card>)}
      </div>
      <Fab onClick={() => edit(null)} label="Add category" />
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Category' : 'Add Category'} size="max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Category Name" required><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="Type"><select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>parts</option><option>make</option><option>company</option></select></Field>
          <Field label="Description"><textarea className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Button>Save</Button>
        </form>
      </Modal>
    </>
  );
}
