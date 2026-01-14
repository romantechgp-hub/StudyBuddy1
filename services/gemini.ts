
import { GoogleGenAI, Type } from "@google/genai";

/**
 * গাইডলাইন অনুযায়ী API Key সরাসরি process.env.API_KEY থেকে নেওয়া হচ্ছে।
 * Vite Config-এ এটি ইনজেক্ট করা আছে।
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Critical: API_KEY is missing. Check Vercel Environment Variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const studyService = {
  // সহজ পড়া মোড: দ্রুত রেসপন্সের জন্য Flash মডেল
  async explainTopic(topic: string, level: 'basic' | 'standard') {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Explain "${topic}" in simple Bengali for a ${level} level student. Include a definition, an example, and key points.`,
      });
      return response.text || "উত্তর পাওয়া যায়নি।";
    } catch (e) {
      console.error("Study Mode Error:", e);
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
      console.error("Study Image Error:", e);
      return "ছবি বিশ্লেষণে সমস্যা হয়েছে।";
    }
  },

  // অংক সমাধানকারী: Vercel-এ টাইমআউট এড়াতে Flash মডেল ব্যবহার করা হচ্ছে
  async solveMath(problem: string) {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an expert Math Tutor. Solve the following problem step-by-step in Bengali.
        IMPORTANT: Do not use any LaTeX symbols like $, \[, or \]. Use plain text and simple numbers.
        
        Structure:
        1. দেওয়া আছে (Given info)
        2. সূত্র (Formula)
        3. সমাধান প্রক্রিয়া (Step-by-step calculation)
        4. উত্তর (Final Answer)
        
        Problem: ${problem}
        Keep the explanation very clear for a student.`,
      });
      return response.text || "সমাধান মেলেনি।";
    } catch (e) {
      console.error("Math Solve Error:", e);
      return "অংকটি সমাধান করা সম্ভব হচ্ছে না। দয়া করে আবার চেষ্টা করো।";
    }
  },

  async solveMathWithImage(base64Image: string) {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `You are an expert Math Tutor. Identify the math problem in this image and solve it step-by-step in Bengali.
            IMPORTANT: Do not use any LaTeX symbols like $, \[, or \]. Use plain text and simple numbers.
            
            Structure:
            1. ছবিতে যা দেখা যাচ্ছে (Observation)
            2. সমাধান প্রক্রিয়া (Step-by-step calculation)
            3. উত্তর (Final Answer)` }
          ]
        }
      });
      return response.text || "অংকটি শনাক্ত করা যায়নি।";
    } catch (e) {
      console.error("Math Image Error:", e);
      return "ছবি থেকে অংক সমাধান করা সম্ভব হয়নি।";
    }
  },

  // অনুবাদ ও স্পিকিং: দ্রুত কাজ করার জন্য Flash মডেল
  async translateAndPronounce(text: string, direction: 'bn-en' | 'en-bn') {
    const ai = getAI();
    const target = direction === 'bn-en' ? 'English' : 'Bengali';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate to ${target}: "${text}". Return JSON with translation, pronunciation, and explanation in Bengali.`,
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
      console.error("Translation Error:", e);
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
      console.error("Translation Image Error:", e);
      throw e;
    }
  },

  // প্রশ্ন ও উত্তর: Flash মডেল
  async askQuestion(question: string) {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Answer briefly in Bengali: "${question}"`,
      });
      return response.text || "উত্তর পাওয়া যায়নি।";
    } catch (e) {
      console.error("QA Error:", e);
      return "উত্তর দিতে সমস্যা হচ্ছে। দয়া করে পরে চেষ্টা করো।";
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
            { text: "Identify the question in this image and answer it briefly in Bengali." }
          ]
        },
      });
      return response.text || "উত্তর পাওয়া যায়নি।";
    } catch (e) {
      console.error("QA Image Error:", e);
      return "ছবি থেকে উত্তর বের করা সম্ভব হয়নি।";
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
      return "দুঃখিত বন্ধু, ইন্টারনেটে সমস্যা হচ্ছে।";
    }
  },

  async generateScript(topic: string, language: 'bn' | 'en') {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a script for "${topic}" in ${language === 'bn' ? 'Bengali' : 'English'}.`,
      });
      return response.text || "স্ক্রিপ্ট তৈরি করা যায়নি।";
    } catch (e) {
      console.error(e);
      return "স্ক্রিপ্ট তৈরি করতে সমস্যা হচ্ছে।";
    }
  }
};
