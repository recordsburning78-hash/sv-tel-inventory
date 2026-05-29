import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { orderBy } from 'firebase/firestore';
import { listenCollection } from '../services/firestoreService';
import { useAuth } from './AuthContext.jsx';

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const { firebaseUser, isAdmin, can, user } = useAuth();
  const [state, setState] = useState({
    products: [],
    categories: [],
    vendors: [],
    purchaseOrders: [],
    transactions: [],
    users: [],
    activityLogs: [],
    notifications: [],
    resetRequests: [],
    loading: true,
  });

  useEffect(() => {
    if (!firebaseUser) return undefined;
    const listeners = [listenCollection('categories', (categories) => setState((s) => ({ ...s, categories, loading: false })), [orderBy('name')])];

    if (isAdmin || can('parts')) listeners.push(listenCollection('products', (products) => setState((s) => ({ ...s, products, loading: false })), [orderBy('createdAt', 'desc')]));
    if (isAdmin || can('vendors')) listeners.push(listenCollection('vendors', (vendors) => setState((s) => ({ ...s, vendors })), [orderBy('companyName')]));
    if (isAdmin || can('po')) listeners.push(listenCollection('purchase_orders', (purchaseOrders) => setState((s) => ({ ...s, purchaseOrders })), [orderBy('createdAt', 'desc')]));
    if (isAdmin || can('transactions')) listeners.push(listenCollection('stock_transactions', (transactions) => setState((s) => ({ ...s, transactions })), [orderBy('createdAt', 'desc')]));
    if (isAdmin) {
      listeners.push(listenCollection('users', (users) => setState((s) => ({ ...s, users })), [orderBy('createdAt', 'desc')]));
      listeners.push(listenCollection('activity_logs', (activityLogs) => setState((s) => ({ ...s, activityLogs })), [orderBy('createdAt', 'desc')]));
      listeners.push(listenCollection('password_reset_requests', (resetRequests) => setState((s) => ({ ...s, resetRequests })), [orderBy('createdAt', 'desc')]));
    }
    listeners.push(listenCollection('notifications', (notifications) => setState((s) => ({ ...s, notifications })), [orderBy('createdAt', 'desc')]));

    return () => listeners.forEach((unsub) => unsub());
  }, [firebaseUser, isAdmin, user?.permissions]);

  const metrics = useMemo(() => {
    const totalProducts = state.products.length;
    const lowStock = state.products.filter((item) => Number(item.stockQuantity || 0) <= Number(item.minimumStock || 0));
    const outOfStock = state.products.filter((item) => Number(item.stockQuantity || 0) === 0);
    const stockValue = state.products.reduce((total, item) => total + Number(item.stockQuantity || 0) * Number(item.buyingPrice || 0), 0);
    const today = new Date().toDateString();
    const todaysMovements = state.transactions.filter((item) => {
      const date = item.timestamp?.toDate ? item.timestamp.toDate() : item.createdAt?.toDate?.();
      return date && date.toDateString() === today;
    });

    return {
      totalProducts,
      lowStock,
      outOfStock,
      stockValue,
      todaysMovements,
      totalCategories: state.categories.length,
      recentTransactions: state.transactions.slice(0, 8),
      pendingResetRequests: state.resetRequests.filter((item) => item.status === 'pending'),
    };
  }, [state]);

  return <InventoryContext.Provider value={{ ...state, metrics }}>{children}</InventoryContext.Provider>;
}

export const useInventory = () => useContext(InventoryContext);
