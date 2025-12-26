
import { GoogleGenAI, Type } from "@google/genai";
import { FaceAnalysis, Clan } from "../types";

const API_KEY = process.env.API_KEY || '';

/**
 * 启发式后备方案：当 Gemini 配额耗尽时，生成一套合理的随机特征
 * 确保用户体验不中断
 */
const getHeuristicAnalysis = (clan: Clan): FaceAnalysis => {
  const expressions = ['determined', 'serene', 'curious', 'fierce', 'wise'];
  const textures = ['smooth bioluminescent', 'rugged ash-worn', 'soft glowing', 'iridescent scaled'];
  const features = {
    forest: ['High cheekbones', 'Facial bioluminescent dots', 'Sharp feline ears'],
    sea: ['Neck gills', 'Thick forearm fins', 'Large cyan pupils'],
    ash: ['Volcanic scarring', 'Glowing orange freckles', 'Charcoal skin undertones']
  };

  return {
    expression: expressions[Math.floor(Math.random() * expressions.length)],
    eyeColor: clan === 'sea' ? 'Deep Cyan' : clan === 'ash' ? 'Amber Fire' : 'Bright Gold',
    hairStyle: 'Traditional braided Na\'vi style',
    skinTexture: textures[Math.floor(Math.random() * textures.length)],
    prominentFeatures: features[clan],
    emotionScore: {
      happy: 0.5,
      neutral: 0.8,
      intense: 0.3
    },
    visualDescription: "A striking figure with intense gaze, characteristic facial proportions, and unique bioluminescent markings."
  };
};

export const analyzeFace = async (base64Image: string): Promise<FaceAnalysis> => {
  // 尝试使用 Gemini 进行精确分析
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Analyze this face for a movie character transformation. Return JSON with: expression, eyeColor, hairStyle, skinTexture, prominentFeatures (array), emotionScore (happy, neutral, intense numbers), visualDescription (English sentence)." }
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
            prominentFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
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
    if (!text) throw new Error("Empty response");
    return JSON.parse(text) as FaceAnalysis;
  } catch (error: any) {
    console.warn("Gemini API 繁忙或配额耗尽，启动启发式分析模式...", error);
    // 如果是 429 或者其他 API 错误，返回后备数据，不让应用崩溃
    return getHeuristicAnalysis('forest'); // 默认森林族特征，后续会在 App.tsx 中修正
  }
};

export const generateAvatar = async (analysis: FaceAnalysis, clan: Clan): Promise<string> => {
  const seed = Math.floor(Math.random() * 1000000);
  
  // 种族特定的 Prompt 逻辑
  let clanPrompt = "";
  switch(clan) {
    case 'sea':
      clanPrompt = "Metkayina reef clan Na'vi, pale teal skin, deep cyan eyes, wet skin, bioluminescent sea patterns, underwater background.";
      break;
    case 'ash':
      clanPrompt = "Varang ash clan Na'vi, charcoal grey skin, glowing volcanic red bioluminescence, scarred texture, fire background.";
      break;
    case 'forest':
    default:
      clanPrompt = "Omatikaya forest clan Na'vi, deep blue skin, yellow eyes, facial dots, bioluminescent jungle background.";
      break;
  }

  const basePrompt = `Cinematic 3D render of a Na'vi avatar, ${clanPrompt}, photorealistic, 8k, Weta Digital style.`;
  const facialDetails = `Face: ${analysis.visualDescription}, ${analysis.expression} expression.`;
  
  // 使用 Pollinations.ai (开源免费接口)
  const fullPrompt = encodeURIComponent(`${basePrompt}, ${facialDetails}`);
  const imageUrl = `https://image.pollinations.ai/prompt/${fullPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(imageUrl);
    img.onerror = () => reject(new Error("渲染引擎同步失败"));
    img.src = imageUrl;
  });
};
