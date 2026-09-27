import { Transaction, BusinessCashProfile, CreditApplicant, LedgerBreak, AuditLogEntry } from '../types/banking';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-8821',
    accountNumber: '•••• 4920',
    accountHolder: 'David Vance',
    businessName: 'Vance Precision Works LLC',
    amount: 4850.00,
    timestamp: '2026-09-27 04:38:12',
    counterparty: 'Sofia Liquid Trade Ltd (Prepaid Wire Rail)',
    rail: 'Fedwire',
    status: 'Precision Frozen',
    category: 'Crypto Exchange',
    deviceData: {
      ip: '185.193.88.14',
      geo: 'Sofia, Bulgaria',
      asn: 'AS44034 (Residential Proxy Network)',
      isProxyOrVpn: true,
      deviceFingerprint: 'df-992a-88f1',
      isKnownDevice: false,
    },
    anomalySignals: [
      'New device login 4 min prior to wire initiation',
      'IP located in Sofia, Bulgaria; customer primary residence in Austin, TX',
      'Beneficiary routing code matches known rapid-cashout mule vector',
      'Historical average wire is $320.00; this is a 1,415% deviation'
    ],
    investigation: {
      confidenceScore: 0.94,
      riskTier: 'Tier 2 (Precision Action)',
      fraudTypology: 'Credential Stuffing & Session Hijack (Mule Target)',
      keyFindings: [
        'Transaction originates from a newly registered ASN in Sofia, Bulgaria via residential proxy network.',
        'Velocity anomaly: $4,850.00 outbound wire initiated 4 minutes after device credential update.',
        'Beneficiary routing number matches known rapid-cashout prepaid crypto rail flagged in FinCEN advisory.',
        'Customer historical median transaction is $145.00 with 98.4% domestic debit card spend.'
      ],
      graduatedAction: 'EXECUTE_PRECISION_FREEZE',
      actionRationale: 'Execute surgical hold solely on transaction TX-8821. Do not freeze operating checking account or payroll rails, preventing merchant business interruption while dispatching instant two-factor biometric verification challenge.',
      smsNotificationDraft: 'Aequitas Bank Alert: We paused a $4,850 wire to Sofia Liquid Trade pending your review. Your main card & account remain fully active. Reply 1 to approve or 2 to dispute.',
      regulatoryCitation: 'CFPB Regulation E 12 CFR § 1005.11 & FFIEC Authentication Guidance',
      analystPreBuiltSummary: 'High-confidence session mismatch. Automated hold placed on wire rails; primary depository services unaffected. Ready for tier-2 human sign-off upon customer response.',
      investigatedAt: '2026-09-27 04:38:15',
    }
  },
  {
    id: 'TX-8824',
    accountNumber: '•••• 1184',
    accountHolder: 'Elena Rostova',
    businessName: 'Nordic Import-Export Corp',
    amount: 18750.00,
    timestamp: '2026-09-27 04:42:01',
    counterparty: 'Atlantic Supply Partner (Altered ABA 021000089)',
    rail: 'Fedwire',
    status: 'Precision Frozen',
    category: 'Vendor Invoice',
    deviceData: {
      ip: '198.51.100.42',
      geo: 'Frankfurt, Germany',
      asn: 'AS24940 (Hosting Datacenter)',
      isProxyOrVpn: true,
      deviceFingerprint: 'df-bc12-9011',
      isKnownDevice: false,
    },
    anomalySignals: [
      'Beneficiary bank routing number changed 18 minutes before payout',
      'Supplier invoice PDF metadata shows authoring via modified web editor',
      'Amount exceeds dual-control threshold ($15,000.00)'
    ],
    investigation: {
      confidenceScore: 0.89,
      riskTier: 'Tier 3 (Critical Escalation)',
      fraudTypology: 'Business Email Compromise (BEC) / Invoice Redirection',
      keyFindings: [
        'Beneficiary bank account altered from longstanding domestic ACH to newly provisioned neobank routing number.',
        'Invoice submission email header originated from unauthorized relay server.',
        'High monetary exposure exceeding automated release boundaries.'
      ],
      graduatedAction: 'ESCALATE_DUAL_CONTROL',
      actionRationale: 'Surgically hold outbound payment. Flag for senior operations analyst callback verification with the verified supplier controller before release.',
      smsNotificationDraft: 'Aequitas Bank Alert: Outbound wire $18,750 to Atlantic Supply placed on precision hold due to updated beneficiary details. Our operations team is verifying with your vendor controller.',
      regulatoryCitation: 'FinCEN Advisory FIN-2016-A003 (BEC Fraud Typology)',
      analystPreBuiltSummary: 'Suspected BEC redirect. Vendor routing details changed without secondary out-of-band token. Mandatory human dual-control verification engaged.',
      investigatedAt: '2026-09-27 04:42:05',
    }
  },
  {
    id: 'TX-8829',
    accountNumber: '•••• 3091',
    accountHolder: 'Marcus Chen',
    businessName: 'Apex Hardware Dynamics LLC',
    amount: 32500.00,
    timestamp: '2026-09-27 04:15:00',
    counterparty: 'Gusto Bi-Weekly Payroll Batch',
    rail: 'ACH',
    status: 'Settled',
    category: 'Payroll',
    deviceData: {
      ip: '24.180.12.9',
      geo: 'Austin, TX, US',
      asn: 'AS7018 (AT&T Services)',
      isProxyOrVpn: false,
      deviceFingerprint: 'df-1277-4402',
      isKnownDevice: true,
    },
    anomalySignals: [],
    investigation: {
      confidenceScore: 0.02,
      riskTier: 'Low',
      fraudTypology: 'Routine Certified Operational Payout',
      keyFindings: [
        'Device fingerprint matches 18-month primary CFO workstation.',
        'Payroll batch total conforms to trailing 6-pay-cycle average within 1.2% variance.',
        'Plaid/Gusto automated ledger parity verified.'
      ],
      graduatedAction: 'MONITOR_ONLY',
      actionRationale: 'Low risk. Zero anomalous device, biometric, or geographic attributes detected.',
      smsNotificationDraft: '',
      regulatoryCitation: 'Automated Clearing House (NACHA) Rule 3.8 Compliant',
      analystPreBuiltSummary: 'Standard recurring payroll clearing. Full speed pass-through.',
      investigatedAt: '2026-09-27 04:15:02',
    }
  },
  {
    id: 'TX-8833',
    accountNumber: '•••• 7712',
    accountHolder: 'Sarah Jenkins',
    businessName: 'Solis Creative Agency',
    amount: 142.50,
    timestamp: '2026-09-27 04:49:10',
    counterparty: 'Adobe Creative Cloud Enterprise',
    rail: 'Debit Card',
    status: 'Settled',
    category: 'Subscription',
    deviceData: {
      ip: '72.229.28.185',
      geo: 'New York, NY, US',
      asn: 'AS12271 (Charter Communications)',
      isProxyOrVpn: false,
      deviceFingerprint: 'df-4889-1123',
      isKnownDevice: true,
    },
    anomalySignals: [],
  }
];

