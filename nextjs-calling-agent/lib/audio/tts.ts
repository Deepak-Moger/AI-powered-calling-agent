// Text-to-Speech using Web Speech API
// This will run in the browser, not on the server

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
}

// Server-side: Return audio data as base64 encoded string
// For now, we'll just return the text and let the client handle TTS
export async function generateSpeech(text: string): Promise<string> {
  // In a production environment, you might want to use a cloud TTS service
  // like Google Cloud TTS, Amazon Polly, or ElevenLabs
  // For now, we'll return the text and handle TTS on the client side
  return text;
}

// Client-side TTS using Web Speech API
export class BrowserTTS {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('Browser TTS is only available in the browser');
    }

    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();

    // Chrome loads voices asynchronously
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.synth.speaking) {
        this.synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Set options
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // Set voice if specified
      if (options.voice) {
        const voice = this.voices.find((v) => v.name === options.voice);
        if (voice) {
          utterance.voice = voice;
        }
      } else {
        // Use default English voice
        const defaultVoice = this.voices.find((v) => v.lang.startsWith('en'));
        if (defaultVoice) {
          utterance.voice = defaultVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synth.speak(utterance);
    });
  }

  stop() {
    this.synth.cancel();
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }
}
