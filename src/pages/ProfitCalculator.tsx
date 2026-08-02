import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { Calculator, DollarSign, Clock, Percent, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';

export const ProfitCalculator: React.FC = () => {
  const { settings } = useDb();
  const isDark = settings?.theme === 'dark';

  const [laborHours, setLaborHours] = useState<number>(12);
  const [hourlyRate, setHourlyRate] = useState<number>(65);
  const [materialCost, setMaterialCost] = useState<number>(450);
  const [overheadPercent, setOverheadPercent] = useState<number>(15);
  const [desiredProfitPercent, setDesiredProfitPercent] = useState<number>(20);

  // Calculations
  const baseLaborCost = laborHours * hourlyRate;
  const directCost = baseLaborCost + materialCost;
  const overheadCost = (directCost * overheadPercent) / 100;
  const totalCost = directCost + overheadCost;
  const recommendedPrice = totalCost / (1 - desiredProfitPercent / 100);
  const netProfit = recommendedPrice - totalCost;

  const resetCalculator = () => {
    setLaborHours(12);
    setHourlyRate(65);
    setMaterialCost(450);
    setOverheadPercent(15);
    setDesiredProfitPercent(20);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Profit & Estimate Calculator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Calculate accurate job quotes, labor costs, overheads, and target profit margins.
          </p>
        </div>
        <button
          onClick={resetCalculator}
          className={`self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-colors ${
            isDark 
              ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' 
              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Calculator</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column */}
        <div className={`lg:col-span-7 p-6 rounded-2xl border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } space-y-5`}>
          <div className="flex items-center gap-2 pb-3 border-b border-inherit">
            <Calculator className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-base">Cost & Rate Variables</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Labor Hours
              </label>
              <input
                type="number"
                min="0"
                value={laborHours}
                onChange={(e) => setLaborHours(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-xl border text-sm font-medium ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Hourly Rate ($/hr)
              </label>
              <input
                type="number"
                min="0"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-xl border text-sm font-medium ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Material Cost ($)
              </label>
              <input
                type="number"
                min="0"
                value={materialCost}
                onChange={(e) => setMaterialCost(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-xl border text-sm font-medium ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5" />
                Overhead Allowance (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={overheadPercent}
                onChange={(e) => setOverheadPercent(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-xl border text-sm font-medium ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                Target Net Profit Margin (%)
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={desiredProfitPercent}
                onChange={(e) => setDesiredProfitPercent(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1 font-semibold">
                <span>5% (Low)</span>
                <span className="text-amber-500 font-bold">{desiredProfitPercent}% Target</span>
                <span>50% (High)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Column */}
        <div className={`lg:col-span-5 p-6 rounded-2xl border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } space-y-6 flex flex-col justify-between`}>
          <div>
            <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span>Job Quote Breakdown</span>
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Labor Cost ({laborHours} hrs @ ${hourlyRate})</span>
                <span className="font-semibold">${baseLaborCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Materials & Parts</span>
                <span className="font-semibold">${materialCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Overhead ({overheadPercent}%)</span>
                <span className="font-semibold">${overheadCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Total Job Expenses</span>
                <span className="font-semibold">${totalCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm py-2">
                <span className="text-emerald-500 font-medium">Estimated Net Profit</span>
                <span className="font-bold text-emerald-500">${netProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-900 dark:text-slate-100">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider mb-1">
              Recommended Quote To Client
            </p>
            <p className="text-3xl font-extrabold text-amber-500">
              ${isNaN(recommendedPrice) ? '0.00' : recommendedPrice.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Provides a net margin of {desiredProfitPercent}% after covering all costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