export const INITIAL_SMB_PROFILES: BusinessCashProfile[] = [
  {
    id: 'biz-apex',
    name: 'Apex Hardware Dynamics LLC',
    industry: 'Commercial Hardware & Precision Tooling',
    operatingCash: 64200,
    minimumReserveBuffer: 25000,
    horizonDays: 30,
    creditFacility: {
      totalLimit: 100000,
      currentDrawn: 20000,
      available: 80000,
      apr: 6.85
    },
    payables: [
      { id: 'pay-1', title: 'Bi-Weekly Team Payroll (28 staff)', amount: 42000, dueDay: 19, category: 'Payroll', isDiscretionary: false },
      { id: 'pay-2', title: 'Specialty Steel Ingot Inventory (Vendor Net-30)', amount: 18500, dueDay: 12, category: 'Vendor', isDiscretionary: true, deferrableDays: 14 },
      { id: 'pay-3', title: 'State & Federal Estimated Q3 Payroll Taxes', amount: 14200, dueDay: 22, category: 'Tax', isDiscretionary: false },
      { id: 'pay-4', title: 'CNC Machine Lease & Debt Service', amount: 6400, dueDay: 26, category: 'Debt Service', isDiscretionary: false },
      { id: 'pay-5', title: 'Warehouse Facility Lease', amount: 9500, dueDay: 5, category: 'Rent', isDiscretionary: false }
    ],
    receivables: [
      { id: 'rec-1', customerName: 'Titan Industrial Systems', amount: 48500, expectedDay: 14, reliabilityScore: 92, eligibleForEarlyDiscount: true },
      { id: 'rec-2', customerName: 'Metro Defense Corp (Net-60, historically +8 days late)', amount: 54000, expectedDay: 27, reliabilityScore: 68, eligibleForEarlyDiscount: true },
      { id: 'rec-3', customerName: 'Precision Lathe Depot', amount: 12800, expectedDay: 8, reliabilityScore: 96, eligibleForEarlyDiscount: false }
    ]
  },
  {
    id: 'biz-nimbus',
    name: 'Nimbus Cloud Analytics Inc',
    industry: 'B2B Enterprise SaaS',
    operatingCash: 185000,
    minimumReserveBuffer: 50000,
    horizonDays: 30,
    creditFacility: {
      totalLimit: 250000,
      currentDrawn: 0,
      available: 250000,
      apr: 6.25
    },
    payables: [
      { id: 'pay-n1', title: 'Cloud Infrastructure (AWS & GCP)', amount: 28000, dueDay: 10, category: 'Vendor', isDiscretionary: false },
      { id: 'pay-n2', title: 'Bi-Weekly Engineering Payroll', amount: 62000, dueDay: 15, category: 'Payroll', isDiscretionary: false },
      { id: 'pay-n3', title: 'Enterprise Sales Commissions', amount: 19000, dueDay: 25, category: 'Payroll', isDiscretionary: true, deferrableDays: 7 }
    ],
    receivables: [
      { id: 'rec-n1', customerName: 'Global FinTech Corp (Annual SaaS)', amount: 95000, expectedDay: 12, reliabilityScore: 98, eligibleForEarlyDiscount: false },
      { id: 'rec-n2', customerName: 'HyperScale Logistics (Quarterly)', amount: 42000, expectedDay: 22, reliabilityScore: 89, eligibleForEarlyDiscount: true }
    ]
  }
];

