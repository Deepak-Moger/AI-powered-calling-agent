"""
Speech-to-Text module using OpenAI Whisper
"""
import whisper
import numpy as np
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class SpeechToText:
    """Handles speech-to-text conversion using Whisper"""

    def __init__(self, model_name: str = "base"):
        """
        Initialize Whisper STT

        Args:
            model_name: Whisper model size (tiny, base, small, medium, large)
        """
        self.model_name = model_name
        self.model = None
        logger.info(f"Initializing Whisper STT with model: {model_name}")

    def load_model(self):
        """Load the Whisper model (lazy loading)"""
        if self.model is None:
            logger.info(f"Loading Whisper model: {self.model_name}")
            self.model = whisper.load_model(self.model_name)
            logger.info("Whisper model loaded successfully")

    def transcribe(self, audio_data: np.ndarray, sample_rate: int = 16000) -> Optional[str]:
        """
        Transcribe audio to text

        Args:
            audio_data: Audio data as numpy array
            sample_rate: Sample rate of audio (default 16000 Hz)

        Returns:
            Transcribed text or None if transcription fails
        """
        try:
            # Ensure model is loaded
            self.load_model()

            # Ensure audio is float32
            if audio_data.dtype != np.float32:
                audio_data = audio_data.astype(np.float32)

            # Normalize audio
            if np.abs(audio_data).max() > 1.0:
                audio_data = audio_data / np.abs(audio_data).max()

            # Transcribe
            logger.info("Transcribing audio...")
            result = self.model.transcribe(
                audio_data,
                language="en",
                task="transcribe",
                fp16=False
            )

            text = result["text"].strip()
            logger.info(f"Transcribed: {text}")

            return text

        except Exception as e:
            logger.error(f"Transcription error: {str(e)}")
            return None

    def transcribe_file(self, audio_file: str) -> Optional[str]:
        """
        Transcribe audio from file

        Args:
            audio_file: Path to audio file

        Returns:
            Transcribed text or None if transcription fails
        """
        try:
            self.load_model()

            logger.info(f"Transcribing file: {audio_file}")
            result = self.model.transcribe(audio_file, language="en")

            text = result["text"].strip()
            logger.info(f"Transcribed: {text}")

            return text

        except Exception as e:
            logger.error(f"File transcription error: {str(e)}")
            return None
