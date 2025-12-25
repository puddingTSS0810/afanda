
import { GoogleGenAI, Type } from "@google/genai";
import { FaceAnalysis } from "../types";

const API_KEY = process.env.API_KEY || '';

export const analyzeFace = async (base64Image: string): Promise<FaceAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image
          }
        },
        {
          text: `你是一个专业的电影特效分析师。请分析这张人脸，并生成一个用于 AI 绘图的详细英文描述词。
          1. 提取面部轮廓、发型、肤质、表情。
          2. 将其转化为一个详细的英文段落 (visualDescription)，描述该人物的特征。
          3. 同时提取其他结构化字段。`
        }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          expression: { type: Type.STRING },
          eyeColor: { type: Type.STRING },
          hairStyle: { type: Type.STRING },
          skinTexture: { type: Type.STRING },
          prominentFeatures: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          emotionScore: {
            type: Type.OBJECT,
            properties: {
              happy: { type: Type.NUMBER },
              neutral: { type: Type.NUMBER },
              intense: { type: Type.NUMBER }
            },
            required: ['happy', 'neutral', 'intense']
          },
          visualDescription: { type: Type.STRING }
        },
        required: ['expression', 'eyeColor', 'hairStyle', 'skinTexture', 'prominentFeatures', 'emotionScore', 'visualDescription']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("无法从 Gemini 获取分析数据");
  return JSON.parse(text) as FaceAnalysis;
};

export const generateAvatar = async (analysis: FaceAnalysis): Promise<string> => {
  // 使用 Pollinations.ai 的开源免费接口 (基于 Stable Diffusion 等模型)
  // 此接口不需要 API Key，且完全免费
  
  const seed = Math.floor(Math.random() * 1000000);
  const basePrompt = `cinematic 3D render of a Na'vi avatar character from Avatar movie, biological blue skin with bioluminescent glowing spots, tribal patterns, ${analysis.eyeColor} large expressive eyes, 8k resolution, photorealistic, masterpiece, Weta Digital style.`;
  const facialDetails = `Specific facial features: ${analysis.visualDescription}, expression is ${analysis.expression}, hairstyle is ${analysis.hairStyle}.`;
  
  const fullPrompt = encodeURIComponent(`${basePrompt}, ${facialDetails}`);
  const imageUrl = `https://image.pollinations.ai/prompt/${fullPrompt}?width=1024&height=1024&seed=${seed}&nologo=true`;

  // 预加载图片以确保体验流畅
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(imageUrl);
    img.onerror = () => reject(new Error("头像渲染引擎同步失败"));
    img.src = imageUrl;
  });
};
