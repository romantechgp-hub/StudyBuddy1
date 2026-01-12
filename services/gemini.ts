import { GoogleGenAI, Type } from "@google/genai";

/**
 * এআই সার্ভিস যা সরাসরি @google/genai SDK ব্যবহার করে।
 * Vercel-এ কাজ করার জন্য API_KEY এনভায়রনমেন্ট ভ্যারিয়েবল থেকে নেওয়া হচ্ছে।
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing! Please set it in your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const studyService = {
  async explainTopic(topic: string, level: 'basic' | 'standard') {
    const ai = getAI();
    const prompt = `Explain the following topic in simple Bengali: "${topic}". 
    Target Audience: Student. 
    Detail Level: ${level === 'basic' ? 'Simple words for kids' : 'Standard academic level'}.
    Please provide: 1. A clear definition. 2. A real-life example. 3. Bullet points for key features.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return response.text || 'দুঃখিত, আমি কোনো উত্তর খুঁজে পাইনি।';
    } catch (e) {
      console.error("Explain Topic Error:", e);
      return 'সার্ভারে সমস্যা হচ্ছে। আপনার এপিআই কী (API Key) চেক করুন বা আবার চেষ্টা করুন।';
    }
  },

  async explainTopicWithImage(base64Image: string, level: 'basic' | 'standard') {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `এই ছবিতে কী আছে তা একজন ${level === 'basic' ? 'ছোট শিশুকে' : 'ছাত্রকে'} সহজ বাংলায় বুঝিয়ে বলো।` }
          ]
        }],
      });
      return response.text || 'ছবিটি বিশ্লেষণ করা সম্ভব হয়নি।';
    } catch (e) {
      console.error("Image Explain Error:", e);
      return 'ছবিটি পড়ার সময় সমস্যা হয়েছে।';
    }
  },

  async solveMath(problem: string) {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ role: 'user', parts: [{ text: `Solve this math step-by-step in Bengali: "${problem}". Output clean text without $ signs.` }] }],
      });
      return response.text?.replace(/\$/g, '') || 'অংকটির সমাধান পাওয়া যায়নি।';
    } catch (e) {
      return 'অংকটি সমাধান করতে সমস্যা হয়েছে।';
    }
  },

  async solveMathWithImage(base64Image: string) {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: "এই ছবির অংকটি শনাক্ত করো এবং ধাপে ধাপে বাংলায় সমাধান দাও।" }
          ]
        }],
      });
      return response.text?.replace(/\$/g, '') || 'ছবি থেকে অংকটি বোঝা যাচ্ছে না।';
    } catch (e) {
      return 'ছবি থেকে অংক সমাধান করতে সমস্যা হয়েছে।';
    }
  },

  async translateAndPronounce(text: string, direction: 'bn-en' | 'en-bn') {
    const ai = getAI();
    const prompt = `Translate this to ${direction === 'bn-en' ? 'English' : 'Bengali'}: "${text}". 
    Return a JSON object: { "translation": "...", "pronunciation": "...", "explanation": "..." }. 
    Explanation must be in Bengali.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
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

  async translateAndPronounceWithImage(base64Image: string, direction: 'bn-en' | 'en-bn') {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Translate text in this image to ${direction === 'bn-en' ? 'English' : 'Bengali'}. Return JSON: {translation, pronunciation, explanation}.` }
          ]
        }],
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      throw e;
    }
  },

  async generateScript(topic: string, language: 'bn' | 'en') {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: `Write a presentation script about "${topic}" in ${language === 'bn' ? 'Bengali' : 'English'}.` }] }],
      });
      return response.text;
    } catch (e) {
      return 'স্ক্রিপ্ট তৈরি করা যায়নি।';
    }
  },

  async validateEnglishSentence(sentence: string) {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: `Check if this is correct: "${sentence}". Return JSON {isValid: boolean, correction: string, feedback: string in Bengali}` }] }],
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      throw e;
    }
  },

  async checkSpelling(text: string, language: 'bn' | 'en') {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: `Check spelling for ${language}: "${text}". Return JSON {original, corrected, differences, explanation in Bengali}` }] }],
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      throw e;
    }
  },

  async checkSpellingWithImage(base64Image: string, language: 'bn' | 'en') {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Check spelling of detected text in image. Language: ${language}. Return JSON {original, corrected, differences, explanation}.` }
          ]
        }],
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      throw e;
    }
  },

  async askQuestion(question: string) {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: `সরাসরি এবং ছোট করে উত্তর দাও: "${question}"` }] }],
      });
      return response.text;
    } catch (e) {
      return 'উত্তর খুঁজে পাওয়া যায়নি।';
    }
  },

  async askQuestionWithImage(base64Image: string) {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: "এই ছবিতে কী দেখা যাচ্ছে তা বাংলায় বর্ণনা করো।" }
          ]
        }],
      });
      return response.text;
    } catch (e) {
      return 'ছবিটি পড়া যায়নি।';
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
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction: sys },
        history: history,
      });

      const response = await chat.sendMessage({ message: message });
      return response.text;
    } catch (e) {
      console.error("Chat Error:", e);
      return 'দুঃখিত বন্ধু, ইন্টারনেটে সমস্যা হচ্ছে। আবার চেষ্টা করো!';
    }
  }
};