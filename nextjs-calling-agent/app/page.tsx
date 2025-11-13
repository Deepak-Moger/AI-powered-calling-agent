'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { BrowserTTS } from '@/lib/audio/tts';

interface Message {
  role: 'agent' | 'user';
  text: string;
}

interface CallSummary {
  summary: string;
  duration: number;
  callId: string;
}

export default function Home() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [status, setStatus] = useState('Ready to start call');
  const [messages, setMessages] = useState<Message[]>([]);
  const [callSummary, setCallSummary] = useState<CallSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState('Processing...');

  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ttsRef = useRef<BrowserTTS | null>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Socket.io connection
    socketRef.current = io('http://localhost:3000');

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      setStatus('Connected - Ready to start call');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected');
      setStatus('Disconnected from server');
      resetCall();
    });

    socketRef.current.on('agent_speaking', (data: { text: string; audio?: string; transcription?: string }) => {
      console.log('Agent speaking:', data.text);

      // Add user message if transcription exists
      if (data.transcription) {
        setMessages((prev) => [...prev, { role: 'user', text: data.transcription }]);
      }

      // Add agent message
      setMessages((prev) => [...prev, { role: 'agent', text: data.text }]);

      // Speak the text
      if (ttsRef.current) {
        ttsRef.current.speak(data.text);
      }

      setIsProcessing(false);
    });

    socketRef.current.on('call_ended', (data: { summary: string; callId: string; stats: any }) => {
      console.log('Call ended:', data);
      setStatus('Call ended');
      setCallSummary({
        summary: data.summary,
        duration: 0,
        callId: data.callId,
      });
      resetCall();
    });

    socketRef.current.on('error', (data: { message: string }) => {
      console.error('Error:', data.message);
      alert('Error: ' + data.message);
      setStatus('Error: ' + data.message);
      setIsProcessing(false);
    });

    // Initialize TTS
    if (typeof window !== 'undefined') {
      ttsRef.current = new BrowserTTS();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    // Auto-scroll conversation
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Initialize audio context
      audioContextRef.current = new AudioContext();
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Setup media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();

        reader.onloadend = () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          socketRef.current?.emit('audio_chunk', { audio: arrayBuffer });
        };

        reader.readAsArrayBuffer(audioBlob);
        audioChunksRef.current = [];
      };

      // Start recording
      mediaRecorderRef.current.start();
      setupVoiceDetection();

      // Emit start call
      socketRef.current?.emit('start_call');

      setIsCallActive(true);
      setMessages([]);
      setCallSummary(null);
      setStatus('Call starting...');
      setIsProcessing(true);
      setProcessingText('Waiting for AI response...');
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Error accessing microphone: ' + (error as Error).message);
    }
  };

  const endCall = () => {
    socketRef.current?.emit('end_call');
    resetCall();
  };

  const resetCall = () => {
    setIsCallActive(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (ttsRef.current) {
      ttsRef.current.stop();
    }

    setIsProcessing(false);
  };

  const setupVoiceDetection = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let isSpeaking = false;
    let silenceStart: number | null = null;
    const SILENCE_THRESHOLD = 30;
    const SILENCE_DURATION = 1500;

    const checkVoiceActivity = () => {
      if (!isCallActive) return;

      analyserRef.current!.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((a, b) => a + b) / bufferLength;

      if (average > SILENCE_THRESHOLD) {
        if (!isSpeaking) {
          isSpeaking = true;
          setStatus('Listening to you...');
        }
        silenceStart = null;
      } else {
        if (isSpeaking && !silenceStart) {
          silenceStart = Date.now();
        }

        if (isSpeaking && silenceStart && Date.now() - silenceStart > SILENCE_DURATION) {
          isSpeaking = false;
          silenceStart = null;

          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            setStatus('Processing response...');
            setIsProcessing(true);
            setProcessingText('Transcribing speech...');
            mediaRecorderRef.current.stop();

            setTimeout(() => {
              if (isCallActive && mediaRecorderRef.current) {
                audioChunksRef.current = [];
                mediaRecorderRef.current.start();
              }
            }, 1000);
          }
        }
      }

      requestAnimationFrame(checkVoiceActivity);
    };

    checkVoiceActivity();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-8 text-center">
          <h1 className="text-4xl font-bold mb-2">AI Calling Agent</h1>
          <p className="text-purple-100">Intelligent HR Outreach Automation</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Status */}
          <div
            className={`text-center p-4 rounded-lg mb-6 ${
              isCallActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {status}
          </div>

          {/* Call Controls */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={startCall}
              disabled={isCallActive}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Call
            </button>
            <button
              onClick={endCall}
              disabled={!isCallActive}
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              End Call
            </button>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="text-center mb-6">
              <div className="inline-block w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-2"></div>
              <p className="text-gray-600">{processingText}</p>
            </div>
          )}

          {/* Conversation */}
          <div
            ref={conversationRef}
            className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto mb-6 space-y-4"
          >
            {messages.length === 0 ? (
              <p className="text-center text-gray-400">Conversation will appear here...</p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg max-w-[80%] ${
                    msg.role === 'agent'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-800 ml-auto text-right'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">
                    {msg.role === 'agent' ? 'AI Agent' : 'You'}
                  </div>
                  <div>{msg.text}</div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {callSummary && (
            <div className="bg-gray-50 rounded-lg p-6 mt-6">
              <h3 className="text-2xl font-bold text-purple-600 mb-4">Call Summary</h3>
              <div className="whitespace-pre-wrap mb-4">{callSummary.summary}</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg text-center shadow">
                  <div className="text-3xl font-bold text-purple-600">{callSummary.callId.substring(0, 8)}</div>
                  <div className="text-gray-600 text-sm mt-1">Call ID</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center shadow">
                  <div className="text-3xl font-bold text-purple-600">{messages.length}</div>
                  <div className="text-gray-600 text-sm mt-1">Messages</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
