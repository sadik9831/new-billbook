import React, { useState } from 'react';
import { InvoiceVoucher, ViewType, Party } from '../types';
import { formatCurrencyINR } from '../utils/numberToWords';

interface BusinessMonitorProps {
  invoices: InvoiceVoucher[];
  parties: Party[];
  onNavigate: (view: ViewType) => void;
  onOpenCreateInvoice: () => void;
  onSelectPartyLedger: (partyId: string) => void;
  onOpenWhatsAppDrawer: (party: Party, invoice?: InvoiceVoucher) => void;
  onViewInvoiceDetails: (invoice: InvoiceVoucher) => void;
  onShowToast: (title: string, message: string) => void;
}

export const BusinessMonitor: React.FC<BusinessMonitorProps> = ({
  invoices,
  parties,
  onNavigate,
  onOpenCreateInvoice,
  onSelectPartyLedger,
  onOpenWhatsAppDrawer,
  onViewInvoiceDetails,
  onShowToast,
}) => {
  const [journalTab, setJournalTab] = useState<'all' | 'unpaid' | 'overdue' | 'paid'>('all');
  const [trajectoryView, setTrajectoryView] = useState<'monthly' | 'quarterly' | 'fy'>('monthly');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState('25');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter invoices for Journal table
  const filteredInvoices = invoices.filter((inv) => {
    if (journalTab === 'unpaid' && inv.status !== 'Unpaid' && inv.status !== 'Pending') return false;
    if (journalTab === 'overdue' && inv.status !== 'Overdue') return false;
    if (journalTab === 'paid' && inv.status !== 'Paid') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchInv = inv.invoiceNo.toLowerCase().includes(q);
      const matchParty = inv.partyName.toLowerCase().includes(q);
      const matchGstin = inv.partyGstin.toLowerCase().includes(q);
      return matchInv || matchParty || matchGstin;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top Tactical Command Strip */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary font-mono text-[11px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            REAL-TIME LEDGER
          </span>
          <span className="text-[12px] text-outline">•</span>
          <span className="text-[12px] font-medium text-on-surface-variant">
            Period: <strong className="text-on-surface">01 Apr 2024 – 18 Oct 2024 (Q3 FY25)</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-secondary-container text-on-secondary-container text-[11px] font-bold px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            LIVE SYNC
          </span>
        </div>

        {/* Quick Keyboard Actions */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onOpenCreateInvoice}
            className="bg-primary text-on-primary hover:bg-primary-container px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">receipt</span>
            <span>+ New Invoice</span>
            <span className="bg-white/20 font-mono text-[10px] px-1 rounded">F8</span>
          </button>

          <button
            onClick={() => {
              onNavigate('ledger');
              onShowToast('Party Receipt Modal', 'Select party to post instant bank receipt voucher');
            }}
            className="bg-surface-container hover:bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">payments</span>
            <span>+ Party Receipt</span>
            <span className="bg-surface-container-highest font-mono text-[10px] px-1 rounded text-outline">F5</span>
          </button>

          <button
            onClick={() => onShowToast('Vendor Payment Form', 'Opening Accounts Payable voucher entry')}
            className="bg-surface-container hover:bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary">upload</span>
            <span>Payment</span>
            <span className="bg-surface-container-highest font-mono text-[10px] px-1 rounded text-outline">F6</span>
          </button>

          <button
            onClick={() => {
              onNavigate('ledger');
              onShowToast('Add Party Ledger', 'Direct master customer/vendor onboarding active');
            }}
            className="bg-surface-container hover:bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">person_add</span>
            <span>+ Add Party</span>
          </button>

          <button
            onClick={() => onShowToast('Daybook Reconciled', 'Showing all cash, bank & journal vouchers for 18 Oct 2024')}
            className="bg-surface-container-low hover:bg-surface-container text-on-surface-variant px-2.5 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span>Daybook</span>
            <span className="font-mono text-[10px] text-outline">Alt+F1</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Total Sales */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-outline">
              TOTAL SALES (MTD)
            </span>
            <span className="material-symbols-outlined text-primary text-[18px]">
              trending_up
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono text-[24px] font-bold text-on-surface tracking-tight">
              ₹48,92,450
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-container-low">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center bg-secondary-container text-on-secondary-container font-mono text-[11px] font-bold px-1.5 py-0.5 rounded">
                +14.2% MoM
              </span>
              <span className="text-[11px] text-outline font-medium">184 Invoices Issued</span>
            </div>
            {/* Sparkline graphic */}
            <svg className="w-16 h-5 text-primary stroke-current fill-none" viewBox="0 0 70 20">
              <path d="M0,16 L12,14 L24,17 L36,11 L48,13 L60,5 L70,2" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Metric 2: Total Receivables */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-outline">
              TOTAL RECEIVABLES
            </span>
            <span className="material-symbols-outlined text-tertiary-container text-[18px]">
              account_balance_wallet
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono text-[24px] font-bold text-on-surface tracking-tight">
              ₹16,35,800
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-surface-container-low">
            <div className="flex flex-col">
              <span className="text-error font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                Overdue (18 parties):
              </span>
              <span className="text-outline">Upcoming Due:</span>
            </div>
            <div className="flex flex-col text-right font-mono font-medium">
              <span className="text-error">₹5,84,200</span>
              <span className="text-on-surface">₹10,51,600</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Total Payables */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-outline">
              TOTAL PAYABLES
            </span>
            <span className="material-symbols-outlined text-error text-[18px]">
              receipt
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono text-[24px] font-bold text-on-surface tracking-tight">
              ₹7,42,100
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-surface-container-low">
            <div className="flex flex-col">
              <span className="text-tertiary font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                Due This Week:
              </span>
              <span className="text-outline">Purchase Orders Pending:</span>
            </div>
            <div className="flex flex-col text-right font-mono font-medium">
              <span className="text-tertiary">₹2,10,000</span>
              <span className="text-on-surface">9 Vendors</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Net Cash & Bank */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-outline">
              NET CASH & BANK
            </span>
            <span className="material-symbols-outlined text-secondary text-[18px]">
              account_balance
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono text-[24px] font-bold text-on-surface tracking-tight">
              ₹32,18,650
            </span>
          </div>
          <div className="flex flex-col gap-0.5 text-[11px] mt-2 pt-2 border-t border-surface-container-low">
            <div className="flex items-center justify-between">
              <span className="text-outline">HDFC Bank (Primary):</span>
              <span className="font-mono font-medium text-on-surface">₹24,80,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">ICICI Bank (Escrow):</span>
              <span className="font-mono font-medium text-on-surface">₹7,38,650</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-secondary font-medium mt-0.5">
              <span>Reconciled Today 09:30 AM</span>
              <span className="material-symbols-outlined text-[13px]">verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Collections Attention Required Banner */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border-l-4 border-error flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-error-container text-on-error-container flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[22px]">warning</span>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] font-bold text-on-surface">
                Critical Collections Attention Required
              </span>
              <span className="bg-error text-on-error font-mono text-[11px] font-bold px-2 py-0.5 rounded">
                3 High-Value Accounts &gt;45 Days
              </span>
            </div>
            <p className="text-[12px] text-on-surface-variant mt-0.5">
              ₹3,42,000 is blocked across 3 critical parties. Default risk score escalated to tier-1. Trigger WhatsApp ledgers or place billing on hold.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={() => onShowToast('Credit Paused', 'Credit paused on SK Enterprises, Kalyan Infra, and Nexus LogiTech.')}
            className="bg-surface-container hover:bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
          >
            Freeze Credit Limits
          </button>
          <button
            onClick={() => {
              onNavigate('aging');
              onShowToast('WhatsApp Broadcast Scheduled', '3 automated formal payment reminders queued with verified UPI payment links.');
            }}
            className="bg-secondary text-on-secondary hover:bg-secondary-fixed text-on-secondary font-semibold px-3.5 py-1.5 rounded-lg text-[12px] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            <span>Broadcast WhatsApp Reminders (3)</span>
          </button>
        </div>
      </div>

      {/* Middle Section: Trajectory Chart & Aging Slices */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left: Cash Flow & Sales Trajectory (7 cols) */}
        <div className="xl:col-span-7 bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-surface-container flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-xs bg-primary"></span>
                  <h3 className="text-[15px] font-bold text-on-surface">Cash Flow & Sales Trajectory</h3>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-0.5">
                  Monthly billing throughput versus actual cash collections (FY 2024-25)
                </p>
              </div>

              {/* View toggle */}
              <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 text-[11px] font-semibold">
                <button
                  onClick={() => setTrajectoryView('monthly')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    trajectoryView === 'monthly' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setTrajectoryView('quarterly')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    trajectoryView === 'quarterly' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Quarterly
                </button>
                <button
                  onClick={() => setTrajectoryView('fy')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    trajectoryView === 'fy' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-outline hover:text-on-surface'
                  }`}
                >
                  FY View
                </button>
              </div>
            </div>

            {/* Metrics legend */}
            <div className="flex flex-wrap items-center gap-4 text-[12px] mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-primary-container"></span>
                <span className="text-on-surface-variant">Billed Sales (Invoiced):</span>
                <span className="font-mono font-bold text-primary">₹48.92L</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-secondary"></span>
                <span className="text-on-surface-variant">Realized Collections:</span>
                <span className="font-mono font-bold text-secondary">₹39.15L</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-error rounded-xs"></span>
                <span className="text-on-surface-variant">Expense Outflow</span>
              </div>
            </div>

            {/* Bar Chart Visualization */}
            <div className="w-full bg-surface-container-low/50 rounded-xl p-4 flex flex-col justify-end h-56">
              {/* Y Axis Guide Lines */}
              <div className="h-full flex flex-col justify-between text-[10px] font-mono text-outline pb-6 relative">
                <div className="border-b border-surface-container-high/80 w-full flex justify-between">
                  <span>₹60L</span>
                </div>
                <div className="border-b border-surface-container-high/80 w-full flex justify-between">
                  <span>₹45L</span>
                </div>
                <div className="border-b border-surface-container-high/80 w-full flex justify-between">
                  <span>₹30L</span>
                </div>
                <div className="border-b border-surface-container-high/80 w-full flex justify-between">
                  <span>₹15L</span>
                </div>
                <div className="border-b border-surface-container-high/80 w-full flex justify-between">
                  <span>₹0L</span>
                </div>

                {/* Bars Container Absolute */}
                <div className="absolute inset-0 pl-10 pr-2 pb-6 flex items-end justify-between gap-2">
                  {/* May */}
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <div className="flex items-end gap-1.5 w-full justify-center">
                      <div className="w-4 sm:w-5 bg-primary-container rounded-t" style={{ height: '48%' }} title="May Invoiced: ₹28.5L"></div>
                      <div className="w-4 sm:w-5 bg-secondary rounded-t" style={{ height: '42%' }} title="May Collections: ₹24.8L"></div>
                    </div>
                    <span className="font-mono text-[10px] text-outline mt-2">MAY</span>
                  </div>

                  {/* Jun */}
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <div className="flex items-end gap-1.5 w-full justify-center">
                      <div className="w-4 sm:w-5 bg-primary-container rounded-t" style={{ height: '60%' }} title="Jun Invoiced: ₹36.2L"></div>
                      <div className="w-4 sm:w-5 bg-secondary rounded-t" style={{ height: '54%' }} title="Jun Collections: ₹32.0L"></div>
                    </div>
                    <span className="font-mono text-[10px] text-outline mt-2">JUN</span>
                  </div>

                  {/* Jul */}
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <div className="flex items-end gap-1.5 w-full justify-center">
                      <div className="w-4 sm:w-5 bg-primary-container rounded-t" style={{ height: '52%' }} title="Jul Invoiced: ₹31.4L"></div>
                      <div className="w-4 sm:w-5 bg-secondary rounded-t" style={{ height: '46%' }} title="Jul Collections: ₹27.6L"></div>
                    </div>
                    <span className="font-mono text-[10px] text-outline mt-2">JUL</span>
                  </div>

                  {/* Aug */}
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <div className="flex items-end gap-1.5 w-full justify-center">
                      <div className="w-4 sm:w-5 bg-primary-container rounded-t" style={{ height: '62%' }} title="Aug Invoiced: ₹37.5L"></div>
                      <div className="w-4 sm:w-5 bg-secondary rounded-t" style={{ height: '58%' }} title="Aug Collections: ₹34.8L"></div>
                    </div>
                    <span className="font-mono text-[10px] text-outline mt-2">AUG</span>
                  </div>

                  {/* Sep */}
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <div className="flex items-end gap-1.5 w-full justify-center">
                      <div className="w-4 sm:w-5 bg-primary-container rounded-t" style={{ height: '58%' }} title="Sep Invoiced: ₹35.1L"></div>
                      <div className="w-4 sm:w-5 bg-secondary rounded-t" style={{ height: '52%' }} title="Sep Collections: ₹31.2L"></div>
                    </div>
                    <span className="font-mono text-[10px] text-outline mt-2">SEP</span>
                  </div>

                  {/* Oct */}
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <div className="flex items-end gap-1.5 w-full justify-center">
                      <div className="w-4 sm:w-5 bg-primary rounded-t shadow-xs" style={{ height: '82%' }} title="Oct Invoiced: ₹48.92L"></div>
                      <div className="w-4 sm:w-5 bg-secondary rounded-t shadow-xs" style={{ height: '66%' }} title="Oct Collections: ₹39.15L"></div>
                    </div>
                    <span className="font-mono text-[10px] text-primary font-bold mt-2">OCT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[12px] pt-3 mt-3 border-t border-surface-container">
            <span className="text-on-surface-variant">
              Target Realization Rate: <strong className="text-secondary font-mono">80.02%</strong> (Benchmark: 85%)
            </span>
            <button
              onClick={() => onShowToast('Cashflow Ledger', 'Opening full consolidated cash book')}
              className="text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>Detailed Cash Flow Statement</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right: Receivables Aging Slices & Outstanding Accounts (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          {/* Receivables Aging Donut */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-surface-container flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[15px] font-bold text-on-surface">Receivables Aging Slices</h3>
                <p className="text-[11px] text-outline">Risk profile based on invoice credit terms</p>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px]">pie_chart</span>
            </div>

            <div className="flex items-center justify-between gap-4 my-2">
              {/* Donut graphic */}
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f2f3ff" strokeWidth="12" />
                  {/* 0-30 Days: 48% (115.1 of 238.7) */}
                  <circle
                    cx="50" cy="50" r="38" fill="transparent"
                    stroke="#2563eb" strokeWidth="12"
                    strokeDasharray="238.7" strokeDashoffset="0"
                  />
                  {/* 31-60 Days: 28% */}
                  <circle
                    cx="50" cy="50" r="38" fill="transparent"
                    stroke="#006c4a" strokeWidth="12"
                    strokeDasharray="238.7" strokeDashoffset="-114.5"
                  />
                  {/* 61-90 Days: 16% */}
                  <circle
                    cx="50" cy="50" r="38" fill="transparent"
                    stroke="#824500" strokeWidth="12"
                    strokeDasharray="238.7" strokeDashoffset="-181.4"
                  />
                  {/* >90 Days: 8% */}
                  <circle
                    cx="50" cy="50" r="38" fill="transparent"
                    stroke="#ba1a1a" strokeWidth="12"
                    strokeDasharray="238.7" strokeDashoffset="-219.6"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-outline font-semibold">TOTAL O/S</span>
                  <span className="font-mono text-[14px] font-bold text-on-surface">₹16.35L</span>
                </div>
              </div>

              {/* Slices Breakdown */}
              <div className="flex flex-col gap-1.5 flex-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                    0 – 30 Days
                  </span>
                  <span className="font-mono font-bold text-on-surface">48% (₹7.85L)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    31 – 60 Days
                  </span>
                  <span className="font-mono font-bold text-on-surface">28% (₹4.58L)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                    61 – 90 Days
                  </span>
                  <span className="font-mono font-bold text-on-surface">16% (₹2.61L)</span>
                </div>
                <div className="flex items-center justify-between text-error font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                    &gt; 90 Days (Bad Risk)
                  </span>
                  <span className="font-mono font-bold">8% (₹1.31L)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Outstanding Accounts mini list */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-bold text-on-surface">Top Outstanding Accounts</span>
              <button
                onClick={() => onNavigate('aging')}
                className="font-mono text-[11px] font-bold text-primary hover:underline uppercase"
              >
                ALL PARTIES (46)
              </button>
            </div>

            <div className="flex flex-col divide-y divide-surface-container-low">
              {/* Account 1 */}
              <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-[11px]">
                    K
                  </div>
                  <div>
                    <span className="text-[12px] font-semibold text-on-surface block leading-tight">
                      Kalyan Infra Projects Ltd
                    </span>
                    <span className="font-mono text-[10px] text-outline">
                      GST: 27AAFCL8892D1ZW
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-mono text-[12px] font-bold text-on-surface block leading-tight">
                      ₹2,14,000
                    </span>
                    <span className="font-mono text-[10px] text-error font-bold">
                      64d Overdue • 3 Inv
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const p = parties.find(x => x.id === 'party-kalyan') || parties[0];
                      onOpenWhatsAppDrawer(p);
                    }}
                    className="p-1 rounded-md text-secondary hover:bg-secondary-container transition-colors"
                    title="Send WhatsApp Followup"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                  </button>
                </div>
              </div>

              {/* Account 2 */}
              <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-surface-container text-on-surface-variant flex items-center justify-center font-bold text-[11px]">
                    N
                  </div>
                  <div>
                    <span className="text-[12px] font-semibold text-on-surface block leading-tight">
                      Nexus LogiTech Global
                    </span>
                    <span className="font-mono text-[10px] text-outline">
                      GST: 29AABCN4412E1Z8
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-mono text-[12px] font-bold text-on-surface block leading-tight">
                      ₹1,28,000
                    </span>
                    <span className="font-mono text-[10px] text-error font-bold">
                      48d Overdue • 1 Inv
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const p = parties.find(x => x.id === 'party-nexus') || parties[0];
                      onOpenWhatsAppDrawer(p);
                    }}
                    className="p-1 rounded-md text-secondary hover:bg-secondary-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                  </button>
                </div>
              </div>

              {/* Account 3 */}
              <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-[11px]">
                    Z
                  </div>
                  <div>
                    <span className="text-[12px] font-semibold text-on-surface block leading-tight">
                      Zenith Hardware Corp
                    </span>
                    <span className="font-mono text-[10px] text-outline">
                      GST: 27AABCS3310P1ZQ
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-mono text-[12px] font-bold text-on-surface block leading-tight">
                      ₹94,800
                    </span>
                    <span className="font-mono text-[10px] text-tertiary font-bold">
                      22d Grace • Due in 8d
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const p = parties.find(x => x.id === 'party-zenith-hardware') || parties[0];
                      onOpenWhatsAppDrawer(p);
                    }}
                    className="p-1 rounded-md text-secondary hover:bg-secondary-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                  </button>
                </div>
              </div>

              {/* Account 4 */}
              <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold text-[11px]">
                    B
                  </div>
                  <div>
                    <span className="text-[12px] font-semibold text-on-surface block leading-tight">
                      Bharat Tech Solutions
                    </span>
                    <span className="font-mono text-[10px] text-outline">
                      GST: 07AAACB9021L1ZZ
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-mono text-[12px] font-bold text-on-surface block leading-tight">
                      ₹76,450
                    </span>
                    <span className="font-mono text-[10px] text-secondary font-bold">
                      Fresh • Due in 18d
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const p = parties.find(x => x.id === 'party-bharat-tech') || parties[0];
                      onOpenWhatsAppDrawer(p);
                    }}
                    className="p-1 rounded-md text-secondary hover:bg-secondary-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => onShowToast('Statement Generated', 'Consolidated Statement of Accounts (SOA) generated in PDF format.')}
              className="mt-2 w-full py-2 bg-surface-container-low hover:bg-surface-container text-primary text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>Generate Statement of Accounts (SOA)</span>
              <span className="material-symbols-outlined text-[15px]">download</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2 Bottom Highlight Widgets: GST Readiness & Closing Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GSTR-1 & 3B Readiness */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">fact_check</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold uppercase text-outline">GSTR-1 & 3B READINESS</span>
              <span className="bg-secondary-container text-on-secondary-container font-mono text-[11px] font-bold px-1.5 py-0.5 rounded">
                98% Auto-matched
              </span>
            </div>
            <div className="font-mono text-[18px] font-bold text-on-surface mt-0.5">
              ₹8,80,641 Eligible ITC
            </div>
            <span className="text-[12px] text-outline">Zero pending mismatch in 2B portal</span>
          </div>
        </div>

        {/* Closing Stock Value */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-tertiary-fixed text-tertiary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">inventory</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold uppercase text-outline">CLOSING STOCK VALUE</span>
              <span className="font-mono text-[11px] font-bold text-tertiary-container">
                1,240 SKUs
              </span>
            </div>
            <div className="font-mono text-[18px] font-bold text-on-surface mt-0.5">
              ₹1,18,40,200
            </div>
            <span className="text-[12px] text-error font-medium">Reorder threshold alert: 14 items</span>
          </div>
        </div>
      </div>

      {/* Transaction Journal & Invoices Data Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden flex flex-col">
        {/* Table Header Bar */}
        <div className="p-4 bg-surface-container-lowest flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-surface-container">
          <div className="flex items-center gap-3">
            <h3 className="text-[15px] font-bold text-on-surface">Transaction Journal & Invoices</h3>
            <span className="text-[12px] text-outline">Showing last 75 entries</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Tab Pills */}
            <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 text-[12px] font-medium">
              <button
                onClick={() => setJournalTab('all')}
                className={`px-3 py-1 rounded transition-colors ${
                  journalTab === 'all' ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Vouchers
              </button>
              <button
                onClick={() => setJournalTab('unpaid')}
                className={`px-3 py-1 rounded transition-colors ${
                  journalTab === 'unpaid' ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Unpaid (24)
              </button>
              <button
                onClick={() => setJournalTab('overdue')}
                className={`px-3 py-1 rounded transition-colors ${
                  journalTab === 'overdue' ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Overdue (18)
              </button>
              <button
                onClick={() => setJournalTab('paid')}
                className={`px-3 py-1 rounded transition-colors ${
                  journalTab === 'paid' ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Paid
              </button>
            </div>

            {/* Search */}
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-outline text-[16px]">search</span>
              <input
                className="bg-surface-container-low text-on-surface placeholder:text-outline pl-8 pr-3 py-1 rounded-lg text-[12px] outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary w-48"
                placeholder="Filter invoices or GSTIN..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onShowToast('Excel Generated', 'Exporting vouchers to XLSX workbook')}
                className="px-2.5 py-1 bg-surface-container-low hover:bg-surface-container text-on-surface text-[12px] font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-secondary">table_view</span>
                <span>Excel</span>
              </button>
              <button
                onClick={() => onShowToast('Tally XML Ready', 'Generating Tally-compliant Daybook XML payload')}
                className="px-2.5 py-1 bg-surface-container-low hover:bg-surface-container text-on-surface text-[12px] font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-primary">code</span>
                <span>Tally XML</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dense Invoices Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-surface-container-low/70 text-outline font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4">INVOICE #</th>
                <th className="py-2.5 px-3">DATE</th>
                <th className="py-2.5 px-4 min-w-[200px]">PARTY / ACCOUNT LEDGER</th>
                <th className="py-2.5 px-3 text-right">TAXABLE</th>
                <th className="py-2.5 px-3 text-right">GST (TOTAL)</th>
                <th className="py-2.5 px-4 text-right">TOTAL AMOUNT</th>
                <th className="py-2.5 px-3">DUE DATE</th>
                <th className="py-2.5 px-3 text-center">STATUS</th>
                <th className="py-2.5 px-4 text-center">QUICK ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-2.5 px-4">
                    <span 
                      onClick={() => onViewInvoiceDetails(inv)}
                      className="font-mono text-primary font-bold hover:underline cursor-pointer"
                    >
                      {inv.invoiceNo}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-on-surface-variant text-[12px]">
                    {inv.date}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex flex-col">
                      <span 
                        onClick={() => onSelectPartyLedger(inv.partyId)}
                        className="font-semibold text-on-surface hover:text-primary cursor-pointer leading-tight"
                      >
                        {inv.partyName}
                      </span>
                      <span className="font-mono text-[11px] text-outline">
                        {inv.placeOfSupply.split(' ')[2] || 'Maharashtra'} • {inv.partyGstin}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-on-surface">
                    {formatCurrencyINR(inv.subtotal)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-on-surface-variant">
                    {formatCurrencyINR(inv.totalTax)}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-right font-bold text-on-surface">
                    {formatCurrencyINR(inv.totalAmount)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`font-mono text-[12px] ${
                      inv.status === 'Overdue' ? 'text-error font-semibold' : 'text-on-surface-variant'
                    }`}>
                      {inv.dueDate}
                      {inv.status === 'Overdue' && (
                        <span className="block text-[10px] text-error font-bold">
                          {inv.id === 'inv-891' ? '(64d ago)' : inv.id === 'inv-890' ? '(48d ago)' : '(Overdue)'}
                        </span>
                      )}
                      {inv.status === 'Pending' && (
                        <span className="block text-[10px] text-tertiary">
                          (in 8d)
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
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
                  <td className="py-2.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onViewInvoiceDetails(inv)}
                        className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container"
                        title="View / Print Tax Invoice"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button
                        onClick={() => {
                          const p = parties.find(x => x.id === inv.partyId) || parties[0];
                          onOpenWhatsAppDrawer(p, inv);
                        }}
                        className="p-1 rounded text-secondary hover:bg-secondary-container"
                        title="Send Direct WhatsApp Voucher"
                      >
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                      </button>
                      <button
                        onClick={() => onShowToast('Ledger Options', `Voucher ${inv.invoiceNo} audited with digital hash`)}
                        className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container"
                        title="More Actions"
                      >
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="p-3 bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] border-t border-surface-container">
          <div className="flex items-center gap-2">
            <span className="text-outline">Page {currentPage} of 12 (184 total vouchers)</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(e.target.value)}
              className="bg-surface-container-low px-2 py-0.5 rounded text-[11px] font-mono outline-none"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface disabled:opacity-50"
            >
              Previous
            </button>
            <button className="w-7 h-7 rounded bg-primary text-on-primary font-mono text-[11px] font-bold">
              1
            </button>
            <button className="w-7 h-7 rounded hover:bg-surface-container text-on-surface font-mono text-[11px]">
              2
            </button>
            <button className="w-7 h-7 rounded hover:bg-surface-container text-on-surface font-mono text-[11px]">
              3
            </button>
            <span className="px-1 text-outline">...</span>
            <button className="w-7 h-7 rounded hover:bg-surface-container text-on-surface font-mono text-[11px]">
              12
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Tally Vault & E-Way Compliance Status Bar */}
      <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 border border-surface-container-high/60">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[22px]">verified_user</span>
          <div>
            <span className="text-[13px] font-semibold text-on-surface block leading-tight">
              Tally Vault & E-Way Compliance Status
            </span>
            <span className="text-[11px] text-outline">
              Zero discrepancies between ERP local books and GSTN Portal for FY 24-25 Q2
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px] text-outline">
            NIC Server Response: <strong className="text-secondary font-semibold">42ms</strong>
          </span>
          <button
            onClick={() => onShowToast('Book Audit Succeeded', 'Double-entry invariants checked. Zero variance detected across 184 vouchers.')}
            className="text-primary hover:underline text-[12px] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Perform Book Audit (Ctrl+A)</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
