import React, { useEffect } from 'react';
import { SimulationResult, UserData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { DollarSign, TrendingUp, Share2, Copy, HeartPulse, Download } from 'lucide-react';
import StomachCancerRisk from './StomachCancerRisk';

interface Props {
  result: SimulationResult;
  userData: UserData;
}

const Dashboard: React.FC<Props> = ({ result, userData }) => {
  const formatMoney = (val: number) => `¥${Math.floor(val).toLocaleString()}`;

  // LINE共有用のURLをレンダリング時に生成（JavaScriptのイベントハンドラではなく、純粋なリンクとして機能させるため）
  const dSign = result.diff >= 0 ? "+" : "";
  const shareText = `【Precision Health】診断結果
年齢: ${userData.age}歳
推定余命: ${result.le}年
平均との差: ${dSign}${result.diff}年
寿命中央値: ${result.median}歳

#PrecisionHealth #健康資産`;

  // LINE公式のシェアURLスキーム (https://line.me/R/share?text=...)
  const shareUrl = `https://line.me/R/share?text=${encodeURIComponent(shareText)}`;

  const copyResult = () => {
    const text = `精密余命予測結果\n年齢: ${userData.age}歳\n推定余命: ${result.le}年\n寿命中央値: ${result.median}歳\n平均との差: ${dSign}${result.diff}年`;
    navigator.clipboard.writeText(text).then(() => alert("結果をコピーしました"));
  };

  const downloadReport = () => {
    const dateStr = new Date().toLocaleDateString("ja-JP");
    const bmi = (userData.weight / Math.pow(userData.height / 100, 2)).toFixed(1);
    const reportContent = `
============================================
Precision Health Manager レポート
発行日: ${dateStr}
============================================
[基本情報]
年齢: ${userData.age}歳 / 性別: ${userData.sex === 'male' ? '男性' : '女性'}
BMI: ${bmi}

[分析結果]
推定余命: ${result.le} 年 (寿命: ${result.lifespan} 歳)
平均差: ${dSign}${result.diff} 年

[経済的価値]
損失: ${result.economic.currentLoss === 0 ? 'なし' : '-' + formatMoney(result.economic.currentLoss)}
改善余地: ${result.economic.potentialGain === 0 ? 'なし' : '+' + formatMoney(result.economic.potentialGain)}

[詳細]
${result.factors.map(f => `・${f.label}: x${f.hr}`).join('\n')}
============================================`;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report_${dateStr.replace(/\//g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    document.getElementById('dashboard-root')?.scrollIntoView({ behavior: 'smooth' });
  }, [result]);

  // アドバイス生成ロジック
  const getAiAdvice = () => {
    if (result.economic.potentialGain <= 0) {
      return <span>素晴らしい健康管理です！現在の生活習慣はあなたの強力な資産になっています。</span>;
    }

    const suggestions: string[] = [];
    if (userData.smoking === 'current') suggestions.push("禁煙");
    if (userData.exercise === 'no') suggestions.push("運動習慣");
    if (userData.alcohol === 'heavy') suggestions.push("節酒");
    
    // BMIチェック
    const bmi = userData.weight / Math.pow(userData.height / 100, 2);
    if (bmi >= 25) suggestions.push("適正体重への減量");
    if (bmi < 18.5) suggestions.push("栄養改善");

    const actionText = suggestions.length > 0 
      ? `まずは「${suggestions.join("・")}」から始めましょう。`
      : "生活習慣の改善に取り組みましょう。";

    return (
      <span>
        あなたの体にはまだ<span className="font-bold text-blue-600 text-lg mx-1">{formatMoney(result.economic.potentialGain)}</span>分の「伸びしろ」があります！{actionText}
      </span>
    );
  };

  return (
    <div id="dashboard-root" className="space-y-6">
      
      {/* AI Coach Comment */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 flex gap-4 items-start">
         <div className="bg-blue-200 p-3 rounded-full shrink-0 text-blue-700">
            <HeartPulse className="w-8 h-8" />
         </div>
         <div className="flex-1">
            <h4 className="font-bold text-blue-800 mb-1">AIヘルスコーチ</h4>
            <div className="text-slate-800">
               {getAiAdvice()}
            </div>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
           label="推定余命 (あと何年)" 
           value={result.le} 
           unit="年" 
           sub={`同年代平均: ${result.official}年`} 
        />
        <MetricCard 
           label="推定寿命" 
           value={result.lifespan} 
           unit="歳" 
           sub="生存確率50%到達年齢"
        />
        <MetricCard 
           label="平均との差 (健康ボーナス)" 
           value={result.diff} 
           unit="年" 
           prefix={result.diff >= 0 ? "+" : ""}
           highlight={true}
           sub="生活習慣の積み重ねの結果"
        />
      </div>

      {/* Stomach Cancer Risk Section */}
      {result.stomachRisk && (
        <StomachCancerRisk result={result.stomachRisk} />
      )}

      {/* Economic Impact */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="border-b border-slate-100 pb-4 mb-4 font-bold text-lg text-slate-800 flex items-center gap-2">
           <DollarSign className="w-5 h-5 text-blue-600" /> 経済的インパクト (65歳定年モデル)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Loss Box (Gray/Red) */}
          <div className={`p-5 rounded-lg border ${result.economic.currentLoss === 0 ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200'}`}>
             <div className={`font-bold text-sm mb-1 ${result.economic.currentLoss === 0 ? 'text-slate-600' : 'text-red-700'}`}>
               {result.economic.currentLoss === 0 ? '📊 労働価値損失なし' : '⚠️ 現在の推定労働価値損失'}
             </div>
             <div className="text-xs text-slate-500 mb-2">平均寿命との差分 × 労働可能期間</div>
             <div className={`text-3xl font-bold font-mono ${result.economic.currentLoss === 0 ? 'text-slate-600' : 'text-red-600'}`}>
                {result.economic.currentLoss === 0 ? '¥0' : `-${formatMoney(result.economic.currentLoss)}`}
             </div>
          </div>

          {/* Potential Gain Box (Green) */}
          <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-200">
             <div className="font-bold text-sm text-emerald-800 mb-1">💰 獲得可能な「追加ボーナス」</div>
             <div className="text-xs text-emerald-600 mb-2">生活習慣改善で延びる労働可能期間</div>
             <div className="text-3xl font-bold font-mono text-emerald-600">
                +{formatMoney(result.economic.potentialGain)}
             </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-400 bg-slate-50 p-2 rounded">
           計算条件: 時給1,300円 / 年間2,080時間労働 / 定年65歳
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="border-b border-slate-100 pb-4 mb-4 font-bold text-lg text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" /> ライフコース・シミュレーション
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.curve}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="age" unit="歳" />
              <YAxis domain={[0, 1]} tickFormatter={(val) => `${Math.round(val * 100)}%`} />
              <Tooltip formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, '生存率']} labelFormatter={(l) => `${l}歳`} />
              <Legend />
              <ReferenceLine y={0.5} stroke="#cbd5e1" strokeDasharray="3 3" label={{ position: 'right', value: '50%', fontSize: 10 }} />
              <Line type="monotone" dataKey="survival" stroke="#2563eb" strokeWidth={3} dot={false} name="あなた" />
              <Line type="monotone" dataKey="avgSurvival" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="平均" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         {/* Buttonではなく、純粋なHTMLリンク(aタグ)として実装。これによりJavaScriptの制限を受けず確実にLINEアプリが起動する */}
         <a 
           href={shareUrl}
           target="_blank"
           rel="nofollow noopener noreferrer"
           className="flex items-center justify-center gap-2 p-3 bg-[#06c755] text-white font-bold rounded-lg shadow hover:bg-[#05b34c] transition-colors no-underline"
         >
            <Share2 className="w-5 h-5" /> LINEで送る
         </a>

         <button onClick={copyResult} className="flex items-center justify-center gap-2 p-3 bg-slate-600 text-white font-bold rounded-lg shadow hover:bg-slate-700 transition-colors">
            <Copy className="w-5 h-5" /> 結果をコピー
         </button>

         <button onClick={downloadReport} className="col-span-1 sm:col-span-2 flex items-center justify-center gap-2 p-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 transition-colors">
            <Download className="w-5 h-5" /> レポート保存 (.txt)
         </button>
      </div>

    </div>
  );
};

const MetricCard = ({ label, value, unit, sub, prefix = "", highlight }: any) => {
    return (
        <div className={`p-6 rounded-lg border text-center ${highlight ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
           <div className="text-sm text-slate-500 mb-1">{label}</div>
           <div className="text-4xl font-black text-slate-800">
              {prefix}{value}<span className="text-lg font-bold ml-1">{unit}</span>
           </div>
           <div className="text-xs text-slate-400 mt-2">{sub}</div>
        </div>
    )
}

export default Dashboard;