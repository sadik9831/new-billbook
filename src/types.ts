export type ViewType = 
  | 'dashboard' 
  | 'invoices' 
  | 'create-invoice' 
  | 'aging' 
  | 'ledger' 
  | 'inventory' 
  | 'database' 
  | 'reports' 
  | 'settings';

export interface Party {
  id: string;
  name: string;
  gstin: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  stateCode: string;
  creditTerms: number; // e.g. 30 days
  currentOutstanding: number;
  approvedCreditLimit: number;
  ledgerReliability: string; // e.g. "98.4% On-Time"
  category: 'Debtor' | 'Creditor';
  overdueDays: number;
  status: 'Active' | 'Escalated' | 'Prompt' | 'Grace';
  initials: string;
  contactPerson: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  sku: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  discountPct: number;
  taxable: number;
  gstRate: number;
  total: number;
}

export type VoucherType = 
  | 'Tax Invoice' 
  | 'Proforma' 
  | 'Delivery Challan' 
  | 'Credit Note' 
  | 'Bank Receipt' 
  | 'Opening Balance'
  | 'Debit Note';

export interface InvoiceVoucher {
  id: string;
  dbRecordId: string;
  series: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  poRef: string;
  partyId: string;
  partyName: string;
  partyGstin: string;
  placeOfSupply: string;
  shippingAddress: string;
  sameAsBilling: boolean;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  roundOff: number;
  totalAmount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Pending';
  invoiceType: VoucherType;
  paymentMode?: string;
  terms: string;
  notes?: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  partyId: string;
  date: string;
  voucherType: 'Opening Balance' | 'Sales Invoice' | 'Bank Receipt' | 'Credit Note' | 'Debit Note';
  voucherRef: string;
  particulars: string;
  subDetail?: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  balanceType: 'Dr' | 'Cr';
  synced: boolean;
}

export interface AgingRecord {
  id: string;
  partyId: string;
  partyName: string;
  initials: string;
  contactName: string;
  phone: string;
  gstinOrRegion: string;
  invoiceNo: string;
  invoiceDate: string;
  creditDays: number;
  totalInvoiceAmount: number;
  dueAmount: number;
  dueDate: string;
  overdueDays: number; // negative means overdue e.g. -18
  statusText: string;
  statusCategory: 'overdue' | 'today' | 'upcoming' | 'disputed';
  severity: 'healthy' | 'soft' | 'firm' | 'critical' | 'today';
  reminderCount: number;
  reminderDetail: string;
  lastReminderDate: string;
  selected?: boolean;
}

export interface DaybookStats {
  todayInflow: number;
  pendingOutflow: number;
  totalSalesMTD: number;
  totalReceivables: number;
  totalPayables: number;
  netCashBank: number;
}
