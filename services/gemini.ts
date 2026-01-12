import { GoogleGenAI, Type } from "@google/genai";

// Standard initialization strictly using process.env.API_KEY
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing. Please ensure it is set in your environment variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const studyService = {
  async explainTopic(topic: string, level: 'basic' | 'standard') {
    const ai = getAI();
    const prompt = `Explain the following topic in simple Bengali: "${topic}". 
    Target Audience: Student. 
    Detail Level: ${level === 'basic' ? 'Beginner/Children' : 'Standard'}.
    Include: Simple definition, a relatable story or example, and English terms.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।';
    } catch (e) {
      console.error("Explain Topic Error:", e);
      return 'সার্ভারে সমস্যা হচ্ছে, দয়া করে আবার চেষ্টা করো।';
    }
  },

  async explainTopicWithImage(base64Image: string, level: 'basic' | 'standard') {
    const ai = getAI();
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Identify and explain what is in this image in simple Bengali for a ${level} student.` }
          ]
        },
      });
      return response.text || 'ছবিটি থেকে কোনো তথ্য পাওয়া যায়নি।';
    } catch (e) {
      console.error("Image Explain Error:", e);
      return 'ছবিটি বিশ্লেষণ করতে সমস্যা হয়েছে।';
    }
  },

  async solveMath(problem: string) {
    const ai = getAI();
    const prompt = `Solve this math problem: "${problem}". Provide step-by-step simple Bengali explanation. No LaTeX or $ markers.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });
      return response.text?.replace(/\$/g, '') || 'সমাধান পাওয়া যায়নি।';
    } catch (e) {
      console.error("Math Solver Error:", e);
      return 'অংকটি সমাধান করতে সমস্যা হয়েছে।';
    }
  },

  async solveMathWithImage(base64Image: string) {
    const ai = getAI();
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: "Find the math problem in this image and solve it step-by-step in Bengali." }
          ]
        },
      });
      return response.text?.replace(/\$/g, '') || 'সমাধান পাওয়া যায়নি।';
    } catch (e) {
      console.error("Math Image Error:", e);
      return 'ছবি থেকে অংকটি পড়া যায়নি।';
    }
  },

  async translateAndPronounce(text: string, direction: 'bn-en' | 'en-bn') {
    const ai = getAI();
    const prompt = `Translate this text to ${direction === 'bn-en' ? 'English' : 'Bengali'}: "${text}". Provide response in JSON format: { "translation": "...", "pronunciation": "...", "explanation": "..." }. Explanation should be in Bengali.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
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
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Translate any text in this image to ${direction === 'bn-en' ? 'English' : 'Bengali'}. Return JSON: {translation, pronunciation, explanation}.` }
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
    const prompt = `Write a script for a presentation about "${topic}" in ${language === 'bn' ? 'Bengali' : 'English'}. Include introduction, key points, and conclusion.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (e) {
      console.error("Script Error:", e);
      return 'স্ক্রিপ্ট তৈরি করা যায়নি।';
    }
  },

  async validateEnglishSentence(sentence: string) {
    const ai = getAI();
    const prompt = `Validate if this English sentence is correct: "${sentence}". Return JSON: { "isValid": boolean, "correction": "...", "feedback": "..." }. Feedback should be in Bengali.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
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
    const prompt = `Check spelling of this ${language === 'bn' ? 'Bengali' : 'English'} text: "${text}". Return JSON: {original, corrected, differences, explanation}. Explanation in Bengali.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
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
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Check spelling of text in this image. Language: ${language}. Return JSON: {original, corrected, differences, explanation}.` }
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
        contents: `Answer this question briefly in Bengali: "${question}"`,
      });
      return response.text;
    } catch (e) {
      console.error("QA Error:", e);
      return 'উত্তর পাওয়া যায়নি।';
    }
  },

  async askQuestionWithImage(base64Image: string) {
    const ai = getAI();
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: "Answer what is shown in this image in Bengali." }
          ]
        },
      });
      return response.text;
    } catch (e) {
      console.error("QA Image Error:", e);
      return 'ছবিটি বুঝতে সমস্যা হয়েছে।';
    }
  },

  async chatWithFriend(history: any[], message: string) {
    const ai = getAI();
    const saved = localStorage.getItem('global_settings');
    let sys = "You are Roman, a friendly AI tutor for students. Correct English errors in Bengali, then reply in English with Bengali translations in brackets.";
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