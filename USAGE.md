# Usage Examples

## Basic Call Flow

### 1. Starting a Call

```bash
# Terminal 1: Start backend
python src/server.py

# Terminal 2: Start web interface
npm start
```

Open `http://localhost:3000` and click "Start Call"

### 2. Sample Conversation

**AI Agent:** "Hello, this is an AI assistant calling on behalf of a job seeker. I'm reaching out to inquire about current job openings at your company."

**You (HR Rep):** "Hi, yes, how can I help you?"

**AI Agent:** "Thank you for taking my call. Do you currently have any software engineering positions available?"

**You:** "Yes, we have two openings for senior software engineers."

**AI Agent:** "That's great! Could you tell me about the required qualifications for these positions?"

**You:** "We're looking for candidates with 5+ years of experience in Python and React."

**AI Agent:** "Thank you for that information. What's the application process?"

**You:** "Candidates can apply through our careers page on the website."

**AI Agent:** "Perfect, thank you so much for your time. Have a great day!"

### 3. Viewing Results

After the call ends, you'll see:

```
Call Summary
============

Key Information Gathered:
- Company has 2 senior software engineer openings
- Requirements: 5+ years Python and React experience
- Application: Through careers website

Call Statistics:
- Duration: 87 seconds
- Exchanges: 4
- Call ID: 20240109_143022
```

## API Usage Examples

### Get Call Statistics

```bash
curl http://localhost:5000/api/stats
```

Response:
```json
{
  "total_calls": 5,
  "total_duration_seconds": 423,
  "average_duration_seconds": 84.6,
  "last_call": {
    "call_id": "20240109_143022",
    "duration": 87
  }
}
```

### List Recent Calls

```bash
curl http://localhost:5000/api/calls?limit=5
```

### Get Specific Call

```bash
curl http://localhost:5000/api/calls/20240109_143022
```

## Customizing Conversation Flow

Edit `src/config.py`:

```python
CONVERSATION_FLOW = [
    {
        "stage": "greeting",
        "prompt": "Greet professionally and introduce yourself"
    },
    {
        "stage": "your_custom_stage",
        "prompt": "Ask your custom question here"
    },
    # Add more stages...
]
```

## Using Different Whisper Models

Faster (less accurate):
```bash
# In .env
STT_MODEL=tiny
```

More accurate (slower):
```bash
# In .env
STT_MODEL=medium
```

## Custom System Prompts

Edit `src/config.py`:

```python
SYSTEM_PROMPT = """You are an AI calling agent for [YOUR COMPANY].

Your role:
- [Custom instructions]
- [Custom guidelines]

Guidelines:
- [Custom rules]
"""
```

## Integration with Real Phone Systems

### Using Twilio (Optional)

1. Install Twilio SDK:
```bash
pip install twilio
```

2. Add to your code:
```python
from twilio.rest import Client

client = Client(account_sid, auth_token)

call = client.calls.create(
    to="+1234567890",
    from_="+0987654321",
    url="http://your-server.com/voice"
)
```

## Batch Calling

Create a list of phone numbers and loop:

```python
contacts = [
    {"name": "Company A", "phone": "+1234567890"},
    {"name": "Company B", "phone": "+0987654321"},
]

for contact in contacts:
    # Make call
    # Store results
    # Wait between calls
```

## Data Analysis

Access stored calls:

```python
import json
import glob

# Read all call files
calls = []
for filepath in glob.glob("data/calls/*.json"):
    with open(filepath) as f:
        calls.append(json.load(f))

# Analyze
successful_calls = [c for c in calls if c.get('stages_completed', 0) >= 4]
print(f"Success rate: {len(successful_calls)/len(calls)*100:.1f}%")
```

## Production Deployment

### Using Gunicorn

```bash
pip install gunicorn eventlet

gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:5000 src.server:app
```

### Using Docker

Create `Dockerfile`:
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "src/server.py"]
```

Build and run:
```bash
docker build -t ai-calling-agent .
docker run -p 5000:5000 ai-calling-agent
```

## Monitoring and Logging

Logs are printed to console. Redirect to file:

```bash
python src/server.py > logs/app.log 2>&1
```

View logs:
```bash
tail -f logs/app.log
```

## Performance Optimization

1. **Preload Whisper model:**
```python
# At startup
stt.load_model()
```

2. **Use smaller model for real-time:**
```bash
STT_MODEL=tiny
```

3. **Implement caching:**
```python
# Cache common responses
response_cache = {}
```

## Security Best Practices

1. **Protect API keys:**
   - Never commit `.env` to git
   - Use environment variables in production
   - Rotate keys regularly

2. **Add authentication:**
```python
from flask_httpauth import HTTPBasicAuth
auth = HTTPBasicAuth()

@app.route('/api/calls')
@auth.login_required
def list_calls():
    # ...
```

3. **Rate limiting:**
```python
from flask_limiter import Limiter

limiter = Limiter(app, default_limits=["100 per hour"])
```

## Testing

Create test cases:

```python
def test_conversation():
    handler = ConversationHandler(api_key="test-key")
    greeting = handler.start_conversation()
    assert greeting is not None

    response = handler.process_response("We have openings")
    assert response is not None
```

Run tests:
```bash
python -m pytest tests/
```
