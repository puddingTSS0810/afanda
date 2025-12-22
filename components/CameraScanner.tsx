
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        onCapture(base64);
      }
    }
  }, [onCapture]);

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-video rounded-3xl overflow-hidden border-4 border-blue-500/30 bg-black shadow-2xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover scale-x-[-1]"
      />
      
      {/* HUD Overlays */}
      <div className="absolute inset-0 pointer-events-none border-[20px] border-transparent">
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-400 rounded-tl-xl opacity-60"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-blue-400 rounded-tr-xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-blue-400 rounded-bl-xl opacity-60"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-400 rounded-br-xl opacity-60"></div>
      </div>

      {isScanning && (
        <div className="scan-line"></div>
      )}

      {/* Action Overlay */}
      <div className="absolute inset-x-0 bottom-8 flex justify-center items-center gap-4">
        {!disabled && (
          <button
            onClick={handleCapture}
            className="group relative flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md border-2 border-white/50 rounded-full hover:bg-white/20 transition-all duration-300 active:scale-95"
          >
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center group-hover:bg-blue-400 transition-colors">
              <i className="fas fa-camera text-2xl text-white"></i>
            </div>
            <span className="absolute -top-12 bg-black/80 text-xs px-3 py-1 rounded-full text-blue-300 font-mono tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              初始化面部采集
            </span>
          </button>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraScanner;
