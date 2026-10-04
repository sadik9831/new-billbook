import React, { useState } from 'react';
import { InvoiceVoucher, Party, ViewType } from '../types';
import { formatCurrencyINR } from '../utils/numberToWords';

interface DatabaseSyncProps {
  invoices: InvoiceVoucher[];
  parties: Party[];
  onOpenCreateInvoice: () => void;
  onSelectPartyLedger: (partyId: string) => void;
  onViewInvoiceDetails: (invoice: InvoiceVoucher) => void;
  onShowToast: (title: string, message: string) => void;
}

export const DatabaseSync: React.FC<DatabaseSyncProps> = ({
  invoices,
  parties,
  onOpenCreateInvoice,
  onSelectPartyLedger,
  onViewInvoiceDetails,
  onShowToast,
}) => {
  const [dbSearch, setDbSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [walLatency, setWalLatency] = useState(8);

  // Quick generator form state
  const [quickPartyId, setQuickPartyId] = useState('party-kalyan');
  const [quickInvDate, setQuickInvDate] = useState('2024-10-18');
  const [quickDueDate, setQuickDueDate] = useState('2024-11-17');
  const [quickBase, setQuickBase] = useState(120000);
  const [quickGst, setQuickGst] = useState(18);

  const quickTotal = Math.round(quickBase * (1 + quickGst / 100));

  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setWalLatency(Math.floor(6 + Math.random() * 5));
      onShowToast('Database Synced', 'PostgreSQL WAL logs flushed. All 184 vouchers verified in primary replica.');
    }, 700);
  };

  const handleCommitQuickInvoice = () => {
    onShowToast('Committed to DB', `Generated voucher for ₹${formatCurrencyINR(quickTotal)} written to PostgreSQL.`);
    onOpenCreateInvoice();
  };

  // Filtered invoices for database master table
  const filteredInvoices = invoices.filter((inv) => {
    if (!dbSearch.trim()) return true;
    const q = dbSearch.toLowerCase();
    return (
      inv.invoiceNo.toLowerCase().includes(q) ||
      inv.partyName.toLowerCase().includes(q) ||
      inv.dbRecordId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col w-full gap-5 pb-8">
      {/* Top Database Connectivity Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">storage</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-on-surface">PostgreSQL Enterprise DB</span>
                <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                  <span className={`w-1.5 h-1.5 rounded-full bg-secondary ${isSyncing ? 'animate-ping' : ''}`}></span>
                  {isSyncing ? 'Replicating...' : 'Connected & Synced'}
                </span>
              </div>
              <p className="text-[11px] text-outline">
                Auto-sync active • Schema v4.8 • Double-entry consistency verified
              </p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-surface-container text-[11px] font-mono">
            <span className="bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-semibold">
              Pool: 12/20
            </span>
            <span className="bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-semibold">
              WAL Sync: &lt;{walLatency}ms
            </span>
            <span className="bg-secondary-fixed/50 text-on-secondary-container px-2 py-0.5 rounded font-bold">
              Auto-Commit ON
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleForceSync}
            disabled={isSyncing}
            className="bg-surface-container hover:bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
            type="button"
          >
            <span className={`material-symbols-outlined text-secondary text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>Force Sync</span>
          </button>

          <button
            onClick={onOpenCreateInvoice}
            className="bg-primary text-on-primary hover:bg-primary-container px-3.5 py-1.5 rounded-lg text-[12px] font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Create Invoice (F8)</span>
          </button>
        </div>
      </div>

      {/* 2 Primary Operational Zones: Quick Invoicing & Double-Entry Ledger Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ZONE A: Quick Invoice Generator (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-surface-container flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">post_add</span>
                <h3 className="text-[15px] font-bold text-on-surface">Quick Invoice Generator</h3>
              </div>
              <span className="font-mono text-[11px] bg-surface-container px-2 py-0.5 rounded text-outline font-semibold">
                DB Auto-ID: INV-2024-0893
              </span>
            </div>

            <form className="flex flex-col gap-3 mt-3" onSubmit={(e) => { e.preventDefault(); handleCommitQuickInvoice(); }}>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-outline uppercase font-semibold">
                  Select Party / Customer Ledger
                </label>
                <select
                  value={quickPartyId}
                  onChange={(e) => setQuickPartyId(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface px-3 py-1.5 rounded-lg text-[12px] outline-none focus:ring-1 focus:ring-primary border-none cursor-pointer"
                >
                  {parties.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (GST: {p.gstin})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-outline uppercase font-semibold">Invoice Date</label>
                  <input
                    className="w-full bg-surface-container-low text-on-surface px-2.5 py-1.5 rounded-lg font-mono text-[12px] outline-none"
                    type="date"
                    value={quickInvDate}
                    onChange={(e) => setQuickInvDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-outline uppercase font-semibold">Due Date</label>
                  <input
                    className="w-full bg-surface-container-low text-on-surface px-2.5 py-1.5 rounded-lg font-mono text-[12px] outline-none"
                    type="date"
                    value={quickDueDate}
                    onChange={(e) => setQuickDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-outline uppercase font-semibold">Taxable Base (₹)</label>
                  <input
                    className="w-full bg-surface-container-low text-on-surface font-mono px-3 py-1.5 rounded-lg text-[12px] outline-none"
                    type="number"
                    value={quickBase}
                    onChange={(e) => setQuickBase(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-outline uppercase font-semibold">GST Rate</label>
                  <select
                    value={quickGst}
                    onChange={(e) => setQuickGst(Number(e.target.value))}
                    className="w-full bg-surface-container-low text-on-surface px-3 py-1.5 rounded-lg text-[12px] outline-none cursor-pointer"
                  >
                    <option value="18">18% (IGST / CGST+SGST)</option>
                    <option value="12">12%</option>
                    <option value="5">5%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between mt-1">
                <div className="flex flex-col">
                  <span className="text-[11px] text-outline">Calculated Total (with {quickGst}% GST)</span>
                  <span className="text-[18px] font-mono text-primary font-bold">
                    {formatCurrencyINR(quickTotal)}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-secondary flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[15px]">verified</span> Valid Ledger
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-on-primary hover:bg-primary-container py-2 rounded-lg text-[12px] font-semibold shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Commit to Database</span>
                </button>
                <button
                  onClick={() => onShowToast('Draft Created', 'Saved to local scratch buffer')}
                  type="button"
                  className="bg-surface-container hover:bg-surface-container-high text-on-surface px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
                >
                  Draft
                </button>
              </div>
            </form>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container">
              <span className="font-mono text-[10px] text-outline uppercase font-semibold">Total Invoiced (MTD)</span>
              <div className="text-[18px] font-mono text-on-surface font-bold mt-1">₹48,92,450</div>
              <span className="font-mono text-[11px] text-secondary">184 records posted</span>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container">
              <span className="font-mono text-[10px] text-outline uppercase font-semibold">DB Ledger Unsettled</span>
              <div className="text-[18px] font-mono text-error font-bold mt-1">₹16,35,800</div>
              <span className="font-mono text-[11px] text-error">18 overdue parties</span>
            </div>
          </div>
        </div>

        {/* ZONE B: Party Ledger & Double-Entry Audit (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-surface-container flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">account_balance_wallet</span>
                <div>
                  <h3 className="text-[15px] font-bold text-on-surface">Ledger Management & Double-Entry Audit</h3>
                  <p className="text-[11px] text-outline">Real-time debit/credit balances synced from general ledger tables</p>
                </div>
              </div>
              <button
                onClick={() => onShowToast('Exporting Ledger', 'DB ledger entries exported in CSV')}
                className="bg-surface-container-low hover:bg-surface-container text-on-surface px-2.5 py-1 rounded-lg text-[12px] font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-primary text-[15px]">file_download</span>
                <span>Export Ledger</span>
              </button>
            </div>

            {/* Party Ledger Active Card */}
            <div className="p-3 bg-surface-container-low rounded-xl my-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-on-surface font-bold">Kalyan Infra Projects Ltd</span>
                  <span className="bg-primary-fixed text-primary font-mono text-[10px] px-1.5 py-0.2 rounded font-bold">
                    Debtor (Customer)
                  </span>
                </div>
                <span className="text-[11px] text-outline font-mono">
                  GSTIN: 27AAFCL8892D1ZW • Credit Limit: ₹5,00,000
                </span>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-[11px] text-outline">Current Running Balance (Dr)</div>
                <div className="text-[18px] font-mono text-error font-bold">₹2,14,000.00 Dr</div>
              </div>
            </div>

            {/* Micro-Ledger Records Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="bg-surface-container text-outline font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-2 px-3">Date / Voucher</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3 text-right">Debit (₹)</th>
                    <th className="py-2 px-3 text-right">Credit (₹)</th>
                    <th className="py-2 px-3 text-right">Running Balance</th>
                    <th className="py-2 px-3 text-center">DB Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-mono">
                  <tr className="hover:bg-surface-container-low/70 transition-colors">
                    <td className="py-2 px-3">
                      <span className="text-on-surface font-bold block">18 Oct 2024</span>
                      <span className="text-outline text-[10px]">INV-2024-0891</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] text-primary bg-primary-fixed/40 px-1 py-0.5 rounded font-sans font-semibold">
                        Sales Inv
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-on-surface font-semibold">2,14,000.00</td>
                    <td className="py-2 px-3 text-right text-outline">—</td>
                    <td className="py-2 px-3 text-right font-bold text-error">2,14,000.00 Dr</td>
                    <td className="py-2 px-3 text-center">
                      <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-surface-container-low/70 transition-colors">
                    <td className="py-2 px-3">
                      <span className="text-on-surface font-bold block">02 Oct 2024</span>
                      <span className="text-outline text-[10px]">REC-2024-0412</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] text-secondary bg-secondary-container px-1 py-0.5 rounded font-sans font-semibold">
                        Receipt
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-outline">—</td>
                    <td className="py-2 px-3 text-right text-secondary font-semibold">1,50,000.00</td>
                    <td className="py-2 px-3 text-right font-bold text-on-surface">0.00</td>
                    <td className="py-2 px-3 text-center">
                      <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-surface-container-low/70 transition-colors">
                    <td className="py-2 px-3">
                      <span className="text-on-surface font-bold block">15 Sep 2024</span>
                      <span className="text-outline text-[10px]">INV-2024-0744</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] text-primary bg-primary-fixed/40 px-1 py-0.5 rounded font-sans font-semibold">
                        Sales Inv
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-on-surface font-semibold">1,50,000.00</td>
                    <td className="py-2 px-3 text-right text-outline">—</td>
                    <td className="py-2 px-3 text-right font-bold text-error">1,50,000.00 Dr</td>
                    <td className="py-2 px-3 text-center">
                      <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 text-outline text-[11px] border-t border-surface-container mt-2">
              <span>Audited by automated general ledger reconciler</span>
              <button
                onClick={() => onShowToast('Journal Entry (F7)', 'Opening manual general ledger voucher screen')}
                className="text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                type="button"
              >
                <span>Post Manual Journal Voucher (F7)</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Recent Invoices & Database Master Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden flex flex-col">
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest border-b border-surface-container">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-[15px] font-bold text-on-surface">Invoice Database & Transaction Master</h3>
            <span className="bg-secondary-container text-on-secondary-container font-mono text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Live Sync Active
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-outline text-[16px]">search</span>
              <input
                className="bg-surface-container-low text-on-surface placeholder:text-outline pl-8 pr-3 py-1 rounded-lg text-[12px] outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary w-52"
                placeholder="Filter invoice #, party or DB ID..."
                type="text"
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => onShowToast('Exported Master', '184 PostgreSQL table rows exported')}
              className="bg-surface-container-low hover:bg-surface-container text-on-surface px-3 py-1 rounded-lg text-[12px] font-semibold flex items-center gap-1 cursor-pointer"
              title="Export Master"
              type="button"
            >
              <span className="material-symbols-outlined text-secondary text-[16px]">table_view</span>
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-outline font-mono text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-4">DB RECORD ID</th>
                <th className="py-2.5 px-3">INVOICE #</th>
                <th className="py-2.5 px-4 min-w-[200px]">PARTY / CUSTOMER ACCOUNT</th>
                <th className="py-2.5 px-3 text-right">TAXABLE AMOUNT</th>
                <th className="py-2.5 px-4 text-right">TOTAL (GST INCL)</th>
                <th className="py-2.5 px-3">DUE DATE</th>
                <th className="py-2.5 px-3 text-center">STATUS</th>
                <th className="py-2.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-surface-container-low/70 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-outline text-[11px]">
                    {inv.dbRecordId}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-primary font-bold">
                    {inv.invoiceNo}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex flex-col">
                      <span
                        onClick={() => onSelectPartyLedger(inv.partyId)}
                        className="font-semibold text-on-surface hover:text-primary cursor-pointer leading-tight"
                      >
                        {inv.partyName}
                      </span>
                      <span className="font-mono text-outline text-[11px]">
                        {inv.partyGstin} • {inv.placeOfSupply.split(' ')[2] || 'MH'}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-on-surface">
                    {formatCurrencyINR(inv.subtotal)}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-right font-bold text-on-surface">
                    {formatCurrencyINR(inv.totalAmount)}
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    <span className={inv.status === 'Overdue' ? 'text-error font-semibold' : 'text-on-surface-variant'}>
                      {inv.dueDate} {inv.status === 'Overdue' && '(Overdue)'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 ${
                      inv.status === 'Paid'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : inv.status === 'Overdue'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-tertiary-fixed text-on-tertiary-fixed'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        inv.status === 'Paid' ? 'bg-secondary' : inv.status === 'Overdue' ? 'bg-error' : 'bg-tertiary'
                      }`}></span>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewInvoiceDetails(inv)}
                        className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container cursor-pointer"
                        title="View Voucher"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[17px]">visibility</span>
                      </button>
                      <button
                        onClick={() => onShowToast('Database Record Edit', `Lock acquired for ${inv.dbRecordId}`)}
                        className="p-1 rounded text-primary hover:text-primary hover:bg-surface-container cursor-pointer"
                        title="Edit In Database"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[17px]">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-surface-container-lowest flex items-center justify-between text-[12px] border-t border-surface-container">
          <span className="text-outline">Showing {filteredInvoices.length} of 184 database entries</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-0.5 rounded bg-surface-container text-outline text-[11px]" disabled type="button">
              Previous
            </button>
            <button className="w-6 h-6 rounded bg-primary text-on-primary font-mono text-[11px] font-bold" type="button">
              1
            </button>
            <button className="w-6 h-6 rounded hover:bg-surface-container text-on-surface font-mono text-[11px]" type="button">
              2
            </button>
            <button className="px-2.5 py-0.5 rounded bg-surface-container-low hover:bg-surface-container text-on-surface text-[11px]" type="button">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
