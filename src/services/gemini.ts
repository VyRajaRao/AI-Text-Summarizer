import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function summarizeText(text: string, length: 'short' | 'medium' | 'long'): Promise<string> {
  const model = ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Summarize the following text in a ${length} format. 
    Short: 1-2 sentences.
    Medium: 1 paragraph.
    Long: Multiple paragraphs with key points.
    
    Text: ${text}`,
  });

  const response = await model;
  return response.text || "Failed to generate summary.";
}

export async function paraphraseText(text: string, level: 'beginner' | 'intermediate' | 'advanced'): Promise<string> {
  const model = ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Paraphrase the following text for a ${level} reading level.
    Beginner: Simple vocabulary, short sentences, easy to understand for children or non-native speakers.
    Intermediate: Standard vocabulary, clear structure, suitable for general audience.
    Advanced: Academic/Technical vocabulary, complex sentence structures, suitable for researchers or experts.
    
    Text: ${text}`,
  });

  const response = await model;
  return response.text || "Failed to generate paraphrase.";
}

export async function analyzeReadability(text: string): Promise<{
  fleschKincaid: number;
  gunningFog: number;
  smog: number;
  gradeLevel: string;
}> {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the readability of the following text and return the scores in JSON format.
    Include:
    - fleschKincaid (Reading Ease score)
    - gunningFog (Index score)
    - smog (Index score)
    - gradeLevel (e.g., "8th Grade", "College Graduate")
    
    Text: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fleschKincaid: { type: Type.NUMBER },
          gunningFog: { type: Type.NUMBER },
          smog: { type: Type.NUMBER },
          gradeLevel: { type: Type.STRING },
        },
        required: ["fleschKincaid", "gunningFog", "smog", "gradeLevel"],
      },
    },
  });

  const response = await model;
  const data = JSON.parse(response.text || "{}");
  return data;
}

export async function extractKeyPoints(text: string): Promise<string[]> {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract the most important bullet points from the following text. 
    Rank them by importance. Return as a JSON array of strings.
    
    Text: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || "[]");
}

export async function detectTopics(text: string): Promise<string[]> {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Detect the main topics or themes of the following text. 
    Return as a JSON array of strings.
    
    Text: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || "[]");
}

export async function generateQuestions(text: string): Promise<{ question: string; type: 'comprehension' | 'conceptual' }[]> {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate study questions from the following text. 
    Include both comprehension and conceptual questions.
    Return as a JSON array of objects with 'question' and 'type' fields.
    
    Text: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['comprehension', 'conceptual'] }
          },
          required: ["question", "type"]
        }
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || "[]");
}

export async function generateGlossary(text: string): Promise<{ term: string; definition: string }[]> {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Detect important technical terms in the following text and generate definitions for them.
    Return as a JSON array of objects with 'term' and 'definition' fields.
    
    Text: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            definition: { type: Type.STRING }
          },
          required: ["term", "definition"]
        }
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || "[]");
}

export async function chatWithDocument(text: string, query: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<string> {
  const model = ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      { role: 'user', parts: [{ text: `Context Document: ${text}` }] },
      ...history,
      { role: 'user', parts: [{ text: query }] }
    ],
    config: {
      systemInstruction: "You are a helpful assistant that answers questions based on the provided document. If the answer is not in the document, say you don't know based on the context provided."
    }
  });

  const response = await model;
  return response.text || "I'm sorry, I couldn't process that request.";
}
