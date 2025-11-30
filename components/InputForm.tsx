import React from 'react';
import { UserData, UserData as UserDataType, Pylori, AtrophicGastritis, Polypharmacy } from '../types';
import { User, Activity, FileText, Calculator, AlertCircle } from 'lucide-react';

interface Props {
  data: UserData;
  onChange: (data: UserData) => void;
  onAnalyze: () => void;
}

const InputForm: React.FC<Props> = ({ data, onChange, onAnalyze }) => {
  const handleChange = <K extends keyof UserData>(key: K, value: UserData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const getBMI = () => {
    if (data.height > 0 && data.weight > 0) {
      return (data.weight / Math.pow(data.height / 100, 2)).toFixed(1);
    }
    return "--";
  };

  const bmi = parseFloat(getBMI());
  let bmiLabel = "(標準)";
  let bmiColor = "text-emerald-600";
  
  if (bmi < 18.5) { bmiLabel = "(低体重)"; bmiColor = "text-red-500"; }
  else if (bmi >= 25 && bmi < 30) { bmiLabel = "(肥満 1度)"; bmiColor = "text-amber-500"; }
  else if (bmi >= 30) { bmiLabel = "(肥満 2度以上)"; bmiColor = "text-red-600"; }

  const historyItems: { k: keyof UserData; l: string; risk?: boolean }[] = [
    { k: 'hist_cancer', l: 'がん既往(手術歴)', risk: true },
    { k: 'hist_stroke', l: '脳卒中', risk: true },
    { k: 'hist_heart', l: '心筋梗塞/狭心症', risk: true },
    { k: 'dm', l: '糖尿病' },
    { k: 'htn', l: '高血圧' },
    { k: 'dl', l: '高脂血症' },
    { k: 'inf_hep', l: '肝炎ウイルス(B/C)' },
    { k: 'inf_hpv', l: 'HPV(ヒトパピローマ)' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Profile Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 text-lg font-bold text-slate-800">
          <User className="w-5 h-5 text-blue-600" /> 基本プロフィール
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="form-group">
            <label className="block text-sm font-bold text-slate-600 mb-2">年齢</label>
            <select 
              className="w-full p-3 border border-slate-300 rounded-lg bg-white"
              value={data.age}
              onChange={(e) => handleChange('age', parseInt(e.target.value))}
            >
              {Array.from({ length: 81 }, (_, i) => i + 20).map(age => (
                <option key={age} value={age}>{age} 歳</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="block text-sm font-bold text-slate-600 mb-2">性別</label>
            <select 
              className="w-full p-3 border border-slate-300 rounded-lg bg-white"
              value={data.sex}
              onChange={(e) => handleChange('sex', e.target.value as any)}
            >
              <option value="male">男性</option>
              <option value="female">女性</option>
            </select>
          </div>
          <div className="form-group">
            <label className="block text-sm font-bold text-slate-600 mb-2">身長 (cm)</label>
            <input 
              type="number" 
              className="w-full p-3 border border-slate-300 rounded-lg"
              value={data.height || ''}
              onChange={(e) => handleChange('height', e.target.value === '' ? 0 : parseFloat(e.target.value))}
              placeholder="例: 170"
            />
          </div>
          <div className="form-group">
            <label className="block text-sm font-bold text-slate-600 mb-2">体重 (kg)</label>
            <input 
              type="number" 
              className="w-full p-3 border border-slate-300 rounded-lg"
              value={data.weight || ''}
              onChange={(e) => handleChange('weight', e.target.value === '' ? 0 : parseFloat(e.target.value))}
              placeholder="例: 65"
            />
          </div>
        </div>
        <div className="text-right mt-2 text-sm text-slate-500">
           BMI: <span className="font-bold text-slate-800">{getBMI()}</span> <span className={bmiColor}>{bmiLabel}</span>
        </div>
      </div>

      {/* Lifestyle Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 text-lg font-bold text-slate-800">
          <Activity className="w-5 h-5 text-blue-600" /> 生活習慣・家族歴
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
           <div>
             <label className="block text-sm font-bold text-slate-600 mb-2">飲酒習慣</label>
             <select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.alcohol} onChange={(e) => handleChange('alcohol', e.target.value as any)}>
                <option value="none">飲まない</option>
                <option value="moderate">適度 (1日1合程度)</option>
                <option value="heavy">多量 (週450g以上)</option>
             </select>
           </div>
           <div>
             <label className="block text-sm font-bold text-slate-600 mb-2">喫煙歴</label>
             <select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.smoking} onChange={(e) => handleChange('smoking', e.target.value as any)}>
                <option value="never">吸わない (生涯非喫煙)</option>
                <option value="past">過去に吸っていた</option>
                <option value="current">吸っている</option>
             </select>
           </div>
           <div>
             <label className="block text-sm font-bold text-slate-600 mb-2">運動習慣 (週2回以上)</label>
             <select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.exercise} onChange={(e) => handleChange('exercise', e.target.value as any)}>
                <option value="yes">あり</option>
                <option value="no">なし</option>
             </select>
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
           <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
             <input type="checkbox" className="w-4 h-4 mr-2" checked={data.fam_cancer} onChange={(e) => handleChange('fam_cancer', e.target.checked)} />
             がん家族歴(第1近親)
           </label>
           <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
             <input type="checkbox" className="w-4 h-4 mr-2" checked={data.parent_long} onChange={(e) => handleChange('parent_long', e.target.checked)} />
             親が長寿(90歳~)
           </label>
           <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
             <input type="checkbox" className="w-4 h-4 mr-2" checked={data.allergy} onChange={(e) => handleChange('allergy', e.target.checked)} />
             アレルギー体質
           </label>
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 text-lg font-bold text-slate-800">
          <FileText className="w-5 h-5 text-blue-600" /> 既往歴・感染症・内服
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
           <div>
              <label className="block text-sm font-bold text-rose-600 mb-2">ピロリ菌検査</label>
              <select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.pylori} onChange={(e) => handleChange('pylori', e.target.value as Pylori)}>
                <option value="unknown">検査未実施 / 不明</option>
                <option value="negative">陰性 (未感染)</option>
                <option value="eradicated">除菌済み</option>
                <option value="current">陽性 (現感染)</option>
              </select>
           </div>
           <div>
              <label className="block text-sm font-bold text-rose-600 mb-2">萎縮性胃炎 (胃カメラ)</label>
              <select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.atrophic_gastritis} onChange={(e) => handleChange('atrophic_gastritis', e.target.value as AtrophicGastritis)}>
                <option value="unknown">検査未実施 / 不明</option>
                <option value="yes">あり (要経過観察)</option>
                <option value="no">なし</option>
              </select>
           </div>
           <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">内服薬 (ポリファーマシー)</label>
              <select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.polypharmacy} onChange={(e) => handleChange('polypharmacy', e.target.value as Polypharmacy)}>
                <option value="0">なし</option>
                <option value="1-4">1〜4種類</option>
                <option value="5+">5種類以上 (多剤併用)</option>
              </select>
           </div>
        </div>

        <label className="block font-bold text-slate-600 mb-2 text-sm">既往歴・感染症 (該当するものにチェック)</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {historyItems.map((item) => (
             <label 
               key={item.k} 
               className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${item.risk ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
             >
               <input 
                 type="checkbox" 
                 className="w-4 h-4 mr-2" 
                 checked={!!(data as any)[item.k]} 
                 onChange={(e) => handleChange(item.k, e.target.checked)}
               />
               <span className="text-sm font-medium">{item.l}</span>
             </label>
          ))}
        </div>
      </div>

      <button 
        onClick={onAnalyze}
        className="w-full py-4 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-bold rounded-xl shadow-lg transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
      >
        <Calculator className="w-5 h-5" />
        <span>健康資産と余命を分析する</span>
      </button>

    </div>
  );
};

export default InputForm;