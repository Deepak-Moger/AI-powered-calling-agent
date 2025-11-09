# AI-Powered Calling Agent

An intelligent calling agent that can make outbound calls, interact naturally with HR representatives, and record conversation data.

## Features

- 🎙️ **Speech-to-Text**: Local Whisper model for accurate transcription
- 🔊 **Text-to-Speech**: Free pyttsx3 for natural voice synthesis
- 🤖 **AI Conversation**: Claude API for intelligent dialogue
- 📞 **Calling**: WebRTC browser-based calling for demos
- 💾 **Data Storage**: JSON-based conversation logs
- 📊 **Reporting**: Automated conversation summaries

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 14+ (for WebRTC demo)
- Claude API key

### Installation

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node dependencies (for WebRTC demo)
npm install
```

### Configuration

1. Copy `.env.example` to `.env`
2. Add your Claude API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

### Running the Demo

```bash
# Start the backend server
python src/server.py

# In another terminal, start the web interface
npm start
```

## Architecture

### System Flow
```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │◄────►│ Flask Server │◄────►│ Claude API  │
│  (WebRTC)   │ WSS  │  (Python)    │ HTTPS│    (AI)     │
└─────────────┘      └──────────────┘      └─────────────┘
       │                    │
       │                    ▼
       │             ┌──────────────┐
       │             │   Whisper    │
       │             │    (STT)     │
       │             └──────────────┘
       │                    │
       │                    ▼
       │             ┌──────────────┐
       └────────────►│   pyttsx3    │
          Audio      │    (TTS)     │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ JSON Storage │
                     └──────────────┘
```

### Project Structure
```
AI-powered calling agent/
├── src/
│   ├── server.py        # Main Flask server with WebSocket
│   ├── config.py        # Configuration and prompts
│   ├── stt.py          # Speech-to-Text (Whisper)
│   ├── tts.py          # Text-to-Speech (pyttsx3)
│   ├── ai_handler.py   # Claude API integration
│   └── storage.py      # JSON data storage
├── web/
│   ├── index.html      # UI interface
│   ├── app.js          # Client-side logic
│   └── server.js       # Node.js static server
├── data/               # Created on first run
│   ├── calls/          # Call records
│   ├── transcripts/    # Text transcripts
│   └── summaries/      # AI summaries
├── .env.example        # Environment template
├── requirements.txt    # Python dependencies
├── package.json        # Node dependencies
├── setup.bat/.sh       # Installation scripts
└── start.bat/.sh       # Launch scripts
```

## Usage

The agent will:
1. Place an outbound call (simulated via browser)
2. Greet the HR representative professionally
3. Ask job-related questions intelligently
4. Record and transcribe responses in real-time
5. Generate a conversation summary using AI
6. Store all data for analysis

## Documentation

- **QUICKSTART.md** - Quick reference guide
- **SETUP.md** - Detailed installation instructions
- **USAGE.md** - Examples and API documentation
- **PROJECT_OVERVIEW.md** - Complete technical overview

## Cost

- **Free components:** Whisper, pyttsx3, WebRTC
- **Paid:** Claude API (~$0.01-0.05 per call)
- **Total cost:** Approximately $0.05 per call

## Technology Stack

| Component | Technology | License |
|-----------|-----------|---------|
| AI | Claude API | Paid |
| STT | OpenAI Whisper | MIT |
| TTS | pyttsx3 | MPL-2.0 |
| Backend | Python + Flask | BSD |
| Frontend | HTML/JS | N/A |
| Storage | JSON | N/A |

## System Requirements

- Python 3.8+
- Node.js 14+
- 4GB RAM (8GB recommended)
- Microphone
- Internet connection
- Claude API key

## Quick Start Commands

### Windows
```bash
setup.bat    # Install dependencies
start.bat    # Run application
```

### Linux/Mac
```bash
./setup.sh   # Install dependencies
./start.sh   # Run application
```

Then open: http://localhost:3000

## Features in Detail

### Voice Interaction
- Real-time speech-to-text transcription
- Natural text-to-speech synthesis
- Voice activity detection
- Automatic silence detection

### AI Conversation
- Context-aware dialogue
- Multi-stage conversation flow
- Natural language understanding
- Adaptive responses

### Data Management
- Automatic call recording
- JSON-based storage
- Full conversation transcripts
- AI-generated summaries
- Call statistics

## Demo Flow

1. Click "Start Call" button
2. AI: "Hello, this is an AI assistant calling about job opportunities..."
3. You: "Hi, how can I help?"
4. AI: "Do you have any software engineering positions available?"
5. You: "Yes, we have two openings..."
6. Conversation continues...
7. View summary with key information extracted

## API Endpoints

- `GET /api/stats` - Call statistics
- `GET /api/calls` - List recent calls
- `GET /api/calls/<id>` - Get specific call details

## WebSocket Events

- `start_call` - Initialize new call
- `audio_chunk` - Send audio data
- `agent_speaking` - Receive AI response
- `call_ended` - Receive call summary

## Contributing

Contributions welcome! Areas for improvement:
- Twilio integration for real phone calls
- Multi-language support
- Better voice activity detection
- Cloud deployment guides
- Additional use cases

## License

MIT License - Free for personal and commercial use

## Support

For detailed help, see:
- SETUP.md for installation issues
- USAGE.md for usage examples
- PROJECT_OVERVIEW.md for architecture details

## Acknowledgments

Built with:
- OpenAI Whisper for speech recognition
- Anthropic Claude for AI conversation
- pyttsx3 for text-to-speech
- Flask for backend
- Socket.io for real-time communication
# AI-powered-calling-agent