export const INITIAL_CREDIT_APPLICANTS: CreditApplicant[] = [
  {
    id: 'app-meridian',
    businessName: 'Meridian Autonomous Robotics LLC',
    ein: '84-9921448',
    yearsInBusiness: 3.5,
    annualRevenue: 2450000,
    requestedFacility: 150000,
    purpose: 'Bridge working capital for semiconductor component bulk pre-orders',
    bankStatementsPeriodMonths: 14,
    monthlyAverageInflow: 204160,
    monthlyAverageOutflow: 172000,
    historicalDSCR: 1.52,
    invoiceFulfillmentRate: 99.4,
    cashConversionCycleDays: 21,
    activeStatus: 'Under Review'
  },
  {
    id: 'app-terra',
    businessName: 'Terra Cold-Chain Logistics',
    ein: '72-1102947',
    yearsInBusiness: 6,
    annualRevenue: 3800000,
    requestedFacility: 300000,
    purpose: 'Electrification of 8 refrigerated local delivery fleet vans',
    bankStatementsPeriodMonths: 24,
    monthlyAverageInflow: 316600,
    monthlyAverageOutflow: 289000,
    historicalDSCR: 1.34,
    invoiceFulfillmentRate: 97.8,
    cashConversionCycleDays: 34,
    activeStatus: 'Under Review'
  }
];

