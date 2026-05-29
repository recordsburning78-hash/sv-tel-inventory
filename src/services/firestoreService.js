import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase/config';

export const colRef = (name) => collection(db, name);
export const docRef = (name, id) => doc(db, name, id);

export function listenCollection(name, callback, constraints = []) {
  return onSnapshot(query(colRef(name), ...constraints), (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}

export const orderByCreated = orderBy('createdAt', 'desc');

export async function saveDocument(collectionName, payload, id) {
  const data = { ...payload, updatedAt: serverTimestamp() };
  if (id) {
    await setDoc(docRef(collectionName, id), data, { merge: true });
    return id;
  }
  const created = await addDoc(colRef(collectionName), { ...data, createdAt: serverTimestamp() });
  return created.id;
}

export function removeDocument(collectionName, id) {
  return deleteDoc(docRef(collectionName, id));
}

export async function uploadProductImage(file) {
  if (!file) return '';
  const imageRef = ref(storage, `products/${crypto.randomUUID()}-${file.name}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}

export async function logActivity(user, action, details = {}) {
  return addDoc(colRef('activity_logs'), {
    action,
    details,
    userId: user?.uid || 'system',
    userName: user?.name || user?.email || 'System',
    timestamp: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
}

export async function createStockTransaction({ productId, quantity, type, user, notes, meta = {} }) {
  await runTransaction(db, async (transaction) => {
    const productReference = docRef('products', productId);
    const productSnapshot = await transaction.get(productReference);
    if (!productSnapshot.exists()) throw new Error('Product not found');

    const product = productSnapshot.data();
    const previousStock = Number(product.stockQuantity || 0);
    const delta = type === 'IN' ? Number(quantity) : -Number(quantity);
    const newStock = previousStock + delta;
    if (newStock < 0) throw new Error('Outward quantity cannot exceed current stock');

    transaction.update(productReference, {
      stockQuantity: newStock,
      updatedAt: serverTimestamp(),
    });

    const transactionReference = doc(colRef('stock_transactions'));
    transaction.set(transactionReference, {
      transactionType: type,
      productId,
      productName: product.productName,
      partNo: product.partNo,
      sku: product.sku,
      quantity: Number(quantity),
      previousStock,
      newStock,
      userId: user?.uid,
      userName: user?.name || user?.email,
      timestamp: serverTimestamp(),
      notes,
      ...meta,
      createdAt: serverTimestamp(),
    });
  });
}

export async function createInwardAgainstPo({ po, item, quantity, user, remarks }) {
  await createStockTransaction({
    productId: item.productId,
    quantity,
    type: 'IN',
    user,
    notes: remarks,
    meta: {
      poId: po.id,
      poNo: po.poNo,
      vendorId: po.vendorId,
      vendorName: po.vendorName,
      companyName: po.vendorName,
    },
  });

  const nextItems = po.items.map((poItem) => {
    if (poItem.productId !== item.productId) return poItem;
    const inwardQty = Number(poItem.inwardQty || 0) + Number(quantity);
    return {
      ...poItem,
      inwardQty,
      status: inwardQty >= Number(poItem.quantity || 0) ? 'complete' : 'partial',
    };
  });

  const isComplete = nextItems.every((poItem) => Number(poItem.inwardQty || 0) >= Number(poItem.quantity || 0));
  await updateDoc(docRef('purchase_orders', po.id), {
    items: nextItems,
    status: isComplete ? 'complete' : 'partial',
    updatedAt: serverTimestamp(),
  });
}

export async function createOutward({ invoiceNo, dispatchThrough, items, user, notes }) {
  const batch = writeBatch(db);
  const transactionIds = [];

  for (const item of items) {
    await createStockTransaction({
      productId: item.productId,
      quantity: item.quantity,
      type: 'OUT',
      user,
      notes,
      meta: { invoiceNo, dispatchThrough, outwardGroupId: transactionIds[0] || crypto.randomUUID() },
    });
  }

  await batch.commit();
}

export async function exportBackup() {
  const names = ['users', 'products', 'categories', 'vendors', 'purchase_orders', 'stock_transactions', 'settings'];
  const backup = {};
  for (const name of names) {
    const snapshot = await getDocs(colRef(name));
    backup[name] = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  }
  return backup;
}

export async function restoreBackup(backup) {
  const batch = writeBatch(db);
  Object.entries(backup).forEach(([name, rows]) => {
    rows.forEach((row) => {
      const { id, ...data } = row;
      batch.set(docRef(name, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
    });
  });
  await batch.commit();
}

export async function requestPasswordReset(email) {
  return addDoc(colRef('password_reset_requests'), {
    email,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

export async function markNotificationForPassword(uid) {
  return addDoc(colRef('notifications'), {
    userId: uid,
    title: 'Password updated',
    body: 'Admin has changed your password. Please login with the new password.',
    read: false,
    createdAt: serverTimestamp(),
  });
}

export function productQueryByVendor(vendorId) {
  return query(colRef('products'), where('vendorIds', 'array-contains', vendorId));
}
