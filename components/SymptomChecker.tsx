import React, { useState } from 'react';
import { Thermometer, AlertCircle, ShieldCheck, Activity, XCircle } from 'lucide-react';

const SymptomChecker: React.FC = () => {
  const [activeSymptoms, setActiveSymptoms] = useState<string[]>([]);

  const toggleSymptom = (id: string) => {
    setActiveSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const symptoms = [
    { id: 'fever', label: '発熱・感冒', icon: <Thermometer className="w-5 h-5"/> },
    { id: 'pain', label: '疼痛 (腰・背中)', icon: <Activity className="w-5 h-5"/> },
    { id: 'stomach', label: '消化器 (嘔吐/下痢)', icon: <XCircle className="w-5 h-5"/> },
    { id: 'injury', label: '外傷 (ケガ)', icon: <AlertCircle className="w-5 h-5"/> },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
           <Thermometer className="w-6 h-6 text-accent" /> 気になる症状・セルフケアガイド
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          現在気になる症状があればチェックしてください。ガイドラインに基づく「安全な対処」と「危険な兆候（Red Flag）」を表示します。
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {symptoms.map(s => (
            <button
              key={s.id}
              onClick={() => toggleSymptom(s.id)}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                activeSymptoms.includes(s.id) 
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md ring-1 ring-blue-500' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className={activeSymptoms.includes(s.id) ? 'text-blue-600' : 'text-slate-400'}>{s.icon}</div>
              <span className="font-bold text-sm">{s.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {activeSymptoms.includes('fever') && (
            <SymptomCard 
              title="🤒 発熱・感冒"
              safeTitle="セルフケア適用 (様子見OK)"
              safeDesc="軽度で短期間の発熱、全身倦怠感、鼻水。水分(ORS)摂取で脱水予防が可能な場合。"
              safeAction="総合感冒薬による緩和、十分な睡眠と水分補給。"
              redDesc={[
                "38℃以上の発熱が4日以上持続",
                "強い頭痛、項部硬直(首が固い・髄膜炎疑い)",
                "けいれん、意識障害、呼吸困難"
              ]}
            />
          )}
          {activeSymptoms.includes('pain') && (
            <SymptomCard 
              title="⚡ 疼痛 (腰痛・背部痛)"
              safeTitle="セルフケア適用"
              safeDesc="軽度から中等度の筋肉痛、姿勢変化に伴う痛み。"
              safeAction="安静にしすぎず動ける範囲で動かす。湿布やNSAIDs(痛み止め)の使用。"
              redDesc={[
                "急性の引き裂かれるような背部痛 (大動脈解離の可能性)",
                "原因不明の体重減少、排尿・排便障害(馬尾神経圧迫)",
                "安静にしていても痛む重度の夜間痛"
              ]}
            />
          )}
          {activeSymptoms.includes('stomach') && (
            <SymptomCard 
              title="🤢 消化器症状 (嘔吐/下痢)"
              safeTitle="セルフケア適用"
              safeDesc="軽度な下痢・嘔吐、経口補水が可能な場合。"
              safeAction="絶食せず消化の良いものを少量ずつ。脱水予防(ORS)が最優先。"
              redDesc={[
                "激しい腹痛の持続",
                "血便・吐血 (タール便含む)",
                "強い脱水症状 (意識レベル低下、尿量減少)"
              ]}
            />
          )}
          {activeSymptoms.includes('injury') && (
            <SymptomCard 
              title="🩹 外傷"
              safeTitle="セルフケア適用"
              safeDesc="軽微な擦過傷、表皮に留まる切り傷、異物が完全に除去できた場合。"
              safeAction="水道水でよく洗浄し、湿潤療法(キズパワーパッド等)で保護。消毒は控える。"
              redDesc={[
                "圧迫しても止血困難",
                "砂や異物が完全に除去できない (感染・刺青リスク)",
                "広範囲の熱傷、関節が動かせない"
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const SymptomCard = ({ title, safeTitle, safeDesc, safeAction, redDesc }: any) => (
  <div className="border border-slate-200 rounded-xl overflow-hidden animate-slide-down">
     <div className="bg-slate-50 p-3 font-bold text-slate-700 border-b">{title}</div>
     <div className="p-4 grid md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
           <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
             <ShieldCheck className="w-5 h-5"/> {safeTitle}
           </div>
           <p className="text-sm text-slate-700 mb-2">{safeDesc}</p>
           <div className="text-sm font-semibold text-emerald-800">対処: {safeAction}</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
           <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
             <AlertCircle className="w-5 h-5"/> 受診推奨 (Red Flag)
           </div>
           <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
             {redDesc.map((d: string, i: number) => <li key={i}>{d}</li>)}
           </ul>
        </div>
     </div>
  </div>
);

export default SymptomChecker;
