import React, { useState, useMemo } from 'react';
import { InvoiceVoucher, InvoiceItem, Party, ViewType } from '../types';
import { COMPANY_PROFILE } from '../mockData';
import { formatCurrencyINR, numberToWordsINR } from '../utils/numberToWords';

interface InvoicesBillingProps {
  invoices: InvoiceVoucher[];
  parties: Party[];
  onSaveInvoice: (invoice: InvoiceVoucher) => void;
  onNavigate: (view: ViewType) => void;
  onSelectPartyLedger: (partyId: string) => void;
  onOpenWhatsAppDrawer: (party: Party, invoice?: InvoiceVoucher) => void;
  onPrintInvoice: (invoice: InvoiceVoucher) => void;
  onShowToast: (title: string, message: string) => void;
}

export const InvoicesBilling: React.FC<InvoicesBillingProps> = ({
  invoices,
  parties,
  onSaveInvoice,
  onNavigate,
  onSelectPartyLedger,
  onOpenWhatsAppDrawer,
  onPrintInvoice,
  onShowToast,
}) => {
  // Document Type
  const [docType, setDocType] = useState<'Tax Invoice' | 'Proforma' | 'Delivery Challan' | 'Credit Note'>('Tax Invoice');
  const [seriesNumber, setSeriesNumber] = useState('INV-2024-0892');
  const [invoiceDate, setInvoiceDate] = useState('2024-10-18');
  const [creditTerm, setCreditTerm] = useState('Net 30 (Due 17 Nov 2024)');
  const [poRef, setPoRef] = useState('PO-99214/MUM');

  // Party Selection
  const [selectedPartyId, setSelectedPartyId] = useState<string>('party-apex-horizon');
  const currentParty = useMemo(() => {
    return parties.find(p => p.id === selectedPartyId) || parties[0];
  }, [parties, selectedPartyId]);

  // Shipping & Dispatch
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [placeOfSupply, setPlaceOfSupply] = useState('27 - Maharashtra (Intra-state CGST + SGST @ 9% each)');
  const [shippingAddress, setShippingAddress] = useState('Warehouse Hub Alpha, Plot C-12, MIDC Industrial Area, Turbhe, Navi Mumbai, MH - 400705');

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      description: 'Enterprise Cloud Infrastructure Server - Rack Mount',
      sku: 'SKU: SRV-DEL-R750-XE • 64GB ECC RAM / 2TB NVMe Dual PS',
      hsn: '8471',
      qty: 2,
      unit: 'Nos',
      rate: 145000,
      discountPct: 5.0,
      taxable: 275500,
      gstRate: 18,
      total: 325090,
    },
    {
      id: 'item-2',
      description: 'Annual Maintenance Contract (AMC) SLA Support 24x7',
      sku: 'SAC: 9987 • Mission Critical Onsite L3 Escalation Coverage',
      hsn: '9987',
      qty: 1,
      unit: 'Year',
      rate: 85000,
      discountPct: 0.0,
      taxable: 85000,
      gstRate: 18,
      total: 100300,
    },
    {
      id: 'item-3',
      description: 'Industrial Network Switch 48-Port PoE+ Managed',
      sku: 'SKU: CS-9300-48P • 740W PoE Budget, 4x 10G SFP+ Uplinks',
      hsn: '8517',
      qty: 4,
      unit: 'Pcs',
      rate: 18500,
      discountPct: 2.5,
      taxable: 71750,
      gstRate: 18,
      total: 84665,
    },
  ]);

  // Fast draft input row
  const [draftDesc, setDraftDesc] = useState('');
  const [draftHsn, setDraftHsn] = useState('');
  const [draftQty, setDraftQty] = useState(1);
  const [draftUnit, setDraftUnit] = useState('Nos');
  const [draftRate, setDraftRate] = useState(0);
  const [draftDisc, setDraftDisc] = useState(0);

  // Settings
  const [autoRoundOff, setAutoRoundOff] = useState(true);
  const [showHsnSummary, setShowHsnSummary] = useState(true);
  const [paymentStatusMode, setPaymentStatusMode] = useState<'Unpaid' | 'Paid'>('Unpaid');
  const [autoDispatch, setAutoDispatch] = useState(true);

  // Terms
  const [termsText, setTermsText] = useState(
    `1. Goods once sold will not be accepted back or exchanged under standard SLA terms.\n2. Interest @ 18% p.a. will be levied on delayed payments beyond 30 days grace timeline.\n3. Subject to Mumbai Jurisdiction only. Electronic E-Invoice authenticated through NIC portal.`
  );

  // Calculations
  const isInterState = placeOfSupply.includes('Inter-state');

  const { subtotal, cgst, sgst, igst, totalTax, roundOff, grandTotal } = useMemo(() => {
    let sub = 0;
    items.forEach(it => {
      sub += it.taxable;
    });

    let c = 0;
    let s = 0;
    let i = 0;

    items.forEach(it => {
      const taxRate = it.gstRate / 100;
      if (isInterState) {
        i += it.taxable * taxRate;
      } else {
        c += it.taxable * (taxRate / 2);
        s += it.taxable * (taxRate / 2);
      }
    });

    const tax = isInterState ? i : (c + s);
    const unroundedTotal = sub + tax;
    const rounded = autoRoundOff ? Math.round(unroundedTotal) : unroundedTotal;
    const ro = Number((rounded - unroundedTotal).toFixed(2));

    return {
      subtotal: sub,
      cgst: c,
      sgst: s,
      igst: i,
      totalTax: tax,
      roundOff: ro,
      grandTotal: rounded,
    };
  }, [items, isInterState, autoRoundOff]);

  // Recalculate item row
  const updateItem = (index: number, updates: Partial<InvoiceItem>) => {
    const updated = [...items];
    const item = { ...updated[index], ...updates };

    // Recompute taxable and total
    const discMultiplier = (100 - (item.discountPct || 0)) / 100;
    const taxable = Number((item.qty * item.rate * discMultiplier).toFixed(2));
    const tax = Number((taxable * (item.gstRate / 100)).toFixed(2));
    item.taxable = taxable;
    item.total = Number((taxable + tax).toFixed(2));

    updated[index] = item;
    setItems(updated);
  };

  const deleteRow = (index: number) => {
    if (items.length <= 1) {
      onShowToast('Invoice Requirement', 'At least one line item is required.');
      return;
    }
    const filtered = items.filter((_, i) => i !== index);
    setItems(filtered);
    onShowToast('Row Removed', `Removed item line #${index + 1}`);
  };

  const addDraftItem = () => {
    if (!draftDesc.trim()) {
      onShowToast('Missing Item Name', 'Please specify item description to add.');
      return;
    }

    const discMultiplier = (100 - draftDisc) / 100;
    const taxable = Number((draftQty * draftRate * discMultiplier).toFixed(2));
    const tax = Number((taxable * 0.18).toFixed(2));

    const newItem: InvoiceItem = {
      id: 'item-' + Date.now(),
      description: draftDesc,
      sku: 'SKU: ' + (draftHsn ? 'HSN-' + draftHsn : 'GEN-01'),
      hsn: draftHsn || '8471',
      qty: draftQty,
      unit: draftUnit,
      rate: draftRate,
      discountPct: draftDisc,
      taxable,
      gstRate: 18,
      total: Number((taxable + tax).toFixed(2)),
    };

    setItems([...items, newItem]);
    setDraftDesc('');
    setDraftHsn('');
    setDraftQty(1);
    setDraftRate(0);
    setDraftDisc(0);
    onShowToast('Line Item Added', `Added ${newItem.description}`);
  };

  const handleSaveAndGenerate = () => {
    const dueDays = creditTerm.includes('15') ? 15 : creditTerm.includes('Immediate') ? 0 : 30;
    const dueD = new Date();
    dueD.setDate(dueD.getDate() + dueDays);
    const dueDateStr = dueD.toISOString().split('T')[0];

    const invoiceVoucher: InvoiceVoucher = {
      id: 'inv-' + Date.now(),
      dbRecordId: '#rec_' + Math.floor(10000 + Math.random() * 90000),
      series: seriesNumber,
      invoiceNo: seriesNumber,
      date: invoiceDate,
      dueDate: dueDateStr,
      poRef: poRef,
      partyId: currentParty.id,
      partyName: currentParty.name,
      partyGstin: currentParty.gstin,
      placeOfSupply: placeOfSupply,
      shippingAddress: sameAsBilling ? currentParty.address : shippingAddress,
      sameAsBilling: sameAsBilling,
      items: items,
      subtotal,
      cgst,
      sgst,
      igst,
      totalTax,
      roundOff,
      totalAmount: grandTotal,
      status: paymentStatusMode === 'Paid' ? 'Paid' : 'Unpaid',
      invoiceType: docType,
      terms: termsText,
      createdAt: new Date().toISOString(),
    };

    onSaveInvoice(invoiceVoucher);
    onShowToast(
      'Invoice Generated & Committed',
      `${seriesNumber} (${formatCurrencyINR(grandTotal)}) posted to PostgreSQL ledger with e-Invoice QR code.`
    );
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Sticky Top Command & Action Bar */}
      <div className="sticky top-16 z-30 bg-surface-container-lowest shadow-xs rounded-xl mb-5 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 border border-surface-container">
        <div className="flex items-center flex-wrap gap-3">
          {/* Doc Type Selector */}
          <div className="flex items-center bg-surface-container-high rounded-lg p-0.5 shadow-inner">
            {(['Tax Invoice', 'Proforma', 'Delivery Challan', 'Credit Note'] as const).map(type => (
              <button
                key={type}
                onClick={() => setDocType(type)}
                className={`px-3 py-1 rounded text-[12px] font-semibold transition-colors cursor-pointer ${
                  docType === type
                    ? 'bg-primary-container text-on-primary-container shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                {type}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-surface-variant"></div>

          {/* Series */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] text-outline uppercase tracking-wider">Series</span>
            <input
              type="text"
              value={seriesNumber}
              onChange={(e) => setSeriesNumber(e.target.value)}
              className="bg-surface-container-low px-2 py-0.5 rounded font-mono text-[12px] font-bold text-primary outline-none w-32 border border-transparent focus:border-primary/20"
            />
          </div>

          {/* Date */}
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-outline">calendar_today</span>
            <span className="text-[12px]">Date:</span>
            <input
              className="bg-surface-container-low px-2 py-0.5 rounded font-mono text-[12px] text-on-surface outline-none cursor-pointer border border-transparent focus:border-primary/20"
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>

          {/* Due Terms */}
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
            <select
              value={creditTerm}
              onChange={(e) => setCreditTerm(e.target.value)}
              className="bg-surface-container-low px-2 py-1 rounded text-[12px] text-on-surface outline-none cursor-pointer"
            >
              <option>Net 30 (Due 17 Nov 2024)</option>
              <option>Net 15 (Due 02 Nov 2024)</option>
              <option>Immediate / Due on Receipt</option>
              <option>Custom Due Date</option>
            </select>
          </div>

          {/* PO Ref */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded">
            <span className="font-mono text-[11px] text-outline">PO Ref:</span>
            <input
              className="bg-transparent font-mono text-[12px] text-on-surface w-28 outline-none"
              placeholder="PO-99214/MUM"
              type="text"
              value={poRef}
              onChange={(e) => setPoRef(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Action CTAs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onShowToast('Draft Stored', 'Invoice draft state auto-saved to local session')}
            className="bg-surface-container-low hover:bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">draft</span>
            <span>Draft</span>
          </button>

          <button
            onClick={() => {
              const dummyInv: InvoiceVoucher = {
                id: 'inv-preview',
                dbRecordId: '#rec_preview',
                series: seriesNumber,
                invoiceNo: seriesNumber,
                date: invoiceDate,
                dueDate: '2024-11-17',
                poRef,
                partyId: currentParty.id,
                partyName: currentParty.name,
                partyGstin: currentParty.gstin,
                placeOfSupply,
                shippingAddress: sameAsBilling ? currentParty.address : shippingAddress,
                sameAsBilling,
                items,
                subtotal,
                cgst,
                sgst,
                igst,
                totalTax,
                roundOff,
                totalAmount: grandTotal,
                status: paymentStatusMode === 'Paid' ? 'Paid' : 'Unpaid',
                invoiceType: docType,
                terms: termsText,
                createdAt: new Date().toISOString(),
              };
              onPrintInvoice(dummyInv);
            }}
            className="bg-surface-container-low hover:bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print</span>
          </button>

          <button
            onClick={() => onOpenWhatsAppDrawer(currentParty)}
            className="bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleSaveAndGenerate}
            className="bg-primary hover:bg-primary-container text-on-primary px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">cloud_done</span>
            <span>Save & Generate</span>
            <span className="bg-white/20 text-on-primary font-mono text-[10px] px-1 rounded ml-0.5">
              Ctrl+S
            </span>
          </button>
        </div>
      </div>

      {/* Party, Billing & Consignee Bento Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-5">
        {/* Party (Billed To) Section (7 Cols) */}
        <div className="xl:col-span-7 bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">corporate_fare</span>
                <h3 className="text-[15px] font-bold text-on-surface">Billed To (Customer Ledger)</h3>
                <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-1.5 py-0.2 rounded uppercase">
                  Verified GSTIN
                </span>
              </div>
              <button
                onClick={() => {
                  onNavigate('ledger');
                  onShowToast('Party Onboarding', 'Enter registered company credentials');
                }}
                className="text-primary hover:underline text-[12px] font-semibold flex items-center gap-1 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">person_add</span>
                <span>+ New Party</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[11px] text-outline uppercase tracking-wider font-semibold">
                  Party Name (Autocomplete)
                </label>
                <div className="relative flex items-center">
                  <select
                    value={selectedPartyId}
                    onChange={(e) => setSelectedPartyId(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface text-[13px] px-3 py-1.5 rounded-lg outline-none focus:bg-surface-container-lowest shadow-xs cursor-pointer border border-transparent focus:border-primary/20"
                  >
                    {parties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[11px] text-outline uppercase tracking-wider font-semibold">
                  GSTIN / Tax ID
                </label>
                <div className="flex items-center">
                  <input
                    className="w-full bg-surface-container-low text-on-surface font-mono text-[12px] font-semibold px-3 py-1.5 rounded-lg outline-none shadow-xs tracking-wider"
                    type="text"
                    value={currentParty.gstin}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[11px] text-outline uppercase tracking-wider font-semibold">
                  Registered Billing Address
                </label>
                <textarea
                  className="w-full bg-surface-container-low text-on-surface text-[12px] p-2 rounded-lg outline-none resize-none focus:bg-surface-container-lowest shadow-xs border border-transparent focus:border-primary/20"
                  rows={2}
                  value={currentParty.address}
                  onChange={(e) => {
                    // Quick local address override
                  }}
                />
              </div>

              <div className="flex flex-col justify-between">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[11px] text-outline uppercase tracking-wider font-semibold">
                    Contact & Email
                  </label>
                  <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] bg-surface-container-low px-2.5 py-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-[15px] text-outline">call</span>
                    <span className="font-mono">{currentParty.phone} • {currentParty.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 bg-surface-container-low px-3 py-1.5 rounded-lg text-[12px]">
                  <span className="text-outline">Credit Terms:</span>
                  <span className="font-mono text-on-surface font-semibold">{currentParty.creditTerms} Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Ledger Health Status Strip */}
          <div className="mt-3 pt-3 bg-surface-container rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-[12px]">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-outline uppercase">Current Outstanding</span>
                <span className="font-mono text-[13px] text-tertiary-container font-bold">
                  {formatCurrencyINR(currentParty.currentOutstanding)} Dr
                </span>
              </div>
              <div className="h-6 w-px bg-outline-variant"></div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-outline uppercase">Approved Credit Limit</span>
                <span className="font-mono text-[13px] text-on-surface font-bold">
                  {formatCurrencyINR(currentParty.approvedCreditLimit)}
                </span>
              </div>
              <div className="h-6 w-px bg-outline-variant"></div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-outline uppercase">Ledger Reliability</span>
                <span className="text-[12px] text-secondary font-semibold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  {currentParty.ledgerReliability}
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectPartyLedger(currentParty.id)}
              className="text-[12px] font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              type="button"
            >
              <span>Open Ledger</span>
              <span className="material-symbols-outlined text-[15px]">open_in_new</span>
            </button>
          </div>
        </div>

        {/* Consignee (Ship To) & Tax Jurisdictions (5 Cols) */}
        <div className="xl:col-span-5 bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">local_shipping</span>
                <h3 className="text-[15px] font-bold text-on-surface">Ship To / Dispatch Location</h3>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-[12px]">
                <input
                  checked={sameAsBilling}
                  onChange={(e) => setSameAsBilling(e.target.checked)}
                  className="accent-primary rounded"
                  type="checkbox"
                />
                <span className="text-on-surface-variant font-medium">Same as Billing</span>
              </label>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[11px] text-outline uppercase tracking-wider font-semibold">
                  Place of Supply (State / Code)
                </label>
                <div className="relative">
                  <select
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface text-[12px] px-3 py-2 rounded-lg outline-none cursor-pointer shadow-xs border border-transparent focus:border-primary/20"
                  >
                    <option>27 - Maharashtra (Intra-state CGST + SGST @ 9% each)</option>
                    <option>24 - Gujarat (Inter-state IGST @ 18%)</option>
                    <option>29 - Karnataka (Inter-state IGST @ 18%)</option>
                    <option>07 - Delhi (Inter-state IGST @ 18%)</option>
                    <option>03 - Punjab (Inter-state IGST @ 18%)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[11px] text-outline uppercase tracking-wider font-semibold">
                  Consignee Shipping Address
                </label>
                <textarea
                  disabled={sameAsBilling}
                  className={`w-full text-on-surface text-[12px] p-2 rounded-lg outline-none resize-none shadow-xs border border-transparent focus:border-primary/20 ${
                    sameAsBilling ? 'bg-surface-container text-outline' : 'bg-surface-container-low'
                  }`}
                  rows={2}
                  value={sameAsBilling ? currentParty.address : shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 bg-surface-container-low rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">assignment_turned_in</span>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-on-surface">E-Way Bill Mandatory</span>
                <span className="text-[11px] text-outline">Consignment value exceeds ₹50,000 threshold</span>
              </div>
            </div>
            <button
              onClick={() => onShowToast('E-Way Bill Auto-Generated', 'EWB No. 281920194829 fetched from NIC portal')}
              className="bg-primary-fixed text-on-primary-fixed font-mono text-[11px] font-bold px-2.5 py-1 rounded cursor-pointer hover:bg-primary-fixed-dim transition-colors"
            >
              Auto-Generate
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Line Items Ledger Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container mb-5 overflow-hidden">
        <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 bg-surface-container-low border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">view_list</span>
            <h3 className="text-[15px] font-bold text-on-surface">Line Items & Taxable Breakdown</h3>
            <span className="bg-surface-container-highest text-primary font-mono text-[11px] font-bold px-2 py-0.5 rounded">
              {items.length} Items Listed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onShowToast('Barcode Scanner', 'Ready for laser/camera scan')}
              className="bg-surface-container-lowest hover:bg-surface-container text-on-surface text-[12px] font-semibold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
              <span>Scan Barcode</span>
            </button>
            <button
              onClick={() => onShowToast('Bulk Catalog', 'Opening inventory master item picker')}
              className="bg-surface-container-lowest hover:bg-surface-container text-on-surface text-[12px] font-semibold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">playlist_add</span>
              <span>Add Bulk Items</span>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('draft-desc-input');
                el?.focus();
              }}
              className="bg-primary-container text-on-primary-container hover:bg-primary text-[12px] font-semibold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>+ Add Row (Enter)</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="bg-surface-container text-outline font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 min-w-[280px]">Item Description & SKU</th>
                <th className="py-2.5 px-3 w-24">HSN/SAC</th>
                <th className="py-2.5 px-3 w-20 text-right">Qty</th>
                <th className="py-2.5 px-3 w-20">Unit</th>
                <th className="py-2.5 px-3 w-28 text-right">Rate (₹)</th>
                <th className="py-2.5 px-3 w-20 text-right">Disc %</th>
                <th className="py-2.5 px-3 w-32 text-right">Taxable (₹)</th>
                <th className="py-2.5 px-3 w-20 text-center">GST %</th>
                <th className="py-2.5 px-3 w-32 text-right">Total Amount (₹)</th>
                <th className="py-2.5 px-3 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {items.map((it, idx) => (
                <tr key={it.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="py-2.5 px-3 text-center font-mono text-outline group-hover:text-on-surface">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface leading-tight">
                        {it.description}
                      </span>
                      <span className="font-mono text-[11px] text-outline">
                        {it.sku}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-on-surface-variant text-[12px]">
                    {it.hsn}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <input
                      type="number"
                      value={it.qty}
                      onChange={(e) => updateItem(idx, { qty: Number(e.target.value) || 1 })}
                      className="w-14 bg-surface-container-low px-1.5 py-0.5 rounded text-right font-mono text-[12px] font-semibold text-on-surface outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-outline text-[12px]">
                    {it.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[12px]">
                    <input
                      type="number"
                      value={it.rate}
                      onChange={(e) => updateItem(idx, { rate: Number(e.target.value) || 0 })}
                      className="w-24 bg-surface-container-low px-1.5 py-0.5 rounded text-right font-mono text-[12px] text-on-surface outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[12px] text-on-surface-variant">
                    {it.discountPct.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[12px] font-semibold text-on-surface">
                    {formatCurrencyINR(it.taxable, false, 2)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="bg-surface-container-high text-on-surface-variant font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {it.gstRate}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[12px] font-bold text-on-surface">
                    {formatCurrencyINR(it.total, false, 2)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => deleteRow(idx)}
                      className="text-outline hover:text-error opacity-60 group-hover:opacity-100 transition-all p-1 cursor-pointer"
                      title="Delete Row"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}

              {/* Active Draft Input Row (Fast Tally-Style Entry) */}
              <tr className="bg-surface-container-lowest border-t border-primary/20">
                <td className="py-2.5 px-3 text-center font-mono text-primary font-bold">
                  +
                </td>
                <td className="py-2.5 px-3">
                  <input
                    id="draft-desc-input"
                    className="w-full bg-surface-container-low px-2 py-1 rounded text-[12px] outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary/20"
                    placeholder="Type item name or scan barcode to add..."
                    type="text"
                    value={draftDesc}
                    onChange={(e) => setDraftDesc(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addDraftItem();
                    }}
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    className="w-full bg-surface-container-low px-1.5 py-1 rounded font-mono text-[11px] outline-none text-center"
                    placeholder="HSN"
                    type="text"
                    value={draftHsn}
                    onChange={(e) => setDraftHsn(e.target.value)}
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    className="w-full bg-surface-container-low px-1.5 py-1 rounded font-mono text-[12px] outline-none text-right"
                    placeholder="1"
                    type="number"
                    value={draftQty}
                    onChange={(e) => setDraftQty(Number(e.target.value) || 1)}
                  />
                </td>
                <td className="py-2.5 px-3">
                  <select
                    value={draftUnit}
                    onChange={(e) => setDraftUnit(e.target.value)}
                    className="w-full bg-surface-container-low px-1 py-1 rounded text-[11px] outline-none"
                  >
                    <option>Nos</option>
                    <option>Pcs</option>
                    <option>Kg</option>
                    <option>Mtr</option>
                    <option>Set</option>
                    <option>Year</option>
                  </select>
                </td>
                <td className="py-2.5 px-3">
                  <input
                    className="w-full bg-surface-container-low px-1.5 py-1 rounded font-mono text-[12px] outline-none text-right"
                    placeholder="0.00"
                    type="number"
                    value={draftRate || ''}
                    onChange={(e) => setDraftRate(Number(e.target.value) || 0)}
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    className="w-full bg-surface-container-low px-1.5 py-1 rounded font-mono text-[12px] outline-none text-right"
                    placeholder="0%"
                    type="number"
                    value={draftDisc || ''}
                    onChange={(e) => setDraftDisc(Number(e.target.value) || 0)}
                  />
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-[12px] text-outline">
                  ₹{Number((draftQty * draftRate * ((100 - draftDisc) / 100)).toFixed(2))}
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-[11px] text-outline">
                  18%
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-[12px] text-outline font-semibold">
                  ₹{Number((draftQty * draftRate * ((100 - draftDisc) / 100) * 1.18).toFixed(2))}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <button
                    onClick={addDraftItem}
                    className="text-primary hover:text-primary-container cursor-pointer"
                    title="Quick Add"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Quick Table Bar Actions */}
        <div className="px-5 py-2.5 bg-surface-container flex flex-wrap items-center justify-between gap-3 border-t border-surface-container-high text-[12px]">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                checked={autoRoundOff}
                onChange={(e) => setAutoRoundOff(e.target.checked)}
                className="accent-primary rounded"
                type="checkbox"
              />
              <span className="text-on-surface-variant font-medium">Apply Currency Auto-Round Off</span>
            </label>
            <span className="text-outline">•</span>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                checked={showHsnSummary}
                onChange={(e) => setShowHsnSummary(e.target.checked)}
                className="accent-primary rounded"
                type="checkbox"
              />
              <span className="text-on-surface-variant font-medium">Show HSN/SAC Summary Table in PDF</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-outline">Quick Shortcuts:</span>
            <span className="bg-surface-container-highest px-1.5 py-0.5 rounded font-mono text-[10px] text-on-surface">
              Enter (Next Cell)
            </span>
            <span className="bg-surface-container-highest px-1.5 py-0.5 rounded font-mono text-[10px] text-on-surface">
              Alt+D (Delete Row)
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Ledger Terms, Banking, and Grand Totals Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Terms, Bank Details & Signatory (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Terms & Conditions */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-surface-container">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-outline text-[18px]">gavel</span>
                <h4 className="text-[13px] font-bold text-on-surface">Terms & Declarations</h4>
              </div>
              <button
                onClick={() => onShowToast('Template Loaded', 'Default statutory invoice terms inserted')}
                className="text-primary hover:underline font-mono text-[11px] uppercase font-bold"
                type="button"
              >
                Load Template
              </button>
            </div>
            <textarea
              className="w-full bg-surface-container-low text-on-surface text-[12px] p-2.5 rounded-lg outline-none resize-none focus:bg-surface-container-lowest shadow-xs leading-relaxed border border-transparent focus:border-primary/20"
              rows={3}
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
            />
          </div>

          {/* Payment / Bank Account & UPI Settlement Card */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-surface-container">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
                <h4 className="text-[13px] font-bold text-on-surface">Remittance Account & UPI QR Details</h4>
              </div>
              <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded">
                Primary A/C
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-8 flex flex-col gap-1.5 text-[12px]">
                <div className="flex items-center justify-between bg-surface-container-low px-3 py-1.5 rounded-lg">
                  <span className="text-outline">Bank Name:</span>
                  <span className="font-semibold text-on-surface">{COMPANY_PROFILE.bank.name}</span>
                </div>
                <div className="flex items-center justify-between bg-surface-container-low px-3 py-1.5 rounded-lg">
                  <span className="text-outline">Current Account No:</span>
                  <span className="font-mono font-bold text-on-surface tracking-wider">
                    {COMPANY_PROFILE.bank.accountNo}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-surface-container-low px-3 py-1.5 rounded-lg">
                  <span className="text-outline">IFSC Code:</span>
                  <span className="font-mono font-semibold text-on-surface tracking-wide">
                    {COMPANY_PROFILE.bank.ifsc}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-surface-container-low px-3 py-1.5 rounded-lg">
                  <span className="text-outline">UPI VPA:</span>
                  <span className="font-mono text-primary font-semibold">
                    {COMPANY_PROFILE.bank.upiVpa}
                  </span>
                </div>
              </div>

              {/* Dynamic Dynamic UPI QR Code Preview Box */}
              <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-surface-container-low rounded-xl text-center">
                <div className="w-24 h-24 bg-surface-container-lowest p-2 rounded-lg shadow-xs flex items-center justify-center">
                  {/* Inline Crisp Vector QR Code Asset */}
                  <svg className="w-full h-full text-on-surface" fill="currentColor" viewBox="0 0 100 100">
                    <path d="M0 0h36v36H0V0zm6 6v24h24V6H6zm6 6h12v12H12V12zm52-12h36v36H64V0zm6 6v24h24V6H70zm6 6h12v12H76V12zM0 64h36v36H0V64zm6 6v24h24V70H6zm6 6h12v12H12V76zm46-12h12v12H58V64zm18 0h12v12H76V64zm-18 18h12v18H58V82zm24 6h18v12H82V88zm-36-40h6v6h-6v-6zm12 0h6v12h-6V48zm12 0h12v6H70v-6zm6 12h12v6H76v-6z"></path>
                  </svg>
                </div>
                <span className="font-mono text-[10px] text-on-surface-variant uppercase font-bold mt-1.5">
                  Scan To Pay {formatCurrencyINR(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Authorized Signatory Card */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">draw</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-on-surface">Authorized Signature</span>
                <span className="text-[11px] text-outline">Digitally Signed by Vikram Malhotra (Director)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onShowToast('Digital Seal Updated', 'Cryptographic signature refreshed')}
                className="bg-surface-container-low hover:bg-surface-container text-on-surface px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">upload</span>
                <span>Update Seal</span>
              </button>
              <div className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded text-[11px] font-bold">
                e-Sign Verified
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Grand Totals Breakdown & Settlement Toggle (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Totals Card */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <h3 className="text-[15px] font-bold text-on-surface">Invoice Computation</h3>
                <span className="font-mono text-[11px] bg-surface-container-high px-2 py-0.5 rounded text-outline font-semibold">
                  GST REGD #27
                </span>
              </div>

              <div className="flex flex-col gap-2 py-3 text-[13px] text-on-surface-variant">
                <div className="flex items-center justify-between">
                  <span>Subtotal (Taxable Value)</span>
                  <span className="font-mono font-medium text-on-surface">
                    {formatCurrencyINR(subtotal, true, 2)}
                  </span>
                </div>

                {!isInterState ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>Central GST (CGST 9%)</span>
                        <span className="text-outline text-[11px]">(Intra-state)</span>
                      </span>
                      <span className="font-mono text-on-surface">
                        {formatCurrencyINR(cgst, true, 2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>State GST (SGST 9%)</span>
                        <span className="text-outline text-[11px]">(Intra-state)</span>
                      </span>
                      <span className="font-mono text-on-surface">
                        {formatCurrencyINR(sgst, true, 2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>Integrated GST (IGST 18%)</span>
                      <span className="text-outline text-[11px]">(Inter-state)</span>
                    </span>
                    <span className="font-mono text-on-surface">
                      {formatCurrencyINR(igst, true, 2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-secondary">
                  <span className="font-semibold">Total Applicable Tax (18%)</span>
                  <span className="font-mono font-bold">
                    {formatCurrencyINR(totalTax, true, 2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-outline text-[12px]">
                  <span>Round Off Adjustments</span>
                  <span className="font-mono font-medium">
                    {roundOff < 0 ? `-₹${Math.abs(roundOff).toFixed(2)}` : `+₹${roundOff.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Total Amount Highlight Box */}
              <div className="bg-primary/5 p-4 rounded-xl mt-1 flex flex-col gap-1 border border-primary/10">
                <div className="flex items-baseline justify-between">
                  <span className="text-[14px] text-primary font-bold">Total Invoice Value</span>
                  <span className="font-mono text-[24px] font-bold text-primary tracking-tight">
                    {formatCurrencyINR(grandTotal, true, 2)}
                  </span>
                </div>
                <span className="text-[11px] text-outline italic">
                  Amount in Words: {numberToWordsINR(grandTotal)}
                </span>
              </div>
            </div>

            {/* Payment Settlement Mode Selector */}
            <div className="mt-4 pt-3 border-t border-surface-container flex flex-col gap-2">
              <span className="font-mono text-[11px] text-outline uppercase tracking-wider font-semibold">
                Receivable Status on Generation
              </span>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <label
                  onClick={() => setPaymentStatusMode('Unpaid')}
                  className={`flex flex-col p-2.5 rounded-lg cursor-pointer select-none transition-all ${
                    paymentStatusMode === 'Unpaid'
                      ? 'bg-surface-container-low border-2 border-primary'
                      : 'bg-surface-container-low border border-transparent hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-semibold ${paymentStatusMode === 'Unpaid' ? 'text-primary' : 'text-on-surface'}`}>
                      Mark as Unpaid
                    </span>
                    <input
                      checked={paymentStatusMode === 'Unpaid'}
                      onChange={() => setPaymentStatusMode('Unpaid')}
                      className="accent-primary"
                      name="payment_status"
                      type="radio"
                    />
                  </div>
                  <span className="text-[11px] text-outline">Creates open entry in Accounts Receivable ledger</span>
                </label>

                <label
                  onClick={() => setPaymentStatusMode('Paid')}
                  className={`flex flex-col p-2.5 rounded-lg cursor-pointer select-none transition-all ${
                    paymentStatusMode === 'Paid'
                      ? 'bg-surface-container-low border-2 border-primary'
                      : 'bg-surface-container-low border border-transparent hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-semibold ${paymentStatusMode === 'Paid' ? 'text-primary' : 'text-on-surface'}`}>
                      Mark as Paid
                    </span>
                    <input
                      checked={paymentStatusMode === 'Paid'}
                      onChange={() => setPaymentStatusMode('Paid')}
                      className="accent-primary"
                      name="payment_status"
                      type="radio"
                    />
                  </div>
                  <span className="text-[11px] text-outline">Generate instant payment voucher & bank receipt</span>
                </label>
              </div>
            </div>
          </div>

          {/* Quick Notification Dispatch Widget */}
          <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-xs border border-surface-container flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">send_and_archive</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-on-surface">Automated Notification Dispatch</span>
                <span className="text-[11px] text-outline">Send signed PDF & e-Invoice link via WhatsApp & Email</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                checked={autoDispatch}
                onChange={(e) => setAutoDispatch(e.target.checked)}
                className="sr-only peer"
                type="checkbox"
              />
              <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Final Studio Action Footer */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-1/3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant text-[13px] font-semibold py-2.5 rounded-lg transition-colors text-center cursor-pointer"
              type="button"
            >
              Cancel (Esc)
            </button>
            <button
              onClick={handleSaveAndGenerate}
              className="w-2/3 bg-primary hover:bg-primary-container text-on-primary text-[13px] font-semibold py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-center cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Save & Generate Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
