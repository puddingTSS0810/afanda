
import React from 'react';
import { AvatarResult } from '../types';

interface AvatarDisplayProps {
  result: AvatarResult;
  onReset: () => void;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ result, onReset }) => {
  const clanNames = {
    forest: '森林族 (Omatikaya)',
    sea: '礁岩族 (Metkayina)',
    ash: '灰烬族 (Varang)'
  };

  const clanColors = {
    forest: 'text-green-400 bg-green-500/10',
    sea: 'text-cyan-400 bg-cyan-500/10',
    ash: 'text-red-400 bg-red-500/10'
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
            <img 
              src={result.imageUrl} 
              alt="AI 生成的化身" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Analysis Details */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                生物 DNA 链路已连接
              </h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border border-current ${clanColors[result.clan]}`}>
                {clanNames[result.clan]}
              </span>
            </div>
            <p className="text-slate-400 font-mono text-sm tracking-tight uppercase">
              面部特征映射与捕捉完成
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl">
              <span className="block text-xs font-mono text-blue-400 uppercase mb-1">表情识别</span>
              <span className="text-lg font-medium capitalize">{result.analysis.expression}</span>
            </div>
            <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl">
              <span className="block text-xs font-mono text-blue-400 uppercase mb-1">眼部轮廓</span>
              <span className="text-lg font-medium capitalize">{result.analysis.eyeColor}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl">
            <span className="block text-xs font-mono text-blue-400 uppercase mb-2">基因标记特征</span>
            <div className="flex flex-wrap gap-2">
              {result.analysis.prominentFeatures.map((feature, i) => (
                <span key={i} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-300">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 bg-blue-900/20 border border-blue-500/20 rounded-2xl">
            <h3 className="text-sm font-mono text-blue-300 uppercase mb-4 flex items-center gap-2">
              <i className="fas fa-chart-bar"></i> 神经突触同步状态
            </h3>
            <div className="space-y-3">
              {[
                { label: '神经和谐度', value: result.analysis.emotionScore.happy },
                { label: '信号稳定性', value: result.analysis.emotionScore.neutral },
                { label: '处理强度', value: result.analysis.emotionScore.intense }
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span>{stat.label}</span>
                    <span>{Math.round(stat.value * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000" 
                      style={{ width: `${stat.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onReset}
            className="w-full py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-lg shadow-white/5 active:scale-95"
          >
            启动新的神经同步
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarDisplay;
