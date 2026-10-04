import React, { useState } from 'react';
import { COMPANY_PROFILE } from '../mockData';

interface SettingsViewProps {
  onShowToast: (title: string, message: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onShowToast }) => {
  const [companyName, setCompanyName] = useState(COMPANY_PROFILE.name);
  const [gstin, setGstin] = useState(COMPANY_PROFILE.gstin);
  const [phone, setPhone] = useState(COMPANY_PROFILE.phone);
  const [bankName, setBankName] = useState(COMPANY_PROFILE.bank.name);
  const [accountNo, setAccountNo] = useState(COMPANY_PROFILE.bank.accountNo);
  const [ifsc, setIfsc] = useState(COMPANY_PROFILE.bank.ifsc);
  const [upiVpa, setUpiVpa] = useState(COMPANY_PROFILE.bank.upiVpa);
  const [eInvoiceToken, setEInvoiceToken] = useState('nic_gst_auth_99120489');

  const handleSave = () => {
    onShowToast('Settings Saved', 'Company master profile, UPI settlement VPA, and bank coordinates updated.');
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-8 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[11px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
            Configuration Master
          </span>
          <span className="text-[12px] text-outline">•</span>
          <span className="text-[12px] text-outline font-mono">System v4.8</span>
        </div>
        <h1 className="text-[24px] font-bold text-on-surface">Company Profile & System Settings</h1>
      </div>

      {/* Company Profile Details */}
      <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-surface-container flex flex-col gap-4">
        <h3 className="text-[15px] font-bold text-on-surface">Registered Business Identity</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-outline uppercase font-semibold">Legal Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-surface-container-low px-3 py-2 rounded-lg text-on-surface font-semibold outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-outline uppercase font-semibold">Registered GSTIN (15 Digits)</label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="bg-surface-container-low px-3 py-2 rounded-lg text-on-surface font-mono font-bold outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-outline uppercase font-semibold">Primary Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-surface-container-low px-3 py-2 rounded-lg text-on-surface outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-outline uppercase font-semibold">NIC Portal E-Invoice Token</label>
            <input
              type="password"
              value={eInvoiceToken}
              onChange={(e) => setEInvoiceToken(e.target.value)}
              className="bg-surface-container-low px-3 py-2 rounded-lg text-on-surface font-mono outline-none"
            />
          </div>
        </div>
      </div>

      {/* Remittance & Bank Settings */}
      <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-surface-container flex flex-col gap-4">
        <h3 className="text-[15px] font-bold text-on-surface">Remittance Bank & UPI QR Code Configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-outline uppercase font-semibold">Bank Name & Branch</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="bg-surface-container-low px-3 py-2 rounded-lg text-on-surface outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-outline uppercase font-semibold">Current Account Number</label>
            <input
              type="text"
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              className="bg-surface-container-low px-3 py-2 rounded-lg text-on-surface font-mono font-semibold outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-outline uppercase font-semibold">IFSC Code</label>
            <input
              type="text"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value)}
              className="bg-surface-container-low px-3 py-2 rounded-lg text-on-surface font-mono font-semibold outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-outline uppercase font-semibold">UPI VPA Handle</label>
            <input
              type="text"
              value={upiVpa}
              onChange={(e) => setUpiVpa(e.target.value)}
              className="bg-surface-container-low px-3 py-2 rounded-lg text-primary font-mono font-semibold outline-none"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-primary hover:bg-primary-container text-on-primary px-6 py-2.5 rounded-xl text-[13px] font-semibold shadow-sm transition-all cursor-pointer"
        >
          Save All Changes
        </button>
      </div>
    </div>
  );
};
