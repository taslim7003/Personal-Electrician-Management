import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { DailyLog } from '../../database/types';
import { 
  Clock, 
  Plus, 
  Calendar, 
  Wrench, 
  CloudSun, 
  FileText, 
  Edit, 
  Trash, 
  X,
  FileSpreadsheet,
  Search
} from 'lucide-react';

export const DailyLogs: React.FC = () => {
  const { dailyLogs, projects, saveDailyLog, deleteDailyLog, settings } = useDb();

  const isDark = settings?.theme === 'dark';

  // State
  const [filterProject, setFilterProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals / Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);

  // Form Fields
  const [projectId, setProjectId] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [totalHours, setTotalHours] = useState<number>(8);
  const [weather, setWeather] = useState('');
  const [remarks, setRemarks] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  // Automatically calculate hours if start and end time are modified
  const calculateHours = (start: string, end: string) => {
    if (!start || !end) return;
    try {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      let diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff < 0) diff += 24 * 60; // handle cross-midnight logs
      setTotalHours(Number((diff / 60).toFixed(1)));
    } catch (e) {
      // ignore parsing errors
    }
  };

  const handleStartTimeChange = (val: string) => {
    setStartTime(val);
    calculateHours(val, endTime);
  };

  const handleEndTimeChange = (val: string) => {
    setEndTime(val);
    calculateHours(startTime, val);
  };

  const openAddModal = () => {
    setEditingLog(null);
    setProjectId(projects[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setStartTime('08:00');
    setEndTime('17:00');
    setTotalHours(9);
    setWeather('Sunny');
    setRemarks('');
    setMediaUrl('');
    setIsFormOpen(true);
  };

  const openEditModal = (log: DailyLog) => {
    setEditingLog(log);
    setProjectId(log.projectId);
    setDate(log.date);
    setDescription(log.description);
    setStartTime(log.startTime || '');
    setEndTime(log.endTime || '');
    setTotalHours(log.totalHours);
    setWeather(log.weather || '');
    setRemarks(log.remarks || '');
    setMediaUrl(log.mediaUrls?.[0] || '');
    setIsFormOpen(true);
  };

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !description || !date) return;

    const logData: DailyLog = {
      id: editingLog ? editingLog.id : 'log_' + Math.random().toString(36).substr(2, 9),
      projectId,
      date,
      description,
      startTime,
      endTime,
      totalHours: Number(totalHours),
      weather,
      remarks,
      mediaUrls: mediaUrl ? [mediaUrl] : [],
      ownerId: 'demo'
    };

    await saveDailyLog(logData);
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this daily work log?")) {
      await deleteDailyLog(id);
    }
  };

  // Filter logs
  const filteredLogs = dailyLogs.filter(log => {
    const matchesProject = filterProject === 'all' || log.projectId === filterProject;
    const matchesSearch = log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (log.remarks || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesSearch;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 animate-fade-in">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daily Work Logs</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Document daily project progress, on-site obstacles, inspections, and hours worked.
          </p>
        </div>
        <div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Daily Work Log
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'} flex flex-col md:flex-row gap-4 items-center justify-between`}>
        {/* Search */}
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search within work logs, descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Project Selector */}
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

      {/* Timeline View */}
      <div className="max-w-3xl mx-auto space-y-8 relative before:absolute before:inset-0 before:left-4 before:border-l-2 before:border-slate-200 dark:before:border-slate-800 before:pointer-events-none py-2">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 pl-8">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4 stroke-1 animate-pulse" />
            <h3 className="font-semibold text-sm">No Work Logs Recorded</h3>
            <p className="text-xs text-slate-500 mt-1">Add your first daily progress entry above.</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const proj = projects.find(p => p.id === log.projectId);
            return (
              <div key={log.id} className="relative pl-10 group">
                {/* Visual Connector Dot */}
                <div className="absolute left-1.5 top-2.5 w-5 h-5 rounded-full border-4 border-white dark:border-slate-950 bg-indigo-600 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform z-10" />

                {/* Log Card */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'} shadow-sm transition-all flex flex-col md:flex-row md:items-start justify-between gap-4`}>
                  <div className="space-y-3 flex-1">
                    {/* Log Date & Project Name Header */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5" />
                        {log.date}
                      </span>
                      <span className="text-[10px] text-slate-500">•</span>
                      <span className="text-xs font-semibold text-slate-400">
                        {proj?.name || 'General Project'}
                      </span>
                    </div>

                    {/* Progress Description */}
                    <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                      {log.description}
                    </p>

                    {/* Meta widgets: hours, weather, remarks */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-mono">
                      {log.startTime && log.endTime && (
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.startTime} - {log.endTime}
                        </span>
                      )}
                      
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        Total Hours: {log.totalHours} hrs
                      </span>

                      {log.weather && (
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center gap-1">
                          <CloudSun className="w-3 h-3 text-blue-500" />
                          Weather: {log.weather}
                        </span>
                      )}
                    </div>

                    {log.remarks && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">REMARKS / IMPEDIMENTS</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic font-sans">{log.remarks}</p>
                      </div>
                    )}

                    {/* Uploaded log attachments */}
                    {log.mediaUrls?.[0] && (
                      <div className="mt-2.5 max-w-sm rounded-xl overflow-hidden border dark:border-slate-800">
                        <img 
                          src={log.mediaUrls[0]} 
                          alt="Progress Attach" 
                          className="w-full max-h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div className="flex items-center md:flex-col justify-end gap-1.5 md:pt-1 shrink-0">
                    <button
                      onClick={() => openEditModal(log)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                      title="Edit work log"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete work log"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DAILY LOG FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'} max-h-[90vh] overflow-y-auto`}>
            
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingLog ? 'Update Daily Log' : 'Create On-Site Work Log'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>            <form onSubmit={handleSaveLog} className="space-y-4 text-xs">
              
              {/* Project select */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">LINK CONTRACT PROJECT *</label>
                <select
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="" disabled>Select active project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Log Date */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">WORK LOG DATE *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-mono"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">TODAY'S WORK DESCRIPTION *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Laid down conduit trunking, hooked up distribution panel breakers, completed G3 safety checks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Hours Worked Widgets */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">START TIME</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none text-sm font-mono focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">END TIME</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none text-sm font-mono focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">TOTAL HOURS</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={totalHours}
                    onChange={(e) => setTotalHours(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none text-sm font-mono font-bold focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Weather & Remarks */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">SITE WEATHER</label>
                  <input
                    type="text"
                    placeholder="e.g. Sunny, Overcast"
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">ATTACH PHOTO URL</label>
                  <input
                    type="text"
                    placeholder="https://image-link.com"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">SITE REMARKS / ANOMALIES</label>
                <input
                  type="text"
                  placeholder="e.g. Main grid connection delayed due to utility backlog."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {editingLog ? 'Update Work Log Entry' : 'Publish Progress Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
