import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle2, 
  Smartphone, 
  Globe, 
  Cpu, 
  ArrowRight, 
  RefreshCw, 
  Check, 
  X, 
  UserCheck, 
  Info,
  Sparkles,
  Lock,
  Unlock,
  Send,
  BarChart3,
  TrendingDown,
  Zap,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { Transaction, RiskTier, GraduatedActionType } from '../types/banking';
import { investigateTransactionAI } from '../services/api';
import { HISTORICAL_ANOMALY_TRENDS, FRAUD_TYPOLOGY_BREAKDOWN } from '../data/mockData';

interface FraudSentinelViewProps {
  transactions: Transaction[];
  onUpdateTransaction: (updated: Transaction) => void;
  onAddAuditLog: (log: {
    agentName: any;
    actionTaken: string;
    targetEntityId: string;
    graduatedTier: string;
    regulatoryReference: string;
    humanSignOffStatus: 'Pending' | 'Approved' | 'Overridden' | 'Auto-Executed';
  }) => void;
}

export const FraudSentinelView: React.FC<FraudSentinelViewProps> = ({
  transactions,
  onUpdateTransaction,
  onAddAuditLog,
}) => {
  const [selectedTxId, setSelectedTxId] = useState<string>(transactions[0]?.id || '');
  const [isInvestigating, setIsInvestigating] = useState<boolean>(false);
  const [smsReplyState, setSmsReplyState] = useState<'pending' | 'approved' | 'disputed'>('pending');
  const [analystNote, setAnalystNote] = useState<string>('');
  const [chartMetric, setChartMetric] = useState<'anomalies_vs_holds' | 'prevented_loss' | 'latency'>('anomalies_vs_holds');
  const [showVisualDashboard, setShowVisualDashboard] = useState<boolean>(true);

  const selectedTx = transactions.find((t) => t.id === selectedTxId) || transactions[0];

  // Trigger real AI autonomous investigation
  const handleTriggerInvestigation = async (tx: Transaction) => {
    setIsInvestigating(true);
    try {
      const result = await investigateTransactionAI(
        tx,
        {
          accountHolder: tx.accountHolder,
          businessName: tx.businessName,
          accountNumber: tx.accountNumber,
          tenureMonths: 36,
          historicalMedianTx: 145.00,
        },
        {
          trailing90DaysWires: 3,
          lastKnownValidLogin: '2026-09-26 18:20:00 (Austin, TX)',
        },
        tx.anomalySignals
      );

      if (result && result.investigation) {
        const updated: Transaction = {
          ...tx,
          investigation: {
            ...result.investigation,
            investigatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          },
          status: result.investigation.graduatedAction === 'EXECUTE_PRECISION_FREEZE'
            ? 'Precision Frozen'
            : result.investigation.graduatedAction === 'ESCALATE_DUAL_CONTROL'
            ? 'Precision Frozen'
            : 'Settled',
        };

        onUpdateTransaction(updated);

        onAddAuditLog({
          agentName: 'Fraud Sentinel',
          actionTaken: `Autonomous investigation completed: ${result.investigation.graduatedAction} on ${tx.id} ($${tx.amount.toLocaleString()})`,
          targetEntityId: tx.id,
          graduatedTier: result.investigation.riskTier,
          regulatoryReference: result.investigation.regulatoryCitation,
          humanSignOffStatus: result.investigation.graduatedAction === 'MONITOR_ONLY' ? 'Auto-Executed' : 'Pending',
        });
      }
    } catch (err) {
      console.error('Failed investigation:', err);
    } finally {
      setIsInvestigating(false);
    }
  };

  // Human-in-the-Loop release or confirm fraud
  const handleHumanSignOff = (decision: 'Confirmed Fraud' | 'False Positive - Released') => {
    if (!selectedTx) return;

    const newStatus = decision === 'Confirmed Fraud' ? 'Rejected' : 'Released';
    const updated: Transaction = {
      ...selectedTx,
      status: newStatus,
      investigation: selectedTx.investigation ? {
        ...selectedTx.investigation,
        analystSignOff: {
          signedBy: 'Lead Analyst (User)',
          signedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          decision,
        }
      } : undefined,
    };

    onUpdateTransaction(updated);

    onAddAuditLog({
      agentName: 'Fraud Sentinel',
      actionTaken: `Dual-Control Human Sign-off: ${decision} on transaction ${selectedTx.id}. Status changed to ${newStatus}.`,
      targetEntityId: selectedTx.id,
      graduatedTier: selectedTx.investigation?.riskTier || 'Tier 2',
      regulatoryReference: 'FFIEC Dual-Control Governance Standard',
      humanSignOffStatus: 'Approved',
    });
  };

  // Customer SMS reply simulation
  const handleSimulateSmsReply = (reply: 'approve' | 'dispute') => {
    if (!selectedTx) return;
    setSmsReplyState(reply === 'approve' ? 'approved' : 'disputed');

    if (reply === 'approve') {
      const updated: Transaction = {
        ...selectedTx,
        status: 'Released',
        anomalySignals: [...selectedTx.anomalySignals, 'Customer verified transaction via Biometric SMS Challenge'],
      };
      onUpdateTransaction(updated);

      onAddAuditLog({
        agentName: 'Fraud Sentinel',
        actionTaken: `Customer confirmed legitimacy of ${selectedTx.id} via out-of-band SMS challenge. Transaction precision hold released.`,
        targetEntityId: selectedTx.id,
        graduatedTier: 'Tier 1 (Resolved)',
        regulatoryReference: 'CFPB Reg E 1005.11 Consumer Authentication',
        humanSignOffStatus: 'Auto-Executed',
      });
    } else {
      const updated: Transaction = {
        ...selectedTx,
        status: 'Rejected',
        anomalySignals: [...selectedTx.anomalySignals, 'Customer confirmed unauthorized fraud via SMS response'],
      };
      onUpdateTransaction(updated);

      onAddAuditLog({
        agentName: 'Fraud Sentinel',
        actionTaken: `Customer confirmed UNAUTHORIZED fraud on ${selectedTx.id}. Transaction canceled; SAR incident docket pre-populated.`,
        targetEntityId: selectedTx.id,
        graduatedTier: 'Tier 3 (Fraud Confirmed)',
        regulatoryReference: 'FinCEN Suspicious Activity Report (SAR) Filing',
        humanSignOffStatus: 'Approved',
      });
    }
  };

  // Inject a new simulated transaction
  const handleInjectScenario = (type: 'crypto_wire' | 'bec_invoice') => {
    const newTx: Transaction = type === 'crypto_wire' ? {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      accountNumber: '•••• 8911',
      accountHolder: 'Rachel Sterling',
      businessName: 'Sterling Architectural Studio',
      amount: 6720.00,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      counterparty: 'Kraken OTC Liquid Clearing (Unknown IBAN)',
      rail: 'Fedwire',
      status: 'Clearing',
      category: 'Crypto Exchange',
      deviceData: {
        ip: '194.26.29.112',
        geo: 'Bucharest, Romania',
        asn: 'AS59711 (M247 Proxy Cloud)',
        isProxyOrVpn: true,
        deviceFingerprint: `df-new-${Math.floor(Math.random() * 9999)}`,
        isKnownDevice: false,
      },
      anomalySignals: [
        'Outbound wire to crypto exchange during atypical hours (03:14 AM local)',
        'Connecting via overseas hosting proxy ASN',
        'Amount is 8.4x the monthly median outbound debit'
      ]
    } : {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      accountNumber: '•••• 4208',
      accountHolder: 'Gregory Vance',
      businessName: 'Pacific Fabrication Group',
      amount: 24500.00,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      counterparty: 'Metal Works Global (Altered ABA 121000358)',
      rail: 'Fedwire',
      status: 'Clearing',
      category: 'Vendor Invoice',
      deviceData: {
        ip: '172.56.41.98',
        geo: 'Seattle, WA, US',
        asn: 'AS21928 (T-Mobile USA)',
        isProxyOrVpn: false,
        deviceFingerprint: 'df-8819-2201',
        isKnownDevice: true,
      },
      anomalySignals: [
        'Beneficiary routing number altered 12 minutes prior to submission',
        'Amount exceeds standard $15,000 dual-control threshold',
        'Beneficiary routing matches newly chartered fintech neo-bank'
      ]
    };

    onUpdateTransaction(newTx);
    setSelectedTxId(newTx.id);
    handleTriggerInvestigation(newTx);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Overview Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Autonomous Fraud & Precision Action Sentinel
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Real-time autonomous transaction investigation</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">Surgical Precision Hold Active</span>
            <span aria-hidden="true">·</span>
            <span>Zero False-Positive Account Lockouts</span>
          </div>
        </div>

        {/* Quick simulation injectors */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVisualDashboard((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-xs mr-2"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span>{showVisualDashboard ? 'Hide Analytics' : 'Show Analytics'}</span>
          </button>
          <span className="text-xs text-slate-400 font-medium mr-1">Inject Simulation:</span>
          <button
            onClick={() => handleInjectScenario('crypto_wire')}
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
          >
            + Suspicious Crypto Wire ($6.7k)
          </button>
          <button
            onClick={() => handleInjectScenario('bec_invoice')}
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
          >
            + Altered Routing Invoice ($24.5k)
          </button>
        </div>
      </div>

      {/* Visual Recharts Dashboard: Historical Trends of Transaction Anomalies */}
      {showVisualDashboard && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          {/* Executive KPI Deck */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> 14-Day Prevented Loss
              </div>
              <div className="text-xl font-semibold font-mono text-slate-900 mt-1">
                $1,120,400
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                100% intercepted pre-settlement
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-700" /> Surgical Holds
              </div>
              <div className="text-xl font-semibold font-mono text-slate-900 mt-1">
                168 <span className="text-xs text-slate-400 font-normal">Wires & RTP</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Targeted hold on single TX ID
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Unlock className="w-3.5 h-3.5 text-emerald-600" /> Lockouts Averted
              </div>
              <div className="text-xl font-semibold font-mono text-emerald-700 mt-1">
                368 <span className="text-xs text-slate-400 font-normal">Accounts Kept 100% Active</span>
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                Zero merchant business disruptions
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Autonomous Turnaround
              </div>
              <div className="text-xl font-semibold font-mono text-slate-900 mt-1">
                1.8s <span className="text-xs text-slate-400 font-normal">avg latency</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Reduced from 4.2h manual audit
              </div>
            </div>
          </div>

          {/* Charts Row: Trend Line/Area + Typology Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Primary Historical Trend Chart (8 cols) */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-slate-700" />
                    <span>14-Day Historical Transaction Anomaly Trajectory</span>
                  </h4>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Empirical telemetry across Fedwire, RTP, NACHA, and Card clearing rails
                  </div>
                </div>

                {/* Metric Selector Tabs */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
                  <button
                    onClick={() => setChartMetric('anomalies_vs_holds')}
                    className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                      chartMetric === 'anomalies_vs_holds'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Anomalies vs Holds
                  </button>
                  <button
                    onClick={() => setChartMetric('prevented_loss')}
                    className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                      chartMetric === 'prevented_loss'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Prevented Loss ($k)
                  </button>
                  <button
                    onClick={() => setChartMetric('latency')}
                    className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                      chartMetric === 'latency'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Resolution Speed (s)
                  </button>
                </div>
              </div>

              {/* Recharts Composed Container */}
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {chartMetric === 'anomalies_vs_holds' ? (
                    <ComposedChart data={HISTORICAL_ANOMALY_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAverted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-800">
                              <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1">{label}</div>
                              <div className="flex items-center justify-between gap-4 text-amber-300">
                                <span>Flagged Anomalies:</span>
                                <span className="font-mono font-bold">{payload.find((p) => p.dataKey === 'flaggedAnomalies')?.value}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-rose-300">
                                <span>Precision Holds:</span>
                                <span className="font-mono font-bold">{payload.find((p) => p.dataKey === 'precisionHolds')?.value}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-emerald-400">
                                <span>Lockouts Spared:</span>
                                <span className="font-mono font-bold">{payload.find((p) => p.dataKey === 'falsePositivesAverted')?.value}</span>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                      <Area type="monotone" dataKey="falsePositivesAverted" name="Lockouts Spared (Precision Hold)" fill="url(#colorAverted)" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="flaggedAnomalies" name="Flagged Anomalies" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
                      <Bar dataKey="precisionHolds" name="Precision Frozen Transfers" fill="#0f172a" barSize={14} radius={[3, 3, 0, 0]} />
                    </ComposedChart>
                  ) : chartMetric === 'prevented_loss' ? (
                    <ComposedChart data={HISTORICAL_ANOMALY_TRENDS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0f172a" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `$${val}k`} axisLine={false} tickLine={false} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          const val = payload[0]?.value;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg text-xs space-y-1 border border-slate-800">
                              <div className="text-slate-400 font-mono text-[10px]">{label}</div>
                              <div className="font-semibold text-emerald-400 font-mono text-sm">
                                Prevented Exposure: ${val}k
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                      <Area type="monotone" dataKey="preventedLossK" name="Prevented Fraud Loss ($k)" fill="url(#colorLoss)" stroke="#0f172a" strokeWidth={2.5} />
                    </ComposedChart>
                  ) : (
                    <ComposedChart data={HISTORICAL_ANOMALY_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val}s`} axisLine={false} tickLine={false} domain={[0, 4]} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs border border-slate-800">
                              <div className="text-slate-400 text-[10px]">{label}</div>
                              <div className="text-amber-300 font-mono font-semibold">
                                Mean Investigation Speed: {payload[0]?.value} seconds
                              </div>
                              <div className="text-[10px] text-slate-400">Manual review benchmark: 15,120s (4.2h)</div>
                            </div>
                          );
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                      <Line type="monotone" dataKey="avgResolutionSec" name="Agent Investigation Latency (s)" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Secondary Typology Breakdown Card (4 cols) */}
            <div className="lg:col-span-4 bg-slate-50/70 rounded-xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Threat Typology Exposure
                </div>
                <span className="text-[11px] text-slate-400 font-mono">14d Cumulative</span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FRAUD_TYPOLOGY_BREAKDOWN} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded text-xs">
                            <div className="font-semibold text-slate-200">{data.name}</div>
                            <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                              Incidents: {data.count} ({data.percentage}%) · Exposure: ${data.valueK}k
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="valueK" fill="#0f172a" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 pt-1 text-[11px]">
                {FRAUD_TYPOLOGY_BREAKDOWN.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-600">
                    <span className="truncate max-w-[170px]">{item.name}</span>
                    <span className="font-mono font-medium text-slate-800">${item.valueK}k ({item.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Grid: Left Column Transaction Stream / Right Column Deep Investigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Transaction Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Live Inbound Payment Stream ({transactions.length})
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Real-time rails</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {transactions.map((tx) => {
              const isSelected = tx.id === selectedTx?.id;
              const hasInvestigation = !!tx.investigation;
              const isFrozen = tx.status === 'Precision Frozen';
              const isReleased = tx.status === 'Released';

              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    setSelectedTxId(tx.id);
                    setSmsReplyState('pending');
                  }}
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
                          {tx.id}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-xs text-slate-600 font-medium">
                          {tx.businessName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[240px]">
                        To: {tx.counterparty}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-sm text-slate-900">
                        ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {tx.rail}
                      </div>
                    </div>
                  </div>

                  {/* Status & anomaly indicators without generic pills */}
                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {isFrozen ? (
                        <span className="text-amber-700 font-medium flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> Precision Frozen
                        </span>
                      ) : isReleased ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <Unlock className="w-3.5 h-3.5" /> Released (Customer Auth)
                        </span>
                      ) : tx.status === 'Rejected' ? (
                        <span className="text-rose-700 font-medium flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Canceled / SAR
                        </span>
                      ) : (
                        <span className="text-slate-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Settled
                        </span>
                      )}

                      {tx.investigation && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="font-mono text-[11px] text-slate-500">
                            Confidence: {Math.round(tx.investigation.confidenceScore * 100)}%
                          </span>
                        </>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      {tx.timestamp.split(' ')[1] || tx.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Autonomous Investigation Cockpit (7 cols) */}
        {selectedTx && (
          <div className="lg:col-span-7 space-y-5">
            {/* Header Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Transaction Investigation: {selectedTx.id}
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      {selectedTx.rail}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>Account: {selectedTx.accountNumber} ({selectedTx.accountHolder})</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedTx.businessName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTriggerInvestigation(selectedTx)}
                    disabled={isInvestigating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isInvestigating ? 'animate-spin' : ''}`} />
                    <span>{isInvestigating ? 'Agent Investigating...' : 'Re-Run Gemini Investigation'}</span>
                  </button>
                </div>
              </div>

              {/* Crucial Banking Principle: Precision Freeze vs Account Lockout comparison banner */}
              <div className="mt-4 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-lg">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <div className="font-semibold text-amber-900">
                      Surgical Precision Hold Architecture
                    </div>
                    <div className="text-amber-800 mt-0.5 leading-relaxed">
                      Only the suspicious outbound transfer of <strong className="font-mono">${selectedTx.amount.toLocaleString()}</strong> is quarantined in-flight. 
                      The business checking account, payroll batches, debit cards, and automated billing remain <strong>100% active</strong>.
                      This eliminates the #1 cause of SMB client churn: false-positive account freezing.
                    </div>
                  </div>
                </div>
              </div>

              {/* Signal Grid */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> IP & GEO
                  </div>
                  <div className="font-mono font-medium text-slate-800 mt-1 truncate">
                    {selectedTx.deviceData.geo}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {selectedTx.deviceData.ip}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" /> DEVICE ASN
                  </div>
                  <div className="font-mono font-medium text-slate-800 mt-1 truncate">
                    {selectedTx.deviceData.isProxyOrVpn ? 'Proxy/VPN' : 'Clean ISP'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {selectedTx.deviceData.asn}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> FINGERPRINT
                  </div>
                  <div className="font-mono font-medium text-slate-800 mt-1 truncate">
                    {selectedTx.deviceData.isKnownDevice ? 'Known Device' : 'Unrecognized'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {selectedTx.deviceData.deviceFingerprint}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> RISK TIER
                  </div>
                  <div className="font-mono font-medium text-slate-800 mt-1 truncate">
                    {selectedTx.investigation?.riskTier || 'Pending Analysis'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Score: {selectedTx.investigation ? `${Math.round(selectedTx.investigation.confidenceScore * 100)}%` : '---'}
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Investigation Multi-Step Findings */}
            {selectedTx.investigation && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="text-sm font-semibold text-slate-900">
                      Autonomous Investigation Findings & Case File
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Investigated: {selectedTx.investigation.investigatedAt}
                  </span>
                </div>

                {/* Typology */}
                <div className="text-xs">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px] font-medium">
                    Identified Fraud Typology:
                  </span>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5">
                    {selectedTx.investigation.fraudTypology}
                  </div>
                </div>

                {/* Evidence bullets */}
                <div className="space-y-1.5 text-xs text-slate-700">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px] font-medium">
                    Empirical Evidence & Anomaly Correlation:
                  </span>
                  {selectedTx.investigation.keyFindings.map((finding, idx) => (
                    <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
                      <span className="text-slate-400 font-mono">0{idx + 1}.</span>
                      <span className="leading-relaxed">{finding}</span>
                    </div>
                  ))}
                </div>

                {/* Graduated Action Rationale */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center justify-between">
                    <span>Graduated Action: {selectedTx.investigation.graduatedAction}</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {selectedTx.investigation.regulatoryCitation}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedTx.investigation.actionRationale}
                  </p>
                </div>

                {/* Interactive SMS Customer Challenge Simulator */}
                {selectedTx.investigation.smsNotificationDraft && (
                  <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-900 text-white text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium text-slate-200">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span>Autonomous Customer SMS Verification Challenge</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        Out-of-band mobile rail
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-800 rounded border border-slate-700 font-mono text-[11px] text-slate-200 leading-relaxed">
                      "{selectedTx.investigation.smsNotificationDraft}"
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[11px] text-slate-400">
                        Simulate customer mobile response:
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSimulateSmsReply('approve')}
                          disabled={smsReplyState !== 'pending'}
                          className="px-2.5 py-1 text-[11px] font-medium bg-emerald-700 hover:bg-emerald-600 text-white rounded transition-colors disabled:opacity-40"
                        >
                          {smsReplyState === 'approved' ? '✓ Verified by Customer' : 'Reply: 1 (Approve Wire)'}
                        </button>
                        <button
                          onClick={() => handleSimulateSmsReply('dispute')}
                          disabled={smsReplyState !== 'pending'}
                          className="px-2.5 py-1 text-[11px] font-medium bg-rose-700 hover:bg-rose-600 text-white rounded transition-colors disabled:opacity-40"
                        >
                          {smsReplyState === 'disputed' ? '✕ Confirmed Fraud' : 'Reply: 2 (Dispute Fraud)'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Human-in-the-Loop Dual-Control Sign-off Section */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-slate-600" />
                      <span>Human-in-the-Loop Governance Sign-Off</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {selectedTx.investigation.analystSignOff ? (
                        <span className="text-emerald-700 font-medium">
                          Signed by {selectedTx.investigation.analystSignOff.signedBy} on {selectedTx.investigation.analystSignOff.signedAt} ({selectedTx.investigation.analystSignOff.decision})
                        </span>
                      ) : (
                        'Required for permanent fund disposition or SAR escalation'
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleHumanSignOff('False Positive - Released')}
                      className="px-3 py-1.5 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition-colors"
                    >
                      Release Wire (False Positive)
                    </button>
                    <button
                      onClick={() => handleHumanSignOff('Confirmed Fraud')}
                      className="px-3 py-1.5 text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg transition-colors"
                    >
                      Confirm Fraud & Block Wire
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
