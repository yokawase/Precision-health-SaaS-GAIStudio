import React from 'react';
import { UserData, Sex, Alcohol, Smoking, Exercise, Pylori, Polypharmacy } from '../types';
import { User, Activity, FileText, Calculator } from 'lucide-react';

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
  let bmiColor = "text-gray-500";
  let bmiLabel = "";
  if (bmi < 18.5) { bmiColor = "text-red-500"; bmiLabel = "(低体重)"; }
  else if (bmi < 25) { bmiColor = "text-green-500"; bmiLabel = "(標準)"; }
  else if (bmi < 30) { bmiColor = "text-yellow-600"; bmiLabel = "(肥満 1度)"; }
  else if (!isNaN(bmi)) { bmiColor = "text-red-600"; bmiLabel = "(肥満 2度以上)"; }

  return (
    <div className="space-y-6">
      
      {/* Profile */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-3">
          <User className="w-5 h-5 text-accent" /> 基本プロフィール
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">年齢</label>
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
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">性別</label>
            <select 
              className="w-full p-3 border border-slate-300 rounded-lg bg-white"
              value={data.sex}
              onChange={(e) => handleChange('sex', e.target.value as Sex)}
            >
              <option value="male">男性</option>
              <option value="female">女性</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">身長 (cm)</label>
            <input 
              type="number" 
              className="w-full p-3 border border-slate-300 rounded-lg"
              value={data.height}
              onChange={(e) => handleChange('height', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">体重 (kg)</label>
            <input 
              type="number" 
              className="w-full p-3 border border-slate-300 rounded-lg"
              value={data.weight}
              onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
        <div className="text-right mt-3 text-sm">
          BMI: <span className={`font-bold text-lg ${bmiColor}`}>{getBMI()}</span> <span className={bmiColor}>{bmiLabel}</span>
        </div>
      </div>

      {/* Lifestyle */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-3">
          <Activity className="w-5 h-5 text-accent" /> 生活習慣・家族歴
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">飲酒習慣</label>
            <select 
              className="w-full p-3 border border-slate-300 rounded-lg bg-white"
              value={data.alcohol}
              onChange={(e) => handleChange('alcohol', e.target.value as Alcohol)}
            >
              <option value="none">飲まない</option>
              <option value="moderate">適度 (1日1合程度)</option>
              <option value="heavy">多量 (週450g以上)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">喫煙歴</label>
            <select 
              className="w-full p-3 border border-slate-300 rounded-lg bg-white"
              value={data.smoking}
              onChange={(e) => handleChange('smoking', e.target.value as Smoking)}
            >
              <option value="never">吸わない</option>
              <option value="past">過去に吸っていた</option>
              <option value="current">吸っている</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">運動習慣 (週2+)</label>
            <select 
              className="w-full p-3 border border-slate-300 rounded-lg bg-white"
              value={data.exercise}
              onChange={(e) => handleChange('exercise', e.target.value as Exercise)}
            >
              <option value="yes">あり</option>
              <option value="no">なし</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 text-accent mr-3" checked={data.fam_cancer} onChange={(e) => handleChange('fam_cancer', e.target.checked)} />
            がん家族歴(第1近親)
          </label>
          <label className="flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 text-accent mr-3" checked={data.parent_long} onChange={(e) => handleChange('parent_long', e.target.checked)} />
            親が長寿(90歳~)
          </label>
          <label className="flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 text-accent mr-3" checked={data.allergy} onChange={(e) => handleChange('allergy', e.target.checked)} />
            アレルギー体質
          </label>
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-3">
          <FileText className="w-5 h-5 text-accent" /> 既往歴・感染症
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
           <div>
            <label className="block text-sm font-semibold text-red-500 mb-1">ピロリ菌検査</label>
            <select 
              className="w-full p-3 border border-slate-300 rounded-lg bg-white"
              value={data.pylori}
              onChange={(e) => handleChange('pylori', e.target.value as Pylori)}
            >
              <option value="unknown">検査未実施 / 不明</option>
              <option value="negative">陰性 (未感染)</option>
              <option value="eradicated">除菌済み</option>
              <option value="current">陽性 (現感染)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">内服薬 (ポリファーマシー)</label>
            <select 
              className="w-full p-3 border border-slate-300 rounded-lg bg-white"
              value={data.polypharmacy}
              onChange={(e) => handleChange('polypharmacy', e.target.value as Polypharmacy)}
            >
              <option value="0">なし</option>
              <option value="1-4">1〜4種類</option>
              <option value="5+">5種類以上</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { k: 'hist_cancer', l: 'がん既往', w: true },
            { k: 'hist_stroke', l: '脳卒中', w: true },
            { k: 'hist_heart', l: '心筋梗塞', w: true },
            { k: 'dm', l: '糖尿病' },
            { k: 'htn', l: '高血圧' },
            { k: 'dl', l: '高脂血症' },
            { k: 'inf_hep', l: '肝炎(B/C)' },
            { k: 'inf_hpv', l: 'HPV' },
          ].map((item) => (
             <label key={item.k} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${item.w ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-white hover:bg-slate-50'}`}>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-accent mr-2" 
                  checked={(data as any)[item.k]} 
                  onChange={(e) => handleChange(item.k as keyof UserData, e.target.checked)} 
                />
                <span className="text-sm">{item.l}</span>
             </label>
          ))}
        </div>
      </div>

      <button 
        onClick={onAnalyze}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xl font-bold rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
      >
        <Calculator className="w-6 h-6" /> 健康資産と余命を分析する
      </button>

    </div>
  );
};

export default InputForm;
