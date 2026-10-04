import React, { useState, useMemo } from 'react';
import { AgingRecord, Party, ViewType } from '../types';
import { INITIAL_AGING_RECORDS } from '../mockData';
import { formatCurrencyINR } from '../utils/numberToWords';

interface RemindersAgingProps {
  parties: Party[];
  onNavigate: (view: ViewType) => void;
  onOpenWhatsAppDrawer: (party: Party, customData?: any) => void;
  onShowToast: (title: string, message: string) => void;
}

export const RemindersAging: React.FC<RemindersAgingProps> = ({
  parties,
  onNavigate,
  onOpenWhatsAppDrawer,
  onShowToast,
}) => {
  const [records, setRecords] = useState<AgingRecord[]>(INITIAL_AGING_RECORDS);
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'disputed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bucketFilter, setBucketFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'oldest' | 'amount' | 'reminders'>('oldest');
  const [automationActive, setAutomationActive] = useState(true);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeRecipient, setActiveRecipient] = useState({
    party: 'Zenith Logistics Pvt Ltd',
    inv: 'INV-2024-0711',
    amount: '₹1,42,500',
    days: '18',
    contact: 'Rahul Sharma',
    phone: '+91 98201 44521',
  });
  const [templateType, setTemplateType] = useState<'friendly' | 'firm' | 'demand'>('firm');

  // Toggle record selection
  const toggleSelectRecord = (id: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const toggleSelectAll = (checked: boolean) => {
    setRecords(records.map(r => ({ ...r, selected: checked })));
  };

  const selectedCount = records.filter(r => r.selected).length;
  const aggregatedDue = records.filter(r => r.selected).reduce((acc, curr) => acc + curr.dueAmount, 0);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (activeTab === 'today' && r.statusCategory !== 'today') return false;
      if (activeTab === 'upcoming' && r.statusCategory !== 'upcoming') return false;
      if (activeTab === 'disputed' && r.statusCategory !== 'disputed') return false;

      if (bucketFilter === '1-15' && (r.overdueDays > -1 || r.overdueDays < -15)) return false;
      if (bucketFilter === '16-30' && (r.overdueDays > -16 || r.overdueDays < -30)) return false;
      if (bucketFilter === '30+' && r.overdueDays > -31) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          r.partyName.toLowerCase().includes(q) ||
          r.invoiceNo.toLowerCase().includes(q) ||
          r.contactName.toLowerCase().includes(q) ||
          r.gstinOrRegion.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'oldest') return a.overdueDays - b.overdueDays;
      if (sortBy === 'amount') return b.dueAmount - a.dueAmount;
      if (sortBy === 'reminders') return b.reminderCount - a.reminderCount;
      return 0;
    });
  }, [records, activeTab, bucketFilter, searchTerm, sortBy]);

  // Open Drawer with data
  const handleOpenDrawer = (record: AgingRecord, preset: 'friendly' | 'firm' | 'demand' = 'firm') => {
    setActiveRecipient({
      party: record.partyName,
      inv: record.invoiceNo,
      amount: formatCurrencyINR(record.dueAmount),
      days: Math.abs(record.overdueDays).toString(),
      contact: record.contactName,
      phone: record.phone,
    });
    setTemplateType(preset);
    setDrawerOpen(true);
  };

  // WhatsApp template text
  const templateMessage = useMemo(() => {
    if (templateType === 'friendly') {
      return `Dear ${activeRecipient.contact} (${activeRecipient.party}), this is a gentle reminder that Invoice ${activeRecipient.inv} for ${activeRecipient.amount} is awaiting settlement. You can review your account statement and clear dues via UPI: https://pay.flow/i/711 or bank transfer. Thank you for your continued partnership!`;
    }
    if (templateType === 'demand') {
      return `URGENT LEGAL NOTICE: Attention ${activeRecipient.contact} (${activeRecipient.party}). Invoice ${activeRecipient.inv} totaling ${activeRecipient.amount} is now critically overdue (${activeRecipient.days} days). Continued non-settlement will result in credit pause and escalation under MSMED Act / commercial recovery terms. Clear dues immediately: https://pay.flow/i/711`;
    }
    return `Dear ${activeRecipient.contact} (${activeRecipient.party}), reminder for Invoice ${activeRecipient.inv} of ${activeRecipient.amount} due on 30 Sep 2024 (${activeRecipient.days} days overdue). Pay instantly via UPI: https://pay.flow/i/711 or Bank Transfer. View invoice: https://ledgerflow.in/v/711. Please confirm payment ref.`;
  }, [templateType, activeRecipient]);

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Top Hero / Tactical Control Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-primary/10 text-primary font-mono text-[11px] px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              AR Cashflow Engine
            </span>
            <span className="text-outline text-[12px]">•</span>
            <span className="font-mono text-[11px] text-secondary font-semibold flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
              Auto-Sync: Live
            </span>
          </div>
          <h1 className="text-[24px] font-bold text-on-surface tracking-tight">
            Payment Reminders & Receivables Aging
          </h1>
          <p className="text-[13px] text-on-surface-variant mt-0.5">
            Automate cash collection cadence, reconcile party dues, and suppress aging defaults with instant WhatsApp dispatch.
          </p>
        </div>

        {/* Global Action Suite */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-2 bg-surface-container-lowest shadow-xs border border-surface-container px-3 py-1.5 rounded-xl text-[12px]">
            <span className="material-symbols-outlined text-outline text-[18px]">calendar_today</span>
            <span className="font-semibold text-on-surface">As of Today, 18 Oct 2024</span>
          </div>

          <button
            onClick={() => onShowToast('Bulk Reminders Dispatched', `${selectedCount} automated WhatsApp and Email reminders queued via Webhook`)}
            className="bg-primary-container hover:bg-primary text-on-primary-container px-4 py-2 rounded-xl text-[12px] font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            <span>Send Bulk Reminders ({selectedCount} Selected)</span>
          </button>

          <button
            onClick={() => handleOpenDrawer(records[0], 'firm')}
            className="bg-surface-container hover:bg-surface-container-high text-on-surface px-3 py-2 rounded-xl text-[12px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>View Active Preview</span>
          </button>
        </div>
      </div>

      {/* Section 1: KPI Matrix & Aging Bar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-5">
        {/* Total Outstanding & Multi-Bracket Stacked Bar (7 cols) */}
        <div className="xl:col-span-7 bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-outline font-semibold">
                  Total Accounts Receivable
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono text-[28px] font-bold text-on-surface tracking-tight">
                    ₹16,35,800
                  </span>
                  <span className="text-[11px] font-bold text-secondary bg-secondary-container/60 px-2 py-0.5 rounded">
                    40 Open Invoices
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[12px] text-outline">
                <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                <span>91.2% GST E-Invoice Verified</span>
              </div>
            </div>

            {/* Segmented Aging Visual Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-[12px] mb-1.5">
                <span className="font-semibold text-on-surface-variant">Aging Distribution Analysis</span>
                <span className="font-mono text-[11px] text-error font-bold">35.7% Overdue Portfolio</span>
              </div>

              <div className="w-full h-3 rounded-full bg-surface-container-low flex overflow-hidden gap-0.5">
                <div className="bg-secondary transition-all" style={{ width: '64.3%' }} title="Not Due Yet (1-30 days): ₹10,51,600"></div>
                <div className="bg-tertiary-fixed-dim transition-all" style={{ width: '19.2%' }} title="Overdue 1-15 days: ₹3,14,200"></div>
                <div className="bg-tertiary transition-all" style={{ width: '11.1%' }} title="Overdue 16-30 days: ₹1,82,000"></div>
                <div className="bg-error transition-all" style={{ width: '5.4%' }} title="Overdue 30+ days: ₹88,000"></div>
              </div>
            </div>
          </div>

          {/* Aging Tier Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col justify-between">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="font-mono text-[11px] text-on-surface-variant">Not Due Yet</span>
              </div>
              <span className="font-mono text-[14px] font-bold text-on-surface">₹10,51,600</span>
              <span className="text-[11px] text-outline mt-0.5">24 invoices (Healthy)</span>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col justify-between">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                <span className="font-mono text-[11px] text-on-surface-variant">1–15 Days</span>
              </div>
              <span className="font-mono text-[14px] font-bold text-tertiary">₹3,14,200</span>
              <span className="text-[11px] text-outline mt-0.5">8 invoices (Soft Stage)</span>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col justify-between">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span className="font-mono text-[11px] text-on-surface-variant">16–30 Days</span>
              </div>
              <span className="font-mono text-[14px] font-bold text-tertiary-container">₹1,82,000</span>
              <span className="text-[11px] text-outline mt-0.5">5 invoices (Firm Notice)</span>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col justify-between">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-error"></span>
                <span className="font-mono text-[11px] text-error font-bold">30+ Days Critical</span>
              </div>
              <span className="font-mono text-[14px] font-bold text-error">₹88,000</span>
              <span className="text-[11px] text-error/80 mt-0.5">3 invoices (Legal/Hold)</span>
            </div>
          </div>
        </div>

        {/* DSO Velocity Card (2.5 cols) */}
        <div className="xl:col-span-3 bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-outline font-semibold">
              DSO Gauge
            </span>
            <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-1.5 py-0.5 rounded">
              Optimal
            </span>
          </div>

          <div className="flex items-center justify-center my-2 relative">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#f2f3ff" strokeWidth="9"></circle>
              <circle
                cx="50" cy="50" fill="transparent" r="40"
                stroke="#006c4a" strokeDasharray="251.2"
                strokeDashoffset="175" strokeLinecap="round" strokeWidth="9"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-[28px] font-bold text-on-surface">28</span>
              <span className="text-[11px] text-outline -mt-1 font-medium">Days</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-2.5 rounded-lg flex items-center justify-between text-[12px]">
            <div className="flex flex-col">
              <span className="text-outline">Industry Target</span>
              <span className="font-bold text-on-surface">&lt; 30 Days</span>
            </div>
            <div className="h-6 w-px bg-outline-variant"></div>
            <div className="flex flex-col text-right">
              <span className="text-outline">Vs Last Quarter</span>
              <span className="font-bold text-secondary">↓ 6.4 Days</span>
            </div>
          </div>
        </div>

        {/* Total Recovered Banner Card (2 cols) */}
        <div className="xl:col-span-2 bg-gradient-to-br from-primary to-surface-tint rounded-xl text-on-primary shadow-xs p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-on-primary-container uppercase tracking-wider font-semibold">
              Collected MTD
            </span>
            <span className="material-symbols-outlined text-[18px] text-secondary-fixed">
              mark_chat_read
            </span>
          </div>

          <div className="my-3">
            <span className="font-mono text-[22px] font-bold text-on-primary tracking-tight">
              ₹12,45,000
            </span>
            <p className="text-[11px] text-surface-container-highest mt-1">
              Recovered via automated WhatsApp follow-ups this month.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-on-primary-container text-[12px]">
            <span className="material-symbols-outlined text-[15px] text-secondary-fixed">trending_up</span>
            <span className="font-mono font-bold">+22.8%</span>
            <span>vs manual calls</span>
          </div>
        </div>
      </div>

      {/* Section 2: Automation Rules Bar */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 mb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Automation Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAutomationActive(!automationActive);
                onShowToast(
                  automationActive ? 'Cadence Suspended' : 'Automation Resumed',
                  automationActive ? 'Automatic WhatsApp and SMS reminders paused' : 'Live cadence: T-3 days, On Due Date, 5-day cycle'
                );
              }}
              className={`w-11 h-6 rounded-full relative transition-colors focus:outline-none cursor-pointer ${
                automationActive ? 'bg-primary-container' : 'bg-outline'
              }`}
              type="button"
            >
              <span
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-xs ${
                  automationActive ? 'right-0.5' : 'left-0.5'
                }`}
              ></span>
            </button>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-on-surface flex items-center gap-1.5">
                Multi-Channel Auto Reminders
                <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-1.5 py-0.2 rounded">
                  {automationActive ? 'Active' : 'Paused'}
                </span>
              </span>
              <span className="text-[11px] text-outline">
                WhatsApp Business API • SendGrid Email • SMS Gateway
              </span>
            </div>
          </div>

          <div className="hidden xl:block h-7 w-px bg-outline-variant"></div>

          {/* Cadence Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-mono text-outline mr-1 font-semibold">Cadence:</span>
            <span className="bg-surface-container text-on-surface-variant font-medium px-2 py-0.5 rounded flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-primary">schedule</span>
              T-3 Days (Pre-due notice)
            </span>
            <span className="bg-surface-container text-on-surface-variant font-medium px-2 py-0.5 rounded flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-tertiary">today</span>
              On Due Date
            </span>
            <span className="bg-surface-container text-on-surface-variant font-medium px-2 py-0.5 rounded flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-error">repeat</span>
              Every 5 Days Post-due
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            onClick={() => onShowToast('Cadence Configuration', 'Edit default WhatsApp template dispatch schedules')}
            className="bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-outline">tune</span>
            <span>Edit Cadence Rules</span>
          </button>
          <button
            onClick={() => onShowToast('Exporting Ageing Schedule', 'Excel workbook with 30/60/90 days aging generated')}
            className="bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-outline">download</span>
            <span>Export Ageing Excel</span>
          </button>
        </div>
      </div>

      {/* Section 3: Receivables Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden flex flex-col">
        {/* Table Filters & Tab Strip */}
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-primary-container text-on-primary-container shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span>All Overdue</span>
                <span className="bg-white/20 font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold">16</span>
              </button>
              <button
                onClick={() => setActiveTab('today')}
                className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'today'
                    ? 'bg-primary-container text-on-primary-container shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span>Due Today</span>
                <span className="bg-surface-container-highest text-on-surface font-mono text-[10px] px-1.5 py-0.2 rounded-full">4</span>
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'upcoming'
                    ? 'bg-primary-container text-on-primary-container shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span>Upcoming (1-30d)</span>
                <span className="bg-surface-container-highest text-on-surface font-mono text-[10px] px-1.5 py-0.2 rounded-full">24</span>
              </button>
              <button
                onClick={() => setActiveTab('disputed')}
                className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'disputed'
                    ? 'bg-primary-container text-on-primary-container shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span>Disputed / On Hold</span>
                <span className="bg-error-container text-on-error-container font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold">2</span>
              </button>
            </div>

            <span className="text-[12px] text-outline">
              Showing <strong className="text-on-surface">{filteredRecords.length}</strong> of 16 critical parties
            </span>
          </div>

          {/* Search & Select Strip */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-surface-container-low p-2 rounded-xl">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[16px]">search</span>
                <input
                  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline text-[12px] pl-8 pr-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-primary shadow-xs"
                  placeholder="Filter by Party name, GSTIN, or Invoice #..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                value={bucketFilter}
                onChange={(e) => setBucketFilter(e.target.value)}
                className="bg-surface-container-lowest text-on-surface text-[12px] px-3 py-1.5 rounded-lg outline-none shadow-xs cursor-pointer"
              >
                <option value="all">All Aging Buckets</option>
                <option value="1-15">Overdue 1 - 15 Days</option>
                <option value="16-30">Overdue 16 - 30 Days</option>
                <option value="30+">Critical 30+ Days</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-outline uppercase font-semibold">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-surface-container-lowest text-on-surface text-[12px] px-3 py-1.5 rounded-lg outline-none shadow-xs cursor-pointer"
              >
                <option value="oldest">Oldest Due Date First</option>
                <option value="amount">Highest Balance Pending</option>
                <option value="reminders">Most Reminders Sent</option>
              </select>

              <button
                onClick={() => onShowToast('Ledgers Refreshed', 'Voucher data matched with live bank feed')}
                className="p-1.5 bg-surface-container-lowest text-on-surface-variant hover:text-on-surface rounded-lg shadow-xs cursor-pointer"
                title="Refresh Feed"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Actionable Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-surface-container-low text-outline font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    checked={records.length > 0 && records.every(r => r.selected)}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="rounded accent-primary cursor-pointer w-4 h-4"
                    type="checkbox"
                  />
                </th>
                <th className="py-2.5 px-3 font-semibold">CUSTOMER / PARTY NAME</th>
                <th className="py-2.5 px-3 font-semibold">INVOICE & DATE</th>
                <th className="py-2.5 px-3 font-semibold text-right">INVOICE / DUE AMOUNT</th>
                <th className="py-2.5 px-3 font-semibold">AGING & STATUS</th>
                <th className="py-2.5 px-3 font-semibold">REMINDER HISTORY</th>
                <th className="py-2.5 px-3 font-semibold text-center">QUICK ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredRecords.map((r) => {
                const isCritical = r.overdueDays <= -30;
                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-surface-container-low/70 transition-colors ${
                      isCritical ? 'bg-error-container/10' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center">
                      <input
                        checked={!!r.selected}
                        onChange={() => toggleSelectRecord(r.id)}
                        className="rounded accent-primary cursor-pointer w-4 h-4"
                        type="checkbox"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] ${
                          isCritical
                            ? 'bg-error text-on-error'
                            : r.severity === 'today'
                            ? 'bg-primary-fixed text-on-primary-fixed'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {r.initials}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-on-surface leading-tight">
                              {r.partyName}
                            </span>
                            {isCritical ? (
                              <span className="bg-error text-on-error text-[10px] font-bold px-1 rounded">
                                Escalated
                              </span>
                            ) : (
                              <button
                                onClick={() => handleOpenDrawer(r, 'firm')}
                                className="text-secondary hover:text-secondary-container"
                                title="Direct WhatsApp Available"
                              >
                                <span className="material-symbols-outlined text-[15px] align-middle">chat</span>
                              </button>
                            )}
                          </div>
                          <span className="text-[11px] text-outline font-mono">
                            {r.contactName} • {r.phone} • {r.gstinOrRegion}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex flex-col font-mono">
                        <span className="text-primary font-bold text-[12px]">{r.invoiceNo}</span>
                        <span className="text-[11px] text-outline">{r.invoiceDate} (Credit: {r.creditDays}d)</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex flex-col items-end font-mono">
                        <span className={`font-bold text-[13px] ${
                          isCritical ? 'text-error' : r.overdueDays < 0 ? 'text-tertiary-container' : 'text-on-surface'
                        }`}>
                          {formatCurrencyINR(r.dueAmount)}
                        </span>
                        <span className="text-[11px] text-outline">
                          Total: {formatCurrencyINR(r.totalInvoiceAmount)}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex flex-col items-start gap-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isCritical
                            ? 'bg-error text-on-error'
                            : r.overdueDays < 0
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-surface-container-highest text-on-surface'
                        }`}>
                          {r.statusText}
                        </span>
                        <span className="text-[11px] text-outline font-mono">Due: {r.dueDate}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`material-symbols-outlined text-[16px] ${
                          isCritical ? 'text-error' : 'text-secondary'
                        }`}>
                          {isCritical ? 'warning' : 'done_all'}
                        </span>
                        <div className="flex flex-col">
                          <span className={`text-[12px] font-medium leading-tight ${
                            isCritical ? 'text-error font-semibold' : 'text-on-surface'
                          }`}>
                            {r.reminderDetail}
                          </span>
                          <span className="font-mono text-[10px] text-outline">{r.lastReminderDate}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isCritical ? (
                          <button
                            onClick={() => handleOpenDrawer(r, 'demand')}
                            className="bg-error hover:bg-error/90 text-on-error px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">gavel</span>
                            <span>Legal Notice</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenDrawer(r, 'firm')}
                            className="bg-secondary-container hover:bg-secondary hover:text-on-secondary text-on-secondary-container px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">chat</span>
                            <span>WhatsApp</span>
                          </button>
                        )}

                        <button
                          onClick={() => onShowToast('Statement Emailed', `PDF Statement for ${r.invoiceNo} sent to ${r.partyName} finance desk.`)}
                          className="p-1 hover:bg-surface-container rounded-lg text-outline hover:text-on-surface cursor-pointer"
                          title="Email Statement PDF"
                        >
                          <span className="material-symbols-outlined text-[16px]">mail</span>
                        </button>

                        <button
                          onClick={() => onShowToast('Settlement Portal', `Opening quick reconciliation voucher for ${r.partyName} (${formatCurrencyINR(r.dueAmount)}).`)}
                          className="p-1 hover:bg-surface-container rounded-lg text-outline hover:text-secondary cursor-pointer"
                          title="Record Payment Receipt"
                        >
                          <span className="material-symbols-outlined text-[16px]">payments</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-surface-container text-[12px]">
          <div className="flex items-center gap-2">
            <span className="text-outline">Selected:</span>
            <span className="bg-primary/10 text-primary font-mono text-[11px] font-bold px-2 py-0.5 rounded">
              {selectedCount} vouchers
            </span>
            <span className="text-outline">•</span>
            <span className="text-outline">
              Aggregated Due: <strong className="text-on-surface font-mono">{formatCurrencyINR(aggregatedDue)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-surface-container hover:bg-surface-container-high rounded text-on-surface disabled:opacity-50" disabled>
              Previous
            </button>
            <span className="font-mono text-[11px] text-on-surface">Page 1 of 4</span>
            <button className="px-3 py-1 bg-surface-container hover:bg-surface-container-high rounded text-on-surface">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out WhatsApp & Communication Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          ></div>

          <div className="relative w-full max-w-lg bg-surface-container-lowest shadow-2xl flex flex-col justify-between overflow-hidden z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">chat</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold text-on-surface">Instant WhatsApp Dispatch</span>
                  <span className="font-mono text-[11px] text-secondary font-semibold">LedgerFlow Verified Business API</span>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-full hover:bg-surface-container text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
              {/* Recipient Details */}
              <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-1.5 border border-surface-container">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-on-surface">{activeRecipient.party}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    parseInt(activeRecipient.days) > 30 ? 'bg-error text-on-error' : 'bg-error-container text-on-error-container'
                  }`}>
                    {activeRecipient.days} Days Overdue
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px] text-outline">
                  <span>Contact: <strong className="text-on-surface">{activeRecipient.contact}</strong></span>
                  <span className="font-mono text-on-surface">{activeRecipient.phone}</span>
                </div>
                <div className="flex items-center justify-between text-[12px] text-outline pt-1 border-t border-surface-container">
                  <span>Invoice Ref: <span className="font-mono text-primary font-semibold">{activeRecipient.inv}</span></span>
                  <span>Balance: <strong className="font-mono text-error font-bold">{activeRecipient.amount}</strong></span>
                </div>
              </div>

              {/* Template Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-on-surface">Select Recovery Tone / Template:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTemplateType('friendly')}
                    className={`p-2 rounded-lg text-center text-[12px] font-semibold transition-all cursor-pointer ${
                      templateType === 'friendly' ? 'bg-primary-container text-on-primary-container shadow-xs' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                    type="button"
                  >
                    Friendly Due
                  </button>
                  <button
                    onClick={() => setTemplateType('firm')}
                    className={`p-2 rounded-lg text-center text-[12px] font-semibold transition-all cursor-pointer ${
                      templateType === 'firm' ? 'bg-primary-container text-on-primary-container shadow-xs' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                    type="button"
                  >
                    Firm Overdue
                  </button>
                  <button
                    onClick={() => setTemplateType('demand')}
                    className={`p-2 rounded-lg text-center text-[12px] font-semibold transition-all cursor-pointer ${
                      templateType === 'demand' ? 'bg-error text-on-error shadow-xs' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                    type="button"
                  >
                    Final Demand
                  </button>
                </div>
              </div>

              {/* Customer Screen Preview */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-outline font-bold">
                    Customer Screen Preview
                  </span>
                  <span className="font-mono text-[10px] text-secondary font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">lock</span>
                    256-bit encrypted
                  </span>
                </div>

                <div className="bg-[#e5ddd5] p-3.5 rounded-2xl flex flex-col gap-2 relative shadow-inner">
                  <div className="flex items-center justify-center">
                    <span className="bg-[#d1d7db] text-on-surface-variant font-mono text-[9px] px-2 py-0.5 rounded-full font-bold">
                      TODAY • VERIFIED BUSINESS
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div className="bg-white p-3 rounded-2xl rounded-tl-xs shadow-xs flex flex-col gap-2 max-w-[92%]">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-surface-container-low">
                      <span className="text-[11px] text-primary uppercase font-bold tracking-wider">Apex Dynamics Pvt Ltd</span>
                      <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
                    </div>

                    <p className="text-[12px] text-on-surface leading-relaxed">
                      {templateMessage}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-outline font-mono">
                      <span>10:42 AM</span>
                      <span className="material-symbols-outlined text-[14px] text-primary">done_all</span>
                    </div>

                    {/* Interactive Simulated Buttons */}
                    <div className="bg-surface-container-low hover:bg-surface-container p-2 rounded-xl text-center cursor-pointer transition-colors flex items-center justify-center gap-1 text-primary text-[12px] font-semibold">
                      <span className="material-symbols-outlined text-[15px]">bolt</span>
                      <span>Pay {activeRecipient.amount} via UPI / Card</span>
                    </div>
                    <div className="bg-surface-container-low hover:bg-surface-container p-2 rounded-xl text-center cursor-pointer transition-colors flex items-center justify-center gap-1 text-on-surface-variant text-[12px] font-semibold">
                      <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
                      <span>Download Tax Invoice (PDF)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simultaneous Delivery Channels */}
              <div className="bg-surface-container-low p-3 rounded-xl flex flex-col gap-1 text-[12px]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-outline font-bold">
                  Simultaneous Delivery Channels:
                </span>
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input defaultChecked className="accent-secondary rounded" type="checkbox" />
                    <span>WhatsApp (Direct)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input defaultChecked className="accent-primary rounded" type="checkbox" />
                    <span>Email Statement</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input className="accent-primary rounded" type="checkbox" />
                    <span>SMS Fallback</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 bg-surface-container-low flex items-center justify-between gap-3 border-t border-surface-container">
              <button
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl text-[12px] font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  onShowToast(
                    'WhatsApp Reminder Sent!',
                    `Message delivered to ${activeRecipient.contact} (${activeRecipient.party}) with payment link.`
                  );
                }}
                className="flex-1 bg-secondary hover:bg-secondary-fixed text-on-secondary px-4 py-2 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Send Instant Reminder Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
