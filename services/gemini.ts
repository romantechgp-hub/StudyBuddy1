
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Critical: API_KEY is missing. Check Vercel Environment Variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

// এই ইন্সট্রাকশনটি এআই-কে বাধ্য করবে ইংরেজি সংখ্যা ব্যবহার করতে
const NUMERAL_INSTRUCTION = "CRITICAL: Use English numerals (1, 2, 3, 4, 5, 6, 7, 8, 9, 0) for all numbers, math, and counting. Do not use Bengali numerals like ১, ২, ৩.";

export const studyService = {
  async explainTopic(topic: string, level: 'basic' | 'standard', mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    const modePrompt = mode === 'brief' ? "Brief explanation." : "Detailed explanation.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Explain "${topic}" in Bengali for a ${level} student. ${modePrompt} ${NUMERAL_INSTRUCTION}`,
      });
      return response.text || "উত্তর পাওয়া যায়নি।";
    } catch (e) {
      return "সার্ভারে সমস্যা হচ্ছে, আবার চেষ্টা করো।";
    }
  },

  async explainTopicWithImage(base64Image: string, level: 'basic' | 'standard', mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Explain this image in Bengali for a ${level} student. ${NUMERAL_INSTRUCTION}` }
          ]
        },
      });
      return response.text || "ছবিটি বোঝা যাচ্ছে না।";
    } catch (e) {
      return "ছবি বিশ্লেষণে সমস্যা হয়েছে।";
    }
  },

  async solveMath(problem: string, mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Solve this math problem in Bengali step-by-step. ${NUMERAL_INSTRUCTION} Problem: ${problem}`,
      });
      return response.text || "সমাধান মেলেনি।";
    } catch (e) {
      return "অংকটি সমাধান করা সম্ভব হচ্ছে না।";
    }
  },

  async solveMathWithImage(base64Image: string, mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Solve the math in this image in Bengali. ${NUMERAL_INSTRUCTION}` }
          ]
        }
      });
      return response.text || "অংকটি শনাক্ত করা যায়নি।";
    } catch (e) {
      return "ছবি থেকে অংক সমাধান করা সম্ভব হয়নি।";
    }
  },

  async translateAndPronounce(text: string, direction: 'bn-en' | 'en-bn', mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    const target = direction === 'bn-en' ? 'English' : 'Bengali';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate to ${target}: "${text}". ${NUMERAL_INSTRUCTION} Return JSON: {translation, pronunciation, explanation}.`,
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
      throw e;
    }
  },

  async translateAndPronounceWithImage(base64Image: string, direction: 'bn-en' | 'en-bn', mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    const target = direction === 'bn-en' ? 'English' : 'Bengali';
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Translate text in image to ${target}. ${NUMERAL_INSTRUCTION} Return JSON: {translation, pronunciation, explanation}.` }
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
      throw e;
    }
  },

  async askQuestion(question: string, mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Question: "${question}". Answer in Bengali. ${NUMERAL_INSTRUCTION}`,
      });
      return response.text || "উত্তর পাওয়া যায়নি।";
    } catch (e) {
      return "উত্তর দিতে সমস্যা হচ্ছে।";
    }
  },

  async askQuestionWithImage(base64Image: string, mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Answer this image question in Bengali. ${NUMERAL_INSTRUCTION}` }
          ]
        },
      });
      return response.text || "উত্তর পাওয়া যায়নি।";
    } catch (e) {
      return "ছবি থেকে উত্তর খুঁজতে সমস্যা হয়েছে।";
    }
  },

  async checkSpelling(text: string, language: 'bn' | 'en', mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Check spelling for ${language}: "${text}". ${NUMERAL_INSTRUCTION} Return JSON {original, corrected, differences, explanation in Bengali}.`,
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
      throw e;
    }
  },

  async checkSpellingWithImage(base64Image: string, language: 'bn' | 'en', mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Identify text and check spelling in ${language}. ${NUMERAL_INSTRUCTION} Return JSON {original, corrected, differences, explanation}.` }
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
      throw e;
    }
  },

  async generateScript(topic: string, language: 'bn' | 'en', mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a script for "${topic}" in ${language === 'bn' ? 'Bengali' : 'English'}. ${NUMERAL_INSTRUCTION}`,
      });
      return response.text || "স্ক্রিপ্ট তৈরি করা যায়নি।";
    } catch (e) {
      return "স্ক্রিপ্ট তৈরি করতে সমস্যা হচ্ছে।";
    }
  },

  async validateEnglishSentence(sentence: string) {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this English sentence: "${sentence}". ${NUMERAL_INSTRUCTION}
        Return JSON format:
        {
          "isValid": boolean,
          "feedback": "Encouraging feedback in Bengali",
          "correction": "Corrected English"
        }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isValid: { type: Type.BOOLEAN },
              feedback: { type: Type.STRING },
              correction: { type: Type.STRING }
            },
            required: ["isValid", "feedback"]
          }
        }
      });
      return JSON.parse(response.text || '{"isValid": false, "feedback": "ত্রুটি হয়েছে"}');
    } catch (e) {
      return { isValid: false, feedback: "সার্ভারে সমস্যা হয়েছে।" };
    }
  },

  async chatWithFriend(history: any[], message: string) {
    const ai = getAI();
    const saved = localStorage.getItem('global_settings');
    let sys = `You are Roman, a friendly AI tutor. Correct errors in Bengali and reply in English with Bengali translations. ${NUMERAL_INSTRUCTION}`;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.aiSystemInstruction) sys = parsed.aiSystemInstruction + " " + NUMERAL_INSTRUCTION;
    }
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...history, { role: 'user', parts: [{ text: message }] }],
        config: { systemInstruction: sys },
      });
      return response.text || "দুঃখিত বন্ধু, আমি বুঝতে পারিনি। আবার বলো তো!";
    } catch (e) {
      return "দুঃখিত বন্ধু, ইন্টারনেটে সমস্যা হচ্ছে।";
    }
  }
};
