import OpenAI from 'openai';

interface DraftContext {
  leadName?: string;
  location?: string;
  budget?: string;
}

export async function generateMessageDraft(prompt: string, context: DraftContext) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_openai_api_key') {
    console.log('[DRY-RUN] AI Message Draft requested for:', prompt);
    return `Hi ${context.leadName}, I have some great properties in ${context.location} that match your budget of ${context.budget}. When can we connect?`;
  }

  const openai = new OpenAI({ apiKey });

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
