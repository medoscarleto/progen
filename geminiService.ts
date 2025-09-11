import { GoogleGenAI, Type } from "@google/genai";
import type { EtsyListing } from './types';

const getClient = (apiKey?: string) => {
    const keyToUse = apiKey || process.env.API_KEY;
    if (!keyToUse) {
        throw new Error("API_KEY is not configured. Please provide it in your environment or enter a custom key.");
    }
    return new GoogleGenAI({ apiKey: keyToUse });
};

const listingContentSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'An SEO-optimized product title, max 140 characters.'
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of exactly 13 relevant tags potential buyers would use.'
    },
    description: {
      type: Type.STRING,
      description: 'A detailed product description (3-5 paragraphs) highlighting benefits and features. Use markdown for formatting (e.g., **bold text**, and new lines for paragraphs and lists starting with -).'
    },
    coverImagePrompts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Generate exactly 3 distinct, creative prompts for a text-to-image AI to generate a product cover image. The prompts should describe eye-catching, professional product mockups. The main focus must be the product title, using large, clear, and easily readable typography. The overall aesthetic should be modern and appealing to the target audience on Etsy."
    }
  },
  required: ['title', 'tags', 'description', 'coverImagePrompts']
};

export const generateEtsyListing = async (productIdea: string, apiKey?: string): Promise<EtsyListing> => {
  const ai = getClient(apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Generate the Etsy listing content for the following digital product idea: "${productIdea}"`,
    config: {
      systemInstruction: "You are an expert in Etsy SEO and copywriting. Your goal is to create compelling and optimized listing content that attracts buyers and follows Etsy's best practices. Generate content that is engaging, follows Etsy's policies, and is optimized for search.",
      responseMimeType: "application/json",
      responseSchema: listingContentSchema,
    },
  });

  const jsonText = (response.text ?? '').trim();
  const parsed = JSON.parse(jsonText);
  // Ensure tags is an array of strings, even if AI returns a single string.
  if (typeof parsed.tags === 'string') {
      parsed.tags = parsed.tags.split(',').map((tag: string) => tag.trim());
  }

  return parsed as EtsyListing;
};

export const generateProductContent = async (productIdea: string, apiKey?: string): Promise<string> => {
  const ai = getClient(apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Generate the full, well-researched text content for the following digital product: "${productIdea}". The output must be a very long, detailed, and comprehensive guide, structured logically with clear headings and subheadings. Aim for a minimum length of 30,000 characters.`,
    config: {
      systemInstruction: "You are a content creator and subject-matter expert. Your task is to create valuable, factual, and comprehensive content for a digital product based on your extensive knowledge. The tone should be helpful, clear, and easy for the target audience to understand. The final output must be exceptionally long and detailed. Use simple markdown for formatting (e.g., **bold text** for headings or important terms, and new lines for paragraphs and lists starting with -).",
    },
  });

  return response.text ?? '';
};