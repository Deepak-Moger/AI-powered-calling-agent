import { pipeline, AutomaticSpeechRecognitionPipeline } from '@xenova/transformers';

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;

async function getTranscriber() {
  if (!transcriber) {
    console.log('Loading Whisper model...');
    transcriber = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-base',
      {
        // Use quantized version for faster performance
        quantized: true,
      }
    );
    console.log('Whisper model loaded successfully');
  }
  return transcriber;
}

export async function processAudioChunk(audioBuffer: ArrayBuffer): Promise<string> {
  try {
    const transcriber = await getTranscriber();

    // Convert ArrayBuffer to Float32Array
    // Assuming the audio is already in the correct format
    // If it's in different format, you may need to decode it first
    const float32Array = new Float32Array(audioBuffer);

    // Transcribe the audio
    const result = await transcriber(float32Array, {
      chunk_length_s: 30,
      stride_length_s: 5,
    });

    if (result && typeof result === 'object' && 'text' in result) {
      return result.text.trim();
    }

    return '';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return '';
  }
}

// Alternative: Use Web Speech API (browser-based)
export function startBrowserSTT(
  onResult: (transcript: string) => void,
  onError: (error: Error) => void
) {
  if (typeof window === 'undefined') {
    throw new Error('Web Speech API is only available in the browser');
  }

  // @ts-ignore - WebSpeech API types
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    throw new Error('Speech recognition is not supported in this browser');
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    const last = event.results.length - 1;
    const transcript = event.results[last][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    onError(new Error(event.error));
  };

  recognition.start();

  return {
    stop: () => recognition.stop(),
    restart: () => {
      recognition.stop();
      recognition.start();
    },
  };
}
