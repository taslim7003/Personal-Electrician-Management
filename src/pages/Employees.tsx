import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { Employee, Attendance } from '../database/types';
import { 
  Users, 
  Plus, 
  Calendar, 
  DollarSign, 
  Clock, 
  UserPlus, 
  Edit, 
  Trash, 
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Briefcase
} from 'lucide-react';

export const Employees: React.FC = () => {
  const { 
    employees, 
    attendance, 
    projects, 
    saveEmployee, 
    deleteEmployee, 
    saveAttendance, 
    deleteAttendance,
    settings 
  } = useDb();

  const isDark = settings?.theme === 'dark';
  const currencySymbol = settings?.currency === 'INR' ? '₹' : settings?.currency === 'EUR' ? '€' : '$';

  // --- ATTENDANCE WORKSHEET ENGINE ---
  const [worksheetDate, setWorksheetDate] = useState<string>(() => {
    // default to today's work date: 2026-07-16
    return '2026-07-16';
  });

  // Employee Form State
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [empName, setEmpName] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [empWage, setEmpWage] = useState<number>(150);
  const [empStatus, setEmpStatus] = useState<'active' | 'inactive'>('active');

  // Attendance Cell input states (temporary buffer for worksheet)
  const [worksheetChanges, setWorksheetChanges] = useState<{
    [employeeId: string]: {
      status: 'present' | 'absent' | 'half_day';
      workingHours: number;
      overtimeHours: number;
      advancePaid: number;
      projectId: string;
    }
  }>({});

  // Active sub-view tab: 'roster' (Attendance Log) or 'directory' (Labour List)
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'directory'>('roster');

  // --- CALCULATE COST SUMS ---
  const getLaborCostForAttendance = (att: Attendance) => {
    const emp = employees.find(e => e.id === att.employeeId);
    if (!emp) return 0;
    let base = 0;
    if (att.status === 'present') {
      base = emp.dailyWage;
    } else if (att.status === 'half_day') {
      base = emp.dailyWage * 0.5;
    }
    const overtime = att.overtimeHours * (emp.dailyWage / 8);
    return base + overtime;
  };

  // Today's Date Roster
  const todayAttendanceRecords = attendance.filter(a => a.date === worksheetDate);

  // Helper: Incurred totals
  const getLaborCostsRange = (filterFn: (att: Attendance) => boolean) => {
    return attendance.filter(filterFn).reduce((sum, a) => sum + getLaborCostForAttendance(a), 0);
  };

  // Monthly labor
  const thisMonthLaborCost = getLaborCostsRange(a => a.date.startsWith('2026-07'));
  // Weekly labor (we can sum records between July 10 and 16)
  const thisWeekLaborCost = getLaborCostsRange(a => a.date >= '2026-07-10' && a.date <= '2026-07-16');
  // Project-wise labor costs
  const projectLaborCosts = projects.map(p => {
    const cost = getLaborCostsRange(a => a.projectId === p.id);
    return { name: p.name, cost };
  }).filter(p => p.cost > 0);

  // Open Add Employee Modal
  const openAddEmployee = () => {
    setEditingEmployee(null);
    setEmpName('');
    setEmpPhone('');
    setEmpRole('');
    setEmpWage(150);
    setEmpStatus('active');
    setIsEmployeeFormOpen(true);
  };

  // Open Edit Employee Modal
  const openEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpName(emp.name);
    setEmpPhone(emp.phone || '');
    setEmpRole(emp.role || '');
    setEmpWage(emp.dailyWage);
    setEmpStatus(emp.status);
    setIsEmployeeFormOpen(true);
  };

  // Save Employee Catalog Entry
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName) return;

    const data: Employee = {
      id: editingEmployee ? editingEmployee.id : 'emp_' + Math.random().toString(36).substr(2, 9),
      name: empName,
      phone: empPhone,
      role: empRole,
      dailyWage: Number(empWage),
      status: empStatus,
      ownerId: 'demo'
    };

    await saveEmployee(data);
    setIsEmployeeFormOpen(false);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee? Daily rosters associated with this employee will lose identification.")) {
      await deleteEmployee(id);
    }
  };

  // Handle Worksheet Row Changes
  const handleWorksheetChange = (empId: string, field: string, value: any) => {
    // Find existing database attendance or default
    const existing = todayAttendanceRecords.find(a => a.employeeId === empId);
    
    setWorksheetChanges(prev => {
      const current = prev[empId] || {
        status: (existing?.status || 'absent') as any,
        workingHours: existing?.workingHours ?? 0,
        overtimeHours: existing?.overtimeHours ?? 0,
        advancePaid: existing?.advancePaid ?? 0,
        projectId: existing?.projectId || projects[0]?.id || ''
      };

      return {
        ...prev,
        [empId]: {
          ...current,
          [field]: value
        }
      };
    });
  };

  // Submit worksheet for the active date
  const handleSaveWorksheet = async () => {
    const activeEmps = employees.filter(e => e.status === 'active');
    
    for (const emp of activeEmps) {
      const change = worksheetChanges[emp.id];
      const existing = todayAttendanceRecords.find(a => a.employeeId === emp.id);

      // If changes are set, or if we want to default save:
      if (change) {
        const attData: Attendance = {
          id: existing ? existing.id : 'att_' + Math.random().toString(36).substr(2, 9),
          employeeId: emp.id,
          date: worksheetDate,
          status: change.status,
          workingHours: Number(change.workingHours),
          overtimeHours: Number(change.overtimeHours),
          advancePaid: Number(change.advancePaid),
          projectId: change.projectId,
          ownerId: 'demo'
        };
        await saveAttendance(attData);
      } else if (!existing) {
        // Automatically save as absent if not in database
        const attData: Attendance = {
          id: 'att_' + Math.random().toString(36).substr(2, 9),
          employeeId: emp.id,
          date: worksheetDate,
          status: 'absent',
          workingHours: 0,
          overtimeHours: 0,
          advancePaid: 0,
          projectId: projects[0]?.id || '',
          ownerId: 'demo'
        };
        await saveAttendance(attData);
      }
    }
    alert(`Roster worksheet for ${worksheetDate} submitted successfully.`);
    // clear local buffer state
    setWorksheetChanges({});
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 animate-fade-in">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Labour & Rosters</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log daily electrician attendance, track field wages, advances, and project-allocated manpower costs.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openAddEmployee}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Crew Member
          </button>
        </div>
      </div>

      {/* Wage cost boxes (aggregates) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-150'} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">WEEKLY WAGE overhead</span>
            <span className="text-lg font-black">{currencySymbol}{thisWeekLaborCost.toLocaleString()}</span>
          </div>
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
            <DollarSign className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-150'} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">MONTHLY WAGE OVERHEAD (JUL)</span>
            <span className="text-lg font-black">{currencySymbol}{thisMonthLaborCost.toLocaleString()}</span>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <DollarSign className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-150'} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">ACTIVE FIELD CREW</span>
            <span className="text-lg font-black">{employees.filter(e => e.status === 'active').length} Members</span>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
            <Users className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Sub tabs selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('roster')}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeSubTab === 'roster' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Daily Attendance Worksheet
        </button>
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeSubTab === 'directory' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Employees Directory
        </button>
      </div>

      {/* SUBVIEW 1: ATTENDANCE WORKSHEET */}
      {activeSubTab === 'roster' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} flex flex-col sm:flex-row items-center justify-between gap-4`}>
            
            {/* Roster date selector */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-bold font-mono shrink-0">ROSTER DATE:</span>
              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="date"
                  value={worksheetDate}
                  onChange={(e) => {
                    setWorksheetDate(e.target.value);
                    setWorksheetChanges({}); // reset any unsaved changes buffer
                  }}
                  className="px-3.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-sans italic text-left sm:text-right">
              Mark present status, hours, overtime, wage advances, and allocate to a project.
            </p>
          </div>

          {/* Worksheet Grid Table */}
          <div className={`border rounded-2xl overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-inherit font-mono text-slate-400 font-bold">
                    <th className="p-4">Crew Member</th>
                    <th className="p-4">Attendance Status</th>
                    <th className="p-4 text-center">Regular Hours</th>
                    <th className="p-4 text-center">Overtime Hours</th>
                    <th className="p-4 text-center">Wage Advance ({currencySymbol})</th>
                    <th className="p-4">Allocated Project</th>
                    <th className="p-4 text-right">Incurred Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {employees.filter(e => e.status === 'active').length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No active employees registered yet. Go to "Employees Directory" to register.
                      </td>
                    </tr>
                  ) : (
                    employees.filter(e => e.status === 'active').map((emp) => {
                      // Retrieve record in DB or temporary change buffer
                      const dbRec = todayAttendanceRecords.find(a => a.employeeId === emp.id);
                      const buf = worksheetChanges[emp.id];
                      
                      const currentStatus = buf ? buf.status : (dbRec?.status || 'absent');
                      const currentRegHrs = buf ? buf.workingHours : (dbRec?.workingHours ?? 0);
                      const currentOvHrs = buf ? buf.overtimeHours : (dbRec?.overtimeHours ?? 0);
                      const currentAdv = buf ? buf.advancePaid : (dbRec?.advancePaid ?? 0);
                      const currentProjId = buf ? buf.projectId : (dbRec?.projectId || projects[0]?.id || '');

                      // calculate cost dynamically for display
                      let wageCost = 0;
                      if (currentStatus === 'present') {
                        wageCost = emp.dailyWage;
                      } else if (currentStatus === 'half_day') {
                        wageCost = emp.dailyWage * 0.5;
                      }
                      const ovCost = currentOvHrs * (emp.dailyWage / 8);
                      const totalIncurredRowCost = wageCost + ovCost;

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="p-4">
                            <span className="font-bold text-slate-900 dark:text-white block">{emp.name}</span>
                            <span className="text-[10px] text-slate-500 block italic">{emp.role || 'Electrician'} • {currencySymbol}{emp.dailyWage}/day</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              {/* Present */}
                              <button
                                type="button"
                                onClick={() => {
                                  handleWorksheetChange(emp.id, 'status', 'present');
                                  handleWorksheetChange(emp.id, 'workingHours', 8);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all uppercase ${currentStatus === 'present' ? 'bg-emerald-500 text-white shadow shadow-emerald-500/15' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                              >
                                Present
                              </button>
                              {/* Half Day */}
                              <button
                                type="button"
                                onClick={() => {
                                  handleWorksheetChange(emp.id, 'status', 'half_day');
                                  handleWorksheetChange(emp.id, 'workingHours', 4);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all uppercase ${currentStatus === 'half_day' ? 'bg-blue-500 text-white shadow shadow-blue-500/15' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                              >
                                Half
                              </button>
                              {/* Absent */}
                              <button
                                type="button"
                                onClick={() => {
                                  handleWorksheetChange(emp.id, 'status', 'absent');
                                  handleWorksheetChange(emp.id, 'workingHours', 0);
                                  handleWorksheetChange(emp.id, 'overtimeHours', 0);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all uppercase ${currentStatus === 'absent' ? 'bg-red-500 text-white shadow shadow-red-500/15' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="12"
                              value={currentRegHrs}
                              onChange={(e) => handleWorksheetChange(emp.id, 'workingHours', Number(e.target.value))}
                              disabled={currentStatus === 'absent'}
                              className="w-14 text-center px-1.5 py-1 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-lg disabled:opacity-50 text-xs font-semibold font-mono"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="8"
                              value={currentOvHrs}
                              onChange={(e) => handleWorksheetChange(emp.id, 'overtimeHours', Number(e.target.value))}
                              disabled={currentStatus === 'absent'}
                              className="w-14 text-center px-1.5 py-1 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-lg disabled:opacity-50 text-xs font-semibold font-mono"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input
                              type="number"
                              min="0"
                              value={currentAdv}
                              onChange={(e) => handleWorksheetChange(emp.id, 'advancePaid', Number(e.target.value))}
                              className="w-16 text-center px-1.5 py-1 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-lg text-xs font-semibold font-mono"
                            />
                          </td>
                          <td className="p-4">
                            <select
                              value={currentProjId}
                              onChange={(e) => handleWorksheetChange(emp.id, 'projectId', e.target.value)}
                              disabled={currentStatus === 'absent'}
                              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-lg focus:outline-none text-xs max-w-[150px] truncate"
                            >
                              <option value="">Select Project</option>
                              {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-4 text-right font-bold text-slate-800 dark:text-slate-100 font-mono">
                            {currencySymbol}{totalIncurredRowCost.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Save bar */}
            {employees.filter(e => e.status === 'active').length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-inherit flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Unsubmitted changes are buffered locally in the browser until you hit submit.
                </span>
                <button
                  type="button"
                  onClick={handleSaveWorksheet}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow shadow-indigo-600/10"
                >
                  Submit Daily Worksheet
                </button>
              </div>
            )}
          </div>

          {/* Project-wise Labour Cost aggregates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
              <h4 className="text-sm font-bold mb-4">Labour Allocated By Contract Project</h4>
              <div className="space-y-3.5">
                {projectLaborCosts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No labour logged against projects yet.</p>
                ) : (
                  projectLaborCosts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800/40 pb-2 last:border-0 last:pb-0">
                      <span className="text-xs font-semibold truncate max-w-[200px] text-slate-800 dark:text-slate-200">{p.name}</span>
                      <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">{currencySymbol}{p.cost.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Assistance widget */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex flex-col justify-between`}>
              <div>
                <h4 className="text-sm font-bold mb-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Roster Instructions
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Daily wage is calculated dynamically based on attendance:
                  <br />• <b>Present</b>: Full daily wage.
                  <br />• <b>Half Day</b>: 50% daily wage.
                  <br />• <b>Overtime</b>: Hourly overtime wage calculated as <code className="font-mono text-indigo-600 dark:text-indigo-400">(Daily Wage / 8)</code> per hour.
                  <br />• Wage advances do not reduce the incurred labour cost, but are stored in attendance logs for monthly cash payouts.
                </p>
              </div>
              <div className="text-[10px] text-slate-400 mt-4">
                * To add or deactivate employees, switch to the <b>"Employees Directory"</b>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: EMPLOYEES DIRECTORY */}
      {activeSubTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4 stroke-1" />
              <h3 className="font-semibold text-sm">Labour Catalog is Empty</h3>
              <p className="text-xs text-slate-500 mt-1">Add your field assistants and apprentice electricians above.</p>
            </div>
          ) : (
            employees.map((emp) => (
              <div 
                key={emp.id}
                className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}>
                      {emp.status}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {currencySymbol}{emp.dailyWage}/day
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3 block">{emp.name}</h4>
                  <span className="text-[10px] font-semibold text-slate-400 font-mono block uppercase mt-0.5">{emp.role || 'Junior Wireman'}</span>
                </div>

                {emp.phone && (
                  <p className="text-xs text-slate-500 font-medium">
                    Phone: <span className="text-slate-700 dark:text-slate-300 font-mono">{emp.phone}</span>
                  </p>
                )}

                <div className="flex items-center justify-end gap-1 border-t border-slate-100 dark:border-slate-800/40 pt-3">
                  <button
                    onClick={() => openEditEmployee(emp)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                    title="Edit profile"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(emp.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                    title="Remove profile"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* DIALOG MODAL: Add / Edit Employee */}
      {isEmployeeFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingEmployee ? 'Edit Crew Profile' : 'Register New Crew Member'}
              </h3>
              <button 
                onClick={() => setIsEmployeeFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">EMPLOYEE NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. James Finch"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">CONTACT MOBILE PHONE</label>
                <input
                  type="text"
                  placeholder="e.g. 555-0144"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">WORK ROLE / SPECIALIZATION</label>
                <input
                  type="text"
                  placeholder="e.g. Apprentice, Senior Wireman, Helper"
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">DAILY BASE WAGE ({currencySymbol}) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={empWage}
                    onChange={(e) => setEmpWage(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-semibold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">ROSTER STATUS</label>
                  <select
                    value={empStatus}
                    onChange={(e) => setEmpStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="active">Active Field Duty</option>
                    <option value="inactive">Suspended / Inactive</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {editingEmployee ? 'Apply Profile Changes' : 'Register Crew Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
