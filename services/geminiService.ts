
import { GoogleGenAI, Type } from "@google/genai";
import { FaceAnalysis, AvatarResult } from "../types";

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
          text: `Analyze this person's face for a cinematic avatar conversion. Extract facial landmarks, expression, and distinct physical characteristics. 
          Return a detailed JSON object matching the requested schema.`
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
          }
        },
        required: ['expression', 'eyeColor', 'hairStyle', 'skinTexture', 'prominentFeatures', 'emotionScore']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to get analysis from Gemini");
  return JSON.parse(text) as FaceAnalysis;
};

export const generateAvatar = async (analysis: FaceAnalysis, originalBase64: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `A cinematic, ultra-high-definition 3D render of a Na'vi-style avatar character from Pandora. 
  The character must share the exact facial structure, ${analysis.expression} expression, and ${analysis.hairStyle} style as the person provided. 
  Features to map: ${analysis.prominentFeatures.join(', ')}. 
  Style: Bioluminescent blue skin with subtle tribal glowing patterns, large expressive ${analysis.eyeColor} eyes, realistic skin texture, cinematic lighting, shallow depth of field, 8k resolution, Weta Digital style.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: originalBase64
          }
        },
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate avatar image");
};
