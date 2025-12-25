
import React, { useState } from 'react';
import CameraScanner from './components/CameraScanner';
import AvatarDisplay from './components/AvatarDisplay';
import { analyzeFace, generateAvatar } from './services/geminiService';
import { CaptureState, AvatarResult } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<CaptureState>({ status: 'idle' });
  const [result, setResult] = useState<AvatarResult | null>(null);

  const handleCapture = async (base64: string) => {
    setState({ status: 'analyzing' });
    try {
      // 1. 使用 Gemini 3 Flash 分析面部 (免费层级)
      const analysis = await analyzeFace(base64);
      
      setState({ status: 'generating' });
      
      // 2. 使用开源接口生成化身 (完全免费)
      const imageUrl = await generateAvatar(analysis);
      
      setResult({
        imageUrl,
        analysis
      });
      setState({ status: 'completed' });
    } catch (err: any) {
      console.error(err);
      setState({ 
        status: 'error', 
        errorMessage: err.message || '传输干扰，请重试。' 
      });
    }
  };

  const handleReset = () => {
    setResult(null);
    setState({ status: 'idle' });
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center biolum-glow">
            <i className="fas fa-dna text-2xl text-white"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">阿凡达 AI</h1>
            <p className="text-blue-400 font-mono text-[10px] tracking-[0.2em] uppercase">
              潘多拉生物交互接口 (开源版)
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {['系统正常', '开源引擎就绪', '免费链路已建立'].map((tag) => (
            <span key={tag} className="px-3 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-300">
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {state.status === 'idle' || state.status === 'analyzing' || state.status === 'generating' ? (
          <div className="w-full space-y-8 animate-in fade-in duration-1000">
            <div className="text-center space-y-2 mb-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                {state.status === 'idle' ? '请将面部对准屏幕' : 
                 state.status === 'analyzing' ? '生物特征分析中...' : 
                 '正在构建数字原型...'}
              </h2>
              <p className="text-slate-400 text-lg">
                {state.status === 'idle' ? '将您的 DNA 序列与潘多拉生态系统同步。' : 
                 '正在处理面部表情标记、肌肉运动和视网膜特征。'}
              </p>
            </div>

            <div className="relative">
              <CameraScanner 
                isScanning={state.status !== 'idle'} 
                onCapture={handleCapture}
                disabled={state.status !== 'idle'}
              />
              
              {/* Progress Overlay */}
              {(state.status === 'analyzing' || state.status === 'generating') && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl z-50">
                  <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_infinite]" style={{
                      width: '40%',
                      animation: 'move 1.5s infinite linear'
                    }} />
                  </div>
                  <style>{`
                    @keyframes move {
                      0% { transform: translateX(-100%); }
                      100% { transform: translateX(250%); }
                    }
                  `}</style>
                  <p className="font-mono text-sm text-blue-300 animate-pulse uppercase tracking-widest">
                    {state.status === 'analyzing' ? '解码 DNA 标记中' : '渲染数字生命体中'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : result && state.status === 'completed' ? (
          <AvatarDisplay result={result} onReset={handleReset} />
        ) : state.status === 'error' ? (
          <div className="text-center p-12 bg-red-900/10 border border-red-500/20 rounded-3xl max-w-md mx-auto">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <h3 className="text-xl font-bold mb-2">同步链路中断</h3>
            <p className="text-slate-400 mb-6">{state.errorMessage}</p>
            <button 
              onClick={handleReset}
              className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-400 transition-colors"
            >
              重启系统
            </button>
          </div>
        ) : null}
      </main>

      {/* Footer Info */}
      <footer className="mt-12 py-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-slate-500 gap-4">
        <div className="flex gap-8">
          <span>项目代码: AVATAR-OPEN-FREE</span>
          <span>当前坐标: 潘多拉 - 开源社区</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>实时免费神经流链路激活中</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
