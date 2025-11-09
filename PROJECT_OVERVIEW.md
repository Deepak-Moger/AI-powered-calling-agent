# AI-Powered Calling Agent - Project Overview

## What This Project Does

This is a complete, working AI-powered calling agent that can:

1. Make outbound calls (simulated via web browser)
2. Have natural conversations with HR representatives
3. Ask relevant job-related questions
4. Transcribe responses in real-time
5. Generate intelligent follow-up questions
6. Store conversation data
7. Produce automated summaries

## Technology Stack

### Free/Open Source Components

| Component | Technology | Cost |
|-----------|-----------|------|
| Speech-to-Text | OpenAI Whisper (local) | FREE |
| Text-to-Speech | pyttsx3 | FREE |
| Calling Demo | WebRTC (browser) | FREE |
| Database | JSON files | FREE |
| Backend | Python + Flask | FREE |
| Frontend | HTML/CSS/JavaScript | FREE |

### Paid Component

| Component | Technology | Cost |
|-----------|-----------|------|
| AI Conversation | Claude API | ~$0.01-0.05 per call |

**Estimated cost per call:** $0.01 - $0.05 depending on conversation length

## Project Structure

```
AI-powered calling agent/
│
├── src/                          # Backend Python code
│   ├── server.py                # Main Flask server
│   ├── config.py                # Configuration & prompts
│   ├── stt.py                   # Speech-to-Text (Whisper)
│   ├── tts.py                   # Text-to-Speech (pyttsx3)
│   ├── ai_handler.py            # Claude AI integration
│   └── storage.py               # JSON data storage
│
├── web/                         # Frontend web interface
│   ├── index.html              # Main UI
│   ├── app.js                  # Client-side logic
│   └── server.js               # Node.js static server
│
├── data/                        # Stored data (created on first run)
│   ├── calls/                  # Call records
│   ├── transcripts/            # Text transcripts
│   └── summaries/              # AI summaries
│
├── .env.example                # Environment template
├── requirements.txt            # Python dependencies
├── package.json               # Node dependencies
├── README.md                  # Project documentation
├── SETUP.md                   # Installation guide
├── USAGE.md                   # Usage examples
├── setup.bat / setup.sh       # Installation scripts
└── start.bat / start.sh       # Launch scripts
```

## How It Works

### 1. Call Initialization
```
User clicks "Start Call"
    ↓
Browser requests microphone access
    ↓
WebSocket connection established
    ↓
AI generates greeting using Claude
    ↓
Greeting converted to speech (pyttsx3)
    ↓
Audio played to user
```

### 2. Conversation Loop
```
User speaks
    ↓
Browser captures audio
    ↓
Sent to backend via WebSocket
    ↓
Whisper transcribes speech to text
    ↓
Claude generates intelligent response
    ↓
Response converted to speech
    ↓
Audio sent back to browser
    ↓
Repeat until conversation ends
```

### 3. Call Completion
```
Conversation ends
    ↓
Claude generates summary
    ↓
Data saved to JSON files
    ↓
Summary displayed to user
```

## Key Features

### 1. Real-Time Speech Processing
- Voice Activity Detection (VAD)
- Automatic silence detection
- Live transcription
- Natural speech synthesis

### 2. Intelligent Conversation
- Context-aware responses
- Multi-stage conversation flow
- Natural language understanding
- Adaptive dialogue management

### 3. Data Management
- Automatic call recording
- Structured data storage
- Conversation transcripts
- AI-generated summaries
- Statistics and analytics

### 4. User Interface
- Clean, modern design
- Real-time conversation display
- Audio visualizer
- Call statistics
- Summary reports

## Conversation Flow

The agent follows a structured conversation:

1. **Greeting** - Introduces itself professionally
2. **Purpose** - Explains reason for call
3. **Question 1** - Asks about job openings
4. **Question 2** - Inquires about qualifications
5. **Question 3** - Asks about application process
6. **Closing** - Thanks and ends call politely

Each stage adapts to the HR representative's responses.

## API Endpoints

### REST API
- `GET /` - Health check
- `GET /api/stats` - Call statistics
- `GET /api/calls` - List recent calls
- `GET /api/calls/<id>` - Get specific call

