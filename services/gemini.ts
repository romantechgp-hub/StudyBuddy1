import { GoogleGenAI, Type } from "@google/genai";

// Initialize AI. Always use process.env.API_KEY
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing. Responses will fail.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const studyService = {
  async explainTopic(topic: string, level: 'basic' | 'standard') {
    const ai = getAI();
    const prompt = `Explain the following topic in simple Bengali: "${topic}". 
    Target Audience: Student. 
    Detail Level: ${level === 'basic' ? 'Beginner/Children' : 'Standard'}.
    Format the output with simple Bengali words, clear points, and a real-life example.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return response.text || 'দুঃখিত, এআই কোনো উত্তর দিতে পারেনি।';
    } catch (e) {
      console.error("Gemini Error:", e);
      return 'সার্ভারে সমস্যা হচ্ছে, দয়া করে আবার চেষ্টা করো।';
    }
  },

  async explainTopicWithImage(base64Image: string, level: 'basic' | 'standard') {
    const ai = getAI();
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Identify and explain what is in this image in simple Bengali for a ${level} student.` }
          ]
        }],
      });
      return response.text || 'ছবিটি থেকে কোনো তথ্য পাওয়া যায়নি।';
    } catch (e) {
      console.error("Gemini Image Error:", e);
      return 'ছবিটি বিশ্লেষণ করতে সমস্যা হয়েছে।';
    }
  },

  async solveMath(problem: string) {
    const ai = getAI();
    const prompt = `Solve this math problem: "${problem}". Give a step-by-step simple Bengali explanation. No LaTeX markers.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return response.text?.replace(/\$/g, '') || 'সমাধান পাওয়া যায়নি।';
    } catch (e) {
      return 'অংকটি সমাধান করতে সমস্যা হয়েছে।';
    }
  },

  async solveMathWithImage(base64Image: string) {
    const ai = getAI();
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: "Find the math problem in this image and solve it step-by-step in Bengali." }
          ]
        }],
      });
      return response.text?.replace(/\$/g, '') || 'সমাধান পাওয়া যায়নি।';
    } catch (e) {
      return 'ছবি থেকে অংকটি পড়া যায়নি।';
    }
  },

  async translateAndPronounce(text: string, direction: 'bn-en' | 'en-bn') {
    const ai = getAI();
    const prompt = `Translate this to ${direction === 'bn-en' ? 'English' : 'Bengali'}: "${text}". Return JSON: {translation, pronunciation, explanation}. Language of explanation should be Bengali.`;

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
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: "Translate the text in this image. Return JSON: {translation, pronunciation, explanation}." }
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
      throw e;
    }
  },

  async generateScript(topic: string, language: 'bn' | 'en') {
    const ai = getAI();
    const prompt = `Write a script for a presentation or video about "${topic}" in ${language === 'bn' ? 'Bengali' : 'English'}. Include introduction, key points, and conclusion.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return response.text;
    } catch (e) {
      return 'স্ক্রিপ্ট তৈরি করা যায়নি।';
    }
  },

  async validateEnglishSentence(sentence: string) {
    const ai = getAI();
    const prompt = `Validate if this English sentence is correct: "${sentence}". Return JSON: {isValid, correction, feedback}. Feedback in Bengali.`;
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
      throw e;
    }
  },

  async checkSpelling(text: string, language: 'bn' | 'en') {
    const ai = getAI();
    const prompt = `Check spelling of this ${language === 'bn' ? 'Bengali' : 'English'} text: "${text}". Return JSON: {original, corrected, differences, explanation}. Explanation in Bengali.`;
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
      throw e;
    }
  },

  async checkSpellingWithImage(base64Image: string, language: 'bn' | 'en') {
    const ai = getAI();
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Check spelling of text in this image. Return JSON: {original, corrected, differences, explanation}.` }
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
      throw e;
    }
  },

  async askQuestion(question: string) {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: `Answer this briefly in Bengali: "${question}"` }] }],
      });
      return response.text;
    } catch (e) {
      return 'উত্তর পাওয়া যায়নি।';
    }
  },

  async askQuestionWithImage(base64Image: string) {
    const ai = getAI();
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: "Answer what is shown in this image in Bengali." }
          ]
        }],
      });
      return response.text;
    } catch (e) {
      return 'ছবিটি বুঝতে সমস্যা হয়েছে।';
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