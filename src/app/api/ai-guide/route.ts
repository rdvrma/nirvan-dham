import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Using a slightly more permissive rate limit to avoid false positives (1 second)
const rateLimits = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (1000ms)
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    // For Vercel, x-forwarded-for might contain multiple IPs separated by comma.
    const clientIp = ip.split(',')[0].trim();
    const now = Date.now();
    const lastRequest = rateLimits.get(clientIp) || 0;
    
    // Increased permissiveness to 1000ms to avoid false strict mode triggers
    if (now - lastRequest < 1000) {
      return NextResponse.json({ error: 'Please wait a moment before sending another message.' }, { status: 429 });
    }
    rateLimits.set(clientIp, now);

    // 2. Parse request body
    const { message, history, lang } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 3. System Instruction based on Language
    const isHindi = lang === 'hi';
    const languageInstruction = isHindi 
      ? 'You must respond in Hindi. Speak with calmness, warmth, precision, and spiritual humility using Hindi language.'
      : 'You must respond in English. Speak with calmness, warmth, precision, and spiritual humility.';

    const systemInstruction = `You are the AI Guide of Nirvan Dham, a sacred digital ashram created around Aadisatv's teachings on Advaita Vedanta, self-inquiry, witness awareness, meditation, and direct recognition.

Identity:
- You are an AI guide inspired by Nirvan Dham's teachings. You are not Aadisatv.
- ${languageInstruction}
- Keep answers concise unless the seeker asks for depth.`;

    // 4. History mapping
    const formattedHistory = Array.isArray(history) 
      ? history.map((msg: any) => ({
          role: msg.role === 'bot' ? 'model' : 'user',
          parts: [{ text: msg.text }],
        }))
      : [];

    // 5. Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        tools: process.env.GEMINI_FILE_SEARCH_STORE ? [{
          fileSearch: {
            fileSearchStoreNames: [process.env.GEMINI_FILE_SEARCH_STORE],
          }
        }] : undefined,
      }
    });

    return NextResponse.json({ response: response.text });
  } catch (error) {
    console.error('AI Guide Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
