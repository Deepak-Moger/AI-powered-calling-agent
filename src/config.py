"""
Configuration management for AI Calling Agent
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration"""

    # API Keys
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')

    # Server
    SERVER_HOST = os.getenv('SERVER_HOST', 'localhost')
    SERVER_PORT = int(os.getenv('SERVER_PORT', 5000))

    # AI Configuration
    AI_MODEL = os.getenv('AI_MODEL', 'claude-3-5-sonnet-20241022')
    MAX_TOKENS = int(os.getenv('MAX_TOKENS', 1024))
    TEMPERATURE = float(os.getenv('TEMPERATURE', 0.7))

    # Speech Configuration
    STT_MODEL = os.getenv('STT_MODEL', 'base')
    TTS_RATE = int(os.getenv('TTS_RATE', 150))
    TTS_VOLUME = float(os.getenv('TTS_VOLUME', 0.9))

    # Call Configuration
    MAX_CALL_DURATION = int(os.getenv('MAX_CALL_DURATION', 600))
    RECORDING_ENABLED = os.getenv('RECORDING_ENABLED', 'true').lower() == 'true'

    # Storage
    DATA_DIR = os.getenv('DATA_DIR', './data')
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

    @classmethod
    def validate(cls):
        """Validate required configuration"""
        if not cls.ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY is required. Please set it in .env file")

        # Create data directory if it doesn't exist
        os.makedirs(cls.DATA_DIR, exist_ok=True)
        os.makedirs(os.path.join(cls.DATA_DIR, 'recordings'), exist_ok=True)
        os.makedirs(os.path.join(cls.DATA_DIR, 'transcripts'), exist_ok=True)
        os.makedirs(os.path.join(cls.DATA_DIR, 'summaries'), exist_ok=True)

        return True


# Conversation prompts
SYSTEM_PROMPT = """You are an AI calling agent designed to interact with HR representatives about job opportunities.

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
"""

CONVERSATION_FLOW = [
    {
        "stage": "greeting",
        "prompt": "Greet the HR representative and introduce yourself as an AI assistant calling on behalf of a job seeker."
    },
    {
        "stage": "purpose",
        "prompt": "Briefly explain you're calling to inquire about current job openings."
    },
    {
        "stage": "question_1",
        "prompt": "Ask if they have any software engineering positions available."
    },
    {
        "stage": "question_2",
        "prompt": "Ask about the required qualifications for the position."
    },
    {
        "stage": "question_3",
        "prompt": "Ask about the application process."
    },
    {
        "stage": "closing",
        "prompt": "Thank them for their time and end the call politely."
    }
]
