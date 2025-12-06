import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { TranslationResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for structured translation output
const translationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    kanji: { type: Type.STRING, description: "The word or sentence in Japanese Kanji/Kana mix." },
    hiragana: { type: Type.STRING, description: "The reading in Hiragana only." },
    romaji: { type: Type.STRING, description: "The reading in Romaji." },
    english: { type: Type.STRING, description: "The English translation." },
    type: { type: Type.STRING, enum: ["text", "object"], description: "Whether the input was recognized as text or a physical object." }
  },
  required: ["kanji", "hiragana", "romaji", "english", "type"],
};

/**
 * Analyzes an image (base64) to identify objects or read text.
 */
export const analyzeImage = async (base64Image: string): Promise<TranslationResult> => {
  try {
    const modelId = "gemini-2.5-flash"; // Good balance for vision tasks
    const prompt = `
      Look at this image.
      If it contains prominent text (like a sign, menu, or book), extract the text and translate it.
      If it contains a prominent object (like a cat, car, or food) and no clear text, identify the object.
      
      Return the result in JSON format providing the Japanese (Kanji), Reading (Hiragana), Romaji, and English translation.
    `;

    // Strip header if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: translationSchema
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as TranslationResult;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Vision API Error:", error);
    throw error;
  }
};

/**
 * Translates text and provides linguistic breakdown.
 */
export const translateText = async (text: string): Promise<TranslationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Translate the following text to Japanese: "${text}". Provide the Kanji, Hiragana reading, and Romaji.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: translationSchema
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as TranslationResult;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Translation Error:", error);
    throw error;
  }
};

/**
 * Generates speech from text using Gemini TTS.
 * Returns base64 audio string.
 */
export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text: text }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is usually a good neutral voice
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return audioData || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

/**
 * Chat with "Sensei"
 */
export const chatWithSensei = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: history,
    config: {
      systemInstruction: "You are Sensei-san, a friendly and polite Japanese tutor. You help users with grammar, explain cultural nuances, and translate slang. Always provide the Kanji, Kana, and Romaji for specific Japanese terms you explain. Keep answers concise and helpful.",
    }
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text;
};
