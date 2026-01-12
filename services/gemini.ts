
import { GoogleGenAI, Type } from "@google/genai";

// Initialize AI exclusively using process.env.API_KEY
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing. Please set it in your environment variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const studyService = {
  async explainTopic(topic: string, level: 'basic' | 'standard') {
    const ai = getAI();
    const prompt = `Explain the following topic in simple Bengali: "${topic}". 
    Target Audience: Student. 
    Detail Level: ${level === 'basic' ? 'Beginner/Children' : 'Standard'}.
    Include: 1. Simple definition. 2. Story/Example. 3. English terms.
    Language: Bengali.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return response.text || 'কোনো উত্তর পাওয়া যায়নি।';
    } catch (e) {
      console.error("Explain Topic Error:", e);
      return 'দুঃখিত, ব্যাখ্যা তৈরি করতে সমস্যা হয়েছে।';
    }
  },

  async explainTopicWithImage(base64Image: string, level: 'basic' | 'standard') {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
            { text: `Identify and explain this topic in simple Bengali (level: ${level}).` }
          ]
        }],
      });
      return response.text || 'কোনো উত্তর পাওয়া যায়নি।';
    } catch (e) {
      console.error("Image Explain Error:", e);
      return 'ছবিটি বিশ্লেষণ করতে সমস্যা হয়েছে।';
    }
  },

  async solveMath(problem: string) {
    const ai = getAI();
    const prompt = `Solve this math problem: "${problem}". Provide step-by-step Bengali explanation. Clean formatting.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return response.text?.replace(/\$/g, '') || 'সমাধান পাওয়া যায়নি।';
    } catch (e) {
      console.error("Math Solver Error:", e);
      return 'অংকটি সমাধান করতে সমস্যা হয়েছে।';
    }
  },

  async solveMathWithImage(base64Image: string) {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
            { text: "Solve this math problem with step-by-step Bengali explanation." }
          ]
        }],
      });
      return response.text?.replace(/\$/g, '') || 'সমাধান পাওয়া যায়নি।';
    } catch (e) {
      console.error("Math Image Error:", e);
      return 'ছবি থেকে অংকটি পড়তে সমস্যা হয়েছে।';
    }
  },

  async translateAndPronounce(text: string, direction: 'bn-en' | 'en-bn') {
    const ai = getAI();
    const fromLang = direction === 'bn-en' ? 'Bengali' : 'English';
    const toLang = direction === 'bn-en' ? 'English' : 'Bengali';
    const prompt = `Translate this ${fromLang} text to ${toLang}: "${text}". Provide JSON: translation, pronunciation, explanation.`;

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
      console.error("Translate Error:", e);
      throw e;
    }
  },

  async translateAndPronounceWithImage(base64Image: string, direction: 'bn-en' | 'en-bn') {
    const ai = getAI();
    const prompt = `Detect and translate the text in this image. JSON: translation, pronunciation, explanation.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
            { text: prompt }
          ]
        }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translation: { type: Type.STRING },
              pronunciation: { type: Type.STRING },
              explanation: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Image Translate Error:", e);
      throw e;
    }
  },

  async generateScript(topic: string, language: 'bn' | 'en') {
    const ai = getAI();
    const prompt = `Write a script about "${topic}" in ${language === 'bn' ? 'Bengali' : 'English'}.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return response.text;
    } catch (e) {
      console.error("Script Error:", e);
      return 'স্ক্রিপ্ট তৈরি করা যায়নি।';
    }
  },

  async validateEnglishSentence(sentence: string) {
    const ai = getAI();
    const prompt = `Validate this English sentence: "${sentence}". JSON: isValid, correction, feedback.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isValid: { type: Type.BOOLEAN },
              correction: { type: Type.STRING },
              feedback: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Validation Error:", e);
      throw e;
    }
  },

  async checkSpelling(text: string, language: 'bn' | 'en') {
    const ai = getAI();
    const prompt = `Check spelling of this ${language === 'bn' ? 'Bengali' : 'English'} text: "${text}". JSON: original, corrected, differences, explanation.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              original: { type: Type.STRING },
              corrected: { type: Type.STRING },
              differences: { type: Type.STRING },
              explanation: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Spelling Error:", e);
      throw e;
    }
  },

  async checkSpellingWithImage(base64Image: string, language: 'bn' | 'en') {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
            { text: `Check spelling of detected text in image. JSON: original, corrected, differences, explanation.` }
          ]
        }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              original: { type: Type.STRING },
              corrected: { type: Type.STRING },
              differences: { type: Type.STRING },
              explanation: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Image Spelling Error:", e);
      throw e;
    }
  },

  async askQuestion(question: string) {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: `Answer in Bengali: "${question}"` }] }],
      });
      return response.text;
    } catch (e) {
      console.error("QA Error:", e);
      return 'উত্তর পাওয়া যায়নি।';
    }
  },

  async askQuestionWithImage(base64Image: string) {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
            { text: "Explain what is happening in this image in Bengali." }
          ]
        }],
      });
      return response.text;
    } catch (e) {
      console.error("QA Image Error:", e);
      return 'ছবিটি পড়তে সমস্যা হয়েছে।';
    }
  },

  async chatWithFriend(history: any[], message: string) {
    const ai = getAI();
    const saved = localStorage.getItem('global_settings');
    let sys = "You are Roman, a friendly English tutor. Gently correct mistakes in Bengali, then reply with English + Bengali translation.";
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
      return 'দুঃখিত বন্ধু, আমার নেটওয়ার্কে সমস্যা হচ্ছে।';
    }
  }
};
