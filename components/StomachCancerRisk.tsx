import React from 'react';
import { StomachCancerResult } from '../types';
import { Activity, Info } from 'lucide-react';

interface Props {
  result: StomachCancerResult;
}

const StomachCancerRisk: React.FC<Props> = ({ result }) => {
  if (result.level === 'unknown') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" /> 胃がんリスク評価
        </div>
        <p className="text-slate-600">{result.advice}</p>
      </div>
    );
  }

  const isHigh = result.level === 'high';
  const isMedium = result.level === 'medium';
  
  const label = isHigh ? '高リスク' : isMedium ? '中リスク' : '低リスク';
  const scoreColor = isHigh ? 'text-red-600' : isMedium ? 'text-amber-600' : 'text-emerald-600';
  const badgeBg = isHigh ? 'bg-red-100 text-red-800' : isMedium ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';

  const maxAbsValue = Math.max(...result.contributions.map(c => Math.abs(c.value)), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
         <Activity className="w-5 h-5 text-blue-600" /> 胃がんリスク評価 (XAI)
      </div>

      <div className="flex flex-col md:flex-row gap-8">
         <div className="md:w-1/2 text-center bg-slate-50 p-6 rounded-lg border border-slate-200">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-2 ${badgeBg}`}>{label}</span>
            <div className="text-sm text-slate-500 font-bold">リスクスコア</div>
            <div className={`text-5xl font-black ${scoreColor}`}>
               {result.score}<span className="text-lg text-slate-400">/99</span>
            </div>
            <div className="mt-4 text-left text-sm text-slate-600 bg-white p-3 rounded border border-slate-200">
               {result.advice}
            </div>
         </div>

         <div className="md:w-1/2">
            <h4 className="font-bold text-slate-700 text-sm mb-3">リスク要因の寄与度 (SHAP値)</h4>
            <div className="space-y-2">
               {result.contributions.map((c, i) => {
                  const widthPct = (Math.abs(c.value) / maxAbsValue) * 100;
                  const isRisk = c.value > 0;
                  const barColor = isRisk ? 'bg-red-400' : 'bg-emerald-400';
                  
                  return (
                     <div key={i} className="flex items-center text-sm gap-2">
                        <div className="w-24 text-right font-bold text-slate-600">{c.label}</div>
                        <div className="flex-1 bg-slate-100 h-4 rounded overflow-hidden">
                           <div className={`h-full ${barColor}`} style={{ width: `${widthPct}%` }}></div>
                        </div>
                        <div className={`w-10 text-right font-mono text-xs ${isRisk ? 'text-red-600' : 'text-emerald-600'}`}>
                           {isRisk ? '+' : ''}{c.value.toFixed(1)}
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
    </div>
  );
};

export default StomachCancerRisk;