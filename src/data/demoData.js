import { DEFAULT_PERMISSIONS } from '../utils/constants.js';

export const demoData = {
  users: [
    {
      id: 'replace-with-admin-auth-uid',
      name: 'Rohit Kumar',
      email: 'rohitkumar5480@gmail.com',
      mobile: '',
      role: 'admin',
      status: 'active',
      permissions: DEFAULT_PERMISSIONS,
    },
  ],
  categories: [
    { id: 'cat-electrical', name: 'Electrical', type: 'parts', description: 'Electrical stock parts' },
    { id: 'cat-networking', name: 'Networking', type: 'parts', description: 'Network and telecom material' },
    { id: 'cat-tools', name: 'Tools', type: 'parts', description: 'Service tools and accessories' },
  ],
  vendors: [
    { id: 'vendor-alpha', companyName: 'Alpha Telecom Supplies', contactPerson: 'Amit Sharma', mobile: '9999999999', email: 'sales@alpha.example', gst: '07ABCDE1234F1Z5', address: 'Delhi', status: 'active' },
    { id: 'vendor-beta', companyName: 'Beta Electricals', contactPerson: 'Neha Jain', mobile: '8888888888', email: 'orders@beta.example', gst: '06ABCDE1234F1Z6', address: 'Gurugram', status: 'active' },
  ],
  products: [
    { id: 'part-001', productName: 'Fiber Patch Cord 3M', partNo: 'SV-FPC-003', sku: 'FPC003', barcode: '890001', make: 'D-Link', category: 'Networking', vendorIds: ['vendor-alpha'], stockQuantity: 120, minimumStock: 25, buyingPrice: 85, sellingPrice: 140 },
    { id: 'part-002', productName: 'RJ45 Connector Box', partNo: 'SV-RJ45-BOX', sku: 'RJ45BOX', barcode: '890002', make: 'Molex', category: 'Electrical', vendorIds: ['vendor-beta'], stockQuantity: 18, minimumStock: 20, buyingPrice: 320, sellingPrice: 460 },
    { id: 'part-003', productName: 'Cable Tie 200mm', partNo: 'SV-CT-200', sku: 'CT200', barcode: '890003', make: 'Generic', category: 'Tools', vendorIds: ['vendor-alpha', 'vendor-beta'], stockQuantity: 400, minimumStock: 100, buyingPrice: 35, sellingPrice: 60 },
  ],
};
