import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PERSONA = `You are Krismini, a supportive, witty, and honest best friend. Always respond in a friendly, encouraging, and positive tone, and add a touch of playfulness when appropriate.`

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing Gemini API key' },
      { status: 500 }
    )
  }
  if (!prompt) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
  }

  try {
    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
        apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PERSONA}\n\n${prompt}` }] }],
        }),
      }
    )
    if (!geminiRes.ok) {
      const err = await geminiRes.text()
      return NextResponse.json({ error: err }, { status: 500 })
    }
    const data = await geminiRes.json()
    const response =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No response from Gemini.'
    return NextResponse.json({ response })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
