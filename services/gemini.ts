
import { GoogleGenAI, Type } from "@google/genai";

// Initialize AI exclusively using process.env.API_KEY as per guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const studyService = {
  async explainTopic(topic: string, level: 'basic' | 'standard') {
    const ai = getAI();
    const prompt = `Explain the following topic in simple Bengali: "${topic}". 
    Target Audience: Student. 
    Detail Level: ${level === 'basic' ? 'Beginner/Children' : 'Standard'}.
    Include: 
    1. A very simple definition.
    2. A relatable story or example.
    3. English terms where necessary.
    Output should be purely in Bengali (except for technical terms).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  },

  async explainTopicWithImage(base64Image: string, level: 'basic' | 'standard') {
    const ai = getAI();
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image.split(',')[1],
      },
    };
    const textPart = {
      text: `Identify the main topic in this image and explain it in simple Bengali. 
      Target Audience: Student. 
      Detail Level: ${level === 'basic' ? 'Beginner/Children' : 'Standard'}.
      Include: 
      1. A very simple definition.
      2. A relatable story or example.
      3. English terms where necessary.
      Output should be purely in Bengali (except for technical terms).`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
    });
    return response.text;
  },

  async solveMath(problem: string) {
    const ai = getAI();
    const prompt = `Solve this math problem: "${problem}". 
    Format the output strictly as follows:
    1. Provide the Final Answer first.
    2. Provide Step-by-step explanation in Bengali.
    
    CRITICAL RULES for Math Formatting:
    - Use standard math symbols only (+, -, ×, ÷, =, √, ^).
    - Do NOT wrap any text or formula in dollar signs ($).
    - Keep formula lines clean.
    - The output must be plain text without any LaTeX markers.`;

    // Using gemini-3-pro-preview for math tasks as recommended
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    
    return response.text?.replace(/\$/g, '') || '';
  },

  async solveMathWithImage(base64Image: string) {
    const ai = getAI();
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image.split(',')[1],
      },
    };
    const textPart = {
      text: `Analyze the math problem in this image and solve it. 
      Format the output strictly as follows:
      1. Provide the Final Answer first.
      2. Provide Step-by-step explanation in Bengali.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [imagePart, textPart] },
    });
    return response.text?.replace(/\$/g, '') || '';
  },

  async translateAndPronounce(text: string, direction: 'bn-en' | 'en-bn') {
    const ai = getAI();
    const fromLang = direction === 'bn-en' ? 'Bengali' : 'English';
    const toLang = direction === 'bn-en' ? 'English' : 'Bengali';
    
    const prompt = `Translate this ${fromLang} text to ${toLang}: "${text}".
    Provide the output in JSON format with fields: translation, pronunciation, explanation.`;

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
  },

  async translateAndPronounceWithImage(base64Image: string, direction: 'bn-en' | 'en-bn') {
    const ai = getAI();
    const fromLang = direction === 'bn-en' ? 'Bengali' : 'English';
    const toLang = direction === 'bn-en' ? 'English' : 'Bengali';

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image.split(',')[1],
      },
    };
    const textPart = {
      text: `Detect the ${fromLang} text in this image and translate it to ${toLang}. 
      Provide JSON with translation, pronunciation, and explanation.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
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
  },

  async generateScript(topic: string, language: 'bn' | 'en') {
    const ai = getAI();
    const langName = language === 'bn' ? 'Bengali' : 'English';
    const prompt = `Write a creative script about the topic: "${topic}" in ${langName}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  },

  async validateEnglishSentence(sentence: string) {
    const ai = getAI();
    const prompt = `Check if this is a correct English sentence: "${sentence}".
    Respond with JSON: isValid, correction, feedback.`;

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
  },

  async checkSpelling(text: string, language: 'bn' | 'en') {
    const ai = getAI();
    const prompt = `Check spelling of this ${language === 'bn' ? 'Bengali' : 'English'} text: "${text}".
    Respond with JSON: original, corrected, differences, explanation.`;

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
  },

  async checkSpellingWithImage(base64Image: string, language: 'bn' | 'en') {
    const ai = getAI();
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image.split(',')[1],
      },
    };
    const textPart = {
      text: `Detect the ${language === 'bn' ? 'Bengali' : 'English'} text and check spelling. JSON: original, corrected, differences, explanation.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
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
  },

  async askQuestion(question: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Answer this in Bengali: "${question}".`,
    });
    return response.text;
  },

  async askQuestionWithImage(base64Image: string) {
    const ai = getAI();
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image.split(',')[1],
      },
    };
    const textPart = {
      text: `Analyze this image and answer in Bengali.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
    });
    return response.text;
  },

  async chatWithFriend(history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string) {
    const ai = getAI();
    const saved = localStorage.getItem('global_settings');
    let instruction = `You are Roman, a friendly AI English tutor for Bengali students. 
    Explain mistakes simply in Bengali. For every English sentence, provide Bengali translation in brackets.`;
    
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.aiSystemInstruction) instruction = parsed.aiSystemInstruction;
    }

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: { systemInstruction: instruction },
      history: history,
    });

    const response = await chat.sendMessage({ message: message });
    return response.text;
  }
};
