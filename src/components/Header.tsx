import React, { useState } from 'react';
import { ViewType } from '../types';
import { COMPANY_PROFILE } from '../mockData';

interface HeaderProps {
  onNavigate: (view: ViewType) => void;
  onOpenCreateInvoice: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onShowToast: (title: string, message: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onOpenCreateInvoice,
  searchQuery,
  onSearchChange,
  onShowToast,
}) => {
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'GST 2B Match Ready', time: '10 mins ago', desc: '₹8,80,641 Eligible ITC auto-matched with GSTN' },
    { id: 2, title: 'Critical Overdue Alert', time: '45 mins ago', desc: 'SK Enterprises crossed 52 days threshold (₹52,800)' },
    { id: 3, title: 'Bank Inflow Received', time: '2 hours ago', desc: 'HDFC IMPS ₹1,42,800 received from Zenith Logistics' },
  ]);

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-5 flex items-center justify-between gap-4 border-b border-surface-container">
      {/* Left: Company Selector */}
      <div className="relative">
        <button
          onClick={() => setShowCompanyMenu(!showCompanyMenu)}
          className="flex items-center gap-2.5 bg-surface-container-low hover:bg-surface-container-high px-3 py-1.5 rounded-xl transition-colors text-left"
          type="button"
        >
          <span className="material-symbols-outlined text-primary text-[20px]">
            domain
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold text-on-surface">
                {COMPANY_PROFILE.name}
              </span>
              <span className="bg-secondary-container text-on-secondary-container text-[11px] font-bold px-1.5 py-0.2 rounded">
                {COMPANY_PROFILE.status}
              </span>
            </div>
            <span className="text-[11px] text-on-surface-variant font-mono">
              {COMPANY_PROFILE.fiscalYear} • Reg: {COMPANY_PROFILE.gstin}
            </span>
          </div>
          <span className="material-symbols-outlined text-outline text-[18px]">
            expand_more
          </span>
        </button>

        {/* Company Dropdown */}
        {showCompanyMenu && (
          <div className="absolute top-full left-0 mt-1.5 w-72 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-surface-container">
              <span className="text-[11px] uppercase tracking-wider text-outline font-bold">Active Branch / Entity</span>
              <p className="text-[13px] font-semibold text-on-surface mt-0.5">{COMPANY_PROFILE.name}</p>
              <p className="text-[11px] text-outline font-mono">PAN: {COMPANY_PROFILE.gstin.slice(2, 12)}</p>
            </div>
            <div className="py-1">
              <button 
                onClick={() => {
                  setShowCompanyMenu(false);
                  onShowToast('Entity Switched', 'Viewing Apex Dynamics Pvt Ltd (Mumbai HQ)');
                }}
                className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-primary hover:bg-surface-container-low rounded-lg flex items-center justify-between"
              >
                <span>Mumbai Headquarters (Active)</span>
                <span className="material-symbols-outlined text-[16px]">check</span>
              </button>
              <button 
                onClick={() => {
                  setShowCompanyMenu(false);
                  onShowToast('Entity Notice', 'Bengaluru Branch ledger is in read-only sync mode');
                }}
                className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-on-surface-variant hover:bg-surface-container-low rounded-lg"
              >
                <span>Bengaluru Tech Park Hub (29AABCA1234F1Z9)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Center: Search Bar with Alt+G / ⌘K */}
      <div className="flex-1 max-w-lg">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
            search
          </span>
          <input
            className="w-full bg-surface-container-low text-on-surface placeholder:text-outline pl-9 pr-24 py-1.5 rounded-xl text-[13px] outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all border border-transparent focus:border-primary-container/20"
            placeholder="Search vouchers, ledgers, items or press Alt+G..."
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="absolute right-2 flex items-center gap-1 pointer-events-none">
            <span className="bg-surface-container-high text-on-surface-variant font-mono text-[10px] px-1.5 py-0.5 rounded shadow-xs font-semibold">
              Alt+G
            </span>
            <span className="bg-surface-container-high text-on-surface-variant font-mono text-[10px] px-1.5 py-0.5 rounded shadow-xs font-semibold">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center gap-3">
        {/* + Create Invoice CTA */}
        <button
          onClick={onOpenCreateInvoice}
          className="bg-primary-container text-on-primary-container hover:bg-primary text-[13px] font-semibold flex items-center gap-1.5 px-3.5 py-2 rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">
            add_circle
          </span>
          <span>+ Create Invoice</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
            title="Notifications"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">
              notifications
            </span>
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-on-error text-[10px] font-bold">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container mb-2">
                <span className="text-[13px] font-bold text-on-surface">Compliance & Collections</span>
                <button 
                  onClick={() => {
                    setNotifications([]);
                    setShowNotificationMenu(false);
                    onShowToast('Cleared', 'All notifications marked as read');
                  }}
                  className="text-[11px] text-primary hover:underline font-semibold"
                >
                  Mark all read
                </button>
              </div>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-[12px] text-outline text-center py-4">No unread notifications</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-on-surface">{n.title}</span>
                        <span className="text-[10px] text-outline">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">{n.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help & Documentation (F1) */}
        <button
          onClick={() => onShowToast('Keyboard Shortcuts Active', 'F8: New Invoice | F5: Receipt | F6: Payment | Alt+G: Global Search')}
          className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
          title="Help & Documentation (F1)"
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">
            help_outline
          </span>
        </button>

        {/* Profile Pill */}
        <div 
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-2 pl-2 border-l border-surface-container cursor-pointer hover:opacity-85 transition-opacity"
        >
          <img
            alt="Profile Vikram Malhotra"
            className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/20"
            src={COMPANY_PROFILE.avatarUrl}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-[13px] font-semibold text-on-surface leading-tight">
              {COMPANY_PROFILE.director}
            </span>
            <span className="font-mono text-[10px] text-outline leading-tight font-medium">
              {COMPANY_PROFILE.directorRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
