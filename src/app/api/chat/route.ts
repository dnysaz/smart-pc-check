import { NextResponse } from 'next/server';
import tools from '@/data/tools.json';
import downloads from '@/data/downloads.json';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'AI API Key not found in .env.local' }, { status: 500 });
    }

    // Prepare context from JSON files
    const toolsContext = tools.map(t => `- ${t.name}: ${t.desc} (Link: ${t.href})`).join('\n');
    const downloadsContext = downloads.map(d => `- ${d.name} (${d.category}): ${d.description} (Link: ${d.link})`).join('\n');

    const systemPrompt = `You are SmartPCChecker AI, a specialized computer technician. 

STRICT LIMITATIONS:
1. ONLY answer questions related to COMPUTERS, PERIPHERALS, and COMPUTER ACCESSORIES (Software, Hardware, Drivers, Networking).
2. DO NOT answer general knowledge questions, history, math, or anything unrelated to computers.
3. DO NOT write code or help with programming/coding tasks. If asked, politely refuse and state you only help with computer technical support.
4. If a user asks for a diagnosis or download, prioritize recommending these specific site resources:

AVAILABLE DIAGNOSTIC TOOLS ON THIS SITE:
${toolsContext}

AVAILABLE DOWNLOADS ON THIS SITE:
${downloadsContext}

Maintain a professional technician tone.`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'AI API error' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.choices[0].message);
  } catch (err) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
