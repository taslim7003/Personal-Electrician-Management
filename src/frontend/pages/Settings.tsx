import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Briefcase, 
  DollarSign, 
  HardDriveDownload, 
  ShieldCheck, 
  CheckCircle,
  HelpCircle,
  X
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings, exportDb, importDb } = useDb();

  const isDark = settings?.theme === 'dark';

  // Local Form state
  const [ownerName, setOwnerName] = useState(settings?.ownerName || 'Alex Chen');
  const [businessName, setBusinessName] = useState(settings?.businessName || 'SparkLine Electrical Solutions');
  const [gstNumber, setGstNumber] = useState(settings?.gstNumber || 'GSTIN12ABCDE1234F');
  const [currency, setCurrency] = useState<any>(settings?.currency || 'USD');
  const [theme, setTheme] = useState<any>(settings?.theme || 'dark');
  const [alertMsg, setAlertMsg] = useState('');

  // Submit Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      ownerName,
      businessName,
      gstNumber,
      currency,
      theme
    });
    setAlertMsg('Business preferences saved successfully.');
    setTimeout(() => setAlertMsg(''), 3000);
  };

  // Export database backup
  const handleExportBackup = async () => {
    const backupStr = await exportDb();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(backupStr);
    const link = document.createElement('a');
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "sparkline_backup.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import database backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        await importDb(text);
        alert('Database restored successfully! Refreshing active view...');
        window.location.reload();
      } catch (err) {
        alert('Failed to parse backup JSON. Ensure the file has valid schema.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-1 animate-fade-in">
      
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure business metadata, set your operating currency, and run offline catalog backups.
        </p>
      </div>

      {alertMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-500 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {alertMsg}
        </div>
      )}

      {/* Profile Form card */}
      <div className={`p-6 md:p-8 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200'} shadow-sm`}>
        <h3 className="font-bold text-base flex items-center gap-2 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Business Profile Customization
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Owner Name */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">PROPRIETOR FULL NAME</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">REGISTERED BUSINESS NAME</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* GST / Tax Registration Number */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">GSTIN TAX REGISTER NO. (GST / VAT)</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Currencies selection */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">OPERATIONAL CURRENCY DENOMINATION</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
          >
            Save Profile Preferences
          </button>
        </form>
      </div>

      {/* Backup Card */}
      <div className={`p-6 md:p-8 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200'} shadow-sm space-y-6`}>
        <h3 className="font-bold text-base flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <HardDriveDownload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Backup & Recovery (Database Utilities)
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed">
          Maintain full ownership over your electrical bookkeeping ledger data. Run manual backups to save database archives directly to your system drive as offline backups.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <HardDriveDownload className="w-4.5 h-4.5" />
            Export Backup file
          </button>

          <label className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
            <HardDriveDownload className="w-4.5 h-4.5 rotate-180" />
            Restore from Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
