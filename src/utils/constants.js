export const APP_NAME = 'S V TEL Inventory';

export const PERMISSIONS = [
  { key: 'dashboard', label: 'Dashboard access' },
  { key: 'parts', label: 'Parts create, edit, delete' },
  { key: 'po', label: 'PO entry and purchase orders' },
  { key: 'inward', label: 'Material inward' },
  { key: 'outward', label: 'Material outward' },
  { key: 'vendors', label: 'Vendor management' },
  { key: 'transactions', label: 'Stock transactions and history' },
  { key: 'reports', label: 'Reports export XLS/PDF' },
  { key: 'users', label: 'User management' },
  { key: 'settings', label: 'Settings and backup restore' },
];

export const DEFAULT_PERMISSIONS = PERMISSIONS.reduce((acc, permission) => {
  acc[permission.key] = true;
  return acc;
}, {});

export const PO_PREFIX = 'SVTPL';

export const VIEW_MODES = ['list', 'grid'];
