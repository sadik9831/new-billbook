import React, { useState, useEffect } from 'react';
import { ViewType, InvoiceVoucher, Party, DaybookStats } from './types';
import {
  INITIAL_INVOICES,
  INITIAL_PARTIES,
  INITIAL_DAYBOOK_STATS,
} from './mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BusinessMonitor } from './components/BusinessMonitor';
import { InvoicesBilling } from './components/InvoicesBilling';
import { RemindersAging } from './components/RemindersAging';
import { PartyLedgerBooks } from './components/PartyLedgerBooks';
import { DatabaseSync } from './components/DatabaseSync';
import { InventoryView } from './components/InventoryView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { PrintInvoiceModal } from './components/PrintInvoiceModal';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [invoices, setInvoices] = useState<InvoiceVoucher[]>(() => {
    const saved = localStorage.getItem('lf_invoices');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_INVOICES;
  });

  const [parties, setParties] = useState<Party[]>(() => {
    const saved = localStorage.getItem('lf_parties');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_PARTIES;
  });

  const [daybookStats, setDaybookStats] = useState<DaybookStats>(INITIAL_DAYBOOK_STATS);
  const [selectedPartyId, setSelectedPartyId] = useState<string>('party-zenith');
  const [searchQuery, setSearchQuery] = useState('');
  const [printInvoice, setPrintInvoice] = useState<InvoiceVoucher | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('lf_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('lf_parties', JSON.stringify(parties));
  }, [parties]);

  // Toast dispatch helper
  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 5);
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard shortcut binding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F8: New Invoice
      if (e.key === 'F8') {
        e.preventDefault();
        setCurrentView('create-invoice');
        showToast('Shortcut F8', 'Opened New Invoice Generator');
      }
      // F5: Party Receipt
      else if (e.key === 'F5') {
        e.preventDefault();
        setCurrentView('ledger');
        showToast('Shortcut F5', 'Viewing Party Ledger & Receipts');
      }
      // F6: Payment Record
      else if (e.key === 'F6') {
        e.preventDefault();
        setCurrentView('ledger');
        showToast('Shortcut F6', 'Record Bank Receipt voucher');
      }
      // Alt+G or Cmd+K
      else if ((e.altKey && e.key.toLowerCase() === 'g') || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
        inputEl?.focus();
        showToast('Quick Search', 'Type to search vouchers, ledgers or GSTIN');
      }
      // Escape
      else if (e.key === 'Escape') {
        if (printInvoice) setPrintInvoice(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [printInvoice]);

  // Save newly created invoice
  const handleSaveInvoice = (newInv: InvoiceVoucher) => {
    setInvoices([newInv, ...invoices]);
    // update daybook
    setDaybookStats((prev) => ({
      ...prev,
      totalSalesMTD: prev.totalSalesMTD + newInv.totalAmount,
      totalReceivables: prev.totalReceivables + (newInv.status === 'Unpaid' ? newInv.totalAmount : 0),
      todayInflow: prev.todayInflow + (newInv.status === 'Paid' ? newInv.totalAmount : 0),
    }));
    setCurrentView('dashboard');
  };

  // Quick navigation to party ledger
  const handleSelectPartyLedger = (partyId: string) => {
    setSelectedPartyId(partyId);
    setCurrentView('ledger');
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased font-sans selection:bg-primary/20">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        daybookStats={daybookStats}
      />

      {/* Main Container */}
      <div className="pl-64">
        {/* Fixed Top Header */}
        <Header
          onNavigate={setCurrentView}
          onOpenCreateInvoice={() => setCurrentView('create-invoice')}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onShowToast={showToast}
        />

        {/* Viewport Content */}
        <main className="relative pt-16 bg-surface w-full px-6 py-5 min-h-screen">
          {currentView === 'dashboard' && (
            <BusinessMonitor
              invoices={invoices}
              parties={parties}
              onNavigate={setCurrentView}
              onOpenCreateInvoice={() => setCurrentView('create-invoice')}
              onSelectPartyLedger={handleSelectPartyLedger}
              onOpenWhatsAppDrawer={(party, inv) => {
                showToast('WhatsApp Dispatcher', `Composing automated message for ${party.name}`);
                setCurrentView('aging');
              }}
              onViewInvoiceDetails={(inv) => setPrintInvoice(inv)}
              onShowToast={showToast}
            />
          )}

          {(currentView === 'invoices' || currentView === 'create-invoice') && (
            <InvoicesBilling
              invoices={invoices}
              parties={parties}
              onSaveInvoice={handleSaveInvoice}
              onNavigate={setCurrentView}
              onSelectPartyLedger={handleSelectPartyLedger}
              onOpenWhatsAppDrawer={(party) => {
                showToast('WhatsApp Direct Link', `Verified API session opened for ${party.name}`);
              }}
              onPrintInvoice={(inv) => setPrintInvoice(inv)}
              onShowToast={showToast}
            />
          )}

          {currentView === 'aging' && (
            <RemindersAging
              parties={parties}
              onNavigate={setCurrentView}
              onOpenWhatsAppDrawer={(party) => {
                showToast('WhatsApp API', `Direct communication open for ${party.name}`);
              }}
              onShowToast={showToast}
            />
          )}

          {currentView === 'ledger' && (
            <PartyLedgerBooks
              parties={parties}
              selectedPartyId={selectedPartyId}
              onSelectParty={setSelectedPartyId}
              onNavigate={setCurrentView}
              onShowToast={showToast}
            />
          )}

          {currentView === 'database' && (
            <DatabaseSync
              invoices={invoices}
              parties={parties}
              onOpenCreateInvoice={() => setCurrentView('create-invoice')}
              onSelectPartyLedger={handleSelectPartyLedger}
              onViewInvoiceDetails={(inv) => setPrintInvoice(inv)}
              onShowToast={showToast}
            />
          )}

          {currentView === 'inventory' && (
            <InventoryView
              onShowToast={showToast}
              onOpenCreateInvoice={() => setCurrentView('create-invoice')}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView onShowToast={showToast} />
          )}

          {currentView === 'settings' && (
            <SettingsView onShowToast={showToast} />
          )}
        </main>
      </div>

      {/* Printable Invoice Modal */}
      {printInvoice && (
        <PrintInvoiceModal
          invoice={printInvoice}
          onClose={() => setPrintInvoice(null)}
          onShowToast={showToast}
        />
      )}

      {/* Global Toast Stack */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
