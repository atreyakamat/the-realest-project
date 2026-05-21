import OpenAI from 'openai';

interface DraftContext {
  leadName?: string;
  location?: string;
  budget?: string;
}

type CallInsightResult = {
  transcript: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  followUpTasks: string[];
  raw: Record<string, unknown>;
};

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key') return null;
  return new OpenAI({ apiKey });
}

function safeJsonParse(value: string): Record<string, unknown> | null {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function generateMessageDraft(prompt: string, context: DraftContext) {
  const openai = getOpenAIClient();

  if (!openai) {
    console.log('[DRY-RUN] AI Message Draft requested for:', prompt);
    return `Hi ${context.leadName}, I have some great properties in ${context.location} that match your budget of ${context.budget}. When can we connect?`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful real estate assistant. Draft a professional and friendly message for a lead based on the provided context.'
        },
        {
          role: 'user',
          content: `Draft a message for ${context.leadName}. Context: ${prompt}. Details: Location ${context.location}, Budget ${context.budget}.`
        }
      ]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI Error:', error);
    return 'Hi, I have some property options for you. Let me know when you are free to discuss.';
  }
}

export async function transcribeAndAnalyzeCall(recordingUrl: string): Promise<CallInsightResult> {
  const openai = getOpenAIClient();

  if (!openai) {
    return {
      transcript: 'DRY-RUN transcript unavailable (OpenAI key missing).',
      summary: 'Dry run summary: lead discussed property preferences and asked for follow-up details.',
      sentiment: 'neutral',
      followUpTasks: ['Send brochure', 'Schedule next call'],
      raw: { mode: 'dry-run' },
    };
  }

  const audioResponse = await fetch(recordingUrl);
  if (!audioResponse.ok) {
    throw new Error(`Unable to fetch recording audio: ${audioResponse.status}`);
  }

  const contentType = audioResponse.headers.get('content-type') ?? 'audio/mpeg';
  const audioBuffer = await audioResponse.arrayBuffer();
  const audioFile = new File([audioBuffer], 'call-recording.mp3', { type: contentType });

  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
  });

  const transcript = transcription.text?.trim() || 'No transcript available.';
  const analysisResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          'You analyze real-estate call transcripts. Return ONLY compact JSON with keys: summary (string), sentiment (positive|neutral|negative|mixed), followUpTasks (string[]).',
      },
      {
        role: 'user',
        content: transcript,
      },
    ],
  });

  const content = analysisResponse.choices[0]?.message?.content ?? '{}';
  const parsed = safeJsonParse(content) ?? {};

  const summary = typeof parsed.summary === 'string' ? parsed.summary : 'Call summary unavailable.';
  const sentiment =
    parsed.sentiment === 'positive' || parsed.sentiment === 'neutral' || parsed.sentiment === 'negative' || parsed.sentiment === 'mixed'
      ? parsed.sentiment
      : 'neutral';

  const followUpTasks = Array.isArray(parsed.followUpTasks)
    ? parsed.followUpTasks.filter((task): task is string => typeof task === 'string').slice(0, 6)
    : [];

  return {
    transcript,
    summary,
    sentiment,
    followUpTasks,
    raw: parsed,
  };
}
