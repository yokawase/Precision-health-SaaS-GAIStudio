import React, { useState } from 'react';
import { UserData, SimulationResult } from './types';
import { runHealthAnalysis } from './services/healthEngine';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import SymptomChecker from './components/SymptomChecker';
import { Heart, Edit3, Stethoscope, BarChart2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'input' | 'symptom'>('input');
  const [userData, setUserData] = useState<UserData>({
    age: 40,
    sex: 'male',
    height: 170,
    weight: 65,
    alcohol: 'none',
    smoking: 'never',
    exercise: 'no',
    pylori: 'unknown',
    polypharmacy: '0',
    fam_cancer: false,
    parent_long: false,
    allergy: false,
    hist_cancer: false,
    hist_stroke: false,
    hist_heart: false,
    dm: false,
    htn: false,
    dl: false,
    inf_hep: false,
    inf_hpv: false,
  });

  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleAnalyze = () => {
    const res = runHealthAnalysis(userData);
    setResult(res);
  };

  return (
    <div className="flex min-h-screen bg-bg text-primary font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-full z-20">
        <div className="p-6 flex items-center gap-3 text-xl font-bold text-blue-400">
          <Heart className="w-6 h-6" /> Precision Health
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('input')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'input' && !result ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Edit3 className="w-5 h-5" /> 問診・入力
          </button>
          {result && (
             <button 
               onClick={() => { setActiveTab('input'); document.getElementById('dashboard-root')?.scrollIntoView({behavior:'smooth'}); }}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'input' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
             >
               <BarChart2 className="w-5 h-5" /> 分析結果
             </button>
          )}
          <button 
            onClick={() => setActiveTab('symptom')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'symptom' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Stethoscope className="w-5 h-5" /> 症状チェック
          </button>
        </nav>
        <div className="p-6 text-xs text-slate-500">
           Precision Health Manager v40<br/>
           Engineered for Longevity
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Precision Health Manager</h1>
          <p className="text-slate-500">行動変容を科学する、あなただけの健康管理SaaS</p>
        </header>

        {/* Mobile Tab Nav */}
        <div className="md:hidden flex mb-6 bg-white rounded-xl shadow-sm border border-slate-200 p-1">
           <button onClick={() => setActiveTab('input')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${activeTab === 'input' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>分析・結果</button>
           <button onClick={() => setActiveTab('symptom')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${activeTab === 'symptom' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>症状チェック</button>
        </div>

        <div className="max-w-4xl mx-auto">
          {activeTab === 'input' ? (
            <div className="space-y-8">
              <InputForm data={userData} onChange={setUserData} onAnalyze={handleAnalyze} />
              {result && <Dashboard result={result} userData={userData} />}
            </div>
          ) : (
            <SymptomChecker />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
