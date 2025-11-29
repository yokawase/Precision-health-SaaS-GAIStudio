import React, { useEffect } from 'react';
import { SimulationResult, UserData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { User, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Share2, Copy, HeartPulse, Download } from 'lucide-react';

interface Props {
  result: SimulationResult;
  userData: UserData;
}

const Dashboard: React.FC<Props> = ({ result, userData }) => {
  const formatMoney = (val: number) => `¥${Math.floor(val).toLocaleString()}`;

  const shareLine = () => {
    const dSign = result.diff >= 0 ? "+" : "";
    const text = `【Precision Health】\n健康資産分析結果\n\n年齢: ${userData.age}歳\n推定余命: ${result.le}年\n平均との差: ${dSign}${result.diff}年\n寿命中央値: ${result.median}歳\n\n#健康管理 #ライフプラン`;
    const url = "https://line.me/R/share?text=" + encodeURIComponent(text);
    window.open(url, '_blank');
  };

  const copyResult = () => {
    const dSign = result.diff >= 0 ? "+" : "";
    const text = `精密余命予測結果\n年齢: ${userData.age}歳\n推定余命: ${result.le}年\n寿命中央値: ${result.median}歳\n平均との差: ${dSign}${result.diff}年`;
    navigator.clipboard.writeText(text).then(() => alert("結果をコピーしました"));
  };

  const downloadReport = () => {
    const dSign = result.diff >= 0 ? "+" : "";
    const dateStr = new Date().toLocaleDateString("ja-JP");
    const bmi = (userData.weight / Math.pow(userData.height / 100, 2)).toFixed(1);
    
    const reportContent = `
============================================
       Precision Health Manager
         健康資産分析レポート
============================================
発行日: ${dateStr}

[基本情報]
・年齢: ${userData.age}歳
・性別: ${userData.sex === 'male' ? '男性' : '女性'}
・BMI: ${bmi}

[分析サマリー]
・推定余命: ${result.le} 年
・推定寿命: ${result.lifespan} 歳 (中央値: ${result.median} 歳)
・同年代平均との差: ${dSign}${result.diff} 年

[経済的インパクト (65歳定年までの労働価値)]
・現在の労働価値損失: ${result.economic.currentLoss === 0 ? 'なし' : '-' + formatMoney(result.economic.currentLoss)}
・改善ポテンシャル (伸びしろ): ${result.economic.potentialGain === 0 ? 'なし' : '+' + formatMoney(result.economic.potentialGain)}

[分析詳細: リスク・ボーナス要因]
${result.factors.map(f => `・${f.label}: リスク倍率 x${f.hr} (${f.impact > 0 ? '+' : ''}${f.impact.toFixed(2)}年)`).join('\n')}

[AIヘルスコーチからのアドバイス]
${result.economic.potentialGain > 0 
  ? `あなたの体にはまだ経済的価値にして${formatMoney(result.economic.potentialGain)}分の「伸びしろ」があります。生活習慣を見直すことで、さらに健康寿命を延ばせる可能性があります。` 
  : `素晴らしい健康管理です！現在の生活習慣はあなたの強力な資産になっています。この調子で定期的な検診を受け、健康資産を守り抜きましょう。`}

============================================
Precision Health Manager
行動変容を科学する、あなただけの健康管理SaaS
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PrecisionHealth_Report_${dateStr.replace(/\//g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    document.getElementById('dashboard-root')?.scrollIntoView({ behavior: 'smooth' });
  }, [result]);

  return (
    <div id="dashboard-root" className="space-y-6 animate-fade-in">
      
      {/* AI Coach Comment */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 flex gap-4 items-start">
        <div className="bg-blue-200 p-3 rounded-full shrink-0">
           <HeartPulse className="w-8 h-8 text-blue-600" />
        </div>
        <div>
           <h4 className="font-bold text-blue-700 mb-2">AIヘルスコーチ</h4>
           <div className="text-slate-700 leading-relaxed">
             <strong>{userData.age}歳からの健康戦略：</strong><br/>
             {result.economic.potentialGain > 0 ? (
               <span>
                 あなたの体にはまだ経済的価値にして<span className="text-blue-600 font-bold">{formatMoney(result.economic.potentialGain)}</span>分の「伸びしろ」があります！
                 生活習慣（特に禁煙・運動・ピロリ菌除菌）を見直すことで、健康寿命と労働価値を最大化できます。
               </span>
             ) : (
               <span>
                 素晴らしい健康管理です！現在の生活習慣はあなたの強力な資産になっています。この調子で定期的な検診を受け、健康資産を守り抜きましょう。
               </span>
             )}
           </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="text-sm text-slate-500 mb-1">推定余命 (あと何年)</div>
           <div className="text-4xl font-extrabold text-slate-800">{result.le} <span className="text-lg font-normal">年</span></div>
           <div className="text-xs text-slate-400 mt-2">同年代平均: {result.official}年</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="text-sm text-slate-500 mb-1">推定寿命 / 中央値</div>
           <div className="text-4xl font-extrabold text-slate-800">{result.lifespan} <span className="text-lg font-normal">歳</span></div>
           <div className="text-sm text-blue-600 font-bold mt-1">中央値: {result.median} 歳</div>
        </div>
        <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden ${result.diff >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
           <div className="text-sm text-slate-500 mb-1">平均との差 (健康ボーナス)</div>
           <div className={`text-4xl font-extrabold ${result.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
             {result.diff >= 0 ? '+' : ''}{result.diff} <span className="text-lg font-normal">年</span>
           </div>
           <div className="text-xs text-slate-500 mt-2">生活習慣の積み重ねの結果</div>
        </div>
      </div>

      {/* Economic Impact */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-3">
          <DollarSign className="w-5 h-5 text-accent" /> 経済的インパクト (統計的期待値)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-5 rounded-xl border ${result.economic.currentLoss === 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
             <div className={`font-bold mb-1 ${result.economic.currentLoss === 0 ? 'text-green-800' : 'text-red-800'}`}>
                {result.economic.currentLoss === 0 ? '💎 労働価値損失なし' : '⚠️ 推定労働価値損失'}
             </div>
             <div className="text-xs opacity-80 mb-3">平均寿命との差分による逸失利益の期待値</div>
             <div className={`text-3xl font-extrabold ${result.economic.currentLoss === 0 ? 'text-green-600' : 'text-red-600'}`}>
               {result.economic.currentLoss === 0 ? '¥0' : `-${formatMoney(result.economic.currentLoss)}`}
             </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
             <div className="font-bold text-blue-800 mb-1">💰 獲得可能な「追加ボーナス」</div>
             <div className="text-xs opacity-80 mb-3 text-blue-700">生活習慣改善で延びる労働可能期間の価値</div>
             <div className="text-3xl font-extrabold text-blue-600">
               +{formatMoney(result.economic.potentialGain)}
             </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-slate-400 bg-slate-50 p-3 rounded">
           ※ 計算条件: 時給¥1,300、週40時間労働、65歳定年まで生存する確率に基づいた期待値計算。
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" /> ライフコース・シミュレーション
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.curve} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="age" type="number" domain={['dataMin', 'dataMax']} unit="歳" />
              <YAxis domain={[0, 1]} tickFormatter={(val) => `${Math.round(val * 100)}%`} label={{ value: '生存確率', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                 formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, '生存率']}
                 labelFormatter={(label) => `${label}歳`}
              />
              <Legend />
              <ReferenceLine y={0.5} stroke="red" strokeDasharray="3 3" label="50%" />
              <Line type="monotone" dataKey="survival" stroke="#2563eb" strokeWidth={3} dot={false} name="あなた" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="avgSurvival" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="平均" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Advice Factors */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">分析詳細</h3>
          <div className="space-y-3">
             {result.factors.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                   <div className="flex items-center gap-2">
                      {f.hr > 1 ? <AlertTriangle className="w-4 h-4 text-red-500"/> : <CheckCircle className="w-4 h-4 text-green-500"/>}
                      <span className="font-medium text-slate-700">{f.label}</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="text-sm text-slate-500">リスク倍率: x{f.hr}</div>
                      <div className={`font-bold ${f.impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                         {f.impact > 0 ? '+' : ''}{f.impact.toFixed(2)}年
                      </div>
                   </div>
                </div>
             ))}
          </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         <button onClick={shareLine} className="flex items-center justify-center gap-2 p-4 bg-[#06c755] text-white font-bold rounded-xl shadow-lg hover:bg-[#05b34c] transition active:scale-95">
            <Share2 className="w-5 h-5" /> LINEで送る
         </button>
         <button onClick={downloadReport} className="flex items-center justify-center gap-2 p-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition active:scale-95">
            <Download className="w-5 h-5" /> レポート保存
         </button>
         <button onClick={copyResult} className="flex items-center justify-center gap-2 p-4 bg-slate-700 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition active:scale-95">
            <Copy className="w-5 h-5" /> 結果をコピー
         </button>
      </div>

    </div>
  );
};

export default Dashboard;