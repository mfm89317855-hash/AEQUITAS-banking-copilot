export type RiskTier = 'Low' | 'Tier 1 (Monitor)' | 'Tier 2 (Precision Action)' | 'Tier 3 (Critical Escalation)';

export type GraduatedActionType = 
  | 'MONITOR_ONLY'
  | 'SMS_CUSTOMER_VERIFY'
  | 'EXECUTE_PRECISION_FREEZE'
  | 'ESCALATE_DUAL_CONTROL';

export interface Transaction {
  id: string;
  accountNumber: string;
  accountHolder: string;
  businessName: string;
  amount: number;
  timestamp: string;
  counterparty: string;
  rail: 'Fedwire' | 'ACH' | 'RTP (Real-Time)' | 'Debit Card' | 'Internal Transfer';
  status: 'Clearing' | 'Settled' | 'Precision Frozen' | 'Released' | 'Rejected';
  category: 'Wire Transfer' | 'Payroll' | 'Vendor Invoice' | 'Subscription' | 'Crypto Exchange' | 'Foreign Exchange';
  deviceData: {
    ip: string;
    geo: string;
    asn: string;
    isProxyOrVpn: boolean;
    deviceFingerprint: string;
    isKnownDevice: boolean;
  };
  anomalySignals: string[];
  investigation?: {
    confidenceScore: number;
    riskTier: RiskTier;
    fraudTypology: string;
    keyFindings: string[];
    graduatedAction: GraduatedActionType;
    actionRationale: string;
    smsNotificationDraft: string;
    regulatoryCitation: string;
    analystPreBuiltSummary: string;
    investigatedAt: string;
    analystSignOff?: {
      signedBy: string;
      signedAt: string;
      decision: 'Confirmed Fraud' | 'False Positive - Released' | 'Pending Review';
    };
  };
}

export interface CashFlowPayable {
  id: string;
  title: string;
  amount: number;
  dueDay: number;
  category: 'Payroll' | 'Tax' | 'Vendor' | 'Debt Service' | 'Rent';
  isDiscretionary: boolean;
  deferrableDays?: number;
}

export interface CashFlowReceivable {
  id: string;
  customerName: string;
  amount: number;
  expectedDay: number;
  reliabilityScore: number; // 0 - 100
  eligibleForEarlyDiscount: boolean;
}

export interface RecommendedAction {
  id: string;
  action: string;
  impact: string;
  costEstimate: string;
  riskScore: 'Low' | 'Medium' | 'High';
  requiresHumanApproval: boolean;
  enabled: boolean;
}

export interface BusinessCashProfile {
  id: string;
  name: string;
  industry: string;
  operatingCash: number;
  minimumReserveBuffer: number;
  horizonDays: number;
  creditFacility: {
    totalLimit: number;
    currentDrawn: number;
    available: number;
    apr: number;
  };
  payables: CashFlowPayable[];
  receivables: CashFlowReceivable[];
}

export interface CreditApplicant {
  id: string;
  businessName: string;
  ein: string;
  yearsInBusiness: number;
  annualRevenue: number;
  requestedFacility: number;
  purpose: string;
  bankStatementsPeriodMonths: number;
  monthlyAverageInflow: number;
  monthlyAverageOutflow: number;
  historicalDSCR: number;
  invoiceFulfillmentRate: number; // e.g. 99.2%
  cashConversionCycleDays: number;
  activeStatus: 'Under Review' | 'Approved' | 'Conditional' | 'Declined';
}

export interface LedgerBreak {
  id: string;
  transactionRef: string;
  coreBalance: number;
  settlementRailBalance: number;
  discrepancy: number;
  rail: 'Fedwire' | 'RTP' | 'ACH' | 'Card Clearing';
  reason: 'Timing Cutoff' | 'Rounding Decimal Break' | 'Duplicate Trace ID' | 'Fee Deduct Mismatch';
  status: 'Unresolved' | 'Auto-Journal Drafted' | 'Human Approved & Reconciled';
  draftJournalEntry?: {
    debitAccount: string;
    creditAccount: string;
    amount: number;
    memo: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  agentName: 'Fraud Sentinel' | 'Liquidity Forecaster' | 'Credit Underwriter' | 'Recon Agent' | 'Compliance Watchdog';
  actionTaken: string;
  targetEntityId: string;
  graduatedTier: string;
  humanSignOffRequired: boolean;
  humanSignOffStatus: 'Pending' | 'Approved' | 'Overridden' | 'Auto-Executed';
  humanApprover?: string;
  immutableHash: string;
  regulatoryReference: string;
}
