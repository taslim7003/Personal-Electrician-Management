import React from 'react';
import { useDb } from '../contexts/DbContext';
import { BarChart3, TrendingUp, DollarSign, Wallet, Receipt, Briefcase } from 'lucide-react';

export const Reports: React.FC = () => {
  const { projects, expenses, payments, materials, settings } = useDb();
  const isDark = settings?.theme === 'dark';

  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalMaterials = materials.reduce((acc, m) => acc + ((m.cost || 0) * (m.quantity || 1)), 0);
  const totalContractValue = projects.reduce((acc, pr) => acc + (pr.estimatedCost || 0), 0);

  const netEarnings = totalCollected - (totalExpenses + totalMaterials);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financial & Business Reports</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real-time summary of revenue, project values, expenditures, and net income.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Payments Collected</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-500">${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-400 mt-1">Total received from clients</p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Expenses</span>
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-500">${(totalExpenses + totalMaterials).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-400 mt-1">Materials + general expenses</p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Net Income</span>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${netEarnings >= 0 ? 'text-amber-500' : 'text-rose-500'}`}>
            ${netEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-1">Net profit after all costs</p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Contract Pipeline</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold">${totalContractValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-400 mt-1">Total estimated project value</p>
        </div>
      </div>

      {/* Detail Breakdown */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-500" />
          <span>Project Status Portfolio</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <p className="text-xs text-slate-500 font-medium">Pending Projects</p>
            <p className="text-xl font-bold mt-1">{projects.filter(p => p.status === 'pending').length}</p>
          </div>
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <p className="text-xs text-slate-500 font-medium">Active In-Progress</p>
            <p className="text-xl font-bold mt-1 text-amber-500">{projects.filter(p => p.status === 'in-progress').length}</p>
          </div>
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <p className="text-xs text-slate-500 font-medium">Completed Projects</p>
            <p className="text-xl font-bold mt-1 text-emerald-500">{projects.filter(p => p.status === 'completed').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
