import React from 'react';
import { ViewType, DaybookStats } from '../types';
import { formatCurrencyINR } from '../utils/numberToWords';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  daybookStats: DaybookStats;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, daybookStats }) => {
  const navItems: { id: ViewType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Business Monitor', icon: 'space_dashboard' },
    { id: 'invoices', label: 'Invoices & Billing', icon: 'receipt_long' },
    { id: 'aging', label: 'Reminders & Aging', icon: 'pending_actions' },
    { id: 'ledger', label: 'Party Ledger & Books', icon: 'menu_book' },
    { id: 'database', label: 'Database & Sync', icon: 'sync_alt' },
    { id: 'inventory', label: 'Items & Inventory', icon: 'inventory_2' },
    { id: 'reports', label: 'Reports & Tax (GST)', icon: 'analytics' },
    { id: 'settings', label: 'Settings & Profile', icon: 'tune' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-surface-container">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div 
          className="h-16 px-5 flex items-center gap-3 cursor-pointer hover:bg-surface-container-low/40 transition-colors"
          onClick={() => onNavigate('dashboard')}
        >
          <img 
            alt="LedgerFlow Brand Logo" 
            className="h-8 w-auto object-contain" 
            src="https://lh3.googleusercontent.com/aida/AEtjO1XIr7vGljv9t_nxHoZXqsFvDq3puz9qRhT1BbwsmByRtPHRrR5FLzN5BrSrMc79zW0nq1Fp-Pt7jCTmrP_L5Jrjf8E-niVZ5koj0O50AX3bCV8rdA5vKlZPwOrYnVAWPQe7XGn_ua5BQB_IPOwhhC7bUGriehq6u-Zr3kyh6sh5BrnygGQTWl3Ja93z-45iQ-1cizKy85gnjDTDtDIk5R9BqbEFUQ07aVl9I0Ue4ltDfjfaJl-R8X2PyLoM" 
          onError={(e) => {
            // Elegant SVG fallback in case network blocked
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
          <div className="flex flex-col">
            <span className="text-[17px] font-bold text-primary tracking-tight leading-tight flex items-center gap-1">
              Ledger<span className="text-primary-container">Flow</span>
            </span>
            <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Enterprise ERP
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-3 py-2">
          <div className="px-3 py-1">
            <span className="font-mono text-[11px] text-outline uppercase tracking-wider font-medium">
              Operations & Ledgers
            </span>
          </div>
          <nav className="flex flex-col gap-1 mt-1.5">
            {navItems.map((item) => {
              const isActive = currentView === item.id || (item.id === 'invoices' && currentView === 'create-invoice');
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  type="button"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] shrink-0">
                    {item.icon}
                  </span>
                  <span className="text-[13px] leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Daybook Summary Widget */}
      <div className="p-3">
        <div className="bg-surface-container-low p-3.5 rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-surface-container-high/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant flex items-center gap-1.5">
              <span>Daybook Summary</span>
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-outline">Today's Inflow</span>
              <span className="font-mono text-[13px] text-secondary font-bold">
                {formatCurrencyINR(daybookStats.todayInflow)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-outline">Pending Outflow</span>
              <span className="font-mono text-[13px] text-error font-bold">
                {formatCurrencyINR(daybookStats.pendingOutflow)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
