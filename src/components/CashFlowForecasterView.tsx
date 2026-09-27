import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sliders, 
  ShieldCheck, 
  FileCheck,
  RefreshCw,
  Clock,
  Layers,
  BarChart2,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { BusinessCashProfile, CashFlowPayable, CashFlowReceivable, RecommendedAction } from '../types/banking';
import { simulateCashflowAI } from '../services/api';

interface CashFlowForecasterViewProps {
  profiles: BusinessCashProfile[];
  onAddAuditLog: (log: {
    agentName: any;
    actionTaken: string;
    targetEntityId: string;
    graduatedTier: string;
    regulatoryReference: string;
    humanSignOffStatus: 'Pending' | 'Approved' | 'Overridden' | 'Auto-Executed';
  }) => void;
}

export const CashFlowForecasterView: React.FC<CashFlowForecasterViewProps> = ({
  profiles,
  onAddAuditLog,
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || '');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeActions, setActiveActions] = useState<Record<string, boolean>>({
    credit_draw: false,
    delay_vendor: false,
    invoice_discount: false,
  });
  const [isPackageApproved, setIsPackageApproved] = useState<boolean>(false);

  const profile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  // Dynamic 30-Day Cash Curve Simulation
  const trajectory = useMemo(() => {
    if (!profile) return [];

    let baselineCash = profile.operatingCash;
    let simulatedCash = profile.operatingCash;
    const days: Array<{
      day: number;
      dayLabel: string;
      baseline: number;
      simulated: number;
      inflow: number;
      outflow: number;
      netFlow: number;
      payables: CashFlowPayable[];
      receivables: CashFlowReceivable[];
      events: string[];
    }> = [];

    for (let d = 1; d <= 30; d++) {
      const dayPayables = profile.payables.filter((p) => {
        // If delayed vendor action is active, shift discretionary vendor from dueDay 12 to 26
        if (activeActions.delay_vendor && p.id === 'pay-2') {
          return d === (p.dueDay + (p.deferrableDays || 14));
        }
        return p.dueDay === d;
      });

      const dayReceivables = profile.receivables.filter((r) => {
        // If invoice discount active, shift Titan Industrial from Day 14 to Day 10
        if (activeActions.invoice_discount && r.id === 'rec-1') {
          return d === 10;
        }
        return r.expectedDay === d;
      });

      // Compute baseline outflows/inflows (without any actions)
      const rawPayables = profile.payables.filter((p) => p.dueDay === d);
      const rawReceivables = profile.receivables.filter((r) => r.expectedDay === d);

      const baselineOut = rawPayables.reduce((acc, p) => acc + p.amount, 0);
      const baselineIn = rawReceivables.reduce((acc, r) => acc + r.amount, 0);
      baselineCash = baselineCash - baselineOut + baselineIn;

      // Compute simulated outflows/inflows (with active actions)
      let simOut = dayPayables.reduce((acc, p) => acc + p.amount, 0);
      let simIn = dayReceivables.reduce((acc, r) => {
        // Apply 1.5% discount deduction if pulled forward
        if (activeActions.invoice_discount && r.id === 'rec-1') {
          return acc + (r.amount * 0.985);
        }
        return acc + r.amount;
      }, 0);

      // Inject credit draw of $25,000 on Day 10 if active
      if (activeActions.credit_draw && d === 10) {
        simIn += 25000;
      }

      simulatedCash = simulatedCash - simOut + simIn;

      const events: string[] = [];
      rawPayables.forEach((p) => events.push(`Payable: ${p.title} (-$${p.amount.toLocaleString()})`));
      rawReceivables.forEach((r) => events.push(`Receivable: ${r.customerName} (+$${r.amount.toLocaleString()})`));

      days.push({
        day: d,
        dayLabel: `D${d}`,
        baseline: Math.round(baselineCash),
        simulated: Math.round(simulatedCash),
        inflow: Math.round(simIn),
        outflow: Math.round(simOut),
        netFlow: Math.round(simIn - simOut),
        payables: rawPayables,
        receivables: rawReceivables,
        events,
      });
    }

    return days;
  }, [profile, activeActions]);

  const [chartDisplayMode, setChartDisplayMode] = useState<'cumulative_curve' | 'daily_flows'>('cumulative_curve');

  const baselineLowPoint = useMemo(() => {
    return Math.min(...trajectory.map((t) => t.baseline));
  }, [trajectory]);

  const simulatedLowPoint = useMemo(() => {
    return Math.min(...trajectory.map((t) => t.simulated));
  }, [trajectory]);

  const shortfallDay = useMemo(() => {
    const found = trajectory.find((t) => t.baseline < profile.minimumReserveBuffer);
    return found ? found.day : null;
  }, [trajectory, profile.minimumReserveBuffer]);

  const payablesByCategory = useMemo(() => {
    if (!profile) return [];
    const map: Record<string, number> = {};
    profile.payables.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + p.amount;
    });
    return Object.entries(map).map(([category, amount]) => ({ category, amount }));
  }, [profile]);

  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const handleRunAiAnalysis = async () => {
    if (!profile) return;
    setIsSimulating(true);
    try {
      const res = await simulateCashflowAI(profile);
      if (res && res.analysis) {
        setAiAnalysis(res.analysis);
        onAddAuditLog({
          agentName: 'Liquidity Forecaster',
          actionTaken: `Simulated cash flow for ${profile.name}: Shortfall projected on Day ${res.analysis.shortfallDay} ($${Math.abs(res.analysis.projectedLowPoint).toLocaleString()} deficit).`,
          targetEntityId: profile.id,
          graduatedTier: res.analysis.urgency,
          regulatoryReference: 'FFIEC Liquidity Risk Management Guidance',
          humanSignOffStatus: 'Pending',
        });
      }
    } catch (err) {
      console.error('Failed AI cashflow analysis:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApproveMitigation = () => {
    setIsPackageApproved(true);
    onAddAuditLog({
      agentName: 'Liquidity Forecaster',
      actionTaken: `Executed Human-in-the-Loop approval of Liquidity Stabilization Package for ${profile.name}. (Credit line draw + vendor deferrals).`,
      targetEntityId: profile.id,
      graduatedTier: 'Approved Action',
      regulatoryReference: 'Commercial Loan Facility Agreement & NACHA',
      humanSignOffStatus: 'Approved',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Editorial Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Proactive SMB Cash-Flow & Runway Forecaster
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Continuous predictive working capital surveillance</span>
            <span aria-hidden="true">·</span>
            <span>Horizon: 30 Days</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-700 font-medium">Early Warning Deficit Mitigation</span>
          </div>
        </div>

        {/* Business Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Business:</span>
          <select
            value={selectedProfileId}
            onChange={(e) => {
              setSelectedProfileId(e.target.value);
              setIsPackageApproved(false);
              setAiAnalysis(null);
            }}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-md text-slate-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.industry})
              </option>
            ))}
          </select>

          <button
            onClick={handleRunAiAnalysis}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'AI Optimization'}</span>
          </button>
        </div>
      </div>

      {/* High-level Cash KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Current Operating Cash
          </div>
          <div className="text-xl font-semibold text-slate-900 font-mono mt-1">
            ${profile.operatingCash.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Minimum reserve buffer: ${profile.minimumReserveBuffer.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Baseline 30-Day Low Point
          </div>
          <div className="text-xl font-semibold font-mono mt-1">
            {baselineLowPoint < 0 ? (
              <span className="text-rose-600 flex items-center gap-1">
                <TrendingDown className="w-5 h-5" /> -${Math.abs(baselineLowPoint).toLocaleString()}
              </span>
            ) : baselineLowPoint < profile.minimumReserveBuffer ? (
              <span className="text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-5 h-5" /> ${baselineLowPoint.toLocaleString()}
              </span>
            ) : (
              <span className="text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-5 h-5" /> ${baselineLowPoint.toLocaleString()}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {shortfallDay ? `Breaches reserve on Day ${shortfallDay} (Payroll batch)` : 'Healthy buffer maintained'}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Simulated Low Point (With Actions)
          </div>
          <div className="text-xl font-semibold font-mono mt-1 text-emerald-700 flex items-center gap-1">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            ${simulatedLowPoint.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {simulatedLowPoint > profile.minimumReserveBuffer
              ? '✓ Buffer fully restored'
              : 'Partial deficit remediation'}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Pre-Approved Credit Facility
          </div>
          <div className="text-xl font-semibold text-slate-900 font-mono mt-1">
            ${profile.creditFacility.available.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Revolving Line @ {profile.creditFacility.apr}% APR
          </div>
        </div>
      </div>

      {/* Main Recharts Projected Liquidity Dashboard */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-slate-700" />
              <span>30-Day Projected Liquidity Over Time & Shortfall Mitigation</span>
            </h3>
            <div className="text-xs text-slate-500 mt-0.5">
              Empirical working capital forecast correlated with scheduled payroll and vendor clearing
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setChartDisplayMode('cumulative_curve')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  chartDisplayMode === 'cumulative_curve'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Liquidity Curve
              </button>
              <button
                onClick={() => setChartDisplayMode('daily_flows')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  chartDisplayMode === 'daily_flows'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daily Inflow / Outflow
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trajectory} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="baselineCashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="simulatedCashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="dayLabel" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
              
              {/* Reference Lines for $25k Buffer and $0 Deficit */}
              <ReferenceLine y={profile.minimumReserveBuffer} stroke="#f59e0b" strokeDasharray="4 3" label={{ value: '$25k Min Reserve', fill: '#d97706', fontSize: 10, position: 'insideTopLeft' }} />
              <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} label={{ value: '$0 Breakeven', fill: '#94a3b8', fontSize: 10, position: 'insideBottomLeft' }} />
              
              {/* Shortfall warning highlight area between Day 17 and Day 21 */}
              <ReferenceArea x1="D17" x2="D21" fill="#fee2e2" fillOpacity={0.4} />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0]?.payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-800 max-w-xs">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                        <span className="font-semibold text-slate-200">{label} ({profile.name})</span>
                        <span className="font-mono text-[10px] text-slate-400">Day {data.day} of 30</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-slate-300">
                        <span>Baseline Balance:</span>
                        <span className="font-mono font-bold text-white">${data.baseline?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-emerald-400">
                        <span>Mitigated Balance:</span>
                        <span className="font-mono font-bold">${data.simulated?.toLocaleString()}</span>
                      </div>

                      {data.inflow > 0 && (
                        <div className="flex items-center justify-between gap-4 text-emerald-300 pt-1 border-t border-slate-800">
                          <span>Scheduled Inflow:</span>
                          <span className="font-mono">+${data.inflow.toLocaleString()}</span>
                        </div>
                      )}

                      {data.outflow > 0 && (
                        <div className="flex items-center justify-between gap-4 text-rose-300">
                          <span>Scheduled Outflow:</span>
                          <span className="font-mono">-${data.outflow.toLocaleString()}</span>
                        </div>
                      )}

                      {data.events?.length > 0 && (
                        <div className="text-[10px] text-amber-200 pt-1 border-t border-slate-800 leading-tight">
                          {data.events[0]}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />

              {/* Inflows and Outflows Bars if in Daily Flows mode */}
              {chartDisplayMode === 'daily_flows' && (
                <>
                  <Bar dataKey="inflow" name="Daily Inflow ($)" fill="#10b981" barSize={10} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="outflow" name="Daily Outflow ($)" fill="#f43f5e" barSize={10} radius={[2, 2, 0, 0]} />
                </>
              )}

              {/* Liquidity Trajectory Area and Lines */}
              <Area type="monotone" dataKey="baseline" name="Baseline Cash Balance" stroke="#0f172a" strokeWidth={2.5} fill="url(#baselineCashGrad)" />
              <Line type="monotone" dataKey="simulated" name="Proactive Mitigated Liquidity" stroke="#059669" strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 3, fill: '#059669' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Proactive Action Playbook & What-If Interactive Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Playbook toggles (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-slate-700" />
                <span>Autonomous Liquidity Playbook (Interactive Simulator)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle actions to observe immediate stabilizing impact on the cash curve
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Human-in-the-Loop required</span>
          </div>

          <div className="space-y-3">
            {/* Action 1: Pre-approved Revolving Line Draw */}
            <div
              onClick={() => setActiveActions((prev) => ({ ...prev, credit_draw: !prev.credit_draw }))}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                activeActions.credit_draw
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={activeActions.credit_draw}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      1. Draw $25,000 on Pre-Approved Revolving Credit Facility
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Instantly injects working capital on Day 10 before payroll batch.
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span className="text-emerald-700 font-medium">Impact: +$25,000 buffer</span>
                      <span aria-hidden="true">·</span>
                      <span>Cost: $141.67/mo (6.85% APR)</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-400">Instant API Execution</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action 2: Vendor Payment Extension */}
            <div
              onClick={() => setActiveActions((prev) => ({ ...prev, delay_vendor: !prev.delay_vendor }))}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                activeActions.delay_vendor
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={activeActions.delay_vendor}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      2. Automated Net-45 Extension on Specialty Steel Supplier ($18.5k)
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Defers vendor outflow from Day 12 to Day 26 under approved supplier grace agreement.
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span className="text-emerald-700 font-medium">Impact: Defers $18,500 by 14 days</span>
                      <span aria-hidden="true">·</span>
                      <span>Cost: $0 penalty fee</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action 3: Early Settlement Receivable Discount */}
            <div
              onClick={() => setActiveActions((prev) => ({ ...prev, invoice_discount: !prev.invoice_discount }))}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                activeActions.invoice_discount
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={activeActions.invoice_discount}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      3. Dispatch 1.5% Quick-Pay Discount on Titan Industrial Invoice ($48.5k)
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Incentivizes client to settle payment by Day 10 instead of standard net-30 terms.
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span className="text-emerald-700 font-medium">Impact: Accelerates +$47,772 inflow</span>
                      <span aria-hidden="true">·</span>
                      <span>Cost: $728 early-settlement incentive</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action execution banner */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {isPackageApproved ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Stabilization Package Authorized & Dispatched
                </span>
              ) : (
                'Dual-control human authorization required for credit line draw'
              )}
            </div>

            <button
              onClick={handleApproveMitigation}
              disabled={isPackageApproved || (!activeActions.credit_draw && !activeActions.delay_vendor && !activeActions.invoice_discount)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isPackageApproved ? 'Package Active' : 'Authorize Selected Mitigation'}</span>
            </button>
          </div>
        </div>

        {/* Upcoming Cash Inflow/Outflow Schedule (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-700" />
              <span>Critical 30-Day Payables & Receivables</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400">Scheduled events</span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            <div className="pt-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Upcoming Payables (Outflows)
              </div>
              {profile.payables.map((p) => (
                <div key={p.id} className="py-1.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-800">{p.title}</div>
                    <div className="text-[11px] text-slate-400">
                      Due Day {p.dueDay} · {p.category} {p.isDiscretionary ? '(Discretionary)' : ''}
                    </div>
                  </div>
                  <div className="font-mono font-semibold text-slate-900">
                    -${p.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Expected Receivables (Inflows)
              </div>
              {profile.receivables.map((r) => (
                <div key={r.id} className="py-1.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-800">{r.customerName}</div>
                    <div className="text-[11px] text-slate-400">
                      Expected Day {r.expectedDay} · Reliability: {r.reliabilityScore}%
                    </div>
                  </div>
                  <div className="font-mono font-semibold text-emerald-700">
                    +${r.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Payables Category Allocation Chart */}
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Payables by Category</span>
                <span className="font-mono text-slate-400 text-[10px]">
                  Total: ${profile.payables.reduce((a, b) => a + b.amount, 0).toLocaleString()}
                </span>
              </div>
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={payablesByCategory} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="category" type="category" width={80} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded text-xs">
                            <div className="font-medium text-slate-200">{data.category}</div>
                            <div className="font-mono text-emerald-400 font-semibold mt-0.5">
                              ${data.amount?.toLocaleString()}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="amount" fill="#0f172a" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