export const INITIAL_LEDGER_BREAKS: LedgerBreak[] = [
  {
    id: 'BRK-902',
    transactionRef: 'FED-20260927-99410',
    coreBalance: 14250.00,
    settlementRailBalance: 0.00,
    discrepancy: 14250.00,
    rail: 'Fedwire',
    reason: 'Timing Cutoff',
    status: 'Auto-Journal Drafted',
    draftJournalEntry: {
      debitAccount: '1105 - Fedwire In-Flight Settlement Suspense',
      creditAccount: '1001 - Core Commercial Clearing Main',
      amount: 14250.00,
      memo: 'Automatic balancing accrual for Fedwire cut-off window break (T+1 auto-reversing)'
    }
  },
  {
    id: 'BRK-905',
    transactionRef: 'STP-SETTLE-881920',
    coreBalance: 84392.42,
    settlementRailBalance: 84392.30,
    discrepancy: 0.12,
    rail: 'Card Clearing',
    reason: 'Rounding Decimal Break',
    status: 'Auto-Journal Drafted',
    draftJournalEntry: {
      debitAccount: '6210 - Merchant Processing FX Rounding Expense',
      creditAccount: '1120 - Stripe Interchange Clearing',
      amount: 0.12,
      memo: 'Micro-penny rounding variance reconciliation write-off below $1 threshold'
    }
  },
  {
    id: 'BRK-909',
    transactionRef: 'RTP-RTX-441029',
    coreBalance: 2200.00,
    settlementRailBalance: 4400.00,
    discrepancy: 2200.00,
    rail: 'RTP',
    reason: 'Duplicate Trace ID',
    status: 'Unresolved',
    draftJournalEntry: {
      debitAccount: '1110 - Real-Time Payment Settlement Rail',
      creditAccount: '2190 - Unmatched Participant Inbound Liability',
      amount: 2200.00,
      memo: 'Hold duplicate sequence packet pending RTP network ACK trace match'
    }
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-771',
    timestamp: '2026-09-27 04:38:15',
    agentName: 'Fraud Sentinel',
    actionTaken: 'Executed Precision Hold on TX-8821 ($4,850.00). Retained checking account liquidity.',
    targetEntityId: 'TX-8821',
    graduatedTier: 'Tier 2 (Precision Action)',
    humanSignOffRequired: true,
    humanSignOffStatus: 'Pending',
    immutableHash: 'sha256:4f8a91b...e901',
    regulatoryReference: 'CFPB Reg E 12 CFR § 1005.11'
  },
  {
    id: 'AUD-769',
    timestamp: '2026-09-27 04:42:05',
    agentName: 'Fraud Sentinel',
    actionTaken: 'Escalated BEC suspicious wire TX-8824 ($18,750.00) to Dual-Control review queue.',
    targetEntityId: 'TX-8824',
    graduatedTier: 'Tier 3 (Critical Escalation)',
    humanSignOffRequired: true,
    humanSignOffStatus: 'Pending',
    immutableHash: 'sha256:bc8120a...1102',
    regulatoryReference: 'FinCEN Advisory FIN-2016-A003'
  },
  {
    id: 'AUD-765',
    timestamp: '2026-09-27 04:15:02',
    agentName: 'Compliance Watchdog',
    actionTaken: 'Auto-verified NACHA payroll compliance for Gusto batch ($32,500.00).',
    targetEntityId: 'TX-8829',
    graduatedTier: 'Tier 1 (Monitor)',
    humanSignOffRequired: false,
    humanSignOffStatus: 'Auto-Executed',
    immutableHash: 'sha256:1198da1...77fa',
    regulatoryReference: 'NACHA Operating Rules Sec 3.8'
  },
  {
    id: 'AUD-760',
    timestamp: '2026-09-27 03:55:00',
    agentName: 'Liquidity Forecaster',
    actionTaken: 'Synthesized 30-day cash curve for Apex Hardware Dynamics; detected Day 19 payroll shortfall risk.',
    targetEntityId: 'biz-apex',
    graduatedTier: 'Proactive Alert',
    humanSignOffRequired: true,
    humanSignOffStatus: 'Pending',
    immutableHash: 'sha256:d8892ca...9011',
    regulatoryReference: 'FFIEC Liquidity Risk Management'
  }
];

