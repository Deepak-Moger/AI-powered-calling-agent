// AI Calling Agent - Frontend Application
const socket = io('http://localhost:5000');

let isCallActive = false;
let mediaRecorder = null;
let audioChunks = [];
let audioContext = null;
let analyser = null;
let visualizerBars = [];

// DOM Elements
const startBtn = document.getElementById('startBtn');
const endBtn = document.getElementById('endBtn');
const status = document.getElementById('status');
const conversation = document.getElementById('conversation');
const summary = document.getElementById('summary');
const summaryContent = document.getElementById('summaryContent');
const stats = document.getElementById('stats');
const processingIndicator = document.getElementById('processingIndicator');
const processingText = document.getElementById('processingText');
const visualizer = document.getElementById('visualizer');

// Initialize visualizer bars
for (let i = 0; i < 20; i++) {
    const bar = document.createElement('div');
    bar.className = 'visualizer-bar';
    bar.style.height = '10px';
    visualizer.appendChild(bar);
    visualizerBars.push(bar);
}

// Socket event handlers
socket.on('connect', () => {
    console.log('Connected to server');
    updateStatus('Connected - Ready to start call', false);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    updateStatus('Disconnected from server', false);
    resetCall();
});

socket.on('call_started', (data) => {
    console.log('Call started:', data);
    updateStatus('Call in progress - Agent speaking...', true);
    addMessage('agent', data.greeting);
});

socket.on('agent_speaking', (data) => {
    console.log('Agent speaking:', data.text);
    addMessage('agent', data.text);

    // Play audio if available
    if (data.audio) {
        playAudio(data.audio);
    } else {
        // Fallback: use browser's speech synthesis
        speak(data.text);
    }
});

socket.on('user_spoke', (data) => {
    console.log('User spoke:', data.text);
    addMessage('user', data.text);
});

socket.on('processing', (data) => {
    console.log('Processing:', data.status);
    showProcessing(data.status);
});

socket.on('call_ended', (data) => {
    console.log('Call ended:', data);
    updateStatus('Call ended', false);
    showSummary(data);
    resetCall();
});

socket.on('error', (data) => {
    console.error('Error:', data.message);
    alert('Error: ' + data.message);
    updateStatus('Error: ' + data.message, false);
    hideProcessing();
});

// Start call
async function startCall() {
    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Initialize audio context for visualization (with resume for browser policy)
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Resume audio context (required by modern browsers)
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        // Start visualizer
        visualize();

        // Setup media recorder
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            // Convert audio chunks to base64 and send
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64Audio = reader.result.split(',')[1];
                socket.emit('audio_chunk', { audio: base64Audio });
                socket.emit('user_finished_speaking');
            };

            reader.readAsDataURL(audioBlob);
            audioChunks = [];
        };

        // Start recording
        mediaRecorder.start();

        // Emit start call event
        socket.emit('start_call', {});

        isCallActive = true;
        startBtn.disabled = true;
        endBtn.disabled = false;
        summary.classList.remove('show');
        conversation.innerHTML = '';

        updateStatus('Call starting...', true);

        // Setup voice activity detection (simplified)
        setupVoiceDetection();

    } catch (error) {
        console.error('Error starting call:', error);
        alert('Error accessing microphone: ' + error.message);
    }
}

// End call
function endCall() {
    socket.emit('end_call');
    resetCall();
}

// Reset call state
function resetCall() {
    isCallActive = false;
    startBtn.disabled = false;
    endBtn.disabled = true;

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }

    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }

    hideProcessing();
}

// Update status display
function updateStatus(message, isActive) {
    status.textContent = message;
    status.className = 'status' + (isActive ? ' active' : '');
}

// Add message to conversation
function addMessage(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + role;

    const roleDiv = document.createElement('div');
    roleDiv.className = 'role';
    roleDiv.textContent = role === 'agent' ? 'AI Agent' : 'HR Representative';

    const textDiv = document.createElement('div');
    textDiv.className = 'text';
    textDiv.textContent = text;

    messageDiv.appendChild(roleDiv);
    messageDiv.appendChild(textDiv);

    conversation.appendChild(messageDiv);
    conversation.scrollTop = conversation.scrollHeight;
}

// Show processing indicator
function showProcessing(statusText) {
    const messages = {
        'transcribing': 'Transcribing speech...',
        'generating_response': 'Generating response...',
        'generating_audio': 'Converting to speech...'
    };

    processingText.textContent = messages[statusText] || 'Processing...';
    processingIndicator.classList.add('show');
}

// Hide processing indicator
function hideProcessing() {
    processingIndicator.classList.remove('show');
}

// Show call summary
function showSummary(data) {
    summaryContent.textContent = data.summary;

    // Show stats
    stats.innerHTML = `
        <div class="stat-card">
            <div class="value">${Math.round(data.duration)}s</div>
            <div class="label">Duration</div>
        </div>
        <div class="stat-card">
            <div class="value">${data.call_id.substring(0, 8)}</div>
            <div class="label">Call ID</div>
        </div>
    `;

    summary.classList.add('show');
}

// Play audio from base64
function playAudio(base64Audio) {
    const audio = new Audio('data:audio/wav;base64,' + base64Audio);
    audio.play().catch(err => {
        console.error('Error playing audio:', err);
        // Fallback handled by caller
    });
}

// Fallback: Browser speech synthesis
function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }
}

// Simple voice activity detection
function setupVoiceDetection() {
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let isSpeaking = false;
    let silenceStart = null;
    const SILENCE_THRESHOLD = 30;
    const SILENCE_DURATION = 1500; // ms

    function checkVoiceActivity() {
        if (!isCallActive) return;

        analyser.getByteFrequencyData(dataArray);

        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;

        if (average > SILENCE_THRESHOLD) {
            // User is speaking
            if (!isSpeaking) {
                isSpeaking = true;
                updateStatus('Listening to HR representative...', true);
            }
            silenceStart = null;
        } else {
            // Silence detected
            if (isSpeaking && !silenceStart) {
                silenceStart = Date.now();
            }

            if (isSpeaking && silenceStart && (Date.now() - silenceStart > SILENCE_DURATION)) {
                // User finished speaking
                isSpeaking = false;
                silenceStart = null;

                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    updateStatus('Processing response...', true);
                    mediaRecorder.stop();

                    // Restart recording for next response
                    setTimeout(() => {
                        if (isCallActive && mediaRecorder) {
                            audioChunks = [];
                            mediaRecorder.start();
                        }
                    }, 1000);
                }
            }
        }

        requestAnimationFrame(checkVoiceActivity);
    }

    checkVoiceActivity();
}

// Visualize audio
function visualize() {
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        if (!isCallActive) {
            // Reset bars
            visualizerBars.forEach(bar => bar.style.height = '10px');
            return;
        }

        analyser.getByteFrequencyData(dataArray);

        // Update bars
        const step = Math.floor(bufferLength / visualizerBars.length);
        visualizerBars.forEach((bar, i) => {
            const value = dataArray[i * step];
            const height = Math.max(10, (value / 255) * 50);
            bar.style.height = height + 'px';
        });

        requestAnimationFrame(draw);
    }

    draw();
}

// Initialize
console.log('AI Calling Agent initialized');
