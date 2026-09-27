import React, { useState } from 'react';
import { 
  GitCompare, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  FileCheck, 
  BookOpen, 
  DollarSign, 
  RefreshCw,
  Check,
  ShieldCheck
} from 'lucide-react';
import { LedgerBreak } from '../types/banking';

interface ReconAgentViewProps {
  ledgerBreaks: LedgerBreak[];
  onUpdateBreak: (updated: LedgerBreak) => void;
  onAddAuditLog: (log: {
    agentName: any;
    actionTaken: string;
    targetEntityId: string;
    graduatedTier: string;
    regulatoryReference: string;
    humanSignOffStatus: 'Pending' | 'Approved' | 'Overridden' | 'Auto-Executed';
  }) => void;
}

export const ReconAgentView: React.FC<ReconAgentViewProps> = ({
  ledgerBreaks,
  onUpdateBreak,
  onAddAuditLog,
}) => {
  const [selectedBreakId, setSelectedBreakId] = useState<string>(ledgerBreaks[0]?.id || '');

  const selectedBreak = ledgerBreaks.find((b) => b.id === selectedBreakId) || ledgerBreaks[0];

  const handleApproveJournal = (breakItem: LedgerBreak) => {
    const updated: LedgerBreak = {
      ...breakItem,
      status: 'Human Approved & Reconciled',
    };
    onUpdateBreak(updated);

    onAddAuditLog({
      agentName: 'Recon Agent',
      actionTaken: `Human controller authorized auto-adjusting journal entry for ${breakItem.id} (${breakItem.rail} discrepancy of $${breakItem.discrepancy.toFixed(2)}). General ledger balanced.`,
      targetEntityId: breakItem.id,
      graduatedTier: 'Reconciled & Balanced',
      regulatoryReference: 'SOX 404 Internal Financial Controls & GAAP Accrual',
      humanSignOffStatus: 'Approved',
    });
  };

  const pendingBreaksCount = ledgerBreaks.filter((b) => b.status !== 'Human Approved & Reconciled').length;

  return (
    <div className="space-y-6">
      {/* Top Editorial Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Back-Office Multi-System Ledger Reconciliation Agent
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Automated cross-rail ledger parity (Core Banking · Fedwire · RTP · Card Clearing)</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-700 font-medium">Pending Human Sign-off ({pendingBreaksCount})</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>Continuous Reconciliation Interval: T+0 Real-Time</span>
        </div>
      </div>

      {/* Grid: Ledger Break Queue (5 cols) / Auto-Adjusting Journal Resolution (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Breaks Queue */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Discrepancy Exception Queue ({ledgerBreaks.length})
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Real-time breaks</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
            {ledgerBreaks.map((b) => {
              const isSelected = b.id === selectedBreak?.id;
              const isResolved = b.status === 'Human Approved & Reconciled';

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBreakId(b.id)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-50 border-l-4 border-l-slate-900'
                      : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-900">
                          {b.id}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-xs text-slate-700 font-medium">{b.rail}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[220px]">
                        Ref: {b.transactionRef}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-sm text-slate-900">
                        ${b.discrepancy.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                        {b.reason}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <div>
                      {isResolved ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled & Posted
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Auto-Journal Ready for Sign-Off
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Core: ${b.coreBalance.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Break Resolution & Auto Journal Entry */}
        {selectedBreak && (
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <span>Reconciliation Resolution: {selectedBreak.id}</span>
                  <span className="text-xs font-mono text-slate-400">({selectedBreak.rail})</span>
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Ref: {selectedBreak.transactionRef} · Break Root Cause: {selectedBreak.reason}
                </div>
              </div>

              <div>
                <span className={`text-xs font-medium font-mono px-2.5 py-1 rounded ${
                  selectedBreak.status === 'Human Approved & Reconciled'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {selectedBreak.status}
                </span>
              </div>
            </div>

            {/* Core vs External Rail Side-by-Side Comparison */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 text-[11px] font-medium">CORE BANKING LEDGER</div>
                <div className="font-mono font-semibold text-base text-slate-900 mt-1">
                  ${selectedBreak.coreBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Internal depository balance</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 text-[11px] font-medium">{selectedBreak.rail.toUpperCase()} RAIL CLEARING</div>
                <div className="font-mono font-semibold text-base text-slate-900 mt-1">
                  ${selectedBreak.settlementRailBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">External settlement statement</div>
              </div>
            </div>

            {/* Agent Root Cause Diagnosis */}
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
              <div className="font-semibold text-slate-800 flex items-center justify-between">
                <span>Autonomous Root Cause Analysis:</span>
                <span className="text-[11px] font-mono text-slate-500">
                  Variance: ${selectedBreak.discrepancy.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {selectedBreak.reason === 'Timing Cutoff' && (
                  'The outbound Fedwire transaction occurred at 17:02 EST, subsequent to the Federal Reserve FedLine settlement window closing at 17:00 EST. Core ledger debited customer in T+0, but Fedwire network confirms settlement for T+1. Discrepancy is transient timing break.'
                )}
                {selectedBreak.reason === 'Rounding Decimal Break' && (
                  'Stripe card merchant daily batch settlement variance resulting from three-decimal currency conversion truncation across 412 card micro-transactions. Net variance is $0.12, below the $1.00 automated write-off threshold.'
                )}
                {selectedBreak.reason === 'Duplicate Trace ID' && (
                  'Inbound RTP clearing gateway received a network retry packet carrying an identical end-to-end identification sequence. Core ledger rejected duplicate credit, creating temporary clearing suspense balance.'
                )}
              </p>
            </div>

            {/* Auto-Drafted Journal Entry */}
            {selectedBreak.draftJournalEntry && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-600" />
                  <span>Agent-Drafted General Ledger Journal Adjustment (GAAP Compliant)</span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-100/70 p-2 font-semibold text-slate-700 text-[11px]">
                    <div className="col-span-6">Account Designation</div>
                    <div className="col-span-3 text-right">Debit ($)</div>
                    <div className="col-span-3 text-right">Credit ($)</div>
                  </div>

                  <div className="grid grid-cols-12 p-2.5 border-t border-slate-100 text-slate-800 font-mono">
                    <div className="col-span-6 truncate font-sans text-xs">
                      {selectedBreak.draftJournalEntry.debitAccount}
                    </div>
                    <div className="col-span-3 text-right font-semibold text-slate-900">
                      ${selectedBreak.draftJournalEntry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="col-span-3 text-right text-slate-400">---</div>
                  </div>

                  <div className="grid grid-cols-12 p-2.5 border-t border-slate-100 text-slate-800 font-mono bg-slate-50/50">
                    <div className="col-span-6 truncate font-sans text-xs pl-4">
                      {selectedBreak.draftJournalEntry.creditAccount}
                    </div>
                    <div className="col-span-3 text-right text-slate-400">---</div>
                    <div className="col-span-3 text-right font-semibold text-slate-900">
                      ${selectedBreak.draftJournalEntry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 font-sans">
                    <span className="font-semibold text-slate-700">Memo: </span>
                    {selectedBreak.draftJournalEntry.memo}
                  </div>
                </div>
              </div>
            )}

            {/* Human Controller Authorization CTA */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Dual-control controller sign-off required prior to general ledger posting</span>
              </div>

              <button
                onClick={() => handleApproveJournal(selectedBreak)}
                disabled={selectedBreak.status === 'Human Approved & Reconciled'}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>
                  {selectedBreak.status === 'Human Approved & Reconciled'
                    ? 'Reconciliation Complete'
                    : 'Approve & Post Journal Entry'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
