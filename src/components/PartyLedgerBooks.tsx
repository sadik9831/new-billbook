import React, { useState, useMemo } from 'react';
import { Party, LedgerEntry, ViewType } from '../types';
import { INITIAL_LEDGER_ENTRIES } from '../mockData';
import { formatCurrencyINR } from '../utils/numberToWords';

interface PartyLedgerBooksProps {
  parties: Party[];
  selectedPartyId: string;
  onSelectParty: (partyId: string) => void;
  onNavigate: (view: ViewType) => void;
  onShowToast: (title: string, message: string) => void;
}

export const PartyLedgerBooks: React.FC<PartyLedgerBooksProps> = ({
  parties,
  selectedPartyId,
  onSelectParty,
  onNavigate,
  onShowToast,
}) => {
  const [entries, setEntries] = useState<LedgerEntry[]>(INITIAL_LEDGER_ENTRIES);
  const [activeDatePreset, setActiveDatePreset] = useState<'month' | 'quarter' | 'year'>('year');
  const [voucherFilter, setVoucherFilter] = useState('all');
  const [statementDrawerOpen, setStatementDrawerOpen] = useState(false);
  const [recordReceiptModal, setRecordReceiptModal] = useState(false);
  const [creditNoteModal, setCreditNoteModal] = useState(false);

  // New voucher entry form state
  const [receiptAmount, setReceiptAmount] = useState(50000);
  const [receiptParticulars, setReceiptParticulars] = useState('HDFC Bank – Inward RTGS Settlement');
  const [creditNoteAmount, setCreditNoteAmount] = useState(10000);
  const [creditNoteParticulars, setCreditNoteParticulars] = useState('Price Difference Rebate Adjustment');

  // Currently active party
  const party = useMemo(() => {
    return parties.find(p => p.id === selectedPartyId) || parties[0];
  }, [parties, selectedPartyId]);

  // Compute live ledger summary
  const { totalDebit, totalCredit, closingBalance } = useMemo(() => {
    let deb = 0;
    let cred = 0;
    entries.forEach(e => {
      if (e.debit) deb += e.debit;
      if (e.credit) cred += e.credit;
    });
    return {
      totalDebit: deb,
      totalCredit: cred,
      closingBalance: deb - cred,
    };
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      if (voucherFilter === 'sales' && e.voucherType !== 'Sales Invoice') return false;
      if (voucherFilter === 'receipts' && e.voucherType !== 'Bank Receipt') return false;
      if (voucherFilter === 'credit' && e.voucherType !== 'Credit Note') return false;
      return true;
    });
  }, [entries, voucherFilter]);

  // Post bank receipt handler
  const handlePostReceipt = () => {
    if (!receiptAmount || receiptAmount <= 0) {
      onShowToast('Invalid Amount', 'Enter valid receipt amount.');
      return;
    }

    const newBalance = closingBalance - receiptAmount;
    const newEntry: LedgerEntry = {
      id: 'led-' + Date.now(),
      partyId: party.id,
      date: '18 Oct 2024',
      voucherType: 'Bank Receipt',
      voucherRef: 'REC-2024-0' + Math.floor(500 + Math.random() * 500),
      particulars: receiptParticulars,
      subDetail: 'Direct Bank Settlement • Real-time Reconciled',
      debit: null,
      credit: receiptAmount,
      balance: Math.abs(newBalance),
      balanceType: newBalance >= 0 ? 'Dr' : 'Cr',
      synced: true,
    };

    setEntries([...entries, newEntry]);
    setRecordReceiptModal(false);
    onShowToast('Bank Receipt Posted', `₹${formatCurrencyINR(receiptAmount)} credited to ${party.name} ledger.`);
  };

  // Post credit note handler
  const handlePostCreditNote = () => {
    if (!creditNoteAmount || creditNoteAmount <= 0) {
      onShowToast('Invalid Amount', 'Enter valid credit note amount.');
      return;
    }

    const newBalance = closingBalance - creditNoteAmount;
    const newEntry: LedgerEntry = {
      id: 'led-' + Date.now(),
      partyId: party.id,
      date: '18 Oct 2024',
      voucherType: 'Credit Note',
      voucherRef: 'CN-2024-00' + Math.floor(20 + Math.random() * 80),
      particulars: creditNoteParticulars,
      subDetail: 'Tax Credit Adjustment Note with GST reversal',
      debit: null,
      credit: creditNoteAmount,
      balance: Math.abs(newBalance),
      balanceType: newBalance >= 0 ? 'Dr' : 'Cr',
      synced: true,
    };

    setEntries([...entries, newEntry]);
    setCreditNoteModal(false);
    onShowToast('Credit Note Committed', `Credit Note ${newEntry.voucherRef} for ₹${formatCurrencyINR(creditNoteAmount)} posted.`);
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-8">
      {/* Party Profile & Master Financial Card */}
      <section className="w-full bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-5 flex flex-col xl:flex-row gap-5 items-start xl:items-center justify-between relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center shrink-0 shadow-xs text-primary">
            <span className="material-symbols-outlined text-[32px]">domain_verification</span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div className="relative inline-flex items-center">
                <select
                  value={selectedPartyId}
                  onChange={(e) => onSelectParty(e.target.value)}
                  className="appearance-none bg-surface-container-low hover:bg-surface-container text-on-surface text-[18px] font-bold pr-8 pl-3 py-1 rounded-lg cursor-pointer outline-none transition-colors border border-transparent focus:border-primary/20"
                >
                  {parties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 pointer-events-none text-outline text-[18px]">
                  expand_more
                </span>
              </div>
              <span className="bg-primary/10 text-primary text-[11px] font-bold px-2 py-0.5 rounded">
                Sundry Debtor
              </span>
              <span className="bg-secondary-container text-on-secondary-container text-[11px] font-bold px-2 py-0.5 rounded">
                Active Credit
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="text-outline">GSTIN:</span>
                <strong className="text-on-surface font-semibold">{party.gstin}</strong>
              </span>
              <span className="text-outline">•</span>
              <span className="flex items-center gap-1">
                <span className="text-outline">Phone:</span>
                <strong className="text-on-surface font-semibold">{party.phone}</strong>
              </span>
              <span className="text-outline">•</span>
              <span className="flex items-center gap-1">
                <span className="text-outline">Hub:</span>
                <strong className="text-on-surface font-semibold">{party.state}</strong>
              </span>
              <span className="text-outline">•</span>
              <span className="text-secondary font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                KYC Audited
              </span>
            </div>
          </div>
        </div>

        {/* Quick Ledger Shortcuts */}
        <div className="flex items-center gap-2 self-stretch xl:self-auto justify-end shrink-0">
          <button
            onClick={() => setStatementDrawerOpen(true)}
            className="bg-surface-container-low hover:bg-surface-container text-on-surface text-[12px] font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">chat</span>
            <span>WhatsApp Audit</span>
          </button>
          <button
            onClick={() => setRecordReceiptModal(true)}
            className="bg-primary text-on-primary hover:bg-primary-container text-[12px] font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            <span>+ Record Receipt</span>
            <span className="font-mono text-[10px] bg-white/20 text-on-primary px-1 rounded ml-0.5">F6</span>
          </button>
        </div>
      </section>

      {/* 5-Metric Double Entry Financial Position Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 w-full">
        {/* Opening Balance */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between relative overflow-hidden">
          <div className="h-1 bg-outline-variant absolute top-0 left-0 right-0"></div>
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="text-[12px]">Opening Balance</span>
            <span className="material-symbols-outlined text-[18px] text-outline">history</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono text-[22px] font-bold text-on-surface">₹50,000</span>
            <span className="font-mono text-[10px] font-bold text-error bg-error-container/60 px-1 rounded">Dr</span>
          </div>
          <span className="font-mono text-[10px] text-outline mt-1.5">Carried forward from FY 23-24</span>
        </div>

        {/* Total Billed / Debit */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between relative overflow-hidden">
          <div className="h-1 bg-primary absolute top-0 left-0 right-0"></div>
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="text-[12px]">Total Billed (Dr)</span>
            <span className="material-symbols-outlined text-[18px] text-primary">receipt_long</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono text-[22px] font-bold text-on-surface">
              {formatCurrencyINR(totalDebit)}
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] text-outline mt-1.5">
            <span>12 Sales Invoices</span>
            <span className="text-primary font-semibold">100% Tax Invoiced</span>
          </div>
        </div>

        {/* Total Received / Credit */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between relative overflow-hidden">
          <div className="h-1 bg-secondary absolute top-0 left-0 right-0"></div>
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="text-[12px]">Total Received (Cr)</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">price_check</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono text-[22px] font-bold text-secondary">
              {formatCurrencyINR(totalCredit)}
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] text-outline mt-1.5">
            <span>8 Receipts & Credits</span>
            <span className="text-secondary font-semibold">Bank Cleared</span>
          </div>
        </div>

        {/* Closing Net Receivable */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between relative overflow-hidden">
          <div className="h-1 bg-error absolute top-0 left-0 right-0"></div>
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="text-[12px] font-bold text-error">Closing Net Balance</span>
            <span className="flex h-2 w-2 rounded-full bg-error"></span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono text-[22px] font-bold text-error">
              {formatCurrencyINR(closingBalance)}
            </span>
            <span className="font-mono text-[10px] font-bold text-error bg-error-container/60 px-1 rounded">Dr</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] mt-1.5">
            <span className="text-outline">Receivable Due</span>
            <span className="text-error font-semibold">Aging: 18 Days</span>
          </div>
        </div>

        {/* Credit Limit Meter */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between relative overflow-hidden">
          <div className="h-1 bg-tertiary-container absolute top-0 left-0 right-0"></div>
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="text-[12px]">Credit Limit Guard</span>
            <span className="font-mono text-[11px] font-semibold text-tertiary-container">38.5% Used</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-2 my-1 overflow-hidden">
            <div className="bg-tertiary-container h-full rounded-full transition-all duration-500" style={{ width: '38.5%' }}></div>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] text-outline mt-1.5">
            <span>Available: <strong className="text-on-surface font-semibold">₹3,07,500</strong></span>
            <span>Limit: ₹5,00,000</span>
          </div>
        </div>
      </section>

      {/* Filter & Action Controls Ribbon */}
      <section className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Date range */}
          <button className="bg-surface-container-low hover:bg-surface-container text-on-surface text-[12px] font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
            <span>01 Apr 2024 – 31 Mar 2025 (FY 2024-25)</span>
            <span className="material-symbols-outlined text-[16px] text-outline ml-1">expand_more</span>
          </button>

          {/* Quick Presets */}
          <div className="flex items-center bg-surface-container-low rounded-xl p-0.5 gap-0.5 text-[11px]">
            <button
              onClick={() => setActiveDatePreset('month')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeDatePreset === 'month' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setActiveDatePreset('quarter')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeDatePreset === 'quarter' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Last Quarter
            </button>
            <button
              onClick={() => setActiveDatePreset('year')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeDatePreset === 'year' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Full Year (FY25)
            </button>
          </div>

          {/* Voucher type dropdown */}
          <div className="relative">
            <select
              value={voucherFilter}
              onChange={(e) => setVoucherFilter(e.target.value)}
              className="appearance-none bg-surface-container-low hover:bg-surface-container text-on-surface text-[12px] pl-3 pr-8 py-1.5 rounded-xl outline-none cursor-pointer transition-colors"
            >
              <option value="all">All Voucher Types ({entries.length} entries)</option>
              <option value="sales">Sales Invoices Only</option>
              <option value="receipts">Payment Receipts Only</option>
              <option value="credit">Credit Notes / Adjustments</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-outline text-[16px]">
              filter_list
            </span>
          </div>
        </div>

        {/* Actions & Export */}
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <button
            onClick={() => setCreditNoteModal(true)}
            className="bg-surface-container-low hover:bg-surface-container text-on-surface text-[12px] font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary">note_add</span>
            <span>+ Credit Note</span>
            <span className="font-mono text-[10px] text-outline">Alt+C</span>
          </button>

          <div className="flex items-center bg-surface-container-low rounded-xl p-0.5">
            <button
              onClick={() => onShowToast('Ledger PDF Ready', `Audited double-entry statement for ${party.name} downloaded`)}
              className="p-1.5 hover:bg-surface-container text-on-surface-variant hover:text-on-surface rounded-lg transition-colors cursor-pointer"
              title="Export Ledger as PDF (Alt+P)"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            </button>
            <button
              onClick={() => onShowToast('Ledger Excel Ready', 'Full running ledger exported to XLSX spreadsheet')}
              className="p-1.5 hover:bg-surface-container text-on-surface-variant hover:text-on-surface rounded-lg transition-colors cursor-pointer"
              title="Export Ledger as Excel XLS"
            >
              <span className="material-symbols-outlined text-[16px]">table_view</span>
            </button>
            <button
              onClick={() => onShowToast('Tally XML Exported', 'Downloaded Tally-compliant XML schema for party book')}
              className="p-1.5 hover:bg-surface-container text-on-surface-variant hover:text-on-surface rounded-lg transition-colors cursor-pointer"
              title="Export to Tally XML format"
            >
              <span className="material-symbols-outlined text-[16px]">code</span>
            </button>
          </div>

          <button
            onClick={() => setStatementDrawerOpen(true)}
            className="bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed text-[12px] font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span>Send Statement</span>
          </button>
        </div>
      </section>

      {/* Bank Reconciliation Status Banner */}
      <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-on-surface border border-surface-container">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">done_all</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-on-surface">Bank Reconciliation Verified</span>
            <span className="text-[11px] text-on-surface-variant">
              All party receipts match HDFC Current Account Statement (#0091-2311). Zero ledger variance detected.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span className="text-outline">Last Reconciled: <strong>Today, 11:42 AM</strong></span>
          <button
            onClick={() => onShowToast('Reconciliation Pass Complete', 'All 8 transactions matched against bank statement feed')}
            className="text-primary hover:text-primary-container font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Run Auto-Match</span>
            <span className="material-symbols-outlined text-[15px]">sync</span>
          </button>
        </div>
      </div>

      {/* Detailed Ledger Statement Table (Classic Tally Ledger Modernized) */}
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden flex flex-col">
        <div className="px-5 py-3 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-bold text-on-surface">Account Statement & Running Book</h3>
            <span className="text-[11px] font-bold bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded">
              Standard Double Entry
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-outline">
            <span>Currency: <strong className="text-on-surface">INR (₹)</strong></span>
            <span>•</span>
            <span>Sort: <strong className="text-on-surface">Chronological (Oldest First)</strong></span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-surface-container-low/70 text-outline font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4 w-28">Date</th>
                <th className="py-2.5 px-3 w-32">Voucher Type</th>
                <th className="py-2.5 px-3 w-32">Voucher / Ref #</th>
                <th className="py-2.5 px-4">Particulars / Account Head</th>
                <th className="py-2.5 px-4 text-right w-36 text-primary">Debit (Inflow)</th>
                <th className="py-2.5 px-4 text-right w-36 text-secondary">Credit (Outflow)</th>
                <th className="py-2.5 px-4 text-right w-36">Balance (₹)</th>
                <th className="py-2.5 px-3 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredEntries.map((e) => (
                <tr key={e.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-[12px] text-on-surface-variant">
                    {e.date}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      e.voucherType === 'Sales Invoice'
                        ? 'bg-primary/10 text-primary'
                        : e.voucherType === 'Bank Receipt'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : e.voucherType === 'Credit Note'
                        ? 'bg-tertiary-fixed text-tertiary'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {e.voucherType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[12px] text-primary font-bold">
                    {e.voucherRef}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface leading-tight">{e.particulars}</span>
                      {e.subDetail && (
                        <span className="text-[11px] text-outline font-mono">{e.subDetail}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-right font-semibold text-on-surface">
                    {e.debit ? formatCurrencyINR(e.debit, true, 2) : '—'}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-right font-semibold text-secondary">
                    {e.credit ? formatCurrencyINR(e.credit, true, 2) : '—'}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-right font-bold text-error">
                    {formatCurrencyINR(e.balance, true, 2)}{' '}
                    <span className="text-[10px]">{e.balanceType}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onShowToast('Voucher Inspector', `Opening ledger details for ${e.voucherRef}`)}
                      className="p-1 hover:bg-surface-container text-outline hover:text-on-surface rounded cursor-pointer"
                      title="View Voucher"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Table Total Row (Tally Ledger Format Summary) */}
            <tfoot>
              <tr className="bg-surface-container font-semibold text-[13px] border-t border-surface-container-high">
                <td className="py-3 px-4 text-right font-bold text-on-surface uppercase tracking-wider" colSpan={4}>
                  Total Current Period Balances:
                </td>
                <td className="py-3 px-4 font-mono text-right font-bold text-primary">
                  {formatCurrencyINR(totalDebit, true, 2)}
                </td>
                <td className="py-3 px-4 font-mono text-right font-bold text-secondary">
                  {formatCurrencyINR(totalCredit, true, 2)}
                </td>
                <td className="py-3 px-4 font-mono text-right font-bold text-error">
                  {formatCurrencyINR(closingBalance, true, 2)} Dr
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Table Meta Bar */}
        <div className="px-5 py-2.5 bg-surface-container-low flex flex-wrap items-center justify-between text-on-surface-variant font-mono text-[11px] gap-2 border-t border-surface-container">
          <div className="flex items-center gap-3">
            <span>Showing {filteredEntries.length} of {entries.length} records</span>
            <span>•</span>
            <span className="text-secondary font-semibold">Audited in Tally-Compliant Schema</span>
          </div>
          <div className="flex items-center gap-2 text-outline">
            <span>Keyboard: Use Up/Down arrows to navigate ledger rows</span>
          </div>
        </div>
      </div>

      {/* Analytics & Payment Aging Summary Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
        {/* Aging Breakdown Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[14px] font-bold text-on-surface">Accounts Receivable Aging</h4>
            <span className="text-[10px] font-bold text-outline bg-surface-container px-2 py-0.5 rounded">
              30-day cycle
            </span>
          </div>

          <div className="w-full flex flex-col gap-2 my-2 text-[12px]">
            <div className="flex items-center justify-between font-mono">
              <span className="text-on-surface-variant">0 – 30 Days (Current)</span>
              <span className="font-bold text-secondary">{formatCurrencyINR(closingBalance)} (100%)</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '100%' }}></div>
            </div>

            <div className="flex items-center justify-between font-mono mt-1">
              <span className="text-on-surface-variant">31 – 60 Days (Aging)</span>
              <span className="font-bold text-outline">₹0 (0%)</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '0%' }}></div>
            </div>

            <div className="flex items-center justify-between font-mono mt-1">
              <span className="text-on-surface-variant">&gt; 60 Days (Critical)</span>
              <span className="font-bold text-outline">₹0 (0%)</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
              <div className="bg-error h-full rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>

          <div className="bg-surface-container-low p-2.5 rounded-xl mt-2 flex items-center gap-2 text-[12px] text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
            <span>Account Health: <strong>Prompt Payer</strong> (Average clearance: 22 days).</span>
          </div>
        </div>

        {/* Quarterly Inflow vs Outflow */}
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[14px] font-bold text-on-surface">Quarterly Inflow vs Outflow</h4>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded font-mono">
              FY25
            </span>
          </div>

          <div className="w-full h-32 flex items-end justify-between px-3 py-2 bg-surface-container-low rounded-xl">
            {/* Q1 */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className="flex items-end gap-1 h-20">
                <div className="w-4 bg-primary rounded-t" style={{ height: '65%' }} title="Billed: ₹2,70,000"></div>
                <div className="w-4 bg-secondary rounded-t" style={{ height: '50%' }} title="Collected: ₹2,00,000"></div>
              </div>
              <span className="font-mono text-[9px] text-on-surface-variant">Q1 Apr-Jun</span>
            </div>
            {/* Q2 */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className="flex items-end gap-1 h-20">
                <div className="w-4 bg-primary rounded-t" style={{ height: '45%' }} title="Billed: ₹1,85,000"></div>
                <div className="w-4 bg-secondary rounded-t" style={{ height: '40%' }} title="Collected: ₹1,65,000"></div>
              </div>
              <span className="font-mono text-[9px] text-on-surface-variant">Q2 Jul-Sep</span>
            </div>
            {/* Q3 */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className="flex items-end gap-1 h-20">
                <div className="w-4 bg-primary rounded-t" style={{ height: '55%' }} title="Billed: ₹2,25,000"></div>
                <div className="w-4 bg-secondary rounded-t" style={{ height: '30%' }} title="Collected: ₹1,22,500"></div>
              </div>
              <span className="font-mono text-[9px] text-on-surface-variant">Q3 Oct-Dec</span>
            </div>
            {/* Q4 Est */}
            <div className="flex flex-col items-center gap-1 flex-1 opacity-40">
              <div className="flex items-end gap-1 h-20">
                <div className="w-4 bg-outline rounded-t" style={{ height: '20%' }}></div>
                <div className="w-4 bg-outline rounded-t" style={{ height: '15%' }}></div>
              </div>
              <span className="font-mono text-[9px] text-outline">Q4 Proj</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-on-surface-variant font-mono text-[11px] mt-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-primary"></span> Billed (Sales)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-secondary"></span> Collected (Cash)</span>
          </div>
        </div>

        {/* Quick Party Operations & Notes */}
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[14px] font-bold text-on-surface">Bookkeeper Audit Notes</h4>
            <span className="material-symbols-outlined text-[18px] text-outline">edit_note</span>
          </div>

          <div className="bg-surface-container-low p-3 rounded-xl flex flex-col gap-1.5 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-on-surface">Credit Terms Agreement:</span>
              <span className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-1.5 rounded">
                Net 30 Days
              </span>
            </div>
            <p className="text-[12px] text-on-surface-variant leading-relaxed">
              Party eligible for a 1.5% prompt settlement cash discount if invoice INV-2024-0711 cleared before 25 Oct 2024. Next GST 2B reconciliation scheduled for 11th of current month.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => onShowToast('GST Ledger', `Displaying GSTR-1 matching entries for ${party.gstin}`)}
              className="flex-1 bg-surface-container-low hover:bg-surface-container text-on-surface text-[12px] font-semibold py-2 rounded-xl transition-colors cursor-pointer text-center"
              type="button"
            >
              View Master GST Ledger
            </button>
            <button
              onClick={() => onShowToast('Settings', 'Adjust credit threshold and aging alerts')}
              className="flex-1 bg-surface-container-low hover:bg-surface-container text-on-surface text-[12px] font-semibold py-2 rounded-xl transition-colors cursor-pointer text-center"
              type="button"
            >
              Ledger Settings
            </button>
          </div>
        </div>
      </section>

      {/* Share Account Statement Slide-Over Drawer */}
      {statementDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs transition-opacity"
            onClick={() => setStatementDrawerOpen(false)}
          ></div>

          <div className="relative w-full max-w-md bg-surface-container-lowest shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
            <div className="p-5 bg-surface-container flex items-center justify-between border-b border-surface-container-high">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">send</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold text-on-surface">Share Account Statement</span>
                  <span className="font-mono text-[11px] text-on-surface-variant">Instant WhatsApp & Email Dispatch</span>
                </div>
              </div>
              <button
                onClick={() => setStatementDrawerOpen(false)}
                className="p-1 text-outline hover:text-on-surface rounded cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1 text-[12px]">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] font-bold uppercase text-outline">Recipient WhatsApp Mobile</label>
                <input
                  className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-xl font-mono outline-none"
                  type="text"
                  defaultValue={`${party.phone} (Accounts Finance)`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] font-bold uppercase text-outline">Accounts Email (CC)</label>
                <input
                  className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-xl outline-none"
                  type="text"
                  defaultValue={party.email}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] font-bold uppercase text-outline">Pre-Composed Message Preview</label>
                <div className="bg-surface-container-low p-3.5 rounded-xl text-on-surface flex flex-col gap-2">
                  <p>Dear <strong>{party.name}</strong>,</p>
                  <p>Greetings from <strong>Apex Dynamics Pvt Ltd</strong>.</p>
                  <p>Please find attached your updated statement of accounts for the period <strong>01 Apr 2024 to 31 Mar 2025</strong>.</p>

                  <div className="bg-surface-container-lowest p-2.5 rounded-lg flex flex-col gap-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Total Billed:</span>
                      <span className="font-semibold">{formatCurrencyINR(totalDebit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Total Receipts:</span>
                      <span className="font-semibold text-secondary">{formatCurrencyINR(totalCredit)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-error">
                      <span>Closing Net Balance:</span>
                      <span>{formatCurrencyINR(closingBalance)} Dr</span>
                    </div>
                  </div>
                  <p className="text-on-surface-variant text-[11px]">Kindly verify and initiate settlement at your earliest convenience.</p>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] font-bold uppercase text-outline">Attachment Package</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 bg-surface-container-low p-2 rounded-xl flex-1 cursor-pointer">
                    <input defaultChecked className="accent-primary rounded" type="checkbox" />
                    <span className="font-medium">Detailed PDF</span>
                  </label>
                  <label className="flex items-center gap-1.5 bg-surface-container-low p-2 rounded-xl flex-1 cursor-pointer">
                    <input defaultChecked className="accent-primary rounded" type="checkbox" />
                    <span className="font-medium">Excel Sheet</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 bg-surface-container flex items-center gap-3 border-t border-surface-container-high">
              <button
                onClick={() => setStatementDrawerOpen(false)}
                className="flex-1 bg-surface-container-lowest hover:bg-surface-container-high text-on-surface text-[12px] font-semibold py-2 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setStatementDrawerOpen(false);
                  onShowToast('Statement Dispatched', `Account Statement successfully sent via WhatsApp API and Email webhook to ${party.name}!`);
                }}
                className="flex-1 bg-secondary text-on-secondary hover:bg-secondary-fixed text-[12px] font-semibold py-2 rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Send Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Receipt Modal (F6) */}
      {recordReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs" onClick={() => setRecordReceiptModal(false)}></div>
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl p-5 flex flex-col gap-4 z-10 border border-surface-container animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">payments</span>
                <h3 className="text-[16px] font-bold text-on-surface">Record Bank Receipt (F6)</h3>
              </div>
              <button onClick={() => setRecordReceiptModal(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 text-[12px]">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-outline uppercase font-semibold">Party / Debtor</label>
                <input
                  type="text"
                  value={party.name}
                  disabled
                  className="bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-outline uppercase font-semibold">Receipt Amount (₹)</label>
                <input
                  type="number"
                  value={receiptAmount}
                  onChange={(e) => setReceiptAmount(Number(e.target.value) || 0)}
                  className="bg-surface-container-low px-3 py-2 rounded-lg text-on-surface font-mono text-[14px] font-bold outline-none border border-transparent focus:border-primary/20"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-outline uppercase font-semibold">Particulars / Bank Reference</label>
                <input
                  type="text"
                  value={receiptParticulars}
                  onChange={(e) => setReceiptParticulars(e.target.value)}
                  className="bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface outline-none border border-transparent focus:border-primary/20"
                />
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
                <span className="text-outline">Settlement Bank Account:</span>
                <span className="font-semibold text-on-surface font-mono">HDFC Current A/C #1204</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-surface-container">
              <button
                onClick={() => setRecordReceiptModal(false)}
                className="flex-1 py-2 bg-surface-container text-on-surface rounded-xl font-semibold text-[12px]"
              >
                Cancel
              </button>
              <button
                onClick={handlePostReceipt}
                className="flex-1 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-semibold text-[12px] flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Post & Reconcile</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Note Modal (Alt+C) */}
      {creditNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs" onClick={() => setCreditNoteModal(false)}></div>
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl p-5 flex flex-col gap-4 z-10 border border-surface-container animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[22px]">note_add</span>
                <h3 className="text-[16px] font-bold text-on-surface">Create Credit Note (Alt+C)</h3>
              </div>
              <button onClick={() => setCreditNoteModal(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 text-[12px]">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-outline uppercase font-semibold">Party Ledger</label>
                <input
                  type="text"
                  value={party.name}
                  disabled
                  className="bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-outline uppercase font-semibold">Credit Note Value (₹)</label>
                <input
                  type="number"
                  value={creditNoteAmount}
                  onChange={(e) => setCreditNoteAmount(Number(e.target.value) || 0)}
                  className="bg-surface-container-low px-3 py-2 rounded-lg text-on-surface font-mono text-[14px] font-bold outline-none border border-transparent focus:border-primary/20"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-outline uppercase font-semibold">Reason / Particulars</label>
                <input
                  type="text"
                  value={creditNoteParticulars}
                  onChange={(e) => setCreditNoteParticulars(e.target.value)}
                  className="bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface outline-none border border-transparent focus:border-primary/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-surface-container">
              <button
                onClick={() => setCreditNoteModal(false)}
                className="flex-1 py-2 bg-surface-container text-on-surface rounded-xl font-semibold text-[12px]"
              >
                Cancel
              </button>
              <button
                onClick={handlePostCreditNote}
                className="flex-1 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-semibold text-[12px] flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Commit Credit Note</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
