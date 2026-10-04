import React from 'react';
import { InvoiceVoucher } from '../types';
import { COMPANY_PROFILE } from '../mockData';
import { formatCurrencyINR, numberToWordsINR } from '../utils/numberToWords';

interface PrintInvoiceModalProps {
  invoice: InvoiceVoucher | null;
  onClose: () => void;
  onShowToast: (title: string, message: string) => void;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  invoice,
  onClose,
  onShowToast,
}) => {
  if (!invoice) return null;

  const isInterState = invoice.placeOfSupply.includes('Inter-state') || invoice.igst > 0;

  const handlePrint = () => {
    window.print();
    onShowToast('Print Job Queued', 'Sending document to system printer / PDF output.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto my-auto print:p-0 print:m-0 print:max-h-none print:shadow-none print:w-full">
        {/* Modal Controls - hidden in print */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">description</span>
            <span className="text-[16px] font-bold text-slate-900">Tax Invoice Document Preview</span>
            <span className="bg-primary-container text-on-primary-container font-mono text-[11px] px-2 py-0.5 rounded font-bold">
              {invoice.invoiceNo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-primary hover:bg-primary-container text-white px-4 py-1.5 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Paper Layout */}
        <div className="border border-slate-300 p-6 rounded-lg bg-white flex flex-col gap-4 text-[12px] leading-normal font-sans">
          {/* Header Banner */}
          <div className="text-center pb-2 border-b border-slate-300">
            <h1 className="text-[18px] font-bold uppercase tracking-wider text-slate-900">TAX INVOICE</h1>
            <span className="text-[11px] text-slate-500 font-mono">(Original for Recipient)</span>
          </div>

          {/* Company Details & Invoice Metadata */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-300">
            <div className="flex flex-col gap-1">
              <span className="text-[16px] font-bold text-primary">{COMPANY_PROFILE.name}</span>
              <p className="text-slate-600 text-[11px]">{COMPANY_PROFILE.address}</p>
              <p className="font-mono text-[11px] text-slate-700">
                <strong>GSTIN:</strong> {COMPANY_PROFILE.gstin} | <strong>State:</strong> Maharashtra (27)
              </p>
              <p className="font-mono text-[11px] text-slate-700">
                <strong>Email:</strong> {COMPANY_PROFILE.email} | <strong>Phone:</strong> {COMPANY_PROFILE.phone}
              </p>
            </div>

            <div className="flex flex-col gap-1 text-right font-mono text-[11px]">
              <div>
                <span className="text-slate-500">Invoice No: </span>
                <strong className="text-slate-900 text-[13px]">{invoice.invoiceNo}</strong>
              </div>
              <div>
                <span className="text-slate-500">Invoice Date: </span>
                <strong className="text-slate-900">{invoice.date}</strong>
              </div>
              <div>
                <span className="text-slate-500">Due Date: </span>
                <strong className="text-slate-900">{invoice.dueDate}</strong>
              </div>
              <div>
                <span className="text-slate-500">PO Ref: </span>
                <strong className="text-slate-900">{invoice.poRef || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Place of Supply: </span>
                <strong className="text-slate-900">{invoice.placeOfSupply.slice(0, 20)}</strong>
              </div>
            </div>
          </div>

          {/* Billed To & Shipped To */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-300">
            <div className="flex flex-col gap-0.5 bg-slate-50 p-3 rounded border border-slate-200">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-600">Billed To (Customer):</span>
              <span className="text-[13px] font-bold text-slate-900">{invoice.partyName}</span>
              <p className="text-slate-600 text-[11px]">{invoice.shippingAddress}</p>
              <span className="font-mono text-[11px] text-slate-800">
                <strong>GSTIN:</strong> {invoice.partyGstin}
              </span>
            </div>

            <div className="flex flex-col gap-0.5 bg-slate-50 p-3 rounded border border-slate-200">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-600">Shipped To (Consignee):</span>
              <span className="text-[13px] font-bold text-slate-900">{invoice.partyName}</span>
              <p className="text-slate-600 text-[11px]">{invoice.shippingAddress}</p>
              <span className="font-mono text-[11px] text-slate-800">
                <strong>State of Supply:</strong> {invoice.placeOfSupply.slice(0, 30)}
              </span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 text-left text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-mono uppercase">
                  <th className="border border-slate-300 p-2 text-center w-8">#</th>
                  <th className="border border-slate-300 p-2">Description of Goods / Services</th>
                  <th className="border border-slate-300 p-2 text-center w-16">HSN/SAC</th>
                  <th className="border border-slate-300 p-2 text-right w-12">Qty</th>
                  <th className="border border-slate-300 p-2 text-center w-14">Unit</th>
                  <th className="border border-slate-300 p-2 text-right w-20">Rate (₹)</th>
                  <th className="border border-slate-300 p-2 text-right w-16">Disc %</th>
                  <th className="border border-slate-300 p-2 text-right w-24">Taxable (₹)</th>
                  <th className="border border-slate-300 p-2 text-center w-14">GST %</th>
                  <th className="border border-slate-300 p-2 text-right w-24">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-300">
                    <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-300 p-2">
                      <div className="font-semibold text-slate-900">{item.description}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.sku}</div>
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{item.hsn}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">{item.qty}</td>
                    <td className="border border-slate-300 p-2 text-center">{item.unit}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">{formatCurrencyINR(item.rate, false, 2)}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">{item.discountPct}%</td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-semibold">{formatCurrencyINR(item.taxable, false, 2)}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{item.gstRate}%</td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-bold">{formatCurrencyINR(item.total, false, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Computation & Words */}
          <div className="grid grid-cols-2 gap-4 items-start pt-2">
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-[11px] text-slate-700 block mb-1">Bank Remittance & UPI QR:</span>
                <p className="text-[11px] text-slate-600 font-mono">
                  Bank: <strong>{COMPANY_PROFILE.bank.name}</strong><br />
                  A/C No: <strong>{COMPANY_PROFILE.bank.accountNo}</strong><br />
                  IFSC: <strong>{COMPANY_PROFILE.bank.ifsc}</strong><br />
                  UPI: <strong>{COMPANY_PROFILE.bank.upiVpa}</strong>
                </p>
              </div>

              <div>
                <span className="font-bold text-[11px] text-slate-700 block">Amount in Words:</span>
                <p className="text-[11px] font-semibold text-slate-900 italic">
                  {numberToWordsINR(invoice.totalAmount)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1 font-mono text-[12px] bg-slate-50 p-3 rounded border border-slate-200">
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">Subtotal (Taxable):</span>
                <span className="font-semibold">{formatCurrencyINR(invoice.subtotal, true, 2)}</span>
              </div>

              {!isInterState ? (
                <>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-600">Central GST (CGST 9%):</span>
                    <span>{formatCurrencyINR(invoice.cgst, true, 2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-600">State GST (SGST 9%):</span>
                    <span>{formatCurrencyINR(invoice.sgst, true, 2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">Integrated GST (IGST 18%):</span>
                  <span>{formatCurrencyINR(invoice.igst, true, 2)}</span>
                </div>
              )}

              <div className="flex justify-between py-0.5 border-t border-slate-300">
                <span className="text-slate-600">Total Tax:</span>
                <span className="font-semibold text-emerald-700">{formatCurrencyINR(invoice.totalTax, true, 2)}</span>
              </div>

              <div className="flex justify-between py-1 border-t-2 border-slate-400 text-[14px] font-bold text-slate-900">
                <span>Invoice Total:</span>
                <span className="text-primary">{formatCurrencyINR(invoice.totalAmount, true, 2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms & Signatory */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-300 mt-2">
            <div>
              <span className="font-bold text-[11px] text-slate-700 block mb-1">Terms & Conditions:</span>
              <p className="text-[10px] text-slate-500 whitespace-pre-line leading-relaxed">
                {invoice.terms}
              </p>
            </div>

            <div className="flex flex-col items-end justify-between text-right">
              <span className="font-bold text-[11px] text-slate-700">For {COMPANY_PROFILE.name}</span>
              <div className="mt-8 flex flex-col items-end">
                <div className="w-32 border-b border-slate-400 mb-1"></div>
                <span className="font-semibold text-[11px] text-slate-900">Authorized Signatory</span>
                <span className="text-[10px] text-slate-500 font-mono">Digitally Authenticated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
