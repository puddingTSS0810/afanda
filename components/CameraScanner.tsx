
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraScannerProps {
  isScanning: boolean;
  onCapture: (base64: string) => void;
  disabled?: boolean;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ isScanning, onCapture, disabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCaptured, setHasCaptured] = useState(false);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    initCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // 设置绘图分辨率
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 执行绘制过程
        ctx.save();
        // 因为视频是镜像的，绘图时也进行镜像翻转，保证看到的是一致的
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        
        setHasCaptured(true);
        onCapture(base64);
      }
    }
  }, [onCapture]);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
      {/* 主相机窗口 */}
      <div className="relative flex-1 aspect-video rounded-3xl overflow-hidden border-4 border-blue-500/30 bg-black shadow-2xl group">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
        
        {/* HUD 边角装饰 */}
        <div className="absolute inset-0 pointer-events-none border-[20px] border-transparent">
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-cyan-400/50 rounded-br-lg"></div>
        </div>

        {isScanning && (
          <div className="scan-line"></div>
        )}

        {/* 拍摄控制按钮 */}
        <div className="absolute inset-x-0 bottom-8 flex justify-center items-center">
          {!disabled && (
            <button
              onClick={handleCapture}
              className="group relative flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-full hover:border-blue-400 transition-all duration-300 active:scale-90"
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                <i className="fas fa-fingerprint text-2xl text-white"></i>
              </div>
              <span className="absolute -top-12 bg-blue-600 text-[10px] px-3 py-1 rounded-full text-white font-mono tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                开始生物采样
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 侧边：神经采样缓冲区 (Canvas 实时展示区) */}
      <div className="w-full lg:w-64 space-y-4">
        <div className="p-4 bg-slate-900/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-mono text-blue-400 uppercase tracking-tighter flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              采样缓冲区
            </h3>
            <span className="text-[8px] font-mono text-slate-500">BUFFER_V1.0</span>
          </div>
          
          <div className="relative aspect-square bg-black rounded-lg border border-white/5 overflow-hidden flex items-center justify-center group">
            {/* 核心：Canvas 元素现在是可见的 */}
            <canvas 
              ref={canvasRef} 
              className={`w-full h-full object-cover transition-opacity duration-500 ${hasCaptured ? 'opacity-100' : 'opacity-20'}`}
            />
            
            {!hasCaptured && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <i className="fas fa-microchip text-slate-700 text-xl mb-2"></i>
                <p className="text-[8px] font-mono text-slate-600 uppercase">等待生物特征输入...</p>
              </div>
            )}

            {/* 采样装饰层 */}
            <div className="absolute inset-0 pointer-events-none border border-blue-500/10"></div>
            {hasCaptured && isScanning && (
              <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-slate-500">分辨率:</span>
              <span className="text-blue-300">1280 x 720</span>
            </div>
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-slate-500">编码格式:</span>
              <span className="text-blue-300">RAW_JPEG_B64</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block p-3 border border-white/5 rounded-xl bg-blue-500/5">
          <p className="text-[9px] text-slate-400 font-mono leading-relaxed">
            [系统提示]：Canvas 实时缓冲区用于校准面部锚点，确保 DNA 提取过程中的空间一致性。
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraScanner;
