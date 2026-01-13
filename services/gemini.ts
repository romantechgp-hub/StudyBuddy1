
import { GoogleGenAI, Type } from "@google/genai";

// Strictly follow the guideline: Always use new GoogleGenAI({apiKey: process.env.API_KEY})
// process.env.API_KEY is injected by Vite's define config
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const studyService = {
  async explainTopic(topic: string, level: 'basic' | 'standard') {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Explain "${topic}" in simple Bengali for a ${level} level student. Include a definition, an example, and key points.`,
      });
      return response.text || "উত্তর পাওয়া যায়নি।";
    } catch (e) {
      console.error("Gemini Error:", e);
      return "সার্ভারে সমস্যা হচ্ছে, দয়া করে আবার চেষ্টা করো।";
    }
  },

  async explainTopicWithImage(base64Image: string, level: 'basic' | 'standard') {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Identify and explain this image in simple Bengali for a ${level} student.` }
          ]
        },
      });
      return response.text || "ছবিটি বোঝা যাচ্ছে না।";
    } catch (e) {
      console.error(e);
      return "ছবি বিশ্লেষণে সমস্যা হয়েছে।";
    }
  },

  async solveMath(problem: string) {
    const ai = getAI();
    try {
      // Guideline: Use gemini-3-pro-preview for complex reasoning/math
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Solve this math problem step-by-step in Bengali. Show clearly: 1. Given info, 2. Formula (if any), 3. Steps, 4. Final Answer. Problem: ${problem}. Avoid complex symbols, keep it simple.`,
        config: {
          thinkingConfig: { thinkingBudget: 2000 } // Allow some thinking budget for pro math
        }
      });
      return response.text?.replace(/\$/g, '') || "সমাধান মেলেনি।";
    } catch (e) {
      console.error("Math Solve Error:", e);
      return "অংকটি সমাধান করা সম্ভব হচ্ছে না। সম্ভবত ইন্টারনেটে সমস্যা হচ্ছে বা এপিআই কি কাজ করছে না।";
    }
  },

  async solveMathWithImage(base64Image: string) {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: "Solve the math problem in this image step-by-step in Bengali. Provide clear explanation for each step." }
          ]
        },
        config: {
          thinkingConfig: { thinkingBudget: 2000 }
        }
      });
      return response.text?.replace(/\$/g, '') || "অংকটি শনাক্ত করা যায়নি।";
    } catch (e) {
      console.error("Image Math Error:", e);
      return "ছবি থেকে অংক সমাধান করা সম্ভব হয়নি। ছবির সাইজ বা মান পরীক্ষা করো।";
    }
  },

  async translateAndPronounce(text: string, direction: 'bn-en' | 'en-bn') {
    const ai = getAI();
    const target = direction === 'bn-en' ? 'English' : 'Bengali';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate to ${target}: "${text}". Provide JSON output with translation, pronunciation, and explanation in Bengali.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translation: { type: Type.STRING },
              pronunciation: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["translation", "pronunciation", "explanation"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async translateAndPronounceWithImage(base64Image: string, direction: 'bn-en' | 'en-bn') {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    const target = direction === 'bn-en' ? 'English' : 'Bengali';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Translate text in this image to ${target}. Return JSON: {translation, pronunciation, explanation}.` }
          ]
        },
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translation: { type: Type.STRING },
              pronunciation: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["translation", "pronunciation", "explanation"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async validateEnglishSentence(sentence: string) {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Check English grammar: "${sentence}". Return JSON {isValid, correction, feedback in Bengali}.`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isValid: { type: Type.BOOLEAN },
              correction: { type: Type.STRING },
              feedback: { type: Type.STRING }
            },
            required: ["isValid", "correction", "feedback"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async checkSpelling(text: string, language: 'bn' | 'en') {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Check spelling for ${language}: "${text}". Return JSON {original, corrected, differences, explanation in Bengali}.`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              original: { type: Type.STRING },
              corrected: { type: Type.STRING },
              differences: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["original", "corrected", "differences", "explanation"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async checkSpellingWithImage(base64Image: string, language: 'bn' | 'en') {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Check spelling for text in this image for ${language}. Return JSON: {original, corrected, differences, explanation in Bengali}.` }
          ]
        },
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              original: { type: Type.STRING },
              corrected: { type: Type.STRING },
              differences: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["original", "corrected", "differences", "explanation"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async askQuestion(question: string) {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Answer briefly in Bengali: "${question}"`,
      });
      return response.text || "উত্তর পাওয়া যায়নি।";
    } catch (e) {
      console.error(e);
      return "উত্তর পাওয়া যায়নি।";
    }
  },

  async askQuestionWithImage(base64Image: string) {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: "Answer the question in this image briefly in Bengali." }
          ]
        },
      });
      return response.text || "উত্তর পাওয়া যায়নি।";
    } catch (e) {
      console.error(e);
      return "ছবি থেকে উত্তর বের করা সম্ভব হয়নি।";
    }
  },

  async chatWithFriend(history: any[], message: string) {
    const ai = getAI();
    const saved = localStorage.getItem('global_settings');
    let sys = "You are Roman, a friendly AI tutor. Correct errors in Bengali and reply in English with Bengali translations in brackets.";
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.aiSystemInstruction) sys = parsed.aiSystemInstruction;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...history, { role: 'user', parts: [{ text: message }] }],
        config: { systemInstruction: sys },
      });
      return response.text || "দুঃখিত বন্ধু, আমি বুঝতে পারিনি।";
    } catch (e) {
      console.error(e);
      return "দুঃখিত বন্ধু, ইন্টারনেটে সমস্যা হচ্ছে। আবার চেষ্টা করো!";
    }
  },

  async generateScript(topic: string, language: 'bn' | 'en') {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a script for "${topic}" in ${language === 'bn' ? 'Bengali' : 'English'}. Include structure and speaker parts if applicable.`,
      });
      return response.text || "স্ক্রিপ্ট তৈরি করা যায়নি।";
    } catch (e) {
      console.error(e);
      return "স্ক্রিপ্ট তৈরি করতে সমস্যা হচ্ছে।";
    }
  }
};
