import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { Payment } from '../../database/types';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Calendar, 
  Edit, 
  Trash, 
  X,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowUpRight,
  CreditCard
} from 'lucide-react';

export const Payments: React.FC = () => {
  const { payments, projects, savePayment, deletePayment, settings } = useDb();

  const isDark = settings?.theme === 'dark';
  const currencySymbol = settings?.currency === 'INR' ? '₹' : settings?.currency === 'EUR' ? '€' : '$';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('all');

  // Modal / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  // Form Fields
  const [projId, setProjId] = useState('');
  const [payDate, setPayDate] = useState('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<Payment['paymentMethod']>('upi');
  const [txnId, setTxnId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');

  // Calculations
  const totalReceivedValue = payments.reduce((sum, p) => sum + p.amount, 0);

  const openAddPayment = () => {
    setEditingPayment(null);
    setProjId(projects[0]?.id || '');
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayAmount(0);
    setPayMethod('upi');
    setTxnId('');
    setScreenshotUrl('');
    setIsFormOpen(true);
  };

  const openEditPayment = (p: Payment) => {
    setEditingPayment(p);
    setProjId(p.projectId);
    setPayDate(p.date);
    setPayAmount(p.amount);
    setPayMethod(p.paymentMethod);
    setTxnId(p.transactionId || '');
    setScreenshotUrl(p.screenshotUrl || '');
    setIsFormOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projId || !payAmount || !payDate) return;

    const data: Payment = {
      id: editingPayment ? editingPayment.id : 'pay_' + Math.random().toString(36).substr(2, 9),
      projectId: projId,
      date: payDate,
      amount: Number(payAmount),
      paymentMethod: payMethod,
      transactionId: txnId || undefined,
      screenshotUrl: screenshotUrl || undefined,
      ownerId: 'demo'
    };

    await savePayment(data);
    setIsFormOpen(false);
  };

  const handleDeletePayment = async (id: string) => {
    if (window.confirm("Delete this customer payment receipt? This will revert the project's paid balance.")) {
      await deletePayment(id);
    }
  };

  // Filters
  const filteredPayments = payments.filter(p => {
    const proj = projects.find(x => x.id === p.projectId);
    const matchesProject = filterProject === 'all' || p.projectId === filterProject;
    const matchesSearch = (proj?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.transactionId || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesSearch;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 animate-fade-in">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payments Ledger</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Record client advances, milestones payouts, and track residual project balances.
          </p>
        </div>
        <div className="shrink-0">
          <button
            onClick={openAddPayment}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Payment Receipt
          </button>
        </div>
      </div>

      {/* Totals aggregate display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex items-center justify-between`}>
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">TOTAL CUSTOMER INCOME CLEARED</span>
            <span className="text-2xl font-black text-emerald-500">{currencySymbol}{totalReceivedValue.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex items-center justify-between`}>
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">TOTAL OUTSTANDING CLIENT DEBT</span>
            {(() => {
              const totalContractVal = projects.reduce((sum, p) => sum + p.contractAmount, 0);
              const outstanding = Math.max(0, totalContractVal - totalReceivedValue);
              return <span className="text-2xl font-black text-amber-500">{currencySymbol}{outstanding.toLocaleString()}</span>;
            })()}
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'} flex flex-col md:flex-row gap-4 items-center justify-between`}>
        {/* Search */}
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search transaction ID or project name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Project filter */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          <span className="text-xs text-slate-400 font-semibold font-mono">PROJECT FILT:</span>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Payments log table */}
      <div className={`border rounded-2xl overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-inherit font-mono text-slate-400 font-bold">
                <th className="p-4">Cleared Date</th>
                <th className="p-4">Attributed Project</th>
                <th className="p-4">Method</th>
                <th className="p-4">Transaction Reference</th>
                <th className="p-4 text-right">Received Amount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No customer payments found in the ledger.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const proj = projects.find(x => x.id === p.projectId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-500">{p.date}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 dark:text-white block leading-snug">{proj?.name || 'Unlinked Project'}</span>
                        <span className="text-[10px] text-slate-400 block font-sans">Client: {proj?.customerName}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded uppercase font-bold text-[9px] font-mono text-slate-400">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-500 text-[11px] font-semibold">
                        {p.transactionId || '—'}
                      </td>
                      <td className="p-4 text-right font-black text-emerald-500 font-mono">
                        {currencySymbol}{p.amount.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditPayment(p)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(p.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIALOG MODAL: Log Payment */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'} max-h-[90vh] overflow-y-auto`}>
            
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingPayment ? 'Edit Received Receipt' : 'Record Customer Payment'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
              
              {/* Project Selection */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">LINK TO PROJECT CONTRACT *</label>
                <select
                  required
                  value={projId}
                  onChange={(e) => setProjId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="" disabled>Choose target project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Value: {currencySymbol}{p.contractAmount})</option>
                  ))}
                </select>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">RECEIVED SUM AMOUNT ({currencySymbol}) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Transaction Date */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">CLEARANCE DATE *</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Method */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">PAYMENT CHANNEL *</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="upi">UPI (GPay/PhonePe)</option>
                    <option value="bank">Bank Wire Transfer</option>
                    <option value="cash">Hard Cash</option>
                    <option value="cheque">Cheque Deposit</option>
                  </select>
                </div>
              </div>

              {/* Ref ID */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">TRANSACTION ID / CHEQUE NUMBER</label>
                <input
                  type="text"
                  placeholder="e.g. TXN9128371923"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Screenshot url */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">SCREENSHOT / ATTACH RECEIPT URL</label>
                <input
                  type="text"
                  placeholder="https://drive.com/screenshot.jpg"
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {editingPayment ? 'Apply Receipt Edits' : 'Commit Payment Receipt'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
