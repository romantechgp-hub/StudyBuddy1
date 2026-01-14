
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Critical: API_KEY is missing. Check Vercel Environment Variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

// গ্লোবাল ইন্সট্রাকশন যা সকল টুলের জন্য ইংরেজি সংখ্যা নিশ্চিত করবে
const NUMERAL_INSTRUCTION = "CRITICAL: Always use English digits (1, 2, 3, 4, 5, 6, 7, 8, 9, 0) for all numbers, counts, and mathematical expressions, even when the rest of the text is in Bengali.";

export const studyService = {
  // সহজ পড়া মোড
  async explainTopic(topic: string, level: 'basic' | 'standard', mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    const modePrompt = mode === 'brief' 
      ? "Provide a very brief definition and one quick example in Bengali." 
      : "Provide a detailed explanation in Bengali with definitions, multiple examples, and key points for a deep understanding.";
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Explain "${topic}" in simple Bengali for a ${level} level student. ${modePrompt} ${NUMERAL_INSTRUCTION}`,
      });
      return response.text || "উত্তর পাওয়া যায়নি।";
    } catch (e) {
      console.error("Study Mode Error:", e);
      return "সার্ভারে সমস্যা হচ্ছে, আবার চেষ্টা করো।";
    }
  },

  async explainTopicWithImage(base64Image: string, level: 'basic' | 'standard', mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    const modePrompt = mode === 'brief' ? "Briefly identify and explain." : "Detailed identification and step-by-step explanation.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Identify and explain this image in simple Bengali for a ${level} student. ${modePrompt} ${NUMERAL_INSTRUCTION}` }
          ]
        },
      });
      return response.text || "ছবিটি বোঝা যাচ্ছে না।";
    } catch (e) {
      return "ছবি বিশ্লেষণে সমস্যা হয়েছে।";
    }
  },

  // অংক সমাধানকারী: Pro মডেল ব্যবহার করা হচ্ছে উন্নত গাণিতিক যুক্তির জন্য
  async solveMath(problem: string, mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    const modePrompt = mode === 'brief'
      ? "Give the direct answer with minimal steps."
      : "Give a thorough step-by-step breakdown with formulas and logic.";
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are an expert Math Tutor. Solve the following problem in Bengali. 
        IMPORTANT RULES:
        1. ${NUMERAL_INSTRUCTION} 
        2. Do not use any LaTeX symbols like $, \[, or \]. Use plain text and standard symbols like +, -, *, /.
        3. Make the steps logically separated and easy to read.
        ${modePrompt} 
        Problem: ${problem}`,
      });
      return response.text || "সমাধান মেলেনি।";
    } catch (e) {
      return "অংকটি সমাধান করা সম্ভব হচ্ছে না।";
    }
  },

  async solveMathWithImage(base64Image: string, mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    const modePrompt = mode === 'brief' ? "Direct answer." : "Deep step-by-step explanation.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Math Tutor. Identify the math problem in this image and solve it in Bengali. 
            IMPORTANT RULES:
            1. ${NUMERAL_INSTRUCTION}
            2. Do not use LaTeX.
            ${modePrompt}` }
          ]
        }
      });
      return response.text || "অংকটি শনাক্ত করা যায়নি।";
    } catch (e) {
      return "ছবি থেকে অংক সমাধান করা সম্ভব হয়নি।";
    }
  },

  // অনুবাদ ও স্পিকিং
  async translateAndPronounce(text: string, direction: 'bn-en' | 'en-bn', mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    const target = direction === 'bn-en' ? 'English' : 'Bengali';
    const detailPrompt = mode === 'detailed' ? "Provide extra grammar tips and 2 usage examples." : "Provide simple translation and pronunciation.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate to ${target}: "${text}". ${detailPrompt} ${NUMERAL_INSTRUCTION} Return JSON: {translation, pronunciation, explanation}.`,
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
    const detailPrompt = mode === 'detailed' ? "Explain context deeply." : "Quick translation.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Identify text and translate to ${target}. ${detailPrompt} ${NUMERAL_INSTRUCTION} Return JSON: {translation, pronunciation, explanation}.` }
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

  // প্রশ্ন ও উত্তর
  async askQuestion(question: string, mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    const modePrompt = mode === 'brief' ? "Answer in 1-2 short sentences." : "Answer with full context and background info.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Question: "${question}". Mode: ${modePrompt} Answer in Bengali. ${NUMERAL_INSTRUCTION}`,
      });
      return response.text || "উত্তর পাওয়া যায়নি।";
    } catch (e) {
      return "উত্তর দিতে সমস্যা হচ্ছে।";
    }
  },

  async askQuestionWithImage(base64Image: string, mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    const modePrompt = mode === 'brief' ? "Briefly." : "In detail.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Identify and answer this image question in Bengali. ${modePrompt} ${NUMERAL_INSTRUCTION}` }
          ]
        },
      });
      return response.text || "উত্তর পাওয়া যায়নি।";
    } catch (e) {
      return "ছবি থেকে উত্তর খুঁজতে সমস্যা হয়েছে।";
    }
  },

  // বানান চেক
  async checkSpelling(text: string, language: 'bn' | 'en', mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    const modePrompt = mode === 'brief' ? "Minimal explanation." : "Detailed grammatical rules explanation.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Check spelling for ${language}: "${text}". ${modePrompt} ${NUMERAL_INSTRUCTION} Return JSON {original, corrected, differences, explanation in Bengali}.`,
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
    const modePrompt = mode === 'brief' ? "Corrected text only." : "Step-by-step corrections.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: `Identify text and check spelling for ${language}. ${modePrompt} ${NUMERAL_INSTRUCTION} Return JSON {original, corrected, differences, explanation in Bengali}.` }
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

  // স্ক্রিপ্ট রাইটার
  async generateScript(topic: string, language: 'bn' | 'en', mode: 'brief' | 'detailed' = 'detailed') {
    const ai = getAI();
    const modePrompt = mode === 'brief' ? "Short 1-min script." : "Comprehensive multi-part script.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a script for "${topic}" in ${language === 'bn' ? 'Bengali' : 'English'}. Mode: ${modePrompt} ${NUMERAL_INSTRUCTION}`,
      });
      return response.text || "স্ক্রিপ্ট তৈরি করা যায়নি।";
    } catch (e) {
      return "স্ক্রিপ্ট তৈরি করতে সমস্যা হচ্ছে।";
    }
  },

  // ইংরেজি বাক্য যাচাই (Daily Challenge)
  async validateEnglishSentence(sentence: string) {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this English sentence for grammatical correctness and length (at least 3 words): "${sentence}". ${NUMERAL_INSTRUCTION}
        Return JSON format:
        {
          "isValid": boolean,
          "feedback": "Encouraging feedback or correction explanation in Bengali",
          "correction": "Corrected English version of the sentence (only if isValid is false)"
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
      console.error("Validation Error:", e);
      return { isValid: false, feedback: "সার্ভারে সমস্যা হয়েছে।" };
    }
  },

  async chatWithFriend(history: any[], message: string) {
    const ai = getAI();
    const saved = localStorage.getItem('global_settings');
    let sys = `You are Roman, a friendly AI tutor. Correct errors in Bengali and reply in English with Bengali translations in brackets. ${NUMERAL_INSTRUCTION}`;
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
      return response.text || "দুঃখিত বন্ধু, আমি বুঝতে পারিনি।";
    } catch (e) {
      return "দুঃখিত বন্ধু, ইন্টারনেটে সমস্যা হচ্ছে।";
    }
  }
};
