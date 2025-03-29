import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Initialize OpenAI client with server-side API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, functions, functionCall } = body;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      temperature: 0.6,
      messages,
      functions,
      function_call: functionCall
    });
    
    return NextResponse.json(completion);
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}