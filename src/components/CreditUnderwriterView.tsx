import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  DollarSign, 
  Percent, 
  Clock, 
  Check, 
  X,
  FileCheck2
} from 'lucide-react';
import { CreditApplicant } from '../types/banking';
import { underwriteSMBApplicantAI } from '../services/api';

interface CreditUnderwriterViewProps {
  applicants: CreditApplicant[];
  onUpdateApplicant: (updated: CreditApplicant) => void;
  onAddAuditLog: (log: {
    agentName: any;
    actionTaken: string;
    targetEntityId: string;
    graduatedTier: string;
    regulatoryReference: string;
    humanSignOffStatus: 'Pending' | 'Approved' | 'Overridden' | 'Auto-Executed';
  }) => void;
}

export const CreditUnderwriterView: React.FC<CreditUnderwriterViewProps> = ({
  applicants,
  onUpdateApplicant,
  onAddAuditLog,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(applicants[0]?.id || '');
  const [isUnderwriting, setIsUnderwriting] = useState<boolean>(false);
  const [clarifyingQuestion, setClarifyingQuestion] = useState<string>(
    'Please clarify the 28% inflow surge in June: was this a one-time non-recurring milestone or a recurring service agreement?'
  );
  const [applicantResponse, setApplicantResponse] = useState<string>('');
  const [hasClarified, setHasClarified] = useState<boolean>(false);
  const [underwritingResult, setUnderwritingResult] = useState<any>(null);

  const selectedApp = applicants.find((a) => a.id === selectedAppId) || applicants[0];

  const handleRunUnderwrite = async () => {
    if (!selectedApp) return;
    setIsUnderwriting(true);
    try {
      const res = await underwriteSMBApplicantAI(selectedApp);
      if (res && res.underwriting) {
        setUnderwritingResult(res.underwriting);
        onAddAuditLog({
          agentName: 'Credit Underwriter',
          actionTaken: `Completed auditable credit underwriting for ${selectedApp.businessName}: Recommendation = ${res.underwriting.decisionRecommendation}, DSCR = ${res.underwriting.debtServiceCoverageRatio}x.`,
          targetEntityId: selectedApp.id,
          graduatedTier: 'Underwriting Rationale',
          regulatoryReference: 'ECOA Regulation B & OCC Lending Standards',
          humanSignOffStatus: 'Pending',
        });
      }
    } catch (err) {
      console.error('Failed underwriting:', err);
    } finally {
      setIsUnderwriting(false);
    }
  };

  const handleSimulateClarification = () => {
    setApplicantResponse(
      'Applicant Response: The June surge reflected milestone contract #AGV-404 ($58,000) for Phase 1 delivery to Amazon Robotics. Phase 2 recurring maintenance SLA of $12,500/month commenced in July.'
    );
    setHasClarified(true);
    onAddAuditLog({
      agentName: 'Credit Underwriter',
      actionTaken: `Received clarifying response from ${selectedApp.businessName} regarding Q2 inflow surge. Updated recurring cashflow baseline.`,
      targetEntityId: selectedApp.id,
      graduatedTier: 'Clarification Resolved',
      regulatoryReference: '12 CFR § 1002.9 Notification & Information Gathering',
      humanSignOffStatus: 'Auto-Executed',
    });
  };

  const handleDecision = (decision: 'Approved' | 'Declined') => {
    if (!selectedApp) return;
    const updated: CreditApplicant = {
      ...selectedApp,
      activeStatus: decision,
    };
    onUpdateApplicant(updated);

    onAddAuditLog({
      agentName: 'Credit Underwriter',
      actionTaken: `Senior Credit Committee ${decision} loan facility for ${selectedApp.businessName} ($${selectedApp.requestedFacility.toLocaleString()}).`,
      targetEntityId: selectedApp.id,
      graduatedTier: `Final Committee ${decision}`,
      regulatoryReference: 'OCC Heightened Underwriting Governance',
      humanSignOffStatus: 'Approved',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Editorial Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Agentic SMB Credit Underwriting Assistant
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Multi-source bank cash flow reconciliation</span>
            <span aria-hidden="true">·</span>
            <span>Thin-file alternative data assessment</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">ECOA Reg B Fair Lending Audit</span>
          </div>
        </div>

        {/* Applicant Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Applicant:</span>
          <select
            value={selectedAppId}
            onChange={(e) => {
              setSelectedAppId(e.target.value);
              setUnderwritingResult(null);
              setHasClarified(false);
              setApplicantResponse('');
            }}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-md text-slate-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            {applicants.map((a) => (
              <option key={a.id} value={a.id}>
                {a.businessName} (${(a.requestedFacility / 1000).toFixed(0)}k {a.activeStatus})
              </option>
            ))}
          </select>

          <button
            onClick={handleRunUnderwrite}
            disabled={isUnderwriting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isUnderwriting ? 'animate-spin' : ''}`} />
            <span>{isUnderwriting ? 'Underwriting...' : 'Run Gemini Assessment'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Applicant Profile & Metrics (5 cols) / Live Underwriting Rationale (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Multi-source reconciled data */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {selectedApp.businessName}
              </h3>
              <div className="text-xs text-slate-500 mt-0.5">
                EIN: {selectedApp.ein} · {selectedApp.yearsInBusiness} Years Operating
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Facility Request</div>
              <div className="text-base font-semibold font-mono text-slate-900">
                ${selectedApp.requestedFacility.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-800">Stated Loan Purpose: </span>
            {selectedApp.purpose}
          </div>

          {/* Reconciled Empirical Cashflow Metrics */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Empirical Bank Data (14-Month Verified Open Banking)
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 text-[11px] font-medium">AVERAGE MONTHLY INFLOW</div>
                <div className="font-mono font-semibold text-slate-900 text-sm mt-1">
                  ${selectedApp.monthlyAverageInflow.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">+14.2% YoY growth</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 text-[11px] font-medium">AVERAGE MONTHLY OUTFLOW</div>
                <div className="font-mono font-semibold text-slate-900 text-sm mt-1">
                  ${selectedApp.monthlyAverageOutflow.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Operating burn</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 text-[11px] font-medium">CASH CONVERSION CYCLE</div>
                <div className="font-mono font-semibold text-emerald-700 text-sm mt-1">
                  {selectedApp.cashConversionCycleDays} Days
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Industry peer median: 38d</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 text-[11px] font-medium">INVOICE FULFILLMENT RATE</div>
                <div className="font-mono font-semibold text-emerald-700 text-sm mt-1">
                  {selectedApp.invoiceFulfillmentRate}%
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Zero payment defaults</div>
              </div>
            </div>
          </div>

          {/* Interactive Clarifying Question Module */}
          <div className="p-3.5 bg-slate-900 rounded-xl text-white text-xs space-y-3 pt-4">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Autonomous Applicant Clarifying Dialogue</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              When documents or bank statements exhibit non-standard variances, the agent initiates an auditable inquiry rather than issuing an immediate algorithmic decline.
            </p>

            <div className="p-2.5 bg-slate-800 rounded border border-slate-700 font-mono text-[11px] text-amber-200">
              Agent Question: "{clarifyingQuestion}"
            </div>

            {hasClarified && applicantResponse ? (
              <div className="p-2.5 bg-slate-800/90 rounded border border-emerald-600/50 text-[11px] text-emerald-300">
                {applicantResponse}
              </div>
            ) : (
              <button
                onClick={handleSimulateClarification}
                className="w-full py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simulate Applicant Supplying Verified Clarification</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: AI Auditable Rationale & Committee Decision */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Auditable Credit Underwriting Rationale (OCC Standards)
              </h3>
              <div className="text-xs text-slate-500 mt-0.5">
                Transparent decision trail with empirical debt service capacity
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium font-mono px-2 py-0.5 rounded ${
                selectedApp.activeStatus === 'Approved'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : selectedApp.activeStatus === 'Declined'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                Status: {selectedApp.activeStatus}
              </span>
            </div>
          </div>

          {underwritingResult ? (
            <div className="space-y-4 text-xs">
              {/* Decision and DSCR metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[11px] font-medium">RECOMMENDATION</div>
                  <div className="text-sm font-semibold text-emerald-800 font-mono mt-1">
                    {underwritingResult.decisionRecommendation}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[11px] font-medium">EMPIRICAL DSCR</div>
                  <div className="text-sm font-semibold text-slate-900 font-mono mt-1">
                    {underwritingResult.debtServiceCoverageRatio}x
                  </div>
                  <div className="text-[10px] text-slate-400">Min covenant threshold: 1.25x</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[11px] font-medium">RECOMMENDED LIMIT</div>
                  <div className="text-sm font-semibold text-slate-900 font-mono mt-1">
                    ${underwritingResult.recommendedLimit.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Rationale Body */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Transparent Underwriting Explanation:
                </div>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  {underwritingResult.auditableRationale}
                </p>
              </div>

              {/* Stipulations & Covenants */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Mandatory Credit Covenants & Stipulations:
                </div>
                {underwritingResult.stipulations.map((stip: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-slate-50/80 rounded border border-slate-100">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-slate-700">{stip}</span>
                  </div>
                ))}
              </div>

              {/* Fair Lending Compliance Box */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div className="text-[11px] text-emerald-900 leading-relaxed">
                  <span className="font-semibold">ECOA Reg B Fair Lending Audit: </span>
                  {underwritingResult.fairLendingComplianceNote}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 space-y-3">
              <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Click "Run Gemini Assessment" to synthesize the empirical cash flow underwriting report.</p>
            </div>
          )}

          {/* Committee Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Dual-Control Credit Officer Sign-off required
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDecision('Declined')}
                disabled={selectedApp.activeStatus === 'Declined'}
                className="px-3.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors disabled:opacity-40"
              >
                Adverse Decline
              </button>
              <button
                onClick={() => handleDecision('Approved')}
                disabled={selectedApp.activeStatus === 'Approved'}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm disabled:opacity-40"
              >
                Authorize Credit Facility
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
