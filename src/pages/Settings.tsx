import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { Settings as SettingsIcon, Sun, Moon, Download, Upload, Save, CheckCircle, AlertCircle, Building2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings, exportDb, importDb } = useDb();
  const isDark = settings?.theme === 'dark';

  const [companyName, setCompanyName] = useState(settings?.companyName || 'Personal Electric');
  const [licenseNumber, setLicenseNumber] = useState(settings?.licenseNumber || 'EC-948271');
  const [contactEmail, setContactEmail] = useState(settings?.contactEmail || 'contact@personalelectric.com');
  const [phone, setPhone] = useState(settings?.phone || '(555) 234-5678');
  const [currency, setCurrency] = useState(settings?.currency || '$');
  const [theme, setTheme] = useState<'light' | 'dark'>(settings?.theme || 'dark');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [importJson, setImportJson] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      await updateSettings({
        companyName,
        licenseNumber,
        contactEmail,
        phone,
        currency,
        theme,
      });
      setSuccessMsg('Settings updated successfully!');
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const json = await exportDb();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personal_electric_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } catch (err) {
      console.error('Failed to export DB', err);
    }
  };

  const handleImport = async () => {
    if (!importJson.trim()) return;
    setImporting(true);
    setImportError(null);
    try {
      await importDb(importJson);
      setSuccessMsg('Database restored successfully from backup!');
      setImportJson('');
    } catch (err: any) {
      setImportError(err.message || 'Invalid JSON backup format.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Application Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure company profile, license information, appearance, and database backups.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-5`}>
        <div className="flex items-center gap-2 pb-3 border-b border-inherit">
          <Building2 className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-base">Electrical Contractor Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-medium ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Electrical License #</label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-medium ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Business Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-medium ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-medium ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Currency Symbol</label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-medium ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Theme Mode</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                  theme === 'dark' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                  theme === 'light' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </form>

      {/* Backup Section */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
        <h2 className="font-semibold text-base flex items-center gap-2">
          <Download className="w-5 h-5 text-amber-500" />
          <span>Data Backup & Restore</span>
        </h2>
        <p className="text-xs text-slate-400">
          Export your entire database as a JSON backup file or restore from a previous backup.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-amber-500" />
            <span>Export Database Backup (.JSON)</span>
          </button>
        </div>

        <div className="pt-4 border-t border-inherit space-y-3">
          <label className="block text-xs font-medium text-slate-400">Paste JSON Backup to Restore</label>
          <textarea
            rows={3}
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder="Paste raw JSON content here..."
            className={`w-full p-3 rounded-xl border text-xs font-mono ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />
          {importError && (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{importError}</span>
            </p>
          )}
          <button
            type="button"
            onClick={handleImport}
            disabled={importing || !importJson.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl disabled:opacity-40 flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{importing ? 'Restoring...' : 'Restore Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
