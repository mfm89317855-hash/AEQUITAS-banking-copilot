import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  FileText, 
  Sliders, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Hash, 
  Search,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { AuditLogEntry } from '../types/banking';

interface AuditGovernanceViewProps {
  auditLogs: AuditLogEntry[];
}

export const AuditGovernanceView: React.FC<AuditGovernanceViewProps> = ({ auditLogs }) => {
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Guardrail state settings
  const [guardrails, setGuardrails] = useState({
    autoHoldCeiling: 5000,
    dualControlMandatory: true,
    requireSmsBiometrics: true,
    ecoaStrictCompliance: true,
    soxLedgerReviewThreshold: 1.00,
  });

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAgent = filterAgent === 'all' || log.agentName === filterAgent;
    const matchesSearch = 
      log.actionTaken.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetEntityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.regulatoryReference.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAgent && matchesSearch;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aequitas-audit-docket-${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Editorial Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Governance, Human-in-the-Loop Guardrails & Audit Docket
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Specialized agent boundaries</span>
            <span aria-hidden="true">·</span>
            <span>Immutable decision logs</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">100% FFIEC & CFPB Audit Compliance</span>
          </div>
        </div>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 border border-slate-300 rounded-md text-slate-700 transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Auditable Docket (JSON)</span>
        </button>
      </div>

      {/* Architectural Pattern: Narrow-Scope Specialized Agent Boundaries */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Specialized Multi-Agent Architectural Boundaries
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Banking compliance rewards narrow-scope, well-bounded agents over broad unilateral autonomy. 
            No single agent holds unbounded fund movement authority.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
            <div className="font-semibold text-slate-900 flex items-center justify-between">
              <span>01. Fraud Sentinel Agent</span>
              <span className="text-[10px] font-mono text-emerald-700 font-medium">BOUNDED</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              <strong>Scope:</strong> Evaluates device/geo/velocity signals, places precision holds on individual transactions, and issues SMS challenges. 
              <strong>Constraint:</strong> Cannot freeze customer primary accounts or debit cards; cannot permanently seize funds without human sign-off.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
            <div className="font-semibold text-slate-900 flex items-center justify-between">
              <span>02. Liquidity Forecaster Agent</span>
              <span className="text-[10px] font-mono text-emerald-700 font-medium">BOUNDED</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              <strong>Scope:</strong> Predicts 30-day cash curves, identifies shortfall days, generates stabilization playbooks.
              <strong>Constraint:</strong> Drawing on revolving lines ($5k+) and vendor payment deferrals strictly require client/controller dual authorization.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
            <div className="font-semibold text-slate-900 flex items-center justify-between">
              <span>03. Credit Underwriter Agent</span>
              <span className="text-[10px] font-mono text-emerald-700 font-medium">BOUNDED</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              <strong>Scope:</strong> Calculates empirical DSCR from open banking statement flows, asks clarifying questions, drafts covenants.
              <strong>Constraint:</strong> Adverse credit action and facility commitment require human credit committee dual-signature under ECOA Reg B.
            </p>
          </div>
        </div>
      </div>

      {/* Configurable Human-in-the-Loop Guardrail Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-slate-700" />
            <span>Institutional Guardrail Enforcement Parameters</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Policy active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900">Mandatory Dual-Control on Fund Movements ($5k+)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Prohibits unilateral agent wire execution above threshold
              </div>
            </div>
            <input
              type="checkbox"
              checked={guardrails.dualControlMandatory}
              onChange={(e) => setGuardrails({ ...guardrails, dualControlMandatory: e.target.checked })}
              className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900">Out-of-Band Biometric Customer Challenge</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Dispatches non-alarming SMS token before precision hold escalation
              </div>
            </div>
            <input
              type="checkbox"
              checked={guardrails.requireSmsBiometrics}
              onChange={(e) => setGuardrails({ ...guardrails, requireSmsBiometrics: e.target.checked })}
              className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900">ECOA Reg B Algorithmic Non-Discrimination Audit</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Underwriting models restricted strictly to empirical cash flow telemetry
              </div>
            </div>
            <input
              type="checkbox"
              checked={guardrails.ecoaStrictCompliance}
              onChange={(e) => setGuardrails({ ...guardrails, ecoaStrictCompliance: e.target.checked })}
              className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900">Precision Hold vs Account Freeze Enforcement</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Hard rule: Never disable depository checking or direct debits during fraud checks
              </div>
            </div>
            <span className="text-emerald-700 font-mono font-medium">ENFORCED</span>
          </div>
        </div>
      </div>

      {/* Immutable Audit Docket Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm space-y-0">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Immutable Supervisory Audit Trail ({filteredLogs.length})
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">CFPB & OCC Compliant</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter by agent */}
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-300 rounded text-slate-700"
            >
              <option value="all">All Agents</option>
              <option value="Fraud Sentinel">Fraud Sentinel</option>
              <option value="Liquidity Forecaster">Liquidity Forecaster</option>
              <option value="Credit Underwriter">Credit Underwriter</option>
              <option value="Recon Agent">Recon Agent</option>
              <option value="Compliance Watchdog">Compliance Watchdog</option>
            </select>

            {/* Search query */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail..."
                className="pl-7 pr-2.5 py-1 text-xs bg-white border border-slate-300 rounded text-slate-700 w-44 focus:w-56 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{log.agentName}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="font-mono text-[11px] text-slate-500">{log.targetEntityId}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-[11px] text-amber-700 font-medium">{log.graduatedTier}</span>
                  </div>

                  <p className="text-slate-700 leading-relaxed font-sans">{log.actionTaken}</p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                    <span>Citation: {log.regulatoryReference}</span>
                    <span aria-hidden="true">·</span>
                    <span>Hash: {log.immutableHash}</span>
                  </div>
                </div>

                <div className="text-right sm:shrink-0">
                  <div className="font-mono text-[11px] text-slate-500">{log.timestamp}</div>
                  <div className="mt-1">
                    <span className={`text-[11px] font-medium font-mono ${
                      log.humanSignOffStatus === 'Approved'
                        ? 'text-emerald-700'
                        : log.humanSignOffStatus === 'Pending'
                        ? 'text-amber-700'
                        : 'text-slate-500'
                    }`}>
                      Sign-off: {log.humanSignOffStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
