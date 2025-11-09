# Setup Guide - AI Calling Agent

## Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.8 or higher
- Node.js 14 or higher
- pip (Python package manager)
- npm (Node package manager)

## Installation Steps

### 1. Install Python Dependencies

Open a terminal in the project directory and run:

```bash
pip install -r requirements.txt
```

This will install:
- anthropic (Claude API)
- openai-whisper (Speech-to-Text)
- pyttsx3 (Text-to-Speech)
- flask & flask-socketio (Server)
- Other required libraries

**Note:** Whisper may take a few minutes to download models on first run.

### 2. Install Node Dependencies

```bash
npm install
```

This installs Express and Socket.io for the web interface.

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Claude API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

   Get your API key from: https://console.anthropic.com/

### 4. Test Installation

Test if Whisper works:
```bash
python -c "import whisper; print('Whisper OK')"
```

Test if pyttsx3 works:
```bash
python -c "import pyttsx3; engine = pyttsx3.init(); print('TTS OK')"
```

## Running the Application

### Start the Backend Server

In one terminal:
```bash
python src/server.py
```

You should see:
```
Starting AI Calling Agent server...
Server: http://localhost:5000
```

### Start the Web Interface

In another terminal:
```bash
npm start
```

You should see:
```
Web interface running at http://localhost:3000
```

### Access the Demo

Open your browser and go to: **http://localhost:3000**

## Using the Application

1. **Grant Microphone Permission**: When you click "Start Call", your browser will ask for microphone access. Click "Allow".

2. **Start Call**: Click the "Start Call" button. The AI agent will greet you first.

3. **Respond**: Speak naturally when prompted. The system will:
   - Record your voice
   - Transcribe it using Whisper
   - Generate an intelligent response using Claude
   - Speak the response back to you

4. **Voice Detection**: The system automatically detects when you finish speaking (after 1.5 seconds of silence).

5. **End Call**: Click "End Call" or let the conversation complete naturally.

6. **View Summary**: After the call ends, you'll see:
   - Complete conversation transcript
   - AI-generated summary
   - Call duration and ID

## Troubleshooting

### Whisper Model Download

On first run, Whisper downloads models (~150MB for 'base' model). This may take a few minutes.

### Microphone Not Working

- Check browser permissions (usually a 🎤 icon in the address bar)
- Try a different browser (Chrome/Edge recommended)
- Ensure no other application is using the microphone

### TTS Not Working

Windows:
```bash
pip install pywin32
```

Linux:
```bash
sudo apt-get install espeak
```

Mac:
```bash
# Should work out of the box with macOS voices
```

### Socket Connection Errors

- Ensure the Python backend is running on port 5000
- Check for firewall blocking localhost connections
- Verify CORS is enabled (already configured)

### API Errors

- Verify your ANTHROPIC_API_KEY in `.env`
- Check API quota: https://console.anthropic.com/
- Ensure API key has proper permissions

## Configuration Options

Edit `.env` to customize:

```bash
# Whisper model size (tiny, base, small, medium, large)
# Larger = more accurate but slower
STT_MODEL=base

# Speech rate (words per minute)
TTS_RATE=150

# Volume (0.0 to 1.0)
TTS_VOLUME=0.9

# Max call duration (seconds)
MAX_CALL_DURATION=600
```

## Data Storage

All call data is stored in the `data/` directory:

- `data/calls/` - Complete call records (JSON)
- `data/transcripts/` - Text transcripts
- `data/summaries/` - AI-generated summaries

## API Endpoints

The backend provides REST APIs:

- `GET /` - Health check
- `GET /api/stats` - Call statistics
- `GET /api/calls` - List recent calls
- `GET /api/calls/<id>` - Get specific call details

Example:
```bash
curl http://localhost:5000/api/stats
```

## Development Mode

For development with auto-reload:

Backend:
```bash
# Install watchdog
pip install watchdog

# Run with auto-reload
FLASK_DEBUG=1 python src/server.py
```

Frontend:
```bash
# Install nodemon
npm install -g nodemon

# Run with auto-reload
npm run dev
```

## Performance Tips

1. **Use smaller Whisper model for faster transcription:**
   ```
   STT_MODEL=tiny  # Fastest, less accurate
   STT_MODEL=base  # Good balance (recommended)
   ```

2. **Reduce TTS rate for better clarity:**
   ```
   TTS_RATE=130
   ```

3. **Use better microphone** for improved transcription accuracy

## Next Steps

- Customize conversation flow in `src/config.py`
- Modify system prompts for different use cases
- Add phone integration using Twilio
- Deploy to production server
- Add authentication for multi-user support

## Support

For issues and questions:
- Check logs in terminal output
- Review `data/` directory for stored calls
- Ensure all prerequisites are installed
- Verify API keys are valid

## License

MIT License - See LICENSE file for details
