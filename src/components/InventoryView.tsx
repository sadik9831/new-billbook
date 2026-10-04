import React, { useState } from 'react';
import { formatCurrencyINR } from '../utils/numberToWords';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  hsn: string;
  category: string;
  stockQty: number;
  unit: string;
  reorderLevel: number;
  purchaseRate: number;
  sellingRate: number;
  taxRate: number;
  status: 'In Stock' | 'Low Stock' | 'Reorder';
}

interface InventoryViewProps {
  onShowToast: (title: string, message: string) => void;
  onOpenCreateInvoice: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onShowToast, onOpenCreateInvoice }) => {
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: 'inv-1',
      sku: 'SRV-DEL-R750-XE',
      name: 'Enterprise Cloud Infrastructure Server - Rack Mount',
      hsn: '8471',
      category: 'Server Hardware',
      stockQty: 8,
      unit: 'Nos',
      reorderLevel: 5,
      purchaseRate: 110000,
      sellingRate: 145000,
      taxRate: 18,
      status: 'In Stock',
    },
    {
      id: 'inv-2',
      sku: 'CS-9300-48P',
      name: 'Industrial Network Switch 48-Port PoE+ Managed',
      hsn: '8517',
      category: 'Networking',
      stockQty: 3,
      unit: 'Pcs',
      reorderLevel: 6,
      purchaseRate: 14200,
      sellingRate: 18500,
      taxRate: 18,
      status: 'Reorder',
    },
    {
      id: 'inv-3',
      sku: 'CBL-HVY-35MM',
      name: 'Heavy Engineering Heavy Duty Cables & Sub-Station Connectors',
      hsn: '8544',
      category: 'Electricals',
      stockQty: 24,
      unit: 'Coils',
      reorderLevel: 10,
      purchaseRate: 11500,
      sellingRate: 15113,
      taxRate: 18,
      status: 'In Stock',
    },
    {
      id: 'inv-4',
      sku: 'PDU-16A-1U',
      name: 'Server Rack Mount Accessories & Power Distribution Units',
      hsn: '8537',
      category: 'Rack Accessories',
      stockQty: 4,
      unit: 'Nos',
      reorderLevel: 5,
      purchaseRate: 9800,
      sellingRate: 12957.6,
      taxRate: 18,
      status: 'Low Stock',
    },
    {
      id: 'inv-5',
      sku: 'FST-SS-316',
      name: 'Industrial Fasteners & Stainless Steel High-Grade Couplings',
      hsn: '7318',
      category: 'Hardware',
      stockQty: 450,
      unit: 'Boxes',
      reorderLevel: 100,
      purchaseRate: 580,
      sellingRate: 803.39,
      taxRate: 18,
      status: 'In Stock',
    },
  ]);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const filtered = items.filter(it => {
    if (filterCategory !== 'All' && it.category !== filterCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q) || it.hsn.includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-5 pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
              SKU & Warehouse Master
            </span>
            <span className="text-[12px] text-outline">•</span>
            <span className="text-[12px] text-outline">Real-time Valuation: <strong className="text-on-surface font-mono">₹1,18,40,200</strong></span>
          </div>
          <h1 className="text-[24px] font-bold text-on-surface">Items & Inventory Management</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onShowToast('Stock Audit', 'Physical count variance check triggered across Mumbai Hub')}
            className="bg-surface-container hover:bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
          >
            Stock Audit
          </button>
          <button
            onClick={() => onShowToast('Add Item', 'SKU entry form active')}
            className="bg-primary hover:bg-primary-container text-on-primary px-3.5 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Add New Item</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container">
          <span className="text-[11px] font-mono text-outline uppercase font-semibold">Total Stocked SKUs</span>
          <div className="text-[22px] font-mono font-bold text-on-surface mt-1">1,240 Items</div>
          <span className="text-[11px] text-secondary font-semibold">Across 4 central warehouses</span>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container">
          <span className="text-[11px] font-mono text-outline uppercase font-semibold">Reorder Alerts</span>
          <div className="text-[22px] font-mono font-bold text-error mt-1">14 SKUs Critical</div>
          <span className="text-[11px] text-error font-medium">Automatic PO recommended</span>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container">
          <span className="text-[11px] font-mono text-outline uppercase font-semibold">Inventory Turnover</span>
          <div className="text-[22px] font-mono font-bold text-on-surface mt-1">6.8x / Year</div>
          <span className="text-[11px] text-secondary font-medium">Above industry benchmark</span>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container">
          <span className="text-[11px] font-mono text-outline uppercase font-semibold">Gross Margin Avg</span>
          <div className="text-[22px] font-mono font-bold text-primary mt-1">26.4%</div>
          <span className="text-[11px] text-outline font-mono">Weighted by sales volume</span>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden flex flex-col">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <span className="material-symbols-outlined text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search by SKU, product name, HSN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-1.5 rounded-lg text-[12px] outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-surface-container-low px-3 py-1.5 rounded-lg text-[12px] outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Server Hardware">Server Hardware</option>
              <option value="Networking">Networking</option>
              <option value="Electricals">Electricals</option>
              <option value="Hardware">Hardware</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-outline font-mono text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-4">ITEM NAME & DESCRIPTION</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">HSN</th>
                <th className="py-2.5 px-3 text-right">STOCK QTY</th>
                <th className="py-2.5 px-3 text-right">PURCHASE (₹)</th>
                <th className="py-2.5 px-3 text-right">SELLING (₹)</th>
                <th className="py-2.5 px-3 text-center">GST %</th>
                <th className="py-2.5 px-3 text-center">STATUS</th>
                <th className="py-2.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filtered.map(it => (
                <tr key={it.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-2.5 px-4">
                    <span className="font-semibold text-on-surface block leading-tight">{it.name}</span>
                    <span className="text-[11px] text-outline">{it.category}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-primary">{it.sku}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-on-surface-variant">{it.hsn}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface">
                    {it.stockQty} {it.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-outline">{formatCurrencyINR(it.purchaseRate)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-on-surface">{formatCurrencyINR(it.sellingRate)}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{it.taxRate}%</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      it.status === 'In Stock'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : it.status === 'Low Stock'
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                        : 'bg-error-container text-on-error-container'
                    }`}>
                      {it.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={onOpenCreateInvoice}
                      className="text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Invoice SKU
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
