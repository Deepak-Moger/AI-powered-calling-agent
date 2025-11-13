import { Socket, Server as SocketIOServer } from 'socket.io';
import { processAudioChunk } from './audio/stt';
import { generateSpeech } from './audio/tts';
import { generateAIResponse, generateCallSummary } from './ai/claude-handler';
import { saveCallData, getCallStats } from './storage/data-manager';

interface CallSession {
  callId: string;
  transcript: Array<{ speaker: string; text: string; timestamp: Date }>;
  startTime: Date;
  stage: number;
}

const activeCalls = new Map<string, CallSession>();

export function handleSocketConnection(socket: Socket, io: SocketIOServer) {

  socket.on('start_call', async () => {
    const callId = `call_${Date.now()}`;
    const session: CallSession = {
      callId,
      transcript: [],
      startTime: new Date(),
      stage: 0,
    };

    activeCalls.set(socket.id, session);

    try {
      // Generate initial greeting
      const greeting = await generateAIResponse('', 0, []);
      session.transcript.push({
        speaker: 'agent',
        text: greeting,
        timestamp: new Date(),
      });

      // Convert to speech
      const audioData = await generateSpeech(greeting);

      socket.emit('agent_speaking', {
        text: greeting,
        audio: audioData,
      });
    } catch (error) {
      console.error('Error starting call:', error);
      socket.emit('error', { message: 'Failed to start call' });
    }
  });

  socket.on('audio_chunk', async (data: { audio: ArrayBuffer }) => {
    const session = activeCalls.get(socket.id);
    if (!session) return;

    try {
      // Process audio with STT
      const transcription = await processAudioChunk(data.audio);

      if (transcription && transcription.trim().length > 0) {
        session.transcript.push({
          speaker: 'user',
          text: transcription,
          timestamp: new Date(),
        });

        // Generate AI response
        session.stage++;
        const response = await generateAIResponse(
          transcription,
          session.stage,
          session.transcript
        );

        session.transcript.push({
          speaker: 'agent',
          text: response,
          timestamp: new Date(),
        });

        // Convert to speech
        const audioData = await generateSpeech(response);

        socket.emit('agent_speaking', {
          text: response,
          audio: audioData,
          transcription,
        });
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      socket.emit('error', { message: 'Failed to process audio' });
    }
  });

  socket.on('end_call', async () => {
    const session = activeCalls.get(socket.id);
    if (!session) return;

    try {
      // Generate summary
      const summary = await generateCallSummary(session.transcript);

      // Save call data
      await saveCallData({
        callId: session.callId,
        startTime: session.startTime,
        endTime: new Date(),
        transcript: session.transcript,
        summary,
      });

      // Get updated stats
      const stats = await getCallStats();

      socket.emit('call_ended', {
        summary,
        stats,
        callId: session.callId,
      });

      activeCalls.delete(socket.id);
    } catch (error) {
      console.error('Error ending call:', error);
      socket.emit('error', { message: 'Failed to end call' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    activeCalls.delete(socket.id);
  });
}
