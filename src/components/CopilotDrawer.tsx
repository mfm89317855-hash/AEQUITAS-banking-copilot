import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, User, Bot, RefreshCw, Shield, ArrowRight } from 'lucide-react';
import { sendCopilotChat } from '../services/api';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeContext: any;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({ isOpen, onClose, activeContext }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "I am Aequitas Banking Co-Pilot. I am continuously monitoring active payment rails, SMB liquidity forecasts, loan underwriting pipelines, and regulatory guardrails. How can I assist with your portfolio analysis or audit docket today?",
      timestamp: '04:50:00'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await sendCopilotChat(
        query,
        activeContext,
        messages.map((m) => ({ role: m.role, text: m.text }))
      );

      const botMsg: Message = {
        role: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Copilot chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Encountered an issue retrieving agent intelligence. Please check your network connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    "Why precision freeze TX-8821 instead of full account lockout?",
    "How does Apex Hardware bridge the Day 19 payroll deficit?",
    "Assess CFPB Reg E compliance on our customer SMS challenge",
    "Summarize the empirical DSCR justification for Meridian Robotics"
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Aequitas Co-Pilot AI</div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>Institutional Gemini 3.8 Flash</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400">Context Connected</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                  Æ
                </div>
              )}

              <div
                className={`p-3.5 rounded-xl max-w-[85%] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                <div className="whitespace-pre-line font-sans">{m.text}</div>
                <div
                  className={`text-[10px] font-mono mt-1.5 ${
                    m.role === 'user' ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                Æ
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-600" />
                <span>Analyzing portfolio metrics & cross-referencing banking rules...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Quick Inquiries:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                className="text-[11px] text-left px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="p-3.5 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Aequitas Co-Pilot about risk, cashflow, or compliance..."
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
