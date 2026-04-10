import { GoogleGenerativeAI } from '@google/generative-ai';

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export interface GeminiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeminiChatOptions {
  messages: GeminiMessage[];
  systemPrompt: string;
  enableSearchGrounding?: boolean;
  maxOutputTokens?: number;
  temperature?: number;
}

/**
 * Send a chat message to Google Gemini with optional search grounding
 * Search grounding enables the model to search Google for live information
 */
export async function geminiChatWithGrounding(
  options: GeminiChatOptions
): Promise<{ text: string; searchUsed?: boolean; citations?: string[] }> {
  const {
    messages,
    systemPrompt,
    enableSearchGrounding = true,
    maxOutputTokens = 4096,
    temperature = 0.2,
  } = options;

  // Convert message history to Gemini format
  const history = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  // Get the last user message
  const userMessage = messages[messages.length - 1];
  if (userMessage.role !== 'user') {
    throw new Error('Last message must be from user');
  }

  try {
    // Initialize model with Gemini 2.5 Flash (latest & fastest)
    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    // Start chat session with history
    const chat = model.startChat({
      history: history.slice(0, -1), // Exclude the last message (it's the current one)
    });

    // Build the tools array with search grounding if enabled
    const tools: Parameters<typeof chat.sendMessage>[1] = {};
    if (enableSearchGrounding) {
      tools.tools = [
        {
          googleSearch: {},
        },
      ];
    }

    // Send message
    const response = await chat.sendMessage(userMessage.content, tools);

    // Extract text from response
    const text = response.response?.text?.() || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) {
      throw new Error('No text content in response');
    }

    // Extract citations if available
    let citations: string[] = [];
    if (response.response?.groundingMetadata?.searchEntryPoint) {
      citations = [response.response.groundingMetadata.searchEntryPoint];
    }

    return {
      text,
      searchUsed: enableSearchGrounding,
      citations,
    };
  } catch (error) {
    if (error instanceof Error) {
      // Check for rate limiting
      if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('GEMINI_RATE_LIMIT');
      }
      if (error.message.includes('API_KEY') || error.message.includes('authentication')) {
        throw new Error('GEMINI_AUTH_ERROR');
      }
    }
    throw error;
  }
}

/**
 * Alternative simpler method without chat history (for single-turn requests)
 */
export async function geminiSingleRequest(
  prompt: string,
  systemPrompt: string,
  enableSearchGrounding = true
): Promise<string> {
  try {
    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    const generationConfig = {
      maxOutputTokens: 4096,
      temperature: 0.2,
    };

    const tools: Parameters<typeof model.generateContent>[1] = { generationConfig };
    if (enableSearchGrounding) {
      tools.tools = [
        {
          googleSearch: {},
        },
      ];
    }

    const response = await model.generateContent(prompt, tools);
    const text = response.response?.text?.() || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) {
      throw new Error('No text content in response');
    }
    return text;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('GEMINI_RATE_LIMIT');
      }
    }
    throw error;
  }
}

/**
 * Check if Google API key is configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GOOGLE_API_KEY;
}
