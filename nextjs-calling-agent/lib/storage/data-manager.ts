import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || './data';

interface Message {
  speaker: string;
  text: string;
  timestamp: Date;
}

interface CallData {
  callId: string;
  startTime: Date;
  endTime: Date;
  transcript: Message[];
  summary: string;
  duration?: number;
}

interface CallStats {
  totalCalls: number;
  totalDurationSeconds: number;
  averageDurationSeconds: number;
  lastCall: any | null;
}

async function ensureDirectories() {
  const directories = [
    DATA_DIR,
    path.join(DATA_DIR, 'calls'),
    path.join(DATA_DIR, 'transcripts'),
    path.join(DATA_DIR, 'summaries'),
  ];

  for (const dir of directories) {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function saveCallData(callData: CallData): Promise<string> {
  try {
    await ensureDirectories();

    const callId = callData.callId;

    // Calculate duration
    const duration = Math.floor(
      (new Date(callData.endTime).getTime() - new Date(callData.startTime).getTime()) / 1000
    );

    const dataToSave = {
      ...callData,
      duration,
      timestamp: new Date().toISOString(),
    };

    // Save call data
    const callFilePath = path.join(DATA_DIR, 'calls', `${callId}.json`);
    await fs.writeFile(callFilePath, JSON.stringify(dataToSave, null, 2), 'utf-8');

    // Save transcript
    const transcriptText = callData.transcript
      .map((msg) => {
        const role = msg.speaker === 'agent' ? 'Agent' : 'User';
        return `[${new Date(msg.timestamp).toISOString()}] ${role}: ${msg.text}`;
      })
      .join('\n\n');

    const transcriptPath = path.join(DATA_DIR, 'transcripts', `${callId}.txt`);
    await fs.writeFile(transcriptPath, transcriptText, 'utf-8');

    // Save summary
    const summaryPath = path.join(DATA_DIR, 'summaries', `${callId}.json`);
    await fs.writeFile(
      summaryPath,
      JSON.stringify(
        {
          callId,
          summary: callData.summary,
          duration,
          messageCount: callData.transcript.length,
        },
        null,
        2
      ),
      'utf-8'
    );

    console.log(`Saved call data: ${callId}`);
    return callId;
  } catch (error) {
    console.error('Error saving call data:', error);
    throw error;
  }
}

export async function getCallData(callId: string): Promise<any | null> {
  try {
    const callFilePath = path.join(DATA_DIR, 'calls', `${callId}.json`);
    const data = await fs.readFile(callFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error retrieving call data:', error);
    return null;
  }
}

export async function listCalls(limit: number = 100): Promise<any[]> {
  try {
    await ensureDirectories();

    const callsDir = path.join(DATA_DIR, 'calls');
    const files = await fs.readdir(callsDir);

    const jsonFiles = files.filter((f) => f.endsWith('.json'));
    jsonFiles.sort((a, b) => b.localeCompare(a)); // Sort descending

    const calls = [];
    for (const file of jsonFiles.slice(0, limit)) {
      const filePath = path.join(callsDir, file);
      const data = await fs.readFile(filePath, 'utf-8');
      calls.push(JSON.parse(data));
    }

    return calls;
  } catch (error) {
    console.error('Error listing calls:', error);
    return [];
  }
}

export async function getCallStats(): Promise<CallStats> {
  try {
    const calls = await listCalls();

    const totalCalls = calls.length;
    const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
    const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;

    return {
      totalCalls,
      totalDurationSeconds: totalDuration,
      averageDurationSeconds: Math.round(avgDuration),
      lastCall: calls[0] || null,
    };
  } catch (error) {
    console.error('Error getting statistics:', error);
    return {
      totalCalls: 0,
      totalDurationSeconds: 0,
      averageDurationSeconds: 0,
      lastCall: null,
    };
  }
}
