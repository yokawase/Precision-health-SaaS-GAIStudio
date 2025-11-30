import React, { useState } from 'react';
import { UserData, SimulationResult } from './types';
import { runHealthAnalysis } from './services/healthEngine';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import SymptomChecker from './components/SymptomChecker';
import { HeartPulse, Edit3, Stethoscope, BarChart2 } from 'lucide-react';

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
    atrophic_gastritis: 'unknown',
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
    <div className="flex min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans">
      
      {/* Classic Sidebar */}
      <aside className="hidden md:flex flex-col w-[250px] bg-[#1e293b] text-white fixed h-full z-20 overflow-y-auto">
        <div className="p-5">
           <div className="flex items-center gap-2 text-xl font-bold text-blue-400 mb-8">
             <HeartPulse className="w-6 h-6" /> Precision Health
           </div>
           
           <nav className="space-y-1">
             <NavButton 
                active={activeTab === 'input' && !result} 
                onClick={() => setActiveTab('input')}
                icon={<Edit3 className="w-5 h-5" />}
                label="問診・入力"
             />
             <NavButton 
                active={activeTab === 'symptom'} 
                onClick={() => setActiveTab('symptom')}
                icon={<Stethoscope className="w-5 h-5" />}
                label="症状チェック"
             />
             {result && (
               <NavButton 
                 active={activeTab === 'input' && !!result} 
                 onClick={() => { setActiveTab('input'); setTimeout(() => document.getElementById('dashboard-root')?.scrollIntoView({behavior:'smooth'}), 100); }}
                 icon={<BarChart2 className="w-5 h-5" />}
                 label="予測ダッシュボード"
               />
             )}
           </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[250px] p-4 md:p-8 w-full">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-2">
            Precision Health Manager
          </h1>
          <p className="text-slate-500 text-sm">行動変容を科学する、あなただけの健康管理SaaS</p>
        </header>

        {/* Mobile Tab Nav */}
        <div className="md:hidden flex mb-6 bg-white border border-slate-200 p-1 rounded-lg">
           <button onClick={() => setActiveTab('input')} className={`flex-1 py-2 rounded text-sm font-bold ${activeTab === 'input' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>入力・分析</button>
           <button onClick={() => setActiveTab('symptom')} className={`flex-1 py-2 rounded text-sm font-bold ${activeTab === 'symptom' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>症状チェック</button>
        </div>

        <div>
          {activeTab === 'input' ? (
            <div className="space-y-6">
              <InputForm data={userData} onChange={setUserData} onAnalyze={handleAnalyze} />
              {result && <div className="pt-6 border-t border-slate-200"><Dashboard result={result} userData={userData} /></div>}
            </div>
          ) : (
            <SymptomChecker />
          )}
        </div>
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
      active 
        ? 'bg-[#334155] text-white' 
        : 'text-slate-300 hover:bg-[#334155] hover:text-white'
    }`}
  >
    <div className="w-5 text-center">{icon}</div>
    <span className="text-sm">{label}</span>
  </button>
);

export default App;