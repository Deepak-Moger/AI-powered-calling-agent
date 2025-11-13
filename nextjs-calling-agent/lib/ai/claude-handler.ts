import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are an AI calling agent designed to interact with HR representatives about job opportunities.

Your role:
- Be professional, polite, and concise
- Ask relevant questions about job openings
- Listen carefully to responses
- Maintain a natural conversation flow
- End the conversation gracefully

Guidelines:
- Keep responses brief (1-2 sentences)
- Ask one question at a time
- Be respectful of the person's time
- If they're busy, offer to call back
- Thank them for their time at the end
`;

const CONVERSATION_FLOW = [
  {
    stage: 'greeting',
    prompt: 'Greet the HR representative and introduce yourself as an AI assistant calling on behalf of a job seeker.',
  },
  {
    stage: 'purpose',
    prompt: "Briefly explain you're calling to inquire about current job openings.",
  },
  {
    stage: 'question_1',
    prompt: 'Ask if they have any software engineering positions available.',
  },
  {
    stage: 'question_2',
    prompt: 'Ask about the required qualifications for the position.',
  },
  {
    stage: 'question_3',
    prompt: 'Ask about the application process.',
  },
  {
    stage: 'closing',
    prompt: 'Thank them for their time and end the call politely.',
  },
];

const END_PHRASES = [
  'goodbye',
  'bye',
  'have to go',
  "can't talk",
  'busy right now',
  'call back later',
  'not interested',
  'no thank you',
];

interface Message {
  speaker: string;
  text: string;
  timestamp: Date;
}

let anthropic: Anthropic | null = null;

function getClient() {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    anthropic = new Anthropic({ apiKey });
  }
  return anthropic;
}

function shouldEndConversation(userInput: string): boolean {
  const userLower = userInput.toLowerCase();
  return END_PHRASES.some((phrase) => userLower.includes(phrase));
}

export async function generateAIResponse(
  userInput: string,
  stage: number,
  conversationHistory: Message[]
): Promise<string> {
  const client = getClient();

  try {
    // Build conversation history for Claude
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history
    conversationHistory.forEach((msg) => {
      messages.push({
        role: msg.speaker === 'agent' ? 'assistant' : 'user',
        content: msg.text,
      });
    });

    // Determine the prompt based on stage
    let prompt = '';

    if (stage === 0) {
      // Initial greeting
      prompt =
        'Generate a professional greeting introducing yourself as an AI assistant calling on behalf of a job seeker to inquire about job openings. Keep it brief (1-2 sentences).';
    } else if (userInput && shouldEndConversation(userInput)) {
      // User wants to end the call
      prompt =
        'The person wants to end the call. Thank them warmly for their time and say goodbye professionally. Keep it very brief (1 sentence).';
    } else if (stage < CONVERSATION_FLOW.length) {
      // Follow conversation flow
      const stageInfo = CONVERSATION_FLOW[stage];
      prompt = `${stageInfo.prompt} Keep your response brief and natural (1-2 sentences).`;
    } else {
      // Conversation complete
      prompt =
        'Thank them for their time and end the call politely. Keep it brief (1 sentence).';
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    // Call Claude API
    const response = await client.messages.create({
      model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 150,
      system: SYSTEM_PROMPT,
      messages,
    });

    const generatedText =
      response.content[0].type === 'text'
        ? response.content[0].text.trim()
        : '';

    return generatedText;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I apologize, I'm having technical difficulties. Thank you for your time.";
  }
}

export async function generateCallSummary(
  conversationHistory: Message[]
): Promise<string> {
  const client = getClient();

  try {
    // Build full conversation text
    let conversationText = '';
    conversationHistory.forEach((msg) => {
      const role = msg.speaker === 'agent' ? 'Agent' : 'HR Rep';
      conversationText += `${role}: ${msg.text}\n`;
    });

    // Generate summary using Claude
    const summaryPrompt = `Based on this conversation, provide a structured summary:

${conversationText}

Please provide:
1. Key information gathered
2. Job availability status
3. Required qualifications (if mentioned)
4. Next steps (if any)
5. Overall outcome

Format as a clear, bullet-pointed summary.`;

    const response = await client.messages.create({
      model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: summaryPrompt,
        },
      ],
    });

    const summary =
      response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Error generating summary';
  }
}
