import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Calculator,
  Briefcase,
  AlertCircle
} from 'lucide-react';

export const ProfitCalculator: React.FC = () => {
  const { projects, materials, expenses, attendance, employees, settings } = useDb();

  const isDark = settings?.theme === 'dark';
  const currencySymbol = settings?.currency === 'INR' ? '₹' : settings?.currency === 'EUR' ? '€' : '$';

  // State: Select project for detailed analysis
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  // --- WAGE COST CALCULATOR HELPER ---
  const getAttendanceCost = (attId: string) => {
    const att = attendance.find(a => a.id === attId);
    if (!att) return 0;
    const emp = employees.find(e => e.id === att.employeeId);
    if (!emp) return 0;

    let base = 0;
    if (att.status === 'present') {
      base = emp.dailyWage;
    } else if (att.status === 'half_day') {
      base = emp.dailyWage * 0.5;
    }
    const overtime = att.overtimeHours * (emp.dailyWage / 8);
    return base + overtime;
  };

  // --- COMPILE BALANCES ENGINE ---
  let contractRevenue = 0;
  let materialCost = 0;
  let labourCost = 0;
  let generalExpenseCost = 0;

  if (selectedProjectId === 'all') {
    // Total portfolio totals
    contractRevenue = projects.reduce((sum, p) => sum + p.contractAmount, 0);
    materialCost = materials.reduce((sum, m) => sum + m.totalCost, 0);
    
    // Sum all attendance log wage costs
    labourCost = attendance.reduce((sum, att) => {
      return sum + getAttendanceCost(att.id);
    }, 0);

    // Sum other general outlays (excluding materials which are duplicated as expenses)
    generalExpenseCost = expenses
      .filter(ex => ex.category !== 'material_purchase')
      .reduce((sum, ex) => sum + ex.amount, 0);
  } else {
    // Specific project totals
    const proj = projects.find(p => p.id === selectedProjectId);
    if (proj) {
      contractRevenue = proj.contractAmount;
    }

    materialCost = materials
      .filter(m => m.projectId === selectedProjectId)
      .reduce((sum, m) => sum + m.totalCost, 0);

    labourCost = attendance
      .filter(att => att.projectId === selectedProjectId)
      .reduce((sum, att) => sum + getAttendanceCost(att.id), 0);

    generalExpenseCost = expenses
      .filter(ex => ex.projectId === selectedProjectId && ex.category !== 'material_purchase')
      .reduce((sum, ex) => sum + ex.amount, 0);
  }

  const totalCosts = materialCost + labourCost + generalExpenseCost;
  const netProfit = contractRevenue - totalCosts;
  const grossMargin = contractRevenue > 0 ? ((netProfit / contractRevenue) * 100).toFixed(1) : '0';

  // --- RECHARTS CHART PREPARATION ---
  const costBreakdownData = [
    { name: 'Materials Procurement', value: materialCost, color: '#4f46e5' }, // Indigo-600
    { name: 'Crew Labour Cost', value: labourCost, color: '#06b6d4' },      // Cyan-500
    { name: 'Operational Expenses', value: generalExpenseCost, color: '#f43f5e' } // Rose-500
  ].filter(c => c.value > 0);

  // Categorized expenses detailed map
  const getSubcategoryOutlays = () => {
    const counts: { [cat: string]: number } = {};
    
    if (selectedProjectId === 'all') {
      // General expenses breakdown
      expenses.forEach(ex => {
        counts[ex.category] = (counts[ex.category] || 0) + ex.amount;
      });
    } else {
      expenses
        .filter(ex => ex.projectId === selectedProjectId)
        .forEach(ex => {
          counts[ex.category] = (counts[ex.category] || 0) + ex.amount;
        });
    }

    return Object.keys(counts).map(k => ({
      category: k.replace('_', ' ').toUpperCase(),
      amount: counts[k]
    })).sort((a, b) => b.amount - a.amount);
  };

  const expenseBreakdown = getSubcategoryOutlays();

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 animate-fade-in">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contract Margin Auditor</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time visual cost analysis. Understand material leaks, direct labour overheads, and true job profits.
          </p>
        </div>

        {/* Project Selector audit picker */}
        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-bold font-mono">AUDIT SCOPE:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-transparent focus:outline-none cursor-pointer max-w-[200px]"
          >
            <option value="all">Complete Portfolio Overall</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total revenue */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
          <span className="text-[10px] text-slate-400 font-bold font-mono block uppercase">CONTRACT REVENUE</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-black">{currencySymbol}{contractRevenue.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              100%
            </span>
          </div>
        </div>

        {/* Total Cost outlays */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
          <span className="text-[10px] text-slate-400 font-bold font-mono block uppercase">ACCUMULATED OUTLAYS</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-black text-rose-500">{currencySymbol}{totalCosts.toLocaleString()}</span>
            <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
              <ArrowDownRight className="w-3 h-3" />
              {contractRevenue > 0 ? ((totalCosts / contractRevenue) * 100).toFixed(0) : '0'}%
            </span>
          </div>
        </div>

        {/* Net Profit */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
          <span className="text-[10px] text-slate-400 font-bold font-mono block uppercase">NET EARNED PROFIT</span>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xl font-black ${netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {netProfit < 0 ? '-' : ''}{currencySymbol}{Math.abs(netProfit).toLocaleString()}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5 ${netProfit >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
              {netProfit >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {grossMargin}%
            </span>
          </div>
        </div>

        {/* Profit Margin scale */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">PROFIT MARGIN RATING</span>
            <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-2.5">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(0, Number(grossMargin)))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1.5 block font-medium">
              {Number(grossMargin) > 50 ? 'Excellent Margins' : Number(grossMargin) > 25 ? 'Healthy Margins' : 'Attention: High Cost Leakage'}
            </span>
          </div>
        </div>
      </div>

      {/* Main breakdown graph (Bento section) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cost breakdown donut wheel chart */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex flex-col justify-between`}>
          <div>
            <h4 className="text-sm font-bold tracking-tight mb-1">Contract Allocation Wheel</h4>
            <p className="text-xs text-slate-500">Distribution of outlays between wire supplies, team salaries, and petrol logs.</p>
          </div>

          <div className="h-64 my-4">
            {costBreakdownData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No ledger outlays logged under this scope.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {costBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val) => [`${currencySymbol}${Number(val).toLocaleString()}`, 'Spent']}
                    contentStyle={{ fontSize: 11, fontFamily: 'monospace', borderRadius: 12 }} 
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Detailed outlays journal (Subcategory list) */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex flex-col justify-between`}>
          <div>
            <h4 className="text-sm font-bold tracking-tight mb-3">Expenses Leakage Diagnostics</h4>
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {expenseBreakdown.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No micro-expenses logged.</p>
              ) : (
                expenseBreakdown.map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">{item.category}</span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">LEAK CATEGORY</span>
                    </div>
                    <span className="text-xs font-bold font-mono text-rose-500">
                      {currencySymbol}{item.amount.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-4">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              Margin Strategy Advice
            </span>
            {Number(grossMargin) < 30 ? (
              'Consider reducing on-site logistics. Try buying conduit pipes in bulk from direct wholesale suppliers.'
            ) : (
              'Your current profit margin is highly healthy! Keep logistics fuel logs optimized.'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
