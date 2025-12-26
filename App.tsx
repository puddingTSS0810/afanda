
import React, { useState } from 'react';
import CameraScanner from './components/CameraScanner';
import AvatarDisplay from './components/AvatarDisplay';
import { analyzeFace, generateAvatar } from './services/geminiService';
import { CaptureState, AvatarResult, Clan } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<CaptureState>({ status: 'idle' });
  const [result, setResult] = useState<AvatarResult | null>(null);
  const [selectedClan, setSelectedClan] = useState<Clan>('forest');

  const handleCapture = async (base64: string) => {
    setState({ status: 'analyzing' });
    try {
      // 执行分析（内部已包含 429 fallback）
      const analysis = await analyzeFace(base64);
      
      setState({ status: 'generating' });
      // 生成头像（使用开源 Pollinations 接口）
      const imageUrl = await generateAvatar(analysis, selectedClan);
      
      setResult({
        imageUrl,
        analysis,
        clan: selectedClan
      });
      setState({ status: 'completed' });
    } catch (err: any) {
      console.error("Pipeline Error:", err);
      setState({ 
        status: 'error', 
        errorMessage: '潘多拉基站同步失败，请检查网络后重试。' 
      });
    }
  };

  const handleReset = () => {
    setResult(null);
    setState({ status: 'idle' });
  };

  const clans: { id: Clan; name: string; icon: string; desc: string; color: string }[] = [
    { id: 'forest', name: '森林族', icon: 'fa-leaf', desc: '奥马地卡雅', color: 'border-green-500 text-green-400' },
    { id: 'sea', name: '礁岩族', icon: 'fa-water', desc: '麦特卡伊娜', color: 'border-cyan-500 text-cyan-400' },
    { id: 'ash', name: '灰烬族', icon: 'fa-fire', desc: '瓦朗族', color: 'border-red-500 text-red-400' },
  ];

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center biolum-glow">
            <i className="fas fa-dna text-2xl text-white"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">阿凡达 AI</h1>
            <p className="text-blue-400 font-mono text-[10px] tracking-[0.2em] uppercase">
              开源混合采样接口 V2
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded bg-green-500/10 border border-green-500/20 text-[10px] font-mono text-green-400">
            ● 渲染引擎: Pollinations (OPEN)
          </span>
          <span className="px-3 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-300">
            ● 分析引擎: Gemini Hybrid
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {state.status === 'idle' || state.status === 'analyzing' || state.status === 'generating' ? (
          <div className="w-full space-y-8 animate-in fade-in duration-1000">
            {state.status === 'idle' && (
              <div className="max-w-2xl mx-auto w-full mb-8">
                <p className="text-center text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">选择目标生物序列</p>
                <div className="grid grid-cols-3 gap-4">
                  {clans.map((clan) => (
                    <button
                      key={clan.id}
                      onClick={() => setSelectedClan(clan.id)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 group ${
                        selectedClan === clan.id 
                          ? `${clan.color} bg-white/5 shadow-[0_0_20px_rgba(59,130,246,0.2)]` 
                          : 'border-white/5 bg-slate-900/50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                      }`}
                    >
                      <i className={`fas ${clan.icon} text-xl`}></i>
                      <div className="text-center">
                        <div className="font-bold text-sm">{clan.name}</div>
                        <div className="text-[10px] font-mono opacity-60 uppercase">{clan.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center space-y-2 mb-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                {state.status === 'idle' ? '锁定采样坐标' : 
                 state.status === 'analyzing' ? '生物特征分析中...' : 
                 '正在构建数字原型...'}
              </h2>
            </div>

            <div className="relative">
              <CameraScanner 
                isScanning={state.status !== 'idle'} 
                onCapture={handleCapture}
                disabled={state.status !== 'idle'}
              />
              
              {(state.status === 'analyzing' || state.status === 'generating') && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl z-50 text-center p-6">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                    <i className="fas fa-satellite-dish absolute inset-0 flex items-center justify-center text-2xl text-blue-400 animate-pulse"></i>
                  </div>
                  <p className="font-mono text-sm text-blue-300 animate-pulse uppercase tracking-widest mb-2">
                    {state.status === 'analyzing' ? '正在匹配基因序列' : `渲染${clans.find(c => c.id === selectedClan)?.name}化身`}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono max-w-xs">
                    正在通过开源链路分发渲染请求，请保持生物特征稳定...
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : result && state.status === 'completed' ? (
          <AvatarDisplay result={result} onReset={handleReset} />
        ) : state.status === 'error' ? (
          <div className="text-center p-12 bg-red-900/10 border border-red-500/20 rounded-3xl max-w-md mx-auto">
            <i className="fas fa-radiation text-4xl text-red-500 mb-4 animate-pulse"></i>
            <h3 className="text-xl font-bold mb-2 text-white">链路完全中断</h3>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">{state.errorMessage}</p>
            <button onClick={handleReset} className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold transition-transform active:scale-95">重启潘多拉协议</button>
          </div>
        ) : null}
      </main>

      <footer className="mt-12 py-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-slate-500 gap-4">
        <div className="flex gap-8">
          <span>项目: AVATAR-OSS-V2</span>
          <span>后端: POLLINATIONS.AI (无限制)</span>
          <span>状态: {state.status === 'error' ? 'SYSTEM_FAILURE' : 'ACTIVE'}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
