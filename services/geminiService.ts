import { GoogleGenAI } from "@google/genai";
import { Lead } from "../types";

const getApiKey = () => {
  // Prioritize local storage key if set by user in Settings, otherwise fallback to env
  return localStorage.getItem('nexus_api_key') || process.env.API_KEY || '';
};

export const generateEmailContent = async (topic: string, tone: string, recipientName: string): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return `[MOCK GENERATION - No API Key]\n\nSubject: Regarding ${topic}\n\nHi ${recipientName},\n\nTo use real AI generation, please go to Settings and enter your Gemini API Key.\n\nBest,\nNexus Team`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';
    const prompt = `Write a short, engaging sales email about "${topic}". 
    The tone should be ${tone}. 
    The recipient's name is ${recipientName}.
    Include a subject line.
    Format the output as plain text with clearly separated Subject and Body.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "Error generating content. Please check your API Key in Settings.";
  }
};

export const generateIcebreaker = async (lead: Lead): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return `[MOCK ICEBREAKER]\nHi ${lead.name}, I see you're doing great work at ${lead.company} in ${lead.location}!`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';
    const prompt = `Write a short, personalized LinkedIn connection message (max 300 characters) for a prospect named ${lead.name}.
    
    Context:
    - Role: ${lead.title}
    - Company: ${lead.company}
    - Location: ${lead.location}
    
    Make it friendly, professional, and not salesy.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Failed to generate icebreaker.";
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "Error generating icebreaker. Check your API Key.";
  }
};