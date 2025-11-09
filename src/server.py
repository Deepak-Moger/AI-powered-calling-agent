"""
Main server for AI Calling Agent
Handles WebSocket connections and orchestrates all components
"""
import os
import sys
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import numpy as np
import base64
import io
import wave

# Import our modules
from config import Config
from stt import SpeechToText
from tts import TextToSpeech
from ai_handler import ConversationHandler
from storage import DataStorage

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'ai-calling-agent-secret'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Validate configuration
try:
    Config.validate()
except ValueError as e:
    logger.error(f"Configuration error: {str(e)}")
    sys.exit(1)

# Initialize components
stt = SpeechToText(model_name=Config.STT_MODEL)
tts = TextToSpeech(rate=Config.TTS_RATE, volume=Config.TTS_VOLUME)
storage = DataStorage(data_dir=Config.DATA_DIR)

# Active call sessions
active_calls = {}


class CallSession:
    """Represents an active call session"""

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.conversation_handler = ConversationHandler(
            api_key=Config.ANTHROPIC_API_KEY,
            model=Config.AI_MODEL
        )
        self.start_time = datetime.now()
        self.audio_chunks = []
        self.is_active = True

        logger.info(f"Created call session: {session_id}")

    def get_duration(self):
        """Get call duration in seconds"""
        return (datetime.now() - self.start_time).total_seconds()


@app.route('/')
def index():
    """Health check endpoint"""
    return jsonify({
        "status": "running",
        "service": "AI Calling Agent",
        "version": "1.0.0"
    })


@app.route('/api/stats')
def get_stats():
    """Get call statistics"""
    try:
        stats = storage.get_statistics()
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/calls')
def list_calls():
    """List recent calls"""
    try:
        limit = request.args.get('limit', 20, type=int)
        calls = storage.list_calls(limit=limit)
        return jsonify(calls)
    except Exception as e:
        logger.error(f"Error listing calls: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/calls/<call_id>')
def get_call(call_id):
    """Get specific call details"""
    try:
        call_data = storage.get_call(call_id)
        if call_data:
            return jsonify(call_data)
        else:
            return jsonify({"error": "Call not found"}), 404
    except Exception as e:
        logger.error(f"Error getting call: {str(e)}")
        return jsonify({"error": str(e)}), 500


@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {"session_id": request.sid})


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

    # Clean up call session if exists
    if request.sid in active_calls:
        call = active_calls[request.sid]
        call.is_active = False
        logger.info(f"Call session ended: {request.sid}")


@socketio.on('start_call')
def handle_start_call(data):
    """Start a new call session"""
    try:
        session_id = request.sid
        logger.info(f"Starting call for session: {session_id}")

        # Create new call session
        call = CallSession(session_id)
        active_calls[session_id] = call

        # Generate initial greeting
        greeting = call.conversation_handler.start_conversation()

        # Convert to speech
        logger.info("Generating greeting audio...")
        audio_data = tts.get_audio_data(greeting)

        # Send greeting
        emit('agent_speaking', {
            "text": greeting,
            "audio": base64.b64encode(audio_data).decode('utf-8') if audio_data else None
        })

        emit('call_started', {"session_id": session_id, "greeting": greeting})

        logger.info(f"Call started successfully: {session_id}")

    except Exception as e:
        logger.error(f"Error starting call: {str(e)}")
        emit('error', {"message": f"Failed to start call: {str(e)}"})


@socketio.on('audio_chunk')
def handle_audio_chunk(data):
    """Handle incoming audio chunk from user"""
    try:
        session_id = request.sid

        if session_id not in active_calls:
            emit('error', {"message": "No active call session"})
            return

        call = active_calls[session_id]

        # Decode audio data
        audio_bytes = base64.b64decode(data['audio'])
        call.audio_chunks.append(audio_bytes)

        logger.info(f"Received audio chunk ({len(audio_bytes)} bytes)")

    except Exception as e:
        logger.error(f"Error handling audio chunk: {str(e)}")
        emit('error', {"message": str(e)})


@socketio.on('user_finished_speaking')
def handle_user_finished_speaking():
    """Process user's complete audio input"""
    try:
        session_id = request.sid

        if session_id not in active_calls:
            emit('error', {"message": "No active call session"})
            return

        call = active_calls[session_id]

        if not call.audio_chunks:
            logger.warning("No audio chunks to process")
            return

        # Combine audio chunks
        logger.info("Processing user audio...")
        audio_data = b''.join(call.audio_chunks)
        call.audio_chunks = []  # Clear chunks

        # Convert audio bytes to numpy array
        # Assuming 16-bit PCM audio
        audio_array = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0

        # Transcribe
        emit('processing', {"status": "transcribing"})
        transcribed_text = stt.transcribe(audio_array)

        if not transcribed_text:
            emit('error', {"message": "Failed to transcribe audio"})
            return

        logger.info(f"Transcribed: {transcribed_text}")
        emit('user_spoke', {"text": transcribed_text})

        # Generate AI response
        emit('processing', {"status": "generating_response"})
        response = call.conversation_handler.process_response(transcribed_text)

        if response is None:
            # Conversation ended
            logger.info("Conversation completed")
            end_call(call)
            return

        # Convert response to speech
        emit('processing', {"status": "generating_audio"})
        audio_data = tts.get_audio_data(response)

        # Send response
        emit('agent_speaking', {
            "text": response,
            "audio": base64.b64encode(audio_data).decode('utf-8') if audio_data else None
        })

    except Exception as e:
        logger.error(f"Error processing speech: {str(e)}")
        emit('error', {"message": str(e)})


@socketio.on('end_call')
def handle_end_call():
    """End the current call"""
    try:
        session_id = request.sid

        if session_id not in active_calls:
            emit('error', {"message": "No active call session"})
            return

        call = active_calls[session_id]
        end_call(call)

    except Exception as e:
        logger.error(f"Error ending call: {str(e)}")
        emit('error', {"message": str(e)})


def end_call(call: CallSession):
    """End call and save data"""
    try:
        call.is_active = False

        # Generate summary
        logger.info("Generating call summary...")
        summary = call.conversation_handler.get_conversation_summary()

        # Build transcript
        transcript = ""
        for msg in summary['conversation']:
            role = "Agent" if msg["role"] == "assistant" else "HR Rep"
            transcript += f"{role}: {msg['content']}\n"

        # Save call data
        call_data = {
            "session_id": call.session_id,
            "start_time": call.start_time.isoformat(),
            "duration": call.get_duration(),
            "conversation": summary['conversation'],
            "summary": summary['summary'],
            "stages_completed": summary['stages_completed'],
            "total_exchanges": summary['total_exchanges']
        }

        call_id = storage.save_call(call_data)
        storage.save_transcript(call_id, transcript)
        storage.save_summary(call_id, summary)

        # Send summary to client
        emit('call_ended', {
            "call_id": call_id,
            "duration": call.get_duration(),
            "summary": summary['summary'],
            "transcript": transcript
        })

        # Remove from active calls
        if call.session_id in active_calls:
            del active_calls[call.session_id]

        logger.info(f"Call ended and saved: {call_id}")

    except Exception as e:
        logger.error(f"Error ending call: {str(e)}")


if __name__ == '__main__':
    logger.info("Starting AI Calling Agent server...")
    logger.info(f"Server: http://{Config.SERVER_HOST}:{Config.SERVER_PORT}")

    socketio.run(
        app,
        host=Config.SERVER_HOST,
        port=Config.SERVER_PORT,
        debug=True
    )
