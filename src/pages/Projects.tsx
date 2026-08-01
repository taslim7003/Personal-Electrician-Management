import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { Project, Customer } from '../database/types';
import { 
  Wrench, 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Calendar, 
  DollarSign, 
  Edit, 
  Trash, 
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  PlusCircle,
  Briefcase
} from 'lucide-react';

export const Projects: React.FC = () => {
  const { 
    projects, 
    customers, 
    saveProject, 
    deleteProject, 
    saveCustomer, 
    settings 
  } = useDb();

  const isDark = settings?.theme === 'dark';
  const currencySymbol = settings?.currency === 'INR' ? '₹' : settings?.currency === 'EUR' ? '€' : '$';

  // State
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals / Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form Fields
  const [projName, setProjName] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [category, setCategory] = useState<Project['category']>('residential');
  const [contractAmount, setContractAmount] = useState<number>(0);
  const [advanceReceived, setAdvanceReceived] = useState<number>(0);
  const [status, setStatus] = useState<Project['status']>('running');
  const [priority, setPriority] = useState<Project['priority']>('medium');
  const [startDate, setStartDate] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  // Customer Form Fields
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');

  // Open Form for Adding
  const openAddModal = () => {
    setEditingProject(null);
    setProjName('');
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setWorkLocation('');
    setCategory('residential');
    setContractAmount(0);
    setAdvanceReceived(0);
    setStatus('running');
    setPriority('medium');
    setStartDate(new Date().toISOString().split('T')[0]);
    setExpectedDate('');
    setNotes('');
    setMediaUrl('');
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setProjName(proj.name);
    setCustName(proj.customerName);
    setCustPhone(proj.customerPhone || '');
    setCustAddress(proj.customerAddress || '');
    setWorkLocation(proj.workLocation || '');
    setCategory(proj.category);
    setContractAmount(proj.contractAmount);
    setAdvanceReceived(proj.advanceReceived);
    setStatus(proj.status);
    setPriority(proj.priority);
    setStartDate(proj.startDate);
    setExpectedDate(proj.expectedCompletionDate);
    setNotes(proj.notes || '');
    setMediaUrl(proj.mediaUrls?.[0] || '');
    setIsFormOpen(true);
  };

  // Save Project Action
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName || !custName) return;

    // Check if customer already exists, if not, save them as well
    const exists = customers.find(c => c.name.toLowerCase() === custName.toLowerCase());
    if (!exists) {
      const newCust: Customer = {
        id: 'cust_' + Math.random().toString(36).substr(2, 9),
        name: custName,
        phone: custPhone,
        address: custAddress,
        ownerId: 'demo'
      };
      await saveCustomer(newCust);
    }

    const projectData: Project = {
      id: editingProject ? editingProject.id : 'proj_' + Math.random().toString(36).substr(2, 9),
      name: projName,
      customerName: custName,
      customerPhone: custPhone,
      customerAddress: custAddress,
      workLocation,
      category,
      contractAmount: Number(contractAmount),
      advanceReceived: Number(advanceReceived),
      status,
      priority,
      startDate,
      expectedCompletionDate: expectedDate,
      notes,
      mediaUrls: mediaUrl ? [mediaUrl] : [],
      ownerId: 'demo',
      createdAt: editingProject ? editingProject.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveProject(projectData);
    setIsFormOpen(false);
  };

  // Save Customer Action
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName) return;

    const cust: Customer = {
      id: 'cust_' + Math.random().toString(36).substr(2, 9),
      name: newCustName,
      phone: newCustPhone,
      address: newCustAddress,
      notes: newCustNotes,
      ownerId: 'demo'
    };

    await saveCustomer(cust);
    
    // Set customer name directly inside Project form if project form is also open
    setCustName(newCustName);
    setCustPhone(newCustPhone);
    setCustAddress(newCustAddress);
    setIsCustomerFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project? All associated material logs and work orders might become detached.")) {
      await deleteProject(id);
    }
  };

  // Pre-fill fields when an existing customer is selected
  const handleSelectCustomer = (selectedName: string) => {
    setCustName(selectedName);
    const found = customers.find(c => c.name === selectedName);
    if (found) {
      setCustPhone(found.phone || '');
      setCustAddress(found.address || '');
    }
  };

  // Filter and Search Projects
  const filteredProjects = projects.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.workLocation || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 animate-fade-in">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Directory</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log active electrician contracts, track customer payments, and manage site locations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCustomerFormOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 rounded-xl transition-all border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            Add Customer
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Project
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'} flex flex-col md:flex-row gap-4 items-center justify-between`}>
        {/* Search */}
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects, customers, sites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
          {/* Status Dropdown */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="office">Office</option>
            <option value="factory">Factory</option>
          </select>
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4 stroke-1 animate-bounce" />
            <h3 className="font-semibold text-sm">No Projects Found</h3>
            <p className="text-xs text-slate-500 mt-1">Refine your active filters or create a new project above.</p>
          </div>
        ) : (
          filteredProjects.map((proj) => {
            const pendingAmount = proj.contractAmount - proj.advanceReceived;
            
            // Status and priority badge colors
            const statusColor = proj.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                proj.status === 'running' ? 'bg-amber-500/10 text-amber-500' :
                                proj.status === 'paused' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500';

            const priorityColor = proj.priority === 'high' ? 'text-red-500 bg-red-500/10' :
                                  proj.priority === 'medium' ? 'text-amber-500 bg-amber-500/10' : 'text-slate-400 bg-slate-500/10';

            return (
              <div 
                key={proj.id}
                className={`group flex flex-col rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-all overflow-hidden`}
              >
                {/* Project Image Header */}
                <div className="h-40 bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
                  {proj.mediaUrls?.[0] ? (
                    <img 
                      src={proj.mediaUrls[0]} 
                      alt={proj.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-950/25 text-slate-500">
                      <Wrench className="w-10 h-10 stroke-1" />
                    </div>
                  )}
                  {/* Status/Priority Floating badging */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                      {proj.status}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${priorityColor}`}>
                      {proj.priority} Priority
                    </span>
                  </div>
                </div>

                {/* Content Block */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                      {proj.category} installation
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 leading-snug">
                      {proj.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5 pt-1">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      Client: <span className="text-slate-800 dark:text-slate-200">{proj.customerName}</span>
                    </p>
                  </div>

                  {/* Metadata Indicators */}
                  <div className="grid grid-cols-2 gap-3 py-2.5 border-y border-slate-100 dark:border-slate-800/60 font-mono text-[11px] text-slate-500">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">START DATE</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{proj.startDate}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-400">DEADLINE</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{proj.expectedCompletionDate}</span>
                    </div>
                  </div>

                  {/* Pricing and balances */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">CONTRACT VALUE</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">{currencySymbol}{proj.contractAmount.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-sans">PENDING BALANCE</span>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{currencySymbol}{pendingAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2">
                    {proj.workLocation ? (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate max-w-[140px]">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                        {proj.workLocation}
                      </span>
                    ) : <span />}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(proj)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        title="Edit project"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(proj.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete project"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FORM MODAL: Add / Edit Project */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'} max-h-[90vh] overflow-y-auto`}>
            
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <Wrench className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingProject ? 'Edit Project Log' : 'Create New Electrical Project'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Project Name */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-bold mb-1">PROJECT CONTRACT NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chen Residence Solar Wiring Setup"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                {/* Customer selection */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">CLIENT CUSTOMER NAME *</label>
                  <input
                    type="text"
                    list="customer_list"
                    required
                    placeholder="Search or enter client name"
                    value={custName}
                    onChange={(e) => handleSelectCustomer(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  />
                  <datalist id="customer_list">
                    {customers.map(c => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>

                {/* Client Phone */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">CLIENT PHONE NUMBER</label>
                  <input
                    type="text"
                    placeholder="e.g. 555-0100"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                {/* Site location */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-bold mb-1">WORK SITE ADDR / LOCATION</label>
                  <input
                    type="text"
                    placeholder="e.g. Garage and back patio, 482 Redwood Lane"
                    value={workLocation}
                    onChange={(e) => setWorkLocation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">PROJECT SECTOR CATEGORY</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="office">Office</option>
                    <option value="factory">Factory</option>
                  </select>
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">PRIORITY ROSTER</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                {/* Contract Amount */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">TOTAL CONTRACT SUM ({currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={contractAmount}
                    onChange={(e) => setContractAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-semibold font-mono"
                  />
                </div>

                {/* Advance Received */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">ADVANCE SECURED ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    value={advanceReceived}
                    onChange={(e) => setAdvanceReceived(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-semibold font-mono"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">PROJECT START DATE</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-mono"
                  />
                </div>

                {/* Expected Completion Date */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">EXPECTED COMPLETION</label>
                  <input
                    type="date"
                    required
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-mono"
                  />
                </div>

                {/* Project Status (Only when editing) */}
                {editingProject && (
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 font-bold mb-1">PROJECT WORK STATUS</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                    >
                      <option value="running">Running / Active</option>
                      <option value="completed">Completed / Handed Over</option>
                      <option value="paused">Paused / Waiting on parts</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}

                {/* Blueprint / Banner URL */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-bold mb-1">PROJECT BANNER / BLUEPRINT PHOTO URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/... or cloud link"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-bold mb-1">PROJECT SCOPE NOTES</label>
                  <textarea
                    rows={3}
                    placeholder="Wiring schedule, circuit breaker guidelines, safety notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {editingProject ? 'Apply Project Changes' : 'Record Project Contract'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER FORM MODAL */}
      {isCustomerFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Register New Client Profile
              </h3>
              <button 
                onClick={() => setIsCustomerFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">CLIENT / BUSINESS NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Corp Solutions"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">CONTACT PHONE NUMBER</label>
                <input
                  type="text"
                  placeholder="e.g. 555-0192"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">CLIENT BILLING ADDRESS</label>
                <input
                  type="text"
                  placeholder="e.g. 102 Industrial Parkway, Sector 4"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">INTERNAL REMARKS</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Prefers billing in net-15 terms."
                  value={newCustNotes}
                  onChange={(e) => setNewCustNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Register Client
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
