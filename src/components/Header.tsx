import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  GitCompare, 
  Lock, 
  MessageSquare, 
  Sparkles, 
  AlertTriangle,
  User,
  LogOut,
  LogIn,
  Cloud
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: 'fraud' | 'cashflow' | 'underwriting' | 'recon' | 'governance';
  setActiveTab: (tab: 'fraud' | 'cashflow' | 'underwriting' | 'recon' | 'governance') => void;
  openCopilot: () => void;
  precisionHoldCount: number;
  unresolvedBreaksCount: number;
  cashShortfallUrgency: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openCopilot,
  precisionHoldCount,
  unresolvedBreaksCount,
  cashShortfallUrgency
}) => {
  const { user, signInWithGoogle, logout } = useAuth();
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      {/* Top tier brand & system indicators */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg tracking-wider">
            Æ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-900 tracking-tight">
                Aequitas Co-Pilot
              </h1>
              <span className="text-xs text-slate-400 font-mono">v3.8 Institutional</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Autonomous Risk & Liquidity Engine</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-600 font-medium">Dual-Control Guardrails Active</span>
            </div>
          </div>
        </div>

        {/* Global Bank KPI Metrics */}
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-600 border-l border-r border-slate-200 px-6">
          <div>
            <div className="text-slate-400 font-medium text-[11px]">ACTIVE SURGICAL HOLDS</div>
            <div className="text-sm font-semibold text-amber-600 font-mono">
              {precisionHoldCount} <span className="text-xs text-slate-500 font-normal">(Acct Liquidity 100%)</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium text-[11px]">PROJECTED SMB SHORTFALL</div>
            <div className="text-sm font-semibold font-mono">
              {cashShortfallUrgency ? (
                <span className="text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Day 19 Breach
                </span>
              ) : (
                <span className="text-emerald-600">Buffer Stable</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium text-[11px]">UNRESOLVED LEDGER BREAKS</div>
            <div className="text-sm font-semibold text-slate-800 font-mono">
              {unresolvedBreaksCount} <span className="text-xs text-slate-400 font-normal">Auto-Drafted</span>
            </div>
          </div>
        </div>

        {/* Firebase Cloud status & user authentication */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Firestore: us-west1</span>
          </div>

          {user ? (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full border border-slate-200" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
                <span className="truncate max-w-[130px] font-medium">{user.displayName || user.email}</span>
              </div>
              <button
                onClick={logout}
                title="Sign out of Firebase"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-500" />
              <span>Google Sign-In</span>
            </button>
          )}

          {/* AI Co-Pilot trigger */}
          <button
            onClick={openCopilot}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Banking Co-Pilot AI</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 -mb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('fraud')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'fraud'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Autonomous Fraud & Precision Action</span>
          {precisionHoldCount > 0 && (
            <span className="ml-1 text-[11px] font-mono font-medium text-amber-600">
              ({precisionHoldCount})
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('cashflow')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'cashflow'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Proactive SMB Cash-Flow & Runway</span>
        </button>

        <button
          onClick={() => setActiveTab('underwriting')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'underwriting'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Agentic Loan Underwriting</span>
        </button>

        <button
          onClick={() => setActiveTab('recon')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'recon'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>Back-Office Ledger Reconciliation</span>
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'governance'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Governance, Guardrails & Audit</span>
        </button>
      </div>
    </header>
  );
};