export interface AnomalyTrendPoint {
  date: string;
  totalVolumeK: number;
  flaggedAnomalies: number;
  precisionHolds: number;
  falsePositivesAverted: number;
  avgResolutionSec: number;
  preventedLossK: number;
}

export const HISTORICAL_ANOMALY_TRENDS: AnomalyTrendPoint[] = [
  { date: 'Sep 14', totalVolumeK: 1240, flaggedAnomalies: 28, precisionHolds: 8, falsePositivesAverted: 20, avgResolutionSec: 2.4, preventedLossK: 42.5 },
  { date: 'Sep 15', totalVolumeK: 1380, flaggedAnomalies: 34, precisionHolds: 11, falsePositivesAverted: 23, avgResolutionSec: 2.1, preventedLossK: 68.2 },
  { date: 'Sep 16', totalVolumeK: 1190, flaggedAnomalies: 22, precisionHolds: 6, falsePositivesAverted: 16, avgResolutionSec: 1.9, preventedLossK: 31.0 },
  { date: 'Sep 17', totalVolumeK: 1450, flaggedAnomalies: 41, precisionHolds: 14, falsePositivesAverted: 27, avgResolutionSec: 2.2, preventedLossK: 94.6 },
  { date: 'Sep 18', totalVolumeK: 1520, flaggedAnomalies: 38, precisionHolds: 12, falsePositivesAverted: 26, avgResolutionSec: 1.8, preventedLossK: 82.0 },
  { date: 'Sep 19', totalVolumeK: 980,  flaggedAnomalies: 19, precisionHolds: 5, falsePositivesAverted: 14, avgResolutionSec: 1.7, preventedLossK: 24.8 },
  { date: 'Sep 20', totalVolumeK: 890,  flaggedAnomalies: 16, precisionHolds: 4, falsePositivesAverted: 12, avgResolutionSec: 1.6, preventedLossK: 18.5 },
  { date: 'Sep 21', totalVolumeK: 1610, flaggedAnomalies: 45, precisionHolds: 16, falsePositivesAverted: 29, avgResolutionSec: 2.0, preventedLossK: 112.4 },
  { date: 'Sep 22', totalVolumeK: 1680, flaggedAnomalies: 48, precisionHolds: 15, falsePositivesAverted: 33, avgResolutionSec: 1.9, preventedLossK: 104.2 },
  { date: 'Sep 23', totalVolumeK: 1590, flaggedAnomalies: 39, precisionHolds: 13, falsePositivesAverted: 26, avgResolutionSec: 1.8, preventedLossK: 89.0 },
  { date: 'Sep 24', totalVolumeK: 1720, flaggedAnomalies: 52, precisionHolds: 18, falsePositivesAverted: 34, avgResolutionSec: 1.7, preventedLossK: 138.5 },
  { date: 'Sep 25', totalVolumeK: 1810, flaggedAnomalies: 56, precisionHolds: 19, falsePositivesAverted: 37, avgResolutionSec: 1.6, preventedLossK: 145.0 },
  { date: 'Sep 26', totalVolumeK: 1420, flaggedAnomalies: 31, precisionHolds: 10, falsePositivesAverted: 21, avgResolutionSec: 1.7, preventedLossK: 71.4 },
  { date: 'Sep 27', totalVolumeK: 1650, flaggedAnomalies: 44, precisionHolds: 14, falsePositivesAverted: 30, avgResolutionSec: 1.5, preventedLossK: 108.6 },
];

export const FRAUD_TYPOLOGY_BREAKDOWN = [
  { name: 'Credential Hijack & Proxy', count: 46, percentage: 32, valueK: 324 },
  { name: 'Invoice Redirection (BEC)', count: 28, percentage: 24, valueK: 412 },
  { name: 'Offshore Mule Wire Rails', count: 34, percentage: 22, valueK: 288 },
  { name: 'Card Micro-Auth Velocity', count: 52, percentage: 14, valueK: 86 },
  { name: 'Synthetic Identity Deposit', count: 18, percentage: 8, valueK: 94 },
];

