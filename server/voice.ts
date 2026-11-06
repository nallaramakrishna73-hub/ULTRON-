import { Response } from 'express';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '1SM7GgM6IMuvQlz2BwM3';

export async function generateElevenLabsSpeech(text: string, res: Response, voiceId: string = ELEVENLABS_VOICE_ID) {
  if (!ELEVENLABS_API_KEY) {
    return res.status(200).json({
      fallback: true,
      reason: 'No ELEVENLABS_API_KEY provided. Using client-side Web Speech / Piper offline engine.',
    });
  }

  try {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const apiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return res.status(200).json({
        fallback: true,
        reason: `ElevenLabs API error: ${errText}`,
      });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    const arrayBuffer = await apiRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    return res.status(200).json({
      fallback: true,
      reason: err.message || 'Voice generation error',
    });
  }
}
