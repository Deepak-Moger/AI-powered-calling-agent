# AI Calling Agent - Next.js Version

A complete AI-powered calling agent built with Next.js 14, TypeScript, and modern web technologies.

## Features

- **Real-time voice conversations** with AI agents
- **Speech-to-Text** using Whisper (Transformers.js) or Web Speech API
- **Text-to-Speech** using Web Speech API
- **Claude AI** integration for intelligent responses
- **Socket.io** for real-time communication
- **Modern React UI** with Tailwind CSS
- **Call transcripts and summaries**
- **Data persistence** with JSON storage

## Tech Stack

- **Frontend:** Next.js 14, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Socket.io
- **AI:** Claude API (Anthropic)
- **Speech:** Web Speech API, Transformers.js (Whisper)
- **Real-time:** Socket.io

## Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Add your Anthropic API key to `.env.local`:**
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Usage

1. Open `http://localhost:3000` in your browser
2. Click **"Start Call"** button
3. Allow microphone access when prompted
4. Start speaking after the AI greets you
5. The AI will respond naturally to your conversation
6. Click **"End Call"** to finish and see the summary

## Project Structure

```
nextjs-calling-agent/
├── app/
│   ├── api/
│   │   ├── calls/          # Call data endpoints
│   │   └── stats/          # Statistics endpoint
│   └── page.tsx            # Main UI component
├── lib/
│   ├── ai/                 # Claude AI integration
│   ├── audio/              # STT and TTS
│   ├── storage/            # Data persistence
│   └── socket-handler.ts   # Socket.io handlers
├── server.ts               # Custom server with Socket.io
└── .env.local             # Environment variables
```

## API Endpoints

### REST API
- `GET /api/stats` - Get call statistics
- `GET /api/calls` - List recent calls
- `GET /api/calls/[id]` - Get specific call data

### WebSocket Events
- `start_call` - Initialize a new call
- `audio_chunk` - Send audio data
- `end_call` - Terminate the call
- `agent_speaking` - Receive AI responses
- `call_ended` - Receive call summary

## Configuration

Edit `.env.local`:
```env
ANTHROPIC_API_KEY=your_api_key_here
AI_MODEL=claude-3-5-sonnet-20241022
DATA_DIR=./data
PORT=3000
```

## License

MIT License
