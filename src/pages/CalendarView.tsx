import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Briefcase } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { projects, dailyLogs, settings } = useDb();
  const isDark = settings?.theme === 'dark';

  const [currentDate, setCurrentDate] = useState<Date>(new Date());

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Work Calendar & Schedule</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track active electrical jobs, scheduled site visits, and logged labor days.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className={`p-2 rounded-xl border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-base font-bold min-w-[140px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>

          <button
            onClick={handleNextMonth}
            className={`p-2 rounded-xl border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-24 sm:h-28 p-2 rounded-xl bg-transparent" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const formattedDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            
            const dayProjects = projects.filter(p => p.startDate === formattedDateStr || p.endDate === formattedDateStr);
            const dayLogs = dailyLogs.filter(l => l.date === formattedDateStr);

            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum).toDateString();

            return (
              <div
                key={dayNum}
                className={`h-24 sm:h-28 p-2 rounded-xl border flex flex-col justify-between transition-colors overflow-hidden ${
                  isToday 
                    ? 'border-amber-500 bg-amber-500/5' 
                    : isDark 
                      ? 'bg-slate-950/60 border-slate-800/80' 
                      : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                    isToday ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                  }`}>
                    {dayNum}
                  </span>
                </div>

                <div className="space-y-1 overflow-y-auto max-h-16">
                  {dayProjects.map(p => (
                    <div key={p.id} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 truncate flex items-center gap-1">
                      <Briefcase className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{p.title}</span>
                    </div>
                  ))}
                  {dayLogs.map(l => (
                    <div key={l.id} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 truncate flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{l.hoursSpent}h Log</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
