import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  Briefcase, 
  Users, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Search, 
  Building2, 
  Phone, 
  MapPin, 
  Calendar, 
  Layers, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Check, 
  Sparkles,
  Calculator,
  UserCheck,
  ChevronRight
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { projects, expenses, payments, materials, attendance, employees, settings } = useDb();
  const isDark = settings?.theme === 'dark';

  // Currency symbol (Defaults to INR ₹ as explicitly requested)
  const currencySymbol = '₹';

  // Helper for Indian Rupee Formatting
  const formatINR = (val: number) => {
    return `${currencySymbol}${Math.round(val || 0).toLocaleString('en-IN')}`;
  };

  // State for Project Audit Selector
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [searchTableQuery, setSearchTableQuery] = useState<string>('');

  // Selected Project Financial Details
  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Global Financial Totals
  const globalTotalContractValue = projects.reduce((acc, p) => acc + (p.contractAmount || 0), 0);
  const globalTotalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  
  // Global Expenses breakdown
  const globalGeneralExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const globalMaterialExpenses = materials.reduce((acc, m) => acc + (m.totalCost || (m.rate * m.quantity) || 0), 0);
  
  // Calculate Global Labour Cost from attendance
  const globalLabourCost = attendance.reduce((acc, att) => {
    const emp = employees.find(e => e.id === att.employeeId);
    const wage = emp?.dailyWage || 0;
    if (att.status === 'present') return acc + wage;
    if (att.status === 'half_day') return acc + (wage / 2);
    return acc;
  }, 0);

  const globalTotalExpenses = globalGeneralExpenses + globalMaterialExpenses + globalLabourCost;
  const globalNetEarnings = globalTotalCollected - globalTotalExpenses;
  const globalPendingBalance = Math.max(0, globalTotalContractValue - globalTotalCollected);

  // Helper function to calculate comprehensive project audit ledger
  const calculateProjectFinancials = (projId: string) => {
    const proj = projects.find(p => p.id === projId);
    if (!proj) return null;

    const contractAmount = proj.contractAmount || 0;
    const advanceReceived = proj.advanceReceived || 0;

    // Payments received for this project
    const projPayments = payments.filter(p => p.projectId === projId);
    const totalPaymentsReceived = projPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Pending receivable balance from client
    const clientPendingBalance = Math.max(0, contractAmount - totalPaymentsReceived);

    // Labour Cost calculation
    const projAttendance = attendance.filter(a => a.projectId === projId);
    let totalLabourCost = 0;
    let totalWorkerDays = 0;
    const workerSummaryMap: { [empId: string]: { id: string; name: string; role: string; days: number; totalCost: number } } = {};

    projAttendance.forEach(att => {
      const emp = employees.find(e => e.id === att.employeeId);
      const wage = emp?.dailyWage || 0;
      let dayCost = 0;
      let dayFraction = 0;

      if (att.status === 'present') {
        dayFraction = 1;
        dayCost = wage;
      } else if (att.status === 'half_day') {
        dayFraction = 0.5;
        dayCost = wage / 2;
      }

      totalLabourCost += dayCost;
      totalWorkerDays += dayFraction;

      if (emp) {
        if (!workerSummaryMap[emp.id]) {
          workerSummaryMap[emp.id] = { id: emp.id, name: emp.name, role: emp.role || 'Electrician', days: 0, totalCost: 0 };
        }
        workerSummaryMap[emp.id].days += dayFraction;
        workerSummaryMap[emp.id].totalCost += dayCost;
      }
    });

    // Material Ledger Cost
    const projMaterials = materials.filter(m => m.projectId === projId);
    const totalMaterialCost = projMaterials.reduce((sum, m) => sum + (m.totalCost || (m.rate * m.quantity) || 0), 0);

    // General Expense Journal Cost
    const projExpenses = expenses.filter(e => e.projectId === projId);
    const totalGeneralExpenseCost = projExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Total Overall Project Expenses
    const totalProjectExpense = totalLabourCost + totalMaterialCost + totalGeneralExpenseCost;

    // Profit Calculations
    const actualCollectedNetProfit = totalPaymentsReceived - totalProjectExpense;
    const expectedProjectedProfit = contractAmount - totalProjectExpense;
    const profitMarginPct = contractAmount > 0 ? (expectedProjectedProfit / contractAmount) * 100 : 0;

    return {
      proj,
      contractAmount,
      advanceReceived,
      totalPaymentsReceived,
      clientPendingBalance,
      totalLabourCost,
      totalWorkerDays,
      workerBreakdown: Object.values(workerSummaryMap),
      projMaterials,
      totalMaterialCost,
      projExpenses,
      totalGeneralExpenseCost,
      totalProjectExpense,
      actualCollectedNetProfit,
      expectedProjectedProfit,
      profitMarginPct,
      projPayments
    };
  };

  const currentAudit = selectedProject ? calculateProjectFinancials(selectedProject.id) : null;

  // Filtered projects for the ledger table
  const filteredProjectsTable = projects.filter(p => 
    p.name.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
    p.customerName.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTableQuery.toLowerCase())
  );

  const handlePrintAudit = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
              <Calculator className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Financial & Business Reports
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
            Project contract values, advance collections, labour costs, material ledgers, general expenses & profit margins in Indian Rupees (₹).
          </p>
        </div>

        <button
          onClick={handlePrintAudit}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 rounded-xl transition-all border border-slate-300 dark:border-slate-800 shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4 text-indigo-500" />
          Print / Export Report
        </button>
      </div>

      {/* Global Overview Cards (All in ₹ INR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Contract Pipeline</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{formatINR(globalTotalContractValue)}</p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Across {projects.length} electric contracts</p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Payments Collected</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatINR(globalTotalCollected)}</p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Advances + milestone payments</p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{formatINR(globalTotalExpenses)}</p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Labour + Materials + Overhead</p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Pending Client Balance</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{formatINR(globalPendingBalance)}</p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Remaining dues to collect</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURED: PROJECT FINANCIAL AUDIT & EXPENSE BREAKDOWN SECTION             */}
      {/* ========================================================================= */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        {/* Section Header & Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              Project Financial Audit & Profitability Analysis
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
              Select Project to Inspect Financial Ledger
            </h2>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
              Select a project below to audit contract value, advance payment, pending dues, labour wages, material ledger, general expenses, and net profit in Indian Rupees (₹).
            </p>
          </div>

          {/* Project Picker Dropdown */}
          <div className="w-full lg:w-80">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase font-mono">
              Choose Project:
            </label>
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className={`w-full px-4 py-3 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
                  isDark 
                    ? 'bg-slate-950 border-slate-700 text-white focus:border-indigo-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                }`}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ({p.customerName} | {p.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Selected Project Full Audit Card */}
        {currentAudit ? (
          <div className="mt-6 space-y-6">
            {/* Project Info Title Banner */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/90'} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {currentAudit.proj.name}
                  </h3>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                    currentAudit.proj.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : currentAudit.proj.status === 'running'
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  }`}>
                    {currentAudit.proj.status === 'completed' ? '✓ Completed' : currentAudit.proj.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    Customer: <strong className="text-slate-900 dark:text-white font-bold">{currentAudit.proj.customerName}</strong>
                  </span>
                  {currentAudit.proj.customerPhone && (
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      {currentAudit.proj.customerPhone}
                    </span>
                  )}
                  {currentAudit.proj.workLocation && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      Location: {currentAudit.proj.workLocation}
                    </span>
                  )}
                  {currentAudit.proj.actualCompletionDate && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed On: {currentAudit.proj.actualCompletionDate}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block font-mono">Total Contract Value</span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{formatINR(currentAudit.contractAmount)}</span>
                </div>
              </div>
            </div>

            {/* Contract & Revenue Ledger Cards (4 KPI Pillars) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pillar 1: Contract Value */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'}`}>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase block font-mono">1. Contract Value</span>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{formatINR(currentAudit.contractAmount)}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Total agreed contract price</p>
              </div>

              {/* Pillar 2: Advance Received */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'}`}>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase block font-mono">2. Advance Received</span>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatINR(currentAudit.advanceReceived)}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Booking / Initial advance paid</p>
              </div>

              {/* Pillar 3: Total Collected to Date */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'}`}>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase block font-mono">3. Total Payments Received</span>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatINR(currentAudit.totalPaymentsReceived)}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across {currentAudit.projPayments.length} payment receipts</p>
              </div>

              {/* Pillar 4: Pending Receivable Balance */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'}`}>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase block font-mono">4. Client Pending Balance</span>
                <p className={`text-xl font-black mt-1 ${currentAudit.clientPendingBalance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatINR(currentAudit.clientPendingBalance)}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {currentAudit.clientPendingBalance > 0 ? 'Remaining to collect from client' : '✓ Full contract amount collected'}
                </p>
              </div>
            </div>

            {/* 3 EXPENSE LEDGERS BREAKDOWN (Labour + Material + General Expenses) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Ledger A: Labour Cost Amount */}
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'}`}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Users className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono">Labour Cost Amount</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Worker Wages & Payroll</p>
                    </div>
                  </div>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">
                    {formatINR(currentAudit.totalLabourCost)}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 mb-3 font-medium">
                  Total Crew Days Worked: <strong className="text-slate-900 dark:text-white font-bold">{currentAudit.totalWorkerDays} Days</strong>
                </div>

                {currentAudit.workerBreakdown.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic py-3 text-center">No labor attendance logged for this project.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentAudit.workerBreakdown.map((w) => (
                      <div key={w.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{w.name}</span>
                          <span className="text-[10px] text-slate-500 block font-mono">{w.role} • {w.days} days marked</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {formatINR(w.totalCost)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ledger B: Material Ledger Amount */}
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'}`}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <ShoppingBag className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono">Material Ledger Amount</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Procurement & Inventory Costs</p>
                    </div>
                  </div>
                  <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                    {formatINR(currentAudit.totalMaterialCost)}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 mb-3 font-medium">
                  Total Items Bought: <strong className="text-slate-900 dark:text-white font-bold">{currentAudit.projMaterials.length} Entries</strong>
                </div>

                {currentAudit.projMaterials.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic py-3 text-center">No material purchases recorded for this project.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentAudit.projMaterials.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{m.name}</span>
                          <span className="text-[10px] text-slate-500 block font-mono">{m.quantity} {m.unit} @ {formatINR(m.rate)}</span>
                        </div>
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                          {formatINR(m.totalCost || (m.rate * m.quantity))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ledger C: General Expense Journal */}
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'}`}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <Receipt className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono">General Expense Journal</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Fuel, Travel & Miscellaneous Overhead</p>
                    </div>
                  </div>
                  <span className="text-base font-black text-rose-600 dark:text-rose-400 font-mono">
                    {formatINR(currentAudit.totalGeneralExpenseCost)}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 mb-3 font-medium">
                  Total Journal Logs: <strong className="text-slate-900 dark:text-white font-bold">{currentAudit.projExpenses.length} Entries</strong>
                </div>

                {currentAudit.projExpenses.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic py-3 text-center">No general journal expenses logged for this project.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentAudit.projExpenses.map((exp) => (
                      <div key={exp.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{exp.description}</span>
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">{exp.category}</span>
                        </div>
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                          {formatINR(exp.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* PROFIT & LOSS BALANCE SHEET SUMMARY BOX */}
            <div className={`p-6 rounded-2xl border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 text-white shadow-md'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block font-mono">
                    Project Profitability Ledger & Balance Statement
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-1">
                    {currentAudit.proj.name} — Profitability & Balance Statement
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 font-medium max-w-xl">
                    Net profit is calculated by subtracting total expenses (Labour + Material + General Expenses) from total payments collected or contract value.
                  </p>
                </div>

                {/* Main Net Profit Badge */}
                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs min-w-[220px] text-right">
                  <span className="text-[10px] font-bold text-slate-300 uppercase block font-mono">
                    Net Projected Profit
                  </span>
                  <span className={`text-2xl font-black block mt-1 ${
                    currentAudit.expectedProjectedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {formatINR(currentAudit.expectedProjectedProfit)}
                  </span>
                  <span className="text-[11px] text-emerald-300 font-bold font-mono mt-0.5 block">
                    Profit Margin: {currentAudit.profitMarginPct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Equation row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/10 text-center font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-white/5">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Contract Value</span>
                  <span className="text-sm font-extrabold text-white">{formatINR(currentAudit.contractAmount)}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">- Total Expenses</span>
                  <span className="text-sm font-extrabold text-rose-400">{formatINR(currentAudit.totalProjectExpense)}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">= Net Projected Profit</span>
                  <span className="text-sm font-extrabold text-emerald-400">{formatINR(currentAudit.expectedProjectedProfit)}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Collected Profit So Far</span>
                  <span className="text-sm font-extrabold text-emerald-300">{formatINR(currentAudit.actualCollectedNetProfit)}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Client Balance Due</span>
                  <span className="text-sm font-extrabold text-amber-300">{formatINR(currentAudit.clientPendingBalance)}</span>
                </div>
              </div>
            </div>

          </div>
        ) : null}
      </div>

      {/* ========================================================================= */}
      {/* ALL PROJECTS FINANCIAL COMPARISON TABLE                                  */}
      {/* ========================================================================= */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <span>All Projects Financial Ledger Comparison</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Side-by-side comparison of contract value, payments received, labour cost, material cost, general expenses, net profit, and client balance due.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTableQuery}
              onChange={(e) => setSearchTableQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-800 text-slate-400 bg-slate-950/40' : 'border-slate-200 text-slate-600 bg-slate-50'} font-mono uppercase font-bold text-[11px]`}>
                <th className="py-3 px-3">Project / Customer</th>
                <th className="py-3 px-3 text-right">Contract Value</th>
                <th className="py-3 px-3 text-right">Advance / Received</th>
                <th className="py-3 px-3 text-right text-blue-600 dark:text-blue-400">Labour Cost</th>
                <th className="py-3 px-3 text-right text-amber-600 dark:text-amber-400">Material Cost</th>
                <th className="py-3 px-3 text-right text-rose-600 dark:text-rose-400">Gen. Expense</th>
                <th className="py-3 px-3 text-right font-black">Total Expense</th>
                <th className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400">Net Profit</th>
                <th className="py-3 px-3 text-right text-amber-600 dark:text-amber-400">Client Balance</th>
                <th className="py-3 px-3 text-center">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
              {filteredProjectsTable.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-6 text-slate-500">No matching projects found.</td>
                </tr>
              ) : (
                filteredProjectsTable.map((p) => {
                  const fin = calculateProjectFinancials(p.id);
                  if (!fin) return null;

                  return (
                    <tr 
                      key={p.id} 
                      className={`hover:bg-indigo-50/70 dark:hover:bg-indigo-950/50 transition-colors ${
                        selectedProjectId === p.id ? 'bg-indigo-100/60 dark:bg-indigo-950/80 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-slate-900 dark:text-white block">{p.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{p.customerName} • {p.status.toUpperCase()}</span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatINR(fin.contractAmount)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatINR(fin.totalPaymentsReceived)}
                        {fin.advanceReceived > 0 && (
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Adv: {formatINR(fin.advanceReceived)}</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                        {formatINR(fin.totalLabourCost)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                        {formatINR(fin.totalMaterialCost)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        {formatINR(fin.totalGeneralExpenseCost)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-black text-slate-900 dark:text-white bg-slate-100/60 dark:bg-slate-800/60">
                        {formatINR(fin.totalProjectExpense)}
                      </td>

                      <td className={`py-3 px-3 text-right font-mono font-black ${
                        fin.expectedProjectedProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {formatINR(fin.expectedProjectedProfit)}
                      </td>

                      <td className={`py-3 px-3 text-right font-mono font-extrabold ${
                        fin.clientPendingBalance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                      }`}>
                        {formatINR(fin.clientPendingBalance)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedProjectId(p.id);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all cursor-pointer shadow-2xs"
                        >
                          View Audit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
