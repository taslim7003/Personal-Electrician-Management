import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  TrendingUp, 
  Briefcase, 
  DollarSign, 
  CheckCircle,
  FileSpreadsheet,
  X
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { projects, materials, expenses, payments, attendance, employees, settings } = useDb();

  const isDark = settings?.theme === 'dark';
  const currencySymbol = settings?.currency === 'INR' ? '₹' : settings?.currency === 'EUR' ? '€' : '$';

  // State
  const [reportYear, setReportYear] = useState('2026');
  const [reportMonth, setReportMonth] = useState('07'); // Default to July

  // Get project count under scope
  const activeProjects = projects.filter(p => p.startDate.startsWith(`${reportYear}-${reportMonth}`));
  const finishedProjects = activeProjects.filter(p => p.status === 'completed');

  // Sum cash flow details
  const totalInvoiced = activeProjects.reduce((sum, p) => sum + p.contractAmount, 0);

  const materialsCost = materials
    .filter(m => m.purchaseDate.startsWith(`${reportYear}-${reportMonth}`))
    .reduce((sum, m) => sum + m.totalCost, 0);

  const generalExpenses = expenses
    .filter(ex => ex.date.startsWith(`${reportYear}-${reportMonth}`) && ex.category !== 'material_purchase')
    .reduce((sum, ex) => sum + ex.amount, 0);

  // Sum attendance crew labour cost
  const totalLabourWages = attendance
    .filter(att => att.date.startsWith(`${reportYear}-${reportMonth}`))
    .reduce((sum, att) => {
      const emp = employees.find(e => e.id === att.employeeId);
      if (!emp) return sum;
      let base = 0;
      if (att.status === 'present') {
        base = emp.dailyWage;
      } else if (att.status === 'half_day') {
        base = emp.dailyWage * 0.5;
      }
      const overtime = att.overtimeHours * (emp.dailyWage / 8);
      return sum + base + overtime;
    }, 0);

  const totalCostOverhead = materialsCost + generalExpenses + totalLabourWages;
  const netEarnings = totalInvoiced - totalCostOverhead;

  // Invoice / Billing tool state (Quick Invoice Generator inside Reports)
  const [isInvoiceGeneratorOpen, setIsInvoiceGeneratorOpen] = useState(false);
  const [invProjId, setInvProjId] = useState('');
  const [invNo, setInvNo] = useState('INV-2026-001');
  const [invDate, setInvDate] = useState('2026-07-16');
  const [discount, setDiscount] = useState(0);

  const selectedProjForInvoice = projects.find(p => p.id === invProjId);
  const receivedPaymentSum = payments.filter(p => p.projectId === invProjId).reduce((sum, p) => sum + p.amount, 0);

  // Print operational sheets
  const handlePrint = () => {
    window.print();
  };

  // Export CSV Sheet
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Financial Audit Report for Month: " + reportMonth + "/" + reportYear + "\r\n";
    csvContent += "Metric,Amount\r\n";
    csvContent += `Total Contracts Value,${totalInvoiced}\r\n`;
    csvContent += `Material Procurement Cost,${materialsCost}\r\n`;
    csvContent += `Crew Labour Wage Overhead,${totalLabourWages}\r\n`;
    csvContent += `Other Operational Expenses,${generalExpenses}\r\n`;
    csvContent += `Net Earnings,${netEarnings}\r\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `electrician_report_${reportMonth}_${reportYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 animate-fade-in print:p-0 print:bg-white print:text-slate-900">
      
      {/* Header section (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Reports</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Export monthly business ledger spreadsheets, calculate profits, and compile project tax invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setInvProjId(projects[0]?.id || '');
              setIsInvoiceGeneratorOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            Invoice Builder
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Ledger
          </button>
        </div>
      </div>

      {/* Date Selectors (Hidden on print) */}
      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'} flex flex-wrap gap-4 items-center print:hidden`}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold font-mono">AUDIT YEAR:</span>
          <select
            value={reportYear}
            onChange={(e) => setReportYear(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950/65 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
          >
            <option value="2026">2026 Financial Year</option>
            <option value="2025">2025 Financial Year</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold font-mono">AUDIT MONTH:</span>
          <select
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950/65 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
          >
            <option value="07">July</option>
            <option value="06">June</option>
            <option value="05">May</option>
            <option value="04">April</option>
            <option value="03">March</option>
            <option value="02">February</option>
            <option value="01">January</option>
          </select>
        </div>
      </div>

      {/* Printable Sheet Area */}
      <div className={`p-6 md:p-8 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200'} shadow-sm space-y-8 print:border-none print:shadow-none print:p-0 print:text-black`}>
        {/* Document header banner */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight">{settings?.businessName || 'SparkLine Electricians'}</h3>
            <span className="text-[10px] font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">OPERATIONAL TAX LEDGER</span>
            <span className="text-xs text-slate-400 font-mono block">SCOPE PERIOD: {reportMonth}/{reportYear}</span>
          </div>
          <div className="text-right font-mono text-xs text-slate-400 space-y-0.5">
            <span className="block font-bold">OWNER: {settings?.ownerName || 'Electrician Head'}</span>
            <span className="block">GST REG: {settings?.gstNumber || 'GST-UNREGISTERED'}</span>
          </div>
        </div>

        {/* Aggregate Boxes inside report */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border dark:border-slate-850/60 font-mono">
            <span className="text-[9px] text-slate-400 block font-bold">PORTFOLIO CONTRACTS</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100 mt-1 block">{activeProjects.length} Projects</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border dark:border-slate-850/60 font-mono">
            <span className="text-[9px] text-slate-400 block font-bold">COMPLETED PROJECTS</span>
            <span className="text-sm font-black text-emerald-500 mt-1 block">{finishedProjects.length} Done</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border dark:border-slate-850/60 font-mono">
            <span className="text-[9px] text-slate-400 block font-bold">PROCUREMENT COST</span>
            <span className="text-sm font-black text-rose-500 mt-1 block">{currencySymbol}{materialsCost.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border dark:border-slate-850/60 font-mono">
            <span className="text-[9px] text-slate-400 block font-bold">CREW WAGES</span>
            <span className="text-sm font-black text-rose-500 mt-1 block">{currencySymbol}{totalLabourWages.toLocaleString()}</span>
          </div>
        </div>

        {/* Detailed Breakdown ledger */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold tracking-tight pb-1.5 border-b border-slate-100 dark:border-slate-800/60">Ledger Statement Summary</h4>
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-dashed dark:border-slate-800">
              <span className="font-semibold">Gross Contract Revenues (A)</span>
              <span className="font-bold font-mono">{currencySymbol}{totalInvoiced.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-dashed dark:border-slate-800 text-rose-500">
              <span>- Materials & Supplies procurements (B)</span>
              <span className="font-bold font-mono">{currencySymbol}{materialsCost.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-dashed dark:border-slate-800 text-rose-500">
              <span>- Crew wages on-site (C)</span>
              <span className="font-bold font-mono">{currencySymbol}{totalLabourWages.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-dashed dark:border-slate-800 text-rose-500">
              <span>- Operational expenses & vehicle fuel (D)</span>
              <span className="font-bold font-mono">{currencySymbol}{generalExpenses.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm font-black border-t border-solid border-slate-200 dark:border-slate-700 mt-4">
              <span className="text-slate-900 dark:text-white">NET OPERATING PROFITS (A - B - C - D)</span>
              <span className={netEarnings >= 0 ? 'text-emerald-500 font-mono' : 'text-rose-500 font-mono'}>
                {currencySymbol}{netEarnings.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Signatures placeholder */}
        <div className="pt-12 hidden print:flex justify-between items-center text-xs font-semibold">
          <div className="border-t border-slate-400 w-44 text-center pt-2">
            Business Owner Signature
          </div>
          <div className="border-t border-slate-400 w-44 text-center pt-2">
            Date of Audit Signing
          </div>
        </div>
      </div>

      {/* MODAL / SUB-VIEW: INVOICE BUILDER & VIEWER */}
      {isInvoiceGeneratorOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'} max-h-[90vh] overflow-y-auto`}>
            
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Electrical Tax Invoice Builder
              </h3>
              <button 
                onClick={() => setIsInvoiceGeneratorOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              {/* Form entries */}
              <div className="space-y-4 md:col-span-1 border-r border-slate-100 dark:border-slate-800/40 pr-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">SELECT PROJECT CONTRACT</label>
                  <select
                    value={invProjId}
                    onChange={(e) => setInvProjId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">INVOICE SERIAL NO.</label>
                  <input
                    type="text"
                    value={invNo}
                    onChange={(e) => setInvNo(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-lg font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">INVOICE BILLING DATE</label>
                  <input
                    type="date"
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-lg font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">DISCOUNT VALUE ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-lg font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                 <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Print Tax Invoice
                </button>
              </div>

              {/* Real-time Invoice design card */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border dark:border-slate-850/60 space-y-6 flex flex-col justify-between max-h-[60vh] overflow-y-auto">
                {selectedProjForInvoice ? (
                  <>
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-sm">{settings?.businessName || 'SparkLine Electricians'}</h4>
                        <span className="text-[9px] text-slate-400 block font-mono">{settings?.ownerEmail}</span>
                      </div>
                      <div className="text-right font-mono text-[10px] text-slate-400">
                        <span className="font-bold block text-slate-200">TAX INVOICE</span>
                        <span className="block">{invNo}</span>
                        <span className="block">Date: {invDate}</span>
                      </div>
                    </div>

                    {/* Bill To */}
                    <div className="border-t border-slate-200 dark:border-slate-800/80 pt-3">
                      <span className="text-[9px] text-slate-400 font-bold font-mono uppercase">BILL TO CLIENT:</span>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedProjForInvoice.customerName}</p>
                      {selectedProjForInvoice.customerPhone && <span className="text-[10px] text-slate-500 block">Phone: {selectedProjForInvoice.customerPhone}</span>}
                      {selectedProjForInvoice.customerAddress && <span className="text-[10px] text-slate-500 block">Addr: {selectedProjForInvoice.customerAddress}</span>}
                    </div>

                    {/* Scope list table */}
                    <div className="border-t border-slate-200 dark:border-slate-800/80 pt-3 text-[11px]">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-slate-400 font-bold font-mono">
                            <th>Scope Item / Contract Description</th>
                            <th className="text-right">Total sum</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b dark:border-slate-800/30">
                            <td className="py-2">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedProjForInvoice.name}</span>
                              <span className="text-[9px] text-slate-400 block italic">Electrical wiring installation & testing scope</span>
                            </td>
                            <td className="text-right font-bold font-mono">{currencySymbol}{selectedProjForInvoice.contractAmount.toLocaleString()}</td>
                          </tr>
                          {discount > 0 && (
                            <tr className="text-rose-500">
                              <td className="py-2">Client loyalty discount</td>
                              <td className="text-right font-bold font-mono">-{currencySymbol}{discount.toLocaleString()}</td>
                            </tr>
                          )}
                          <tr className="font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800">
                            <td className="py-2">Net Invoice Payable</td>
                            <td className="text-right font-mono">{currencySymbol}{(selectedProjForInvoice.contractAmount - discount).toLocaleString()}</td>
                          </tr>
                          <tr className="text-[10px] text-emerald-500">
                            <td className="py-1">Payments cleared to date</td>
                            <td className="text-right font-bold font-mono">-{currencySymbol}{receivedPaymentSum.toLocaleString()}</td>
                          </tr>
                          <tr className="font-bold text-indigo-600 dark:text-indigo-400 border-t border-dashed dark:border-slate-800">
                            <td className="py-2">Balance Outstanding Client Due</td>
                            <td className="text-right font-mono">{currencySymbol}{Math.max(0, selectedProjForInvoice.contractAmount - discount - receivedPaymentSum).toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="text-[9px] text-center text-slate-500 italic mt-4">
                      Thank you for choosing SparkLine. Quality electrical contracts since 2018.
                    </p>
                  </>
                ) : (
                  <p className="text-center py-8 text-slate-500">Select an active contract to preview tax invoice.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
