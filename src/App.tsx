import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './lib/firebase';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { FraudSentinelView } from './components/FraudSentinelView';
import { CashFlowForecasterView } from './components/CashFlowForecasterView';
import { CreditUnderwriterView } from './components/CreditUnderwriterView';
import { ReconAgentView } from './components/ReconAgentView';
import { AuditGovernanceView } from './components/AuditGovernanceView';
import { CopilotDrawer } from './components/CopilotDrawer';

import {
  INITIAL_TRANSACTIONS,
  INITIAL_SMB_PROFILES,
  INITIAL_CREDIT_APPLICANTS,
  INITIAL_LEDGER_BREAKS,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';

import { Transaction, CreditApplicant, LedgerBreak, AuditLogEntry } from './types/banking';

export default function App() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'fraud' | 'cashflow' | 'underwriting' | 'recon' | 'governance'>('fraud');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  // Core Financial State
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [smbProfiles, setSmbProfiles] = useState(INITIAL_SMB_PROFILES);
  const [creditApplicants, setCreditApplicants] = useState<CreditApplicant[]>(INITIAL_CREDIT_APPLICANTS);
  const [ledgerBreaks, setLedgerBreaks] = useState<LedgerBreak[]>(INITIAL_LEDGER_BREAKS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Real-time Firestore synchronizer when user is authenticated
  useEffect(() => {
    if (!user) return;

    // 1. Transactions Listener
    const txPath = 'transactions';
    const unsubTx = onSnapshot(
      collection(db, txPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudTx: Transaction[] = [];
          snapshot.forEach((docSnap) => cloudTx.push(docSnap.data() as Transaction));
          setTransactions(cloudTx);
        } else {
          // Seed initial transactions to Firestore if empty
          INITIAL_TRANSACTIONS.forEach((tx) => {
            setDoc(doc(db, txPath, tx.id), tx).catch((err) =>
              handleFirestoreError(err, OperationType.WRITE, `${txPath}/${tx.id}`)
            );
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, txPath);
      }
    );

    // 2. Audit Logs Listener
    const auditPath = 'audit_logs';
    const unsubAudit = onSnapshot(
      collection(db, auditPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudLogs: AuditLogEntry[] = [];
          snapshot.forEach((docSnap) => cloudLogs.push(docSnap.data() as AuditLogEntry));
          // Sort descending by timestamp
          cloudLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
          setAuditLogs(cloudLogs);
        } else {
          // Seed initial audit logs to Firestore if empty
          INITIAL_AUDIT_LOGS.forEach((log) => {
            setDoc(doc(db, auditPath, log.id), log).catch((err) =>
              handleFirestoreError(err, OperationType.WRITE, `${auditPath}/${log.id}`)
            );
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, auditPath);
      }
    );

    // 3. Ledger Breaks Listener
    const breakPath = 'ledger_breaks';
    const unsubBreaks = onSnapshot(
      collection(db, breakPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudBreaks: LedgerBreak[] = [];
          snapshot.forEach((docSnap) => cloudBreaks.push(docSnap.data() as LedgerBreak));
          setLedgerBreaks(cloudBreaks);
        } else {
          // Seed initial ledger breaks to Firestore if empty
          INITIAL_LEDGER_BREAKS.forEach((brk) => {
            setDoc(doc(db, breakPath, brk.id), brk).catch((err) =>
              handleFirestoreError(err, OperationType.WRITE, `${breakPath}/${brk.id}`)
            );
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, breakPath);
      }
    );

    return () => {
      unsubTx();
      unsubAudit();
      unsubBreaks();
    };
  }, [user]);

  // Handlers for state updates with synchronized audit logging and cloud persistence
  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updatedTx.id ? updatedTx : t)));
    if (user) {
      setDoc(doc(db, 'transactions', updatedTx.id), updatedTx).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `transactions/${updatedTx.id}`)
      );
    }
  };

  const handleUpdateApplicant = (updatedApp: CreditApplicant) => {
    setCreditApplicants((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));
  };

  const handleUpdateBreak = (updatedBreak: LedgerBreak) => {
    setLedgerBreaks((prev) => prev.map((b) => (b.id === updatedBreak.id ? updatedBreak : b)));
    if (user) {
      setDoc(doc(db, 'ledger_breaks', updatedBreak.id), updatedBreak).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `ledger_breaks/${updatedBreak.id}`)
      );
    }
  };

  const handleAddAuditLog = (logData: {
    agentName: any;
    actionTaken: string;
    targetEntityId: string;
    graduatedTier: string;
    regulatoryReference: string;
    humanSignOffStatus: 'Pending' | 'Approved' | 'Overridden' | 'Auto-Executed';
  }) => {
    const randomHex = Math.random().toString(16).substring(2, 8);
    const newEntry: AuditLogEntry = {
      id: `AUD-${Math.floor(800 + Math.random() * 200)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      agentName: logData.agentName,
      actionTaken: logData.actionTaken,
      targetEntityId: logData.targetEntityId,
      graduatedTier: logData.graduatedTier,
      humanSignOffRequired: logData.humanSignOffStatus !== 'Auto-Executed',
      humanSignOffStatus: logData.humanSignOffStatus,
      immutableHash: `sha256:${randomHex}...${Date.now().toString(16).slice(-4)}`,
      regulatoryReference: logData.regulatoryReference,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);

    if (user) {
      setDoc(doc(db, 'audit_logs', newEntry.id), newEntry).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `audit_logs/${newEntry.id}`)
      );
    }
  };

  // KPI Calculations
  const precisionHoldCount = transactions.filter((t) => t.status === 'Precision Frozen').length;
  const unresolvedBreaksCount = ledgerBreaks.filter((b) => b.status !== 'Human Approved & Reconciled').length;
  const cashShortfallUrgency = true; // Apex Hardware has Day 19 deficit

  // Active Context payload for Copilot Chat
  const activePortfolioContext = {
    activePrecisionHolds: transactions.filter((t) => t.status === 'Precision Frozen').map((t) => ({
      id: t.id,
      amount: t.amount,
      counterparty: t.counterparty,
      typology: t.investigation?.fraudTypology,
    })),
    smbLiquidityAlert: {
      business: 'Apex Hardware Dynamics LLC',
      shortfallProjectedDay: 19,
      deficitEstimate: -16800,
      payrollImpact: 42000,
    },
    unresolvedBreaks: ledgerBreaks.filter((b) => b.status !== 'Human Approved & Reconciled').map((b) => ({
      id: b.id,
      discrepancy: b.discrepancy,
      rail: b.rail,
    })),
    guardrails: {
      dualControlThreshold: 5000,
      humanInTheLoopMandatory: true,
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 font-sans flex flex-col">
      {/* Institutional Navigation & KPI Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCopilot={() => setIsCopilotOpen(true)}
        precisionHoldCount={precisionHoldCount}
        unresolvedBreaksCount={unresolvedBreaksCount}
        cashShortfallUrgency={cashShortfallUrgency}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'fraud' && (
          <FraudSentinelView
            transactions={transactions}
            onUpdateTransaction={handleUpdateTransaction}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeTab === 'cashflow' && (
          <CashFlowForecasterView
            profiles={smbProfiles}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeTab === 'underwriting' && (
          <CreditUnderwriterView
            applicants={creditApplicants}
            onUpdateApplicant={handleUpdateApplicant}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeTab === 'recon' && (
          <ReconAgentView
            ledgerBreaks={ledgerBreaks}
            onUpdateBreak={handleUpdateBreak}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeTab === 'governance' && (
          <AuditGovernanceView auditLogs={auditLogs} />
        )}
      </main>

      {/* Institutional Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Aequitas Banking Co-Pilot</span>
            <span aria-hidden="true">·</span>
            <span>Commercial Risk & Liquidity Platform</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>CFPB Reg E · OCC Heightened Standards · FFIEC Dual-Control · NACHA Rules</span>
          </div>
        </div>
      </footer>

      {/* Interactive AI Co-Pilot Slide-over */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        activeContext={activePortfolioContext}
      />
    </div>
  );
}