### WebSocket Events
- `start_call` - Initialize new call
- `audio_chunk` - Send audio data
- `user_finished_speaking` - Process audio
- `end_call` - Terminate call
- `agent_speaking` - Receive AI response
- `call_ended` - Receive summary

## Configuration Options

### Speech Recognition (Whisper)
- **tiny** - Fastest, least accurate (~75MB)
- **base** - Good balance (~150MB) ⭐ Recommended
- **small** - Better accuracy (~500MB)
- **medium** - High accuracy (~1.5GB)
- **large** - Best accuracy (~3GB)

### Text-to-Speech (pyttsx3)
- Adjustable speech rate (WPM)
- Adjustable volume
- Multiple voice options
- Cross-platform support

### AI Model (Claude)
- claude-3-5-sonnet-20241022 ⭐ Recommended
- Temperature control
- Max token limits
- Custom system prompts

## Performance Metrics

### Typical Call Performance
- **Latency:** 2-4 seconds per response
- **Transcription:** 1-2 seconds (base model)
- **AI Response:** 1-2 seconds
- **TTS Generation:** 0.5-1 second
- **Total Call Duration:** 60-120 seconds

### Resource Usage
- **RAM:** ~2GB (including Whisper model)
- **CPU:** Moderate during transcription
- **Disk:** ~150MB for base model
- **Network:** ~10KB per API call

## Limitations & Future Enhancements

### Current Limitations
1. Browser-based calling only (not real phone calls)
2. Single language support (English)
3. No phone number integration
4. Basic voice activity detection
5. No call recording playback

### Possible Enhancements
1. **Twilio Integration** - Real phone calls
2. **Multi-language** - Support multiple languages
3. **Better TTS** - ElevenLabs or Google TTS
4. **Cloud Deployment** - AWS/Azure hosting
5. **Database** - PostgreSQL for scalability
6. **Authentication** - User accounts
7. **Analytics Dashboard** - Call metrics
8. **Batch Calling** - Multiple calls
9. **CRM Integration** - Salesforce, HubSpot
10. **Advanced AI** - Sentiment analysis

## Security Considerations

### Current Implementation
- API keys in `.env` file
- CORS enabled for localhost
- No authentication required
- No encryption on WebSocket

### Production Requirements
1. HTTPS/WSS encryption
2. API authentication
3. Rate limiting
4. Input validation
5. API key rotation
6. Audit logging
7. GDPR compliance
8. Data retention policies

## Cost Analysis

### Development/Testing (Free)
- Whisper: FREE (local)
- pyttsx3: FREE
- WebRTC: FREE
- Claude API: $5 free credit (100-500 calls)

### Production (Paid)
- Claude API: ~$0.01-0.05 per call
- Twilio: ~$0.02-0.05 per minute
- Server: ~$10-50/month
- **Total:** ~$0.05-0.15 per call

### Scale Economics
- 100 calls/month: ~$5-15/month
- 1,000 calls/month: ~$50-150/month
- 10,000 calls/month: ~$500-1,500/month

## Use Cases

### 1. HR Outreach
- Job opening inquiries
- Candidate screening
- Interview scheduling

### 2. Sales
- Lead qualification
- Appointment setting
- Follow-up calls

### 3. Customer Service
- Survey calls
- Feedback collection
- Support follow-ups

### 4. Research
- Market research
- Data collection
- Polling

## Getting Started

### Quick Start (5 minutes)
1. Run `setup.bat` (Windows) or `./setup.sh` (Linux/Mac)
2. Copy `.env.example` to `.env`
3. Add your Claude API key
4. Run `start.bat` or `./start.sh`
5. Open http://localhost:3000

### First Call (2 minutes)
1. Click "Start Call"
2. Allow microphone access
3. Listen to AI greeting
4. Respond naturally
5. Continue conversation
6. View summary when done

## Support & Documentation

- **README.md** - Project overview
- **SETUP.md** - Installation guide
- **USAGE.md** - Usage examples and API docs
- **THIS FILE** - Complete project documentation

## License

MIT License - Free for personal and commercial use

## Credits

Built with:
- **OpenAI Whisper** - Speech recognition
- **Anthropic Claude** - AI conversation
- **pyttsx3** - Text-to-speech
- **Flask** - Web framework
- **Socket.io** - Real-time communication

---

**Ready to make your first call?** Follow the Quick Start guide above!
