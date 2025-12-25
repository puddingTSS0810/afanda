
export interface FaceAnalysis {
  expression: string;
  eyeColor: string;
  hairStyle: string;
  skinTexture: string;
  prominentFeatures: string[];
  emotionScore: {
    happy: number;
    neutral: number;
    intense: number;
  };
  visualDescription: string; // 用于生成图像的详细面部描述
}

export interface CaptureState {
  status: 'idle' | 'capturing' | 'analyzing' | 'generating' | 'completed' | 'error';
  errorMessage?: string;
}

export interface AvatarResult {
  imageUrl: string;
  analysis: FaceAnalysis;
}
