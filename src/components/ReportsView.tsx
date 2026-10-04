import React, { useState } from 'react';
import { COMPANY_PROFILE } from '../mockData';
import { formatCurrencyINR } from '../utils/numberToWords';

interface ReportsViewProps {
  onShowToast: (title: string, message: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onShowToast }) => {
  const [reportType, setReportType] = useState<'gst' | 'pl' | 'balance_sheet' | 'reconciliation'>('gst');

  return (
    <div className="flex flex-col w-full gap-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
              Statutory & Tax Compliance
            </span>
            <span className="text-[12px] text-outline">•</span>
            <span className="text-[12px] text-outline font-mono">Entity: {COMPANY_PROFILE.name} ({COMPANY_PROFILE.gstin})</span>
          </div>
          <h1 className="text-[24px] font-bold text-on-surface">Reports & GST Tax Center</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onShowToast('GSTR-1 JSON Generated', 'Schema v1.4 compliant payload exported for GST Portal upload')}
            className="bg-primary text-on-primary hover:bg-primary-container px-3.5 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Download GSTR-1 JSON</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-surface-container-low p-1 rounded-xl w-fit text-[12px] font-semibold gap-1">
        <button
          onClick={() => setReportType('gst')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            reportType === 'gst' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          GSTR-1 & 3B Summary
        </button>
        <button
          onClick={() => setReportType('pl')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            reportType === 'pl' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Profit & Loss Statement
        </button>
        <button
          onClick={() => setReportType('balance_sheet')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            reportType === 'balance_sheet' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Balance Sheet
        </button>
        <button
          onClick={() => setReportType('reconciliation')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            reportType === 'reconciliation' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          GSTR-2B Auto-Reconciliation
        </button>
      </div>

      {/* Content */}
      {reportType === 'gst' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-3">
                <span className="text-[14px] font-bold text-on-surface">GSTR-1 Outward Supplies</span>
                <span className="bg-secondary-container text-on-secondary-container font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                  Filed / Reconciled
                </span>
              </div>
              <div className="flex flex-col gap-2.5 text-[12px]">
                <div className="flex justify-between py-1 border-b border-surface-container-low">
                  <span className="text-outline">Total B2B Invoices (Table 4A, 4B):</span>
                  <span className="font-mono font-bold text-on-surface">₹48,92,450 (184 Vouchers)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container-low">
                  <span className="text-outline">Central GST (CGST) Liability:</span>
                  <span className="font-mono font-semibold text-primary">₹3,92,100</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container-low">
                  <span className="text-outline">State GST (SGST) Liability:</span>
                  <span className="font-mono font-semibold text-primary">₹3,92,100</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container-low">
                  <span className="text-outline">Integrated GST (IGST) Inter-State:</span>
                  <span className="font-mono font-semibold text-primary">₹96,441</span>
                </div>
                <div className="flex justify-between py-1.5 font-bold text-[13px]">
                  <span>Total Output Tax Payable:</span>
                  <span className="font-mono text-primary">₹8,80,641</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onShowToast('Exported GSTR-1', 'Excel workbook ready')}
              className="mt-4 w-full py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-[12px] font-semibold text-on-surface text-center cursor-pointer"
            >
              Export Detailed Table 4 Breakdown
            </button>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-3">
                <span className="text-[14px] font-bold text-on-surface">GSTR-3B Input Tax Credit (ITC)</span>
                <span className="bg-primary/10 text-primary font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                  Eligible ITC Active
                </span>
              </div>
              <div className="flex flex-col gap-2.5 text-[12px]">
                <div className="flex justify-between py-1 border-b border-surface-container-low">
                  <span className="text-outline">ITC Available (All other ITC):</span>
                  <span className="font-mono font-bold text-secondary">₹7,42,100</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container-low">
                  <span className="text-outline">ITC Ineligible (Section 17(5)):</span>
                  <span className="font-mono font-semibold text-outline">₹14,500 (Blocked)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container-low">
                  <span className="text-outline">Net Input Tax Credit Available:</span>
                  <span className="font-mono font-semibold text-secondary">₹7,27,600</span>
                </div>
                <div className="flex justify-between py-1.5 font-bold text-[13px] text-error">
                  <span>Net Tax Paid Through Cash Ledger:</span>
                  <span className="font-mono">₹1,53,041</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onShowToast('Challan Generated', 'PMT-06 payment challan verified with authorized bank')}
              className="mt-4 w-full py-2 bg-secondary text-on-secondary hover:bg-secondary-fixed rounded-lg text-[12px] font-semibold text-center cursor-pointer"
            >
              Generate GST PMT-06 Challan
            </button>
          </div>
        </div>
      )}

      {reportType !== 'gst' && (
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs border border-surface-container flex flex-col gap-3">
          <h3 className="text-[15px] font-bold text-on-surface">
            {reportType === 'pl' ? 'Audited Profit & Loss Statement (FY 2024-25)' : reportType === 'balance_sheet' ? 'Balance Sheet & Capital Account' : 'GSTR-2B Inward Purchase Reconciler'}
          </h3>
          <p className="text-[12px] text-outline">
            Double-entry ledger balances calculated across 184 sales invoices and 48 purchase vouchers with zero unassigned discrepancies.
          </p>
          <div className="p-4 bg-surface-container-low rounded-xl flex items-center justify-between font-mono text-[13px]">
            <span>Net Operating Margin: <strong>₹18,42,300</strong></span>
            <span className="text-secondary font-bold">Audited In Tally XML Schema</span>
          </div>
        </div>
      )}
    </div>
  );
};
