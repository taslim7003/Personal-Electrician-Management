import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Wrench, 
  AlertTriangle,
  Award
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { projects, dailyLogs, settings } = useDb();

  const isDark = settings?.theme === 'dark';

  // State: Year/Month coordinates
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed (6 is July 2026)

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper: Prev month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  // Helper: Next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Compile calendar dates
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  // Prefill empty spaces for offsets
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  // Fill actual dates
  for (let d = 1; d <= totalDaysInMonth; d++) {
    calendarDays.push(d);
  }

  // Find occurrences (Milestones, site entries) on any date
  const getEventsForDay = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    const events: {
      id: string;
      title: string;
      type: 'start' | 'deadline' | 'log';
      raw: any;
    }[] = [];

    // 1. Projects starting
    projects.forEach(p => {
      if (p.startDate === dateStr) {
        events.push({
          id: `start_${p.id}`,
          title: `Start: ${p.name}`,
          type: 'start',
          raw: p
        });
      }
    });

    // 2. Project deadlines
    projects.forEach(p => {
      if (p.expectedCompletionDate === dateStr) {
        events.push({
          id: `dead_${p.id}`,
          title: `DL: ${p.name}`,
          type: 'deadline',
          raw: p
        });
      }
    });

    // 3. Daily Logs progress entries
    dailyLogs.forEach(log => {
      if (log.date === dateStr) {
        events.push({
          id: `log_${log.id}`,
          title: `Work Log: ${log.description.substring(0, 15)}...`,
          type: 'log',
          raw: log
        });
      }
    });

    return events;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 animate-fade-in">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Milestones Calendar</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Keep track of project kickoff dates, customer billing deadlines, and daily work logs.
          </p>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
        {/* Navigation block */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
            <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2.5 text-center font-bold font-mono text-xs text-slate-400 mb-2 border-b dark:border-slate-800 pb-2">
          <span>SUN</span>
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-28 bg-slate-50/10 rounded-xl opacity-40 border border-transparent" />;
            }

            const events = getEventsForDay(day);
            const isToday = day === 16 && currentMonth === 6 && currentYear === 2026; // Highlight today's date context: July 16, 2026

            return (
              <div 
                key={`day-${day}`}
                className={`h-28 p-2.5 rounded-xl border flex flex-col justify-between hover:scale-[1.01] transition-all overflow-hidden ${isToday ? 'border-indigo-500 bg-indigo-500/5' : isDark ? 'bg-slate-950/40 border-slate-850 hover:bg-slate-850/20' : 'bg-slate-50/40 border-slate-150 hover:bg-slate-100/50'}`}
              >
                {/* Date digit */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black font-mono leading-none ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                    {day}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-500/10 px-1.5 py-0.5 rounded-md">
                      Today
                    </span>
                  )}
                </div>

                {/* Event badging */}
                <div className="flex-1 overflow-y-auto mt-2 space-y-1 pr-0.5 select-none scrollbar-thin">
                  {events.map((ev, eIdx) => {
                    // Badge colors
                    const badgeClass = ev.type === 'start' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                       ev.type === 'deadline' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                       'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';

                    const Icon = ev.type === 'start' ? Wrench : ev.type === 'deadline' ? AlertTriangle : Clock;

                    return (
                      <div 
                        key={ev.id} 
                        className={`px-1.5 py-1 rounded-md border text-[8px] font-bold flex items-center gap-1 truncate font-sans ${badgeClass}`}
                        title={ev.title}
                      >
                        <Icon className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{ev.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
