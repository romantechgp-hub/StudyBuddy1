
import { GoogleGenAI, Type } from "@google/genai";

// Initialize AI using named parameter and process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const studyService = {
  async explainTopic(topic: string, level: 'basic' | 'standard') {
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

  async solveMath(problem: string) {
    const prompt = `Solve this math problem: "${problem}". 
    Format the output strictly as follows:
    1. Provide the Final Answer first.
    2. Provide Step-by-step explanation in Bengali.
    
    CRITICAL RULES for Math Formatting:
    - Use standard math symbols only (+, -, ×, ÷, =, √, ^).
    - Do NOT use words like "gun", "vag", "jog" inside formulas. Use the symbols instead.
    - Do NOT wrap any text or formula in dollar signs ($) or double dollar signs ($$).
    - Keep formula lines clean and separate from descriptive text.
    - Use letters/variables (like x, y, a, b) for formulas clearly.
    - The output must be plain text without any LaTeX markers.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    // Safety check to remove any remaining $ signs if the model ignores instructions
    return response.text?.replace(/\$/g, '') || '';
  },

  async translateAndPronounce(text: string, direction: 'bn-en' | 'en-bn') {
    const fromLang = direction === 'bn-en' ? 'Bengali' : 'English';
    const toLang = direction === 'bn-en' ? 'English' : 'Bengali';
    
    const prompt = `Translate this ${fromLang} text to ${toLang}: "${text}".
    Provide the output in JSON format with these fields:
    - translation: The translated sentence.
    - pronunciation: A simple Bengali guide to pronounce the translated sentence (if translation is English) or the original sentence (if translation is Bengali).
    Example JSON for BN to EN: {"translation": "How are you?", "pronunciation": "হাউ আর ইউ?"}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translation: { type: Type.STRING },
            pronunciation: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  },

  async generateScript(topic: string, language: 'bn' | 'en') {
    const langName = language === 'bn' ? 'Bengali' : 'English';
    const prompt = `Write a creative and useful script about the topic: "${topic}" in ${langName}. 
    The script could be for a video, a presentation, or a short play. 
    Format it nicely with headings. If in Bengali, use clear and standard language.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  },

  async validateEnglishSentence(sentence: string) {
    const prompt = `Check if this is a correct and meaningful English sentence: "${sentence}".
    Respond with a JSON object:
    - isValid: true or false.
    - correction: If invalid, provide the corrected version.
    - feedback: A very short encouragement in Bengali.`;

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
    const prompt = `Check the spelling and grammar of the following ${language === 'bn' ? 'Bengali' : 'English'} text: "${text}".
    Provide the output in JSON format:
    - original: The original text provided.
    - corrected: The corrected text.
    - differences: A short list of what was corrected in Bengali.
    - explanation: A very simple explanation of the rules in Bengali.`;

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

  async askQuestion(question: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Answer this question in Bengali: "${question}". Be concise and helpful.`,
    });
    return response.text;
  },

  async chatWithFriend(history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string) {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are a friendly AI friend for students named 'Buddy'. 
        If the student speaks English with mistakes, DO NOT be rude. 
        Gently correct their sentence in Bengali first, then reply to them in English.
        Always maintain a supportive and encouraging tone. 
        Focus on daily life, school, interviews, and travel topics.`,
      },
      history: history,
    });

    const response = await chat.sendMessage({ message: message });
    return response.text;
  }
};
