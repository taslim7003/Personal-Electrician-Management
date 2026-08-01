import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { Material, Expense } from '../database/types';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Wrench, 
  Calendar, 
  FileText, 
  Edit, 
  Trash, 
  X,
  FileSpreadsheet,
  Layers,
  ArrowDownRight
} from 'lucide-react';

export const ExpensesMaterials: React.FC = () => {
  const { 
    expenses, 
    materials, 
    projects, 
    saveExpense, 
    deleteExpense, 
    saveMaterial, 
    deleteMaterial, 
    settings 
  } = useDb();

  const isDark = settings?.theme === 'dark';
  const currencySymbol = settings?.currency === 'INR' ? '₹' : settings?.currency === 'EUR' ? '€' : '$';

  // State
  const [activeTab, setActiveTab] = useState<'materials' | 'expenses'>('materials');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('all');

  // Modal / Form States
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isMaterialOpen, setIsMaterialOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Expense Form fields
  const [exAmount, setExAmount] = useState<number>(0);
  const [exCategory, setExCategory] = useState<Expense['category']>('petrol');
  const [exDate, setExDate] = useState('');
  const [exDesc, setExDesc] = useState('');
  const [exProjId, setExProjId] = useState('');
  const [exBillUrl, setExBillUrl] = useState('');

  // Material Form fields
  const [matName, setMatName] = useState('');
  const [matBrand, setMatBrand] = useState('');
  const [matCategory, setMatCategory] = useState<Material['category']>('wire');
  const [matQty, setMatQty] = useState<number>(1);
  const [matUnit, setMatUnit] = useState('Pcs');
  const [matRate, setMatRate] = useState<number>(0);
  const [matGst, setMatGst] = useState<number>(18); // Default 18% GST in many electrician parts
  const [matSupplier, setMatSupplier] = useState('');
  const [matDate, setMatDate] = useState('');
  const [matProjId, setMatProjId] = useState('');
  const [matBillUrl, setMatBillUrl] = useState('');

  // --- CALCULATORS ENGINE ---

  // Helper ranges sums
  const sumExpensesRange = (filterFn: (ex: Expense) => boolean) => {
    return expenses.filter(filterFn).reduce((sum, ex) => sum + ex.amount, 0);
  };
  const sumMaterialsRange = (filterFn: (m: Material) => boolean) => {
    return materials.filter(filterFn).reduce((sum, m) => sum + m.totalCost, 0);
  };

  const todayDateStr = '2026-07-16';

  // Daily Sum
  const dailyOutlay = sumExpensesRange(ex => ex.date === todayDateStr) + sumMaterialsRange(m => m.purchaseDate === todayDateStr);
  // Monthly (July) Sum
  const monthlyOutlay = sumExpensesRange(ex => ex.date.startsWith('2026-07')) + sumMaterialsRange(m => m.purchaseDate.startsWith('2026-07'));
  // Yearly (2026) Sum
  const yearlyOutlay = sumExpensesRange(ex => ex.date.startsWith('2026')) + sumMaterialsRange(m => m.purchaseDate.startsWith('2026'));

  // Open Expense Modal
  const openAddExpense = () => {
    setEditingExpense(null);
    setExAmount(0);
    setExCategory('petrol');
    setExDate(new Date().toISOString().split('T')[0]);
    setExDesc('');
    setExProjId(projects[0]?.id || '');
    setExBillUrl('');
    setIsExpenseOpen(true);
  };

  const openEditExpense = (ex: Expense) => {
    setEditingExpense(ex);
    setExAmount(ex.amount);
    setExCategory(ex.category);
    setExDate(ex.date);
    setExDesc(ex.description);
    setExProjId(ex.projectId || '');
    setExBillUrl(ex.billUrl || '');
    setIsExpenseOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exAmount || !exDesc || !exDate) return;

    const data: Expense = {
      id: editingExpense ? editingExpense.id : 'ex_' + Math.random().toString(36).substr(2, 9),
      amount: Number(exAmount),
      category: exCategory,
      date: exDate,
      description: exDesc,
      projectId: exProjId || undefined,
      billUrl: exBillUrl || undefined,
      ownerId: 'demo'
    };

    await saveExpense(data);
    setIsExpenseOpen(false);
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm("Delete this expense record?")) {
      await deleteExpense(id);
    }
  };

  // Open Material Modal
  const openAddMaterial = () => {
    setEditingMaterial(null);
    setMatName('');
    setMatBrand('');
    setMatCategory('wire');
    setMatQty(1);
    setMatUnit('Coils');
    setMatRate(0);
    setMatGst(18);
    setMatSupplier('');
    setMatDate(new Date().toISOString().split('T')[0]);
    setMatProjId(projects[0]?.id || '');
    setMatBillUrl('');
    setIsMaterialOpen(true);
  };

  const openEditMaterial = (m: Material) => {
    setEditingMaterial(m);
    setMatName(m.name);
    setMatBrand(m.brand || '');
    setMatCategory(m.category);
    setMatQty(m.quantity);
    setMatUnit(m.unit);
    setMatRate(m.rate);
    setMatGst(m.gst || 0);
    setMatSupplier(m.supplier || '');
    setMatDate(m.purchaseDate);
    setMatProjId(m.projectId);
    setMatBillUrl(m.billUrl || '');
    setIsMaterialOpen(true);
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matName || !matQty || !matRate || !matDate || !matProjId) return;

    // total cost calculated with optional GST: Rate * Qty * (1 + GST/100)
    const baseCost = matQty * matRate;
    const gstCost = baseCost * (matGst / 100);
    const calculatedTotalCost = Number((baseCost + gstCost).toFixed(2));

    const data: Material = {
      id: editingMaterial ? editingMaterial.id : 'mat_' + Math.random().toString(36).substr(2, 9),
      name: matName,
      brand: matBrand || undefined,
      category: matCategory,
      quantity: Number(matQty),
      unit: matUnit,
      rate: Number(matRate),
      gst: Number(matGst),
      totalCost: calculatedTotalCost,
      supplier: matSupplier || undefined,
      purchaseDate: matDate,
      projectId: matProjId,
      billUrl: matBillUrl || undefined,
      ownerId: 'demo'
    };

    await saveMaterial(data);

    // Also automatically log as a general expense so it appears in the cashflow journal!
    const matchingExpense: Expense = {
      id: editingMaterial ? `ex_mat_${editingMaterial.id}` : `ex_mat_${data.id}`,
      amount: calculatedTotalCost,
      category: 'material_purchase',
      date: matDate,
      description: `Procured: ${matQty} ${matUnit} of ${matName} (${matCategory})`,
      projectId: matProjId,
      billUrl: matBillUrl || undefined,
      ownerId: 'demo'
    };
    await saveExpense(matchingExpense);

    setIsMaterialOpen(false);
  };

  const handleDeleteMaterial = async (m: Material) => {
    if (window.confirm("Delete this material item ledger? Note that the linked expense record will also be detached.")) {
      await deleteMaterial(m.id);
      // delete matching expense as well
      await deleteExpense(`ex_mat_${m.id}`);
    }
  };

  // Filters
  const filteredMaterials = materials.filter(m => {
    const matchesProject = filterProject === 'all' || m.projectId === filterProject;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (m.supplier || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesSearch;
  }).sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

  const filteredExpenses = expenses.filter(ex => {
    const matchesProject = filterProject === 'all' || ex.projectId === filterProject;
    const matchesSearch = ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesSearch;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 animate-fade-in">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses & Procurements</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log material purchases, fuel, food, and tool costs, with automatic cashflow synchronization.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'materials' ? (
            <button
              onClick={openAddMaterial}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Material Purchase
            </button>
          ) : (
            <button
              onClick={openAddExpense}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Record Outlay / Expense
            </button>
          )}
        </div>
      </div>

      {/* Aggregate metrics (Outlays) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-150'} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">TODAY'S OUTLAY (JUL 16)</span>
            <span className="text-lg font-black text-rose-500">{currencySymbol}{dailyOutlay.toLocaleString()}</span>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
            <ArrowDownRight className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-150'} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">MONTHLY OUTLAY (JULY)</span>
            <span className="text-lg font-black text-rose-500">{currencySymbol}{monthlyOutlay.toLocaleString()}</span>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
            <ArrowDownRight className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-150'} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">YEARLY OUTLAY (2026)</span>
            <span className="text-lg font-black text-rose-500">{currencySymbol}{yearlyOutlay.toLocaleString()}</span>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
            <ArrowDownRight className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Filter and tab bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800 gap-4">
        <div className="flex w-full sm:w-auto">
          <button
            onClick={() => { setActiveTab('materials'); setSearchQuery(''); }}
            className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'materials' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Material Ledger
          </button>
          <button
            onClick={() => { setActiveTab('expenses'); setSearchQuery(''); }}
            className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'expenses' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Operational Outlays (General Expense Journal)
          </button>
        </div>

        {/* Global Filter fields */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end pb-2 sm:pb-0">
          <input
            type="text"
            placeholder="Search items, categories, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
          />
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB 1: MATERIALS */}
      {activeTab === 'materials' && (
        <div className={`border rounded-2xl overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-inherit font-mono text-slate-400 font-bold">
                  <th className="p-4">Material Details</th>
                  <th className="p-4">Supplier</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-center">Qty / Volume</th>
                  <th className="p-4 text-right">Unit Rate</th>
                  <th className="p-4 text-center">Tax / GST</th>
                  <th className="p-4 text-right">Total Cost</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No material procurements found.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((m) => {
                    const proj = projects.find(p => p.id === m.projectId);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-slate-900 dark:text-white block">{m.name}</span>
                          {m.brand && <span className="text-[10px] text-slate-400 block font-semibold">{m.brand} • Brand</span>}
                          <span className="text-[10px] text-amber-500 font-mono block truncate max-w-[150px]">{proj?.name || 'General Project'}</span>
                        </td>
                        <td className="p-4 font-sans text-slate-500">{m.supplier || 'Cash counter purchase'}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded uppercase font-bold text-[9px] text-slate-400 font-mono">
                            {m.category}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold font-mono">{m.quantity} {m.unit}</td>
                        <td className="p-4 text-right font-semibold font-mono">{currencySymbol}{m.rate.toLocaleString()}</td>
                        <td className="p-4 text-center font-semibold font-mono">{m.gst || 0}%</td>
                        <td className="p-4 text-right font-black text-slate-800 dark:text-slate-100 font-mono">
                          {currencySymbol}{m.totalCost.toLocaleString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditMaterial(m)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-amber-500 transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMaterial(m)}
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
      )}

      {/* TAB 2: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className={`border rounded-2xl overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-inherit font-mono text-slate-400 font-bold">
                  <th className="p-4">Expense Date</th>
                  <th className="p-4">Description / Ledger Note</th>
                  <th className="p-4">Allocated Project</th>
                  <th className="p-4">Expense Category</th>
                  <th className="p-4 text-right">Outlay Amount</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No operational expenses recorded.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((ex) => {
                    const proj = projects.find(p => p.id === ex.projectId);
                    return (
                      <tr key={ex.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="p-4 font-mono text-slate-500 font-bold">{ex.date}</td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-900 dark:text-white leading-relaxed">{ex.description}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] text-slate-400 block truncate max-w-[150px] font-semibold">
                            {proj?.name || 'General Overheads'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded uppercase font-bold text-[9px] font-mono">
                            {ex.category}
                          </span>
                        </td>
                        <td className="p-4 text-right font-black text-rose-500 font-mono">
                          {currencySymbol}{ex.amount.toLocaleString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditExpense(ex)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-amber-500 transition-colors cursor-pointer"
                              disabled={ex.id.startsWith('ex_mat_')} // material expense auto-sync can only edit from material ledger!
                              title={ex.id.startsWith('ex_mat_') ? "Locked: Edit through Material tab" : "Edit outlay"}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(ex.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                              disabled={ex.id.startsWith('ex_mat_')}
                              title={ex.id.startsWith('ex_mat_') ? "Locked: Delete through Material tab" : "Delete outlay"}
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
      )}

      {/* MODAL FORM: Material ledger */}
      {isMaterialOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'} max-h-[90vh] overflow-y-auto`}>
            
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingMaterial ? 'Update Procurement Ledger' : 'Log Material Procurement'}
              </h3>
              <button 
                onClick={() => setIsMaterialOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Material Name */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-bold mb-1">MATERIAL PURCHASE NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Copper Wire FR 2.5sqmm"
                    value={matName}
                    onChange={(e) => setMatName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                {/* Brand and category */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">BRAND / MANUFACTURER</label>
                  <input
                    type="text"
                    placeholder="e.g. Finolex, Havells"
                    value={matBrand}
                    onChange={(e) => setMatBrand(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">PART CATEGORY *</label>
                  <select
                    value={matCategory}
                    onChange={(e) => setMatCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="wire">Wires & Cabling</option>
                    <option value="mcb">MCB & Switchgears</option>
                    <option value="switch">Modular Switches</option>
                    <option value="socket">Power Sockets</option>
                    <option value="conduit_pipe">Conduit PVC Pipes</option>
                    <option value="pvc_pipe">PVC Piping Fittings</option>
                    <option value="panel">Main Distribution Boards</option>
                    <option value="lights">LED Lights & Panels</option>
                    <option value="fan">Exhaust & Ceiling Fans</option>
                    <option value="tools">Power & Hand Tools</option>
                    <option value="safety_equipment">Safety & Helmets</option>
                    <option value="others">Other electrical elements</option>
                  </select>
                </div>

                {/* Quantities & units */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">QUANTITY *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={matQty}
                    onChange={(e) => setMatQty(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-semibold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">UNIT SYMBOL</label>
                  <input
                    type="text"
                    placeholder="e.g. Coils, Pcs, Mtr"
                    value={matUnit}
                    onChange={(e) => setMatUnit(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-semibold"
                  />
                </div>

                {/* Rates & GSTs */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">UNIT RATE ({currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={matRate}
                    onChange={(e) => setMatRate(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">TAXES / GST %</label>
                  <input
                    type="number"
                    min="0"
                    value={matGst}
                    onChange={(e) => setMatGst(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-bold font-mono"
                  />
                </div>

                {/* Supplier name */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-bold mb-1">DISTRIBUTOR / SUPPLIER</label>
                  <input
                    type="text"
                    placeholder="e.g. Metro Electrical Wholesalers Ltd"
                    value={matSupplier}
                    onChange={(e) => setMatSupplier(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                {/* Link project */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-bold mb-1">ALLOCATE TO CONTRACT PROJECT *</label>
                  <select
                    required
                    value={matProjId}
                    onChange={(e) => setMatProjId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="" disabled>Choose target project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Procurement date */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">PROCUREMENT DATE *</label>
                  <input
                    type="date"
                    required
                    value={matDate}
                    onChange={(e) => setMatDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm font-mono"
                  />
                </div>

                {/* Bill upload URL */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">BILL INVOICE ATTACH URL</label>
                  <input
                    type="text"
                    placeholder="https://gdrive.com/invoice..."
                    value={matBillUrl}
                    onChange={(e) => setMatBillUrl(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {editingMaterial ? 'Update Material Details' : 'Record Procurement & Bill'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FORM: General Outlay / Expense */}
      {isExpenseOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'} max-h-[90vh] overflow-y-auto`}>
            
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingExpense ? 'Modify Outlay Journal' : 'Record General Business Expense'}
              </h3>
              <button 
                onClick={() => setIsExpenseOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Expense Amount */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">OUTLAY AMOUNT ({currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={exAmount}
                    onChange={(e) => setExAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Expense Category */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">EXPENSE SECTOR CATEGORY *</label>
                  <select
                    value={exCategory}
                    onChange={(e) => setExCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="petrol">Van Petrol / Fuel</option>
                    <option value="transport">Public Transport / Parking</option>
                    <option value="food">Food & Meals</option>
                    <option value="tea">Team Tea & Snacks</option>
                    <option value="hotel">Overnight Hotel Lodging</option>
                    <option value="vehicle_repair">Van Maintenance & Repairs</option>
                    <option value="labour">Labour Payouts (Direct)</option>
                    <option value="equipment">Heavy Machinery Hire</option>
                    <option value="tool_purchase">Hand Tool Purchase</option>
                    <option value="miscellaneous">Other Miscellaneous logs</option>
                  </select>
                </div>

                {/* Expense date */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">OUTLAY TRANSACTION DATE *</label>
                  <input
                    type="date"
                    required
                    value={exDate}
                    onChange={(e) => setExDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Invoice screenshot */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">ATTACH RECEIPT / BILL URL</label>
                  <input
                    type="text"
                    placeholder="https://receipt-cloud.com..."
                    value={exBillUrl}
                    onChange={(e) => setExBillUrl(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-bold mb-1">TRANSACTION DESCRIPTION / NOTE *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Fuel tank full for transportation van to Sector 4 site."
                    value={exDesc}
                    onChange={(e) => setExDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Optional Project link */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-bold mb-1">ALLOCATE TO SPECIFIC PROJECT (OPTIONAL)</label>
                  <select
                    value={exProjId}
                    onChange={(e) => setExProjId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">General Overhead (Not project linked)</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {editingExpense ? 'Apply Transaction Edits' : 'Commit Outlay Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
