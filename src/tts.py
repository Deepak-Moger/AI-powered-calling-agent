"""
Text-to-Speech module using pyttsx3
"""
import pyttsx3
import logging
import tempfile
import os
from typing import Optional

logger = logging.getLogger(__name__)


class TextToSpeech:
    """Handles text-to-speech conversion using pyttsx3"""

    def __init__(self, rate: int = 150, volume: float = 0.9):
        """
        Initialize TTS engine

        Args:
            rate: Speech rate (words per minute)
            volume: Volume (0.0 to 1.0)
        """
        self.rate = rate
        self.volume = volume
        self.engine = None
        logger.info(f"Initializing TTS with rate={rate}, volume={volume}")

    def initialize(self):
        """Initialize the TTS engine (lazy loading)"""
        if self.engine is None:
            logger.info("Initializing pyttsx3 engine")
            self.engine = pyttsx3.init()
            self.engine.setProperty('rate', self.rate)
            self.engine.setProperty('volume', self.volume)

            # Try to set a better voice if available
            voices = self.engine.getProperty('voices')
            if voices:
                # Prefer female voice if available (often sounds more natural)
                for voice in voices:
                    if 'female' in voice.name.lower() or 'zira' in voice.name.lower():
                        self.engine.setProperty('voice', voice.id)
                        logger.info(f"Using voice: {voice.name}")
                        break
                else:
                    # Use first available voice
                    self.engine.setProperty('voice', voices[0].id)
                    logger.info(f"Using voice: {voices[0].name}")

            logger.info("TTS engine initialized successfully")

    def speak(self, text: str):
        """
        Convert text to speech and play it

        Args:
            text: Text to convert to speech
        """
        try:
            self.initialize()
            logger.info(f"Speaking: {text}")
            self.engine.say(text)
            self.engine.runAndWait()
        except Exception as e:
            logger.error(f"TTS error: {str(e)}")

    def save_to_file(self, text: str, filename: str) -> bool:
        """
        Convert text to speech and save to audio file

        Args:
            text: Text to convert
            filename: Output filename (e.g., 'output.wav')

        Returns:
            True if successful, False otherwise
        """
        try:
            self.initialize()
            logger.info(f"Saving speech to file: {filename}")
            self.engine.save_to_file(text, filename)
            self.engine.runAndWait()
            return True
        except Exception as e:
            logger.error(f"TTS save error: {str(e)}")
            return False

    def get_audio_data(self, text: str) -> Optional[bytes]:
        """
        Convert text to speech and return audio data

        Args:
            text: Text to convert

        Returns:
            Audio data as bytes or None if conversion fails
        """
        try:
            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                tmp_filename = tmp_file.name

            # Generate speech
            if self.save_to_file(text, tmp_filename):
                # Read the file
                with open(tmp_filename, 'rb') as f:
                    audio_data = f.read()

                # Clean up
                os.unlink(tmp_filename)

                return audio_data

            return None

        except Exception as e:
            logger.error(f"Audio data error: {str(e)}")
            return None

    def stop(self):
        """Stop current speech"""
        try:
            if self.engine:
                self.engine.stop()
        except Exception as e:
            logger.error(f"Stop error: {str(e)}")
