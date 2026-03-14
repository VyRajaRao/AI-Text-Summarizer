import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      // If it's a 429 (Rate Limit), wait and retry
      if (error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('429') || error?.code === 429) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`Rate limit hit. Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

const PLAIN_TEXT_FORMATTING_INSTRUCTIONS = `
FORMATTING RULES:
1. Return response in clean, structured plain text ONLY.
2. DO NOT use markdown syntax (no bold, italics, bullet points, backticks, or hashtags).
3. DO NOT include markdown list symbols like -, *, or numbered markdown lists.
4. Use simple structured headings followed by a colon (e.g., "Summary:", "Key Point:").
5. Use only normal characters and plain text. No decorative symbols.
6. Ensure proper spacing between sections for readability.
7. DO NOT wrap text in code blocks.
`;

export async function summarizeText(text: string, length: 'short' | 'medium' | 'long'): Promise<string> {
  return withRetry(async () => {
    const model = ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Summarize the following text in a ${length} format. 
      Short: 1-2 sentences.
      Medium: 1 paragraph.
      Long: Multiple paragraphs with key points.
      
      ${PLAIN_TEXT_FORMATTING_INSTRUCTIONS}
      
      Text: ${text}`,
    });

    const response = await model;
    return response.text || "Failed to generate summary.";
  });
}

export async function paraphraseText(text: string, level: 'beginner' | 'intermediate' | 'advanced'): Promise<string> {
  return withRetry(async () => {
    const model = ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Paraphrase the following text for a ${level} reading level.
      Beginner: Simple vocabulary, short sentences, easy to understand for children or non-native speakers.
      Intermediate: Standard vocabulary, clear structure, suitable for general audience.
      Advanced: Academic/Technical vocabulary, complex sentence structures, suitable for researchers or experts.
      
      ${PLAIN_TEXT_FORMATTING_INSTRUCTIONS}
      
      Text: ${text}`,
    });

    const response = await model;
    return response.text || "Failed to generate paraphrase.";
  });
}

export async function analyzeReadability(text: string): Promise<{
  fleschKincaid: number;
  gunningFog: number;
  smog: number;
  gradeLevel: string;
}> {
  return withRetry(async () => {
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
  });
}

export async function extractKeyPoints(text: string): Promise<string[]> {
  return withRetry(async () => {
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract the most important bullet points from the following text. 
      Rank them by importance. Return as a JSON array of strings.
      
      ${PLAIN_TEXT_FORMATTING_INSTRUCTIONS}
      
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
  });
}

export async function detectTopics(text: string): Promise<string[]> {
  return withRetry(async () => {
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Detect the main topics or themes of the following text. 
      Return as a JSON array of strings.
      
      ${PLAIN_TEXT_FORMATTING_INSTRUCTIONS}
      
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
  });
}

export async function generateQuestions(text: string): Promise<{ question: string; type: 'comprehension' | 'conceptual' }[]> {
  return withRetry(async () => {
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate study questions from the following text. 
      Include both comprehension and conceptual questions.
      Return as a JSON array of objects with 'question' and 'type' fields.
      
      ${PLAIN_TEXT_FORMATTING_INSTRUCTIONS}
      
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
  });
}

export async function generateGlossary(text: string): Promise<{ term: string; definition: string }[]> {
  return withRetry(async () => {
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Detect important technical terms in the following text and generate definitions for them.
      Return as a JSON array of objects with 'term' and 'definition' fields.
      
      ${PLAIN_TEXT_FORMATTING_INSTRUCTIONS}
      
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
  });
}

export async function chatWithDocument(text: string, query: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<string> {
  return withRetry(async () => {
    const model = ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        { role: 'user', parts: [{ text: `Context Document: ${text}` }] },
        ...history,
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction: `You are a helpful assistant that answers questions based on the provided document. If the answer is not in the document, say you don't know based on the context provided.
        
        ${PLAIN_TEXT_FORMATTING_INSTRUCTIONS}`
      }
    });

    const response = await model;
    return response.text || "I'm sorry, I couldn't process that request.";
  });
}

export async function chatWithContext(context: string, query: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<string> {
  return withRetry(async () => {
    const model = ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        { role: 'user', parts: [{ text: `Relevant Context:\n${context}` }] },
        ...history,
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction: `You are a helpful assistant that answers questions based on the provided context. Use the provided context to answer the user's question accurately. If the answer is not in the context, inform the user but try to be helpful if possible using general knowledge, while clearly stating it's not in the document.
        
        ${PLAIN_TEXT_FORMATTING_INSTRUCTIONS}`
      }
    });

    const response = await model;
    return response.text || "I'm sorry, I couldn't process that request.";
  });
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: [text],
  });

  return result.embeddings?.[0]?.values ?? [];
}

export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  const result = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: texts,
  });

  return (result.embeddings ?? []).map(e => e.values ?? []);
}
