import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Briefcase, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  User, 
  FileText, 
  ShoppingBag, 
  CreditCard,
  Sparkles,
  CalendarDays,
  X,
  Check,
  Phone,
  Layers
} from 'lucide-react';
import { DailyLog, Attendance, Expense, Payment, Material } from '../database/types';

export const CalendarView: React.FC = () => {
  const { 
    projects, 
    dailyLogs, 
    attendance, 
    expenses, 
    materials, 
    payments, 
    employees, 
    settings,
    saveDailyLog,
    saveAttendance,
    saveExpense,
    savePayment
  } = useDb();

  const isDark = settings?.theme === 'dark';
  const currencySymbol = settings?.currency === 'INR' ? '₹' : settings?.currency === 'EUR' ? '€' : settings?.currency === 'GBP' ? '£' : '$';

  // State for Month/Year Navigation
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Helper to format Date object to YYYY-MM-DD
  const formatDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State for Selected Date
  const [selectedDateStr, setSelectedDateStr] = useState<string>(formatDateStr(new Date()));

  // Modals state for quick logging
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isAddAttendanceOpen, setIsAddAttendanceOpen] = useState(false);

  // Quick Form States
  const [newLogProjId, setNewLogProjId] = useState('');
  const [newLogDesc, setNewLogDesc] = useState('');
  const [newLogHours, setNewLogHours] = useState('8');
  const [newLogWeather, setNewLogWeather] = useState('Sunny / Normal');

  const [newExpProjId, setNewExpProjId] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpCat, setNewExpCat] = useState<'transport' | 'petrol' | 'food' | 'tea' | 'material_purchase' | 'labour' | 'miscellaneous'>('food');
  const [newExpDesc, setNewExpDesc] = useState('');

  const [newPayProjId, setNewPayProjId] = useState('');
  const [newPayAmount, setNewPayAmount] = useState('');
  const [newPayMethod, setNewPayMethod] = useState<'cash' | 'upi' | 'bank' | 'cheque'>('upi');
  const [newPayTxId, setNewPayTxId] = useState('');

  const [newAttProjId, setNewAttProjId] = useState('');
  const [newAttEmpId, setNewAttEmpId] = useState('');
  const [newAttStatus, setNewAttStatus] = useState<'present' | 'half_day' | 'absent'>('present');
  const [newAttHours, setNewAttHours] = useState('8');
  const [newAttAdvance, setNewAttAdvance] = useState('0');

  // Month Navigation
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatDateStr(today));
  };

  // Helper for human-readable date display
  const formatHumanDate = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // --- Selected Day Data Aggregation ---
  const dayLogs = dailyLogs.filter(l => l.date === selectedDateStr);
  const dayAttendance = attendance.filter(a => a.date === selectedDateStr);
  const dayExpenses = expenses.filter(e => e.date === selectedDateStr);
  const dayMaterials = materials.filter(m => m.purchaseDate === selectedDateStr);
  const dayPayments = payments.filter(p => p.date === selectedDateStr);
  const dayProjectsActive = projects.filter(p => p.startDate === selectedDateStr || p.expectedCompletionDate === selectedDateStr || p.actualCompletionDate === selectedDateStr);

  // Totals for selected day
  const totalDayIncome = dayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalDayExpense = dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0) + dayMaterials.reduce((sum, m) => sum + (m.totalCost || 0), 0);
  const totalWorkersPresent = dayAttendance.filter(a => a.status === 'present' || a.status === 'half_day').length;
  const totalHoursLogged = dayLogs.reduce((sum, l) => sum + (l.totalHours || 0), 0);

  // Collect unique Project IDs for the selected date
  const activeProjectIdsSet = new Set<string>();
  dayLogs.forEach(l => l.projectId && activeProjectIdsSet.add(l.projectId));
  dayAttendance.forEach(a => a.projectId && activeProjectIdsSet.add(a.projectId));
  dayExpenses.forEach(e => e.projectId && activeProjectIdsSet.add(e.projectId));
  dayMaterials.forEach(m => m.projectId && activeProjectIdsSet.add(m.projectId));
  dayPayments.forEach(p => p.projectId && activeProjectIdsSet.add(p.projectId));
  dayProjectsActive.forEach(p => activeProjectIdsSet.add(p.id));

  const activeProjectIds = Array.from(activeProjectIdsSet);

  // Check for general / unassigned items (without a valid projectId)
  const unassignedLogs = dayLogs.filter(l => !l.projectId || !projects.find(p => p.id === l.projectId));
  const unassignedAttendance = dayAttendance.filter(a => !a.projectId || !projects.find(p => p.id === a.projectId));
  const unassignedExpenses = dayExpenses.filter(e => !e.projectId || !projects.find(p => p.id === e.projectId));
  const unassignedMaterials = dayMaterials.filter(m => !m.projectId || !projects.find(p => p.id === m.projectId));
  const unassignedPayments = dayPayments.filter(p => !p.projectId || !projects.find(p => p.id === p.projectId));

  const hasUnassignedItems = unassignedLogs.length > 0 || unassignedAttendance.length > 0 || unassignedExpenses.length > 0 || unassignedMaterials.length > 0 || unassignedPayments.length > 0;

  const hasDayActivity = activeProjectIds.length > 0 || hasUnassignedItems;

  // Handlers for Quick Add Actions
  const handleSaveQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogDesc.trim()) return;
    const projId = newLogProjId || (projects[0]?.id || '');
    const newLog: DailyLog = {
      id: `log-${Date.now()}`,
      projectId: projId,
      date: selectedDateStr,
      description: newLogDesc,
      totalHours: parseFloat(newLogHours) || 8,
      weather: newLogWeather,
      ownerId: 'demo'
    };
    await saveDailyLog(newLog);
    setIsAddLogOpen(false);
    setNewLogDesc('');
  };

  const handleSaveQuickExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpAmount || parseFloat(newExpAmount) <= 0) return;
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      amount: parseFloat(newExpAmount),
      category: newExpCat,
      date: selectedDateStr,
      description: newExpDesc || `${newExpCat} expense on ${selectedDateStr}`,
      projectId: newExpProjId || undefined,
      ownerId: 'demo'
    };
    await saveExpense(newExp);
    setIsAddExpenseOpen(false);
    setNewExpAmount('');
    setNewExpDesc('');
  };

  const handleSaveQuickPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayAmount || parseFloat(newPayAmount) <= 0) return;
    const projId = newPayProjId || (projects[0]?.id || '');
    const newPay: Payment = {
      id: `pay-${Date.now()}`,
      projectId: projId,
      date: selectedDateStr,
      amount: parseFloat(newPayAmount),
      paymentMethod: newPayMethod,
      transactionId: newPayTxId || undefined,
      ownerId: 'demo'
    };
    await savePayment(newPay);
    setIsAddPaymentOpen(false);
    setNewPayAmount('');
    setNewPayTxId('');
  };

  const handleSaveQuickAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttEmpId) return;
    const projId = newAttProjId || (projects[0]?.id || '');
    const newAtt: Attendance = {
      id: `att-${Date.now()}`,
      employeeId: newAttEmpId,
      date: selectedDateStr,
      status: newAttStatus,
      workingHours: parseFloat(newAttHours) || 8,
      overtimeHours: 0,
      advancePaid: parseFloat(newAttAdvance) || 0,
      projectId: projId,
      ownerId: 'demo'
    };
    await saveAttendance(newAtt);
    setIsAddAttendanceOpen(false);
    setNewAttAdvance('0');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Calendar Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Work Calendar & Daily Schedule
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
            Date-wise work summary, attendance roster, expense logs, and project breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGoToday}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 ${
              isDark 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Today
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className={`p-2 rounded-xl border transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800'
              }`}
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm font-extrabold min-w-[130px] text-center text-slate-900 dark:text-white font-mono">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>

            <button
              onClick={handleNextMonth}
              className={`p-2 rounded-xl border transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800'
              }`}
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className={`p-4 sm:p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'}`}>
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-20 sm:h-28 p-1.5 rounded-xl bg-transparent opacity-30 pointer-events-none" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            
            // Check day activities
            const cellLogs = dailyLogs.filter(l => l.date === dateStr);
            const cellAttendance = attendance.filter(a => a.date === dateStr && (a.status === 'present' || a.status === 'half_day'));
            const cellExpenses = expenses.filter(e => e.date === dateStr);
            const cellMaterials = materials.filter(m => m.purchaseDate === dateStr);
            const cellPayments = payments.filter(p => p.date === dateStr);
            const cellProjects = projects.filter(p => p.startDate === dateStr || p.expectedCompletionDate === dateStr || p.actualCompletionDate === dateStr);

            const cellIncome = cellPayments.reduce((sum, p) => sum + p.amount, 0);
            const cellExpenseTotal = cellExpenses.reduce((sum, e) => sum + e.amount, 0) + cellMaterials.reduce((sum, m) => sum + m.totalCost, 0);

            const isToday = formatDateStr(new Date()) === dateStr;
            const isSelected = selectedDateStr === dateStr;

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`h-20 sm:h-28 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer select-none overflow-hidden ${
                  isSelected 
                    ? 'ring-2 ring-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-500 shadow-md scale-[1.02] z-10' 
                    : isToday 
                      ? 'border-amber-500 bg-amber-500/10 hover:border-amber-600' 
                      : isDark 
                        ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50' 
                        : 'bg-slate-50 border-slate-200/90 hover:border-indigo-300 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : isToday 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {dayNum}
                  </span>

                  {isSelected && (
                    <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded-full uppercase">
                      Active
                    </span>
                  )}
                </div>

                {/* Badges / Micro Indicators */}
                <div className="space-y-1 overflow-hidden mt-1">
                  {cellLogs.length > 0 && (
                    <div className="text-[9px] sm:text-[10px] font-bold px-1 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 truncate flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                      <span className="truncate">{cellLogs.reduce((acc, l) => acc + (l.totalHours || 0), 0)}h Log</span>
                    </div>
                  )}

                  {cellAttendance.length > 0 && (
                    <div className="text-[9px] sm:text-[10px] font-bold px-1 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300 truncate flex items-center gap-1">
                      <Users className="w-2.5 h-2.5 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span className="truncate">{cellAttendance.length} Workers</span>
                    </div>
                  )}

                  {cellIncome > 0 && (
                    <div className="text-[9px] sm:text-[10px] font-bold px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 truncate flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="truncate">+{currencySymbol}{cellIncome}</span>
                    </div>
                  )}

                  {cellExpenseTotal > 0 && (
                    <div className="text-[9px] sm:text-[10px] font-bold px-1 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 truncate flex items-center gap-1">
                      <DollarSign className="w-2.5 h-2.5 shrink-0 text-rose-600 dark:text-rose-400" />
                      <span className="truncate">-{currencySymbol}{cellExpenseTotal}</span>
                    </div>
                  )}

                  {cellProjects.length > 0 && cellLogs.length === 0 && cellAttendance.length === 0 && cellIncome === 0 && cellExpenseTotal === 0 && (
                    <div className="text-[9px] sm:text-[10px] font-bold px-1 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 truncate flex items-center gap-1">
                      <Briefcase className="w-2.5 h-2.5 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span className="truncate">Job Date</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SELECTED DATE DETAILED WORK BREAKDOWN PANEL */}
      {/* ============================================================== */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        {/* Banner Header for Selected Date */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                <CalendarIcon className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Selected Work Date Summary
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {formatHumanDate(selectedDateStr)}
                </h2>
              </div>
            </div>
          </div>

          {/* Action buttons for logging on selected date */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddLogOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + Work Log
            </button>
            <button
              onClick={() => setIsAddAttendanceOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              + Attendance
            </button>
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5" />
              + Expense
            </button>
            <button
              onClick={() => setIsAddPaymentOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              + Payment
            </button>
          </div>
        </div>

        {/* Selected Day Aggregation KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'}`}>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Total Work Hours</span>
            <div className="flex items-center gap-2 mt-1.5">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xl font-black text-slate-900 dark:text-white">{totalHoursLogged} Hours</span>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'}`}>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Workers Present</span>
            <div className="flex items-center gap-2 mt-1.5">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-black text-slate-900 dark:text-white">{totalWorkersPresent} Crew</span>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'}`}>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Income Received</span>
            <div className="flex items-center gap-2 mt-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{currencySymbol}{totalDayIncome.toLocaleString()}</span>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'}`}>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Day Expense</span>
            <div className="flex items-center gap-2 mt-1.5">
              <DollarSign className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span className="text-xl font-black text-rose-600 dark:text-rose-400">{currencySymbol}{totalDayExpense.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* If NO activity on this day */}
        {!hasDayActivity ? (
          <div className="p-8 my-4 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-200/80 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Is date ko koi work, attendance, expense ya payment record nahi hua hai.
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1 font-medium">
              No entries logged for {selectedDateStr}. Choose an action below to quickly record today's work, labor attendance, material expense, or payment received.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-2.5 mt-5">
              <button
                onClick={() => setIsAddLogOpen(true)}
                className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-xs"
              >
                + Add Work Description
              </button>
              <button
                onClick={() => setIsAddAttendanceOpen(true)}
                className="px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xs"
              >
                + Mark Crew Attendance
              </button>
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="px-3.5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all shadow-xs"
              >
                + Add Expense
              </button>
              <button
                onClick={() => setIsAddPaymentOpen(true)}
                className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-xs"
              >
                + Record Payment
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* PROJECT-BY-PROJECT DETAILED BREAKDOWN LIST                     */
          /* ============================================================== */
          <div className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Project-wise Activity Breakdown ({activeProjectIds.length + (hasUnassignedItems ? 1 : 0)} Parts)</span>
              </h3>
            </div>

            {/* Loop through each active project for this date */}
            {activeProjectIds.map((projId) => {
              const proj = projects.find(p => p.id === projId);

              const pLogs = dayLogs.filter(l => l.projectId === projId);
              const pAtt = dayAttendance.filter(a => a.projectId === projId);
              const pExp = dayExpenses.filter(e => e.projectId === projId);
              const pMat = dayMaterials.filter(m => m.projectId === projId);
              const pPay = dayPayments.filter(p => p.projectId === projId);

              const projDayIncome = pPay.reduce((s, p) => s + p.amount, 0);
              const projDayExpense = pExp.reduce((s, e) => s + e.amount, 0) + pMat.reduce((s, m) => s + m.totalCost, 0);
              const projWorkersCount = pAtt.filter(a => a.status === 'present' || a.status === 'half_day').length;
              const projHours = pLogs.reduce((s, l) => s + (l.totalHours || 0), 0);

              return (
                <div 
                  key={projId}
                  className={`p-5 rounded-2xl border transition-all ${
                    isDark 
                      ? 'bg-slate-950/80 border-slate-800' 
                      : 'bg-slate-50/80 border-slate-200/90 shadow-2xs'
                  }`}
                >
                  {/* Project Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <Briefcase className="w-4 h-4" />
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {proj?.name || 'Electrician Contract Job'}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 uppercase">
                          {proj?.category || 'Project'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                        {proj?.customerName && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            Customer: <strong className="text-slate-900 dark:text-white font-semibold">{proj.customerName}</strong>
                          </span>
                        )}
                        {proj?.customerPhone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            {proj.customerPhone}
                          </span>
                        )}
                        {proj?.workLocation && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            Location: {proj.workLocation}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick project stats badge */}
                    <div className="flex items-center gap-2 text-xs font-bold font-mono">
                      {projDayIncome > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          +{currencySymbol}{projDayIncome.toLocaleString()} Received
                        </span>
                      )}
                      {projDayExpense > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                          -{currencySymbol}{projDayExpense.toLocaleString()} Spent
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4 Parts Breakdown Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    
                    {/* Part 1: Work Done (क्या काम हुआ) */}
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'}`}>
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-inherit">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          Work Logs & Tasks Done ({projHours} Hours)
                        </span>
                      </div>
                      {pLogs.length === 0 ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">Is date ko is project me koi specific work log entry add nahi hui hai.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {pLogs.map((log) => (
                            <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-900 dark:text-slate-100">{log.description}</span>
                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded text-[11px]">
                                  {log.totalHours} hrs
                                </span>
                              </div>
                              {log.weather && (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                                  Weather: {log.weather}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Part 2: Workers & Attendance (कितने वर्कर आए थे) */}
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'}`}>
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-inherit">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          Workers & Field Crew ({projWorkersCount} Present)
                        </span>
                      </div>
                      {pAtt.length === 0 ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">Is date ko is project par koi worker log marked nahi hai.</p>
                      ) : (
                        <div className="space-y-2">
                          {pAtt.map((att) => {
                            const emp = employees.find(e => e.id === att.employeeId);
                            return (
                              <div key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-xs">
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-slate-100">{emp?.name || 'Electrician Worker'}</span>
                                  <span className="text-[10px] text-slate-500 block">{emp?.role || 'Electrician'} • Wage: {currencySymbol}{emp?.dailyWage || 0}/day</span>
                                </div>
                                <div className="text-right">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    att.status === 'present' 
                                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' 
                                      : att.status === 'half_day' 
                                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' 
                                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                                  }`}>
                                    {att.status.replace('_', ' ').toUpperCase()} ({att.workingHours}h)
                                  </span>
                                  {att.advancePaid > 0 && (
                                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono block mt-0.5">
                                      Adv: {currencySymbol}{att.advancePaid}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Part 3: Expenses & Materials (उस दिन कितना खर्चा हुआ) */}
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'}`}>
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-inherit">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          Project Expenses & Materials ({currencySymbol}{projDayExpense.toLocaleString()})
                        </span>
                      </div>
                      {pExp.length === 0 && pMat.length === 0 ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">Is date ko is project me koi karcha ya material buy nahi hua.</p>
                      ) : (
                        <div className="space-y-2">
                          {pExp.map((exp) => (
                            <div key={exp.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-xs">
                              <div>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{exp.description}</span>
                                <span className="text-[10px] text-slate-500 block uppercase font-mono">{exp.category}</span>
                              </div>
                              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                                -{currencySymbol}{exp.amount}
                              </span>
                            </div>
                          ))}
                          {pMat.map((mat) => (
                            <div key={mat.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-xs">
                              <div>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{mat.name} ({mat.quantity} {mat.unit})</span>
                                <span className="text-[10px] text-slate-500 block font-mono">Material Purchase • {mat.supplier || 'Store'}</span>
                              </div>
                              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                                -{currencySymbol}{mat.totalCost}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Part 4: Payments Received (उस दिन कितना पैसा आया) */}
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'}`}>
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-inherit">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Income / Client Payments ({currencySymbol}{projDayIncome.toLocaleString()})
                        </span>
                      </div>
                      {pPay.length === 0 ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">Is date ko is project se koi payment receive nahi hui.</p>
                      ) : (
                        <div className="space-y-2">
                          {pPay.map((pay) => (
                            <div key={pay.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-xs">
                              <div>
                                <span className="font-bold text-slate-900 dark:text-slate-100 uppercase font-mono">{pay.paymentMethod} Payment</span>
                                {pay.transactionId && (
                                  <span className="text-[10px] text-slate-500 block font-mono">Tx: {pay.transactionId}</span>
                                )}
                              </div>
                              <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                                +{currencySymbol}{pay.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}

            {/* Unassigned / General Overhead Items */}
            {hasUnassignedItems && (
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50/80 border-slate-200/90 shadow-2xs'}`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    General Business Expenses & Unassigned Logs
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {unassignedExpenses.length > 0 && (
                    <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'}`}>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block mb-2">General Expenses</span>
                      <div className="space-y-1.5">
                        {unassignedExpenses.map((exp) => (
                          <div key={exp.id} className="flex justify-between text-xs p-2 rounded bg-slate-50 dark:bg-slate-950">
                            <span>{exp.description}</span>
                            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">-{currencySymbol}{exp.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {unassignedPayments.length > 0 && (
                    <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'}`}>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block mb-2">General Income</span>
                      <div className="space-y-1.5">
                        {unassignedPayments.map((pay) => (
                          <div key={pay.id} className="flex justify-between text-xs p-2 rounded bg-slate-50 dark:bg-slate-950">
                            <span>{pay.paymentMethod.toUpperCase()} Payment</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+{currencySymbol}{pay.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODALS FOR QUICK LOGGING FROM CALENDAR                         */}
      {/* ============================================================== */}

      {/* Quick Work Log Modal */}
      {isAddLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} shadow-xl`}>
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Add Daily Work Log ({selectedDateStr})
              </h3>
              <button onClick={() => setIsAddLogOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickLog} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold block mb-1">Select Project</label>
                <select
                  value={newLogProjId}
                  onChange={(e) => setNewLogProjId(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.customerName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Work Done Description *</label>
                <textarea
                  required
                  rows={3}
                  value={newLogDesc}
                  onChange={(e) => setNewLogDesc(e.target.value)}
                  placeholder="e.g. Main DB panel wiring and conduit pipe fitting completed..."
                  className={`w-full p-2.5 text-xs rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Hours Spent</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newLogHours}
                    onChange={(e) => setNewLogHours(e.target.value)}
                    className={`w-full p-2.5 text-xs rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Site Weather</label>
                  <input
                    type="text"
                    value={newLogWeather}
                    onChange={(e) => setNewLogWeather(e.target.value)}
                    className={`w-full p-2.5 text-xs rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => setIsAddLogOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Save Work Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} shadow-xl`}>
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <h3 className="text-base font-bold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-rose-500" />
                Record Daily Expense ({selectedDateStr})
              </h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickExpense} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold block mb-1">Project (Optional)</label>
                <select
                  value={newExpProjId}
                  onChange={(e) => setNewExpProjId(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                >
                  <option value="">-- General / Non-project Overhead --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Amount ({currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    value={newExpAmount}
                    onChange={(e) => setNewExpAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full p-2.5 text-xs rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Category</label>
                  <select
                    value={newExpCat}
                    onChange={(e) => setNewExpCat(e.target.value as any)}
                    className={`w-full p-2.5 text-xs rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                  >
                    <option value="food">Food & Snacks</option>
                    <option value="tea">Tea / Beverage</option>
                    <option value="petrol">Petrol / Fuel</option>
                    <option value="transport">Transport / Logistics</option>
                    <option value="material_purchase">Material Purchase</option>
                    <option value="labour">Daily Labor Cash</option>
                    <option value="miscellaneous">Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Description / Note</label>
                <input
                  type="text"
                  value={newExpDesc}
                  onChange={(e) => setNewExpDesc(e.target.value)}
                  placeholder="e.g. Lunch for 3 wiremen at site..."
                  className={`w-full p-2.5 text-xs rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Payment Modal */}
      {isAddPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} shadow-xl`}>
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <h3 className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Record Received Payment ({selectedDateStr})
              </h3>
              <button onClick={() => setIsAddPaymentOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickPayment} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold block mb-1">Select Project *</label>
                <select
                  value={newPayProjId}
                  onChange={(e) => setNewPayProjId(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.customerName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Amount Received ({currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    value={newPayAmount}
                    onChange={(e) => setNewPayAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full p-2.5 text-xs rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Method</label>
                  <select
                    value={newPayMethod}
                    onChange={(e) => setNewPayMethod(e.target.value as any)}
                    className={`w-full p-2.5 text-xs rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                  >
                    <option value="upi">UPI / Online</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Transaction Ref / Note</label>
                <input
                  type="text"
                  value={newPayTxId}
                  onChange={(e) => setNewPayTxId(e.target.value)}
                  placeholder="e.g. UPI Ref / Google Pay ID / Cash Receipt..."
                  className={`w-full p-2.5 text-xs rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Attendance Modal */}
      {isAddAttendanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} shadow-xl`}>
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Mark Crew Attendance ({selectedDateStr})
              </h3>
              <button onClick={() => setIsAddAttendanceOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickAttendance} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold block mb-1">Select Employee / Worker *</label>
                <select
                  required
                  value={newAttEmpId}
                  onChange={(e) => setNewAttEmpId(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                >
                  <option value="">-- Choose Worker --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role || 'Electrician'}) - {currencySymbol}{emp.dailyWage}/day</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Select Project *</label>
                <select
                  value={newAttProjId}
                  onChange={(e) => setNewAttProjId(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Status</label>
                  <select
                    value={newAttStatus}
                    onChange={(e) => setNewAttStatus(e.target.value as any)}
                    className={`w-full p-2.5 text-xs rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                  >
                    <option value="present">Present (Full Day)</option>
                    <option value="half_day">Half Day</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Advance Cash Paid ({currencySymbol})</label>
                  <input
                    type="number"
                    value={newAttAdvance}
                    onChange={(e) => setNewAttAdvance(e.target.value)}
                    className={`w-full p-2.5 text-xs rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => setIsAddAttendanceOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
