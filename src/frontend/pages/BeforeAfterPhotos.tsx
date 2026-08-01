import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { BeforeAfterItem } from '../../database/types';
import { 
  Camera, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Sliders, 
  Columns, 
  Layers, 
  Upload, 
  X, 
  Sparkles, 
  Check, 
  Share2, 
  ArrowRight,
  Filter,
  Image as ImageIcon
} from 'lucide-react';

export const BeforeAfterPhotos: React.FC = () => {
  const { beforeAfterItems, projects, saveBeforeAfterItem, deleteBeforeAfterItem } = useDb();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'grid'>('slider');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BeforeAfterItem | null>(null);
  const [previewItem, setPreviewItem] = useState<BeforeAfterItem | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<{
    title: string;
    projectId: string;
    customerName: string;
    category: 'panel_upgrade' | 'wiring' | 'lighting' | 'appliance_fix' | 'commercial_fitout' | 'others';
    description: string;
    beforeImageUrl: string;
    afterImageUrl: string;
    beforeLabel: string;
    afterLabel: string;
    date: string;
  }>({
    title: '',
    projectId: '',
    customerName: '',
    category: 'panel_upgrade',
    description: '',
    beforeImageUrl: '',
    afterImageUrl: '',
    beforeLabel: 'Before (Before Work)',
    afterLabel: 'After (Completed Work)',
    date: new Date().toISOString().split('T')[0],
  });

  // Slider State for Interactive Comparison Card
  const [sliderPositions, setSliderPositions] = useState<{ [key: string]: number }>({});

  const handleSliderChange = (id: string, value: number) => {
    setSliderPositions(prev => ({ ...prev, [id]: value }));
  };

  // Handle File Upload (Convert to Base64 Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: 'beforeImageUrl' | 'afterImageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, [targetField]: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddModal = (itemToEdit?: BeforeAfterItem) => {
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setFormData({
        title: itemToEdit.title,
        projectId: itemToEdit.projectId || '',
        customerName: itemToEdit.customerName || '',
        category: itemToEdit.category || 'panel_upgrade',
        description: itemToEdit.description || '',
        beforeImageUrl: itemToEdit.beforeImageUrl || '',
        afterImageUrl: itemToEdit.afterImageUrl || '',
        beforeLabel: itemToEdit.beforeLabel || 'Before Work',
        afterLabel: itemToEdit.afterLabel || 'After Work',
        date: itemToEdit.date || new Date().toISOString().split('T')[0],
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        projectId: '',
        customerName: '',
        category: 'panel_upgrade',
        description: '',
        beforeImageUrl: '',
        afterImageUrl: '',
        beforeLabel: 'Before Work',
        afterLabel: 'After Work',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleProjectSelect = (pId: string) => {
    const selectedProj = projects.find(p => p.id === pId);
    setFormData(prev => ({
      ...prev,
      projectId: pId,
      customerName: selectedProj ? selectedProj.customerName : prev.customerName,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.beforeImageUrl || !formData.afterImageUrl) {
      alert('Please fill in the title and provide both Before and After images.');
      return;
    }

    const newItem: BeforeAfterItem = {
      id: editingItem ? editingItem.id : 'ba_' + Date.now(),
      title: formData.title,
      projectId: formData.projectId || undefined,
      customerName: formData.customerName || undefined,
      category: formData.category,
      description: formData.description || undefined,
      beforeImageUrl: formData.beforeImageUrl,
      afterImageUrl: formData.afterImageUrl,
      beforeLabel: formData.beforeLabel || 'Before Work',
      afterLabel: formData.afterLabel || 'After Work',
      date: formData.date,
      ownerId: 'owner',
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
    };

    await saveBeforeAfterItem(newItem);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this Before & After showcase entry?')) {
      await deleteBeforeAfterItem(id);
      if (previewItem?.id === id) setPreviewItem(null);
    }
  };

  // Filter Items
  const filteredItems = beforeAfterItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.customerName && item.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesProject = selectedProjectId === 'all' || item.projectId === selectedProjectId;
    return matchesSearch && matchesCategory && matchesProject;
  });

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'panel_upgrade': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      case 'wiring': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
      case 'lighting': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
      case 'appliance_fix': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'commercial_fitout': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const formatCategoryName = (cat?: string) => {
    if (!cat) return 'General Electrical';
    return cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Before & After Gallery
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showcase work quality, electrical transformations & before/after comparisons for clients.
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-add-before-after"
          onClick={() => handleOpenAddModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors cursor-pointer text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Before & After Entry</span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, client or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="panel_upgrade">Panel Upgrade</option>
              <option value="wiring">Wiring & Conduits</option>
              <option value="lighting">Lighting & Switches</option>
              <option value="appliance_fix">Appliance Repair</option>
              <option value="commercial_fitout">Commercial Fitout</option>
              <option value="others">Others</option>
            </select>
          </div>

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('slider')}
              title="Interactive Slider Mode"
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'slider' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              title="Side by Side Mode"
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'side-by-side' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Grid Card Mode"
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content List / Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            No Before & After Entries Found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Upload photos of electrical work before starting and after completion to present clear work progress to your clients.
          </p>
          <button
            onClick={() => handleOpenAddModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Showcase Photo</span>
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
          {filteredItems.map(item => {
            const sliderVal = sliderPositions[item.id] !== undefined ? sliderPositions[item.id] : 50;

            return (
              <div 
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                {/* Showcase Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getCategoryBadge(item.category)}`}>
                        {formatCategoryName(item.category)}
                      </span>
                      {item.customerName && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Client: {item.customerName}
                        </span>
                      )}
                      {item.date && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          &bull; {item.date}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setPreviewItem(item)}
                      title="Inspect Full Screen"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenAddModal(item)}
                      title="Edit Entry"
                      className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Delete Entry"
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Photo Display View */}
                <div className="relative bg-slate-950 min-h-[260px] max-h-[360px] overflow-hidden flex items-center justify-center">
                  {viewMode === 'slider' ? (
                    /* Interactive Drag / Range Slider View */
                    <div className="relative w-full h-[280px] select-none overflow-hidden group">
                      {/* AFTER Image (Full background) */}
                      <img 
                        src={item.afterImageUrl} 
                        alt="After work" 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <span className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-emerald-600/90 text-white text-[11px] font-bold rounded-md uppercase tracking-wider backdrop-blur-xs">
                        {item.afterLabel || 'AFTER'}
                      </span>

                      {/* BEFORE Image (Clipped over left side) */}
                      <div 
                        className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-2xl"
                        style={{ width: `${sliderVal}%` }}
                      >
                        <img 
                          src={item.beforeImageUrl} 
                          alt="Before work" 
                          className="absolute top-0 left-0 h-full max-w-none object-cover"
                          style={{ width: '100%', minWidth: '100%' }}
                        />
                        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-rose-600/90 text-white text-[11px] font-bold rounded-md uppercase tracking-wider backdrop-blur-xs">
                          {item.beforeLabel || 'BEFORE'}
                        </span>
                      </div>

                      {/* Visible Divider Handle */}
                      <div 
                        className="absolute top-0 bottom-0 z-20 pointer-events-none flex items-center justify-center -ml-3"
                        style={{ left: `${sliderVal}%` }}
                      >
                        <div className="w-6 h-6 rounded-full bg-white text-slate-900 shadow-lg flex items-center justify-center border border-slate-200 text-xs font-bold">
                          &#10094;&#10095;
                        </div>
                      </div>

                      {/* Interactive Range Input Overlay */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderVal}
                        onChange={(e) => handleSliderChange(item.id, Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                      />
                    </div>
                  ) : viewMode === 'side-by-side' ? (
                    /* Side-by-Side Dual Image Columns */
                    <div className="grid grid-cols-2 gap-1 w-full h-[280px]">
                      <div className="relative h-full overflow-hidden">
                        <img 
                          src={item.beforeImageUrl} 
                          alt="Before work" 
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-rose-600/90 text-white text-[10px] font-bold rounded">
                          {item.beforeLabel || 'BEFORE'}
                        </span>
                      </div>
                      <div className="relative h-full overflow-hidden">
                        <img 
                          src={item.afterImageUrl} 
                          alt="After work" 
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-600/90 text-white text-[10px] font-bold rounded">
                          {item.afterLabel || 'AFTER'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Grid / Card Stack View */
                    <div className="relative w-full h-[280px]">
                      <img 
                        src={item.afterImageUrl} 
                        alt="After work" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4 justify-between">
                        <span className="px-2 py-1 bg-rose-600 text-white text-xs font-bold rounded">
                          Before: {item.beforeLabel}
                        </span>
                        <span className="px-2 py-1 bg-emerald-600 text-white text-xs font-bold rounded">
                          After: {item.afterLabel}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Notes & Actions */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex-1 flex flex-col justify-between">
                  {item.description ? (
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      {item.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic mb-3">No description added.</p>
                  )}

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-slate-500 font-medium">
                      Drag image slider to compare
                    </span>
                    <button
                      onClick={() => {
                        const shareText = `Electrical Work Showcase: ${item.title}\nClient: ${item.customerName || 'N/A'}\nCategory: ${formatCategoryName(item.category)}\nCheck before & after work completion details.`;
                        navigator.clipboard.writeText(shareText);
                        alert('Showcase summary copied to clipboard! You can paste and send it to your client.');
                      }}
                      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Summary</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{editingItem ? 'Edit Before & After Entry' : 'New Before & After Entry'}</span>
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Showcase Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Breaker Box & Conduit Wiring"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="panel_upgrade">Panel Upgrade / Fuse Box</option>
                    <option value="wiring">Wiring & Conduits</option>
                    <option value="lighting">Lighting & Switches</option>
                    <option value="appliance_fix">Appliance / Motor Repair</option>
                    <option value="commercial_fitout">Commercial Fitout</option>
                    <option value="others">Others</option>
                  </select>
                </div>

                {/* Linked Project */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Link Project (Optional)
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => handleProjectSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- No linked project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.customerName})</option>
                    ))}
                  </select>
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer / Client Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe / Apex Corp"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* BEFORE Photo Input Section */}
              <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-rose-700 dark:text-rose-300 tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Before Image (Old / Initial Condition)
                  </span>
                  <input
                    type="text"
                    placeholder="Label e.g. Old Fuse Box"
                    value={formData.beforeLabel}
                    onChange={(e) => setFormData(prev => ({ ...prev, beforeLabel: e.target.value }))}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 rounded text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Upload File / Take Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'beforeImageUrl')}
                      className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Or Paste Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.beforeImageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, beforeImageUrl: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {formData.beforeImageUrl && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={formData.beforeImageUrl} alt="Before preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* AFTER Photo Input Section */}
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300 tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    After Image (Completed / Upgraded Condition)
                  </span>
                  <input
                    type="text"
                    placeholder="Label e.g. 200A Breaker Panel"
                    value={formData.afterLabel}
                    onChange={(e) => setFormData(prev => ({ ...prev, afterLabel: e.target.value }))}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/50 rounded text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Upload File / Take Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'afterImageUrl')}
                      className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Or Paste Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.afterImageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, afterImageUrl: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {formData.afterImageUrl && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={formData.afterImageUrl} alt="After preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Description & Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Description / Client Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe what work was performed..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Update Showcase' : 'Save Before & After Photo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Screen Inspection Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative bg-slate-900 text-white rounded-2xl max-w-4xl w-full p-6 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                  Full Screen Comparison
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {previewItem.title}
                </h2>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg uppercase">
                  BEFORE: {previewItem.beforeLabel || 'Original State'}
                </span>
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-black max-h-[380px]">
                  <img src={previewItem.beforeImageUrl} alt="Before" className="w-full h-full object-contain" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg uppercase">
                  AFTER: {previewItem.afterLabel || 'Completed State'}
                </span>
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-black max-h-[380px]">
                  <img src={previewItem.afterImageUrl} alt="After" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            {previewItem.description && (
              <p className="text-sm text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                {previewItem.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
