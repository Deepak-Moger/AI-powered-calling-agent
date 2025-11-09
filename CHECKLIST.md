# Pre-Launch Checklist

Use this checklist to ensure everything is set up correctly before your first call.

## Prerequisites

- [ ] Python 3.8+ installed
  ```bash
  python --version
  ```

- [ ] Node.js 14+ installed
  ```bash
  node --version
  ```

- [ ] pip installed
  ```bash
  pip --version
  ```

- [ ] npm installed
  ```bash
  npm --version
  ```

## Installation

- [ ] Dependencies installed
  ```bash
  pip install -r requirements.txt
  npm install
  ```

- [ ] Whisper downloaded successfully
  ```bash
  python -c "import whisper; print('OK')"
  ```

- [ ] pyttsx3 working
  ```bash
  python -c "import pyttsx3; engine = pyttsx3.init(); print('OK')"
  ```

## Configuration

- [ ] `.env` file created (copied from `.env.example`)
  ```bash
  cp .env.example .env
  ```

- [ ] Claude API key added to `.env`
  ```
  ANTHROPIC_API_KEY=sk-ant-xxxxx
  ```

- [ ] API key valid (get from https://console.anthropic.com/)

- [ ] `data/` directories created (happens automatically)

## Testing

- [ ] Backend starts without errors
  ```bash
  python src/server.py
  ```
  Expected: "Server: http://localhost:5000"

- [ ] Frontend starts without errors
  ```bash
  npm start
  ```
  Expected: "Web interface running at http://localhost:3000"

- [ ] Can access web interface
  - Open: http://localhost:3000
  - Should see "AI Calling Agent" page

## Hardware

- [ ] Microphone connected and working
  - Check system settings
  - Test with voice recorder

- [ ] Speakers/headphones connected
  - Test audio output

- [ ] Internet connection active
  - Required for Claude API calls

## Browser

- [ ] Using Chrome, Edge, or Firefox (recommended)

- [ ] Microphone permissions granted
  - Browser will prompt on first call

- [ ] Pop-ups not blocked
  - May affect audio playback

## First Call Test

- [ ] Click "Start Call" button

- [ ] Browser asks for microphone permission → Click "Allow"

- [ ] Hear AI greeting

- [ ] Speak a response

- [ ] See your speech transcribed

- [ ] Hear AI response

- [ ] View summary after call ends

## Troubleshooting

If any step fails:

### Python Import Errors
```bash
pip install --upgrade -r requirements.txt
```

### Port Already in Use
Edit `.env`:
```
SERVER_PORT=5001
```

### API Key Invalid
- Check for extra spaces in `.env`
- Verify key is active at console.anthropic.com
- Ensure no quotes around key

### Microphone Not Working
- Check system permissions
- Try different browser
- Restart browser

### Whisper Download Slow
- First run downloads ~150MB model
- Wait for completion
- Use faster model: `STT_MODEL=tiny`

## Performance Verification

After first successful call:

- [ ] Response time < 5 seconds
- [ ] Transcription accurate
- [ ] Audio quality good
- [ ] Summary generated correctly
- [ ] Data saved in `data/calls/`

## Files Created After First Call

Check these exist:
```
data/
├── calls/YYYYMMDD_HHMMSS.json
├── transcripts/YYYYMMDD_HHMMSS.txt
└── summaries/YYYYMMDD_HHMMSS.json
```

## API Test

Test backend API:
```bash
# Health check
curl http://localhost:5000/

# Statistics (after first call)
curl http://localhost:5000/api/stats

# List calls
curl http://localhost:5000/api/calls
```

## Security

- [ ] `.env` file NOT committed to git

- [ ] `.gitignore` includes `.env`

- [ ] API key kept private

## Optional Optimization

For better performance:

- [ ] Use smaller Whisper model if slow
  ```
  STT_MODEL=tiny
  ```

- [ ] Adjust speech rate if too fast/slow
  ```
  TTS_RATE=130
  ```

- [ ] Close unnecessary applications

## Ready for Production?

Additional steps for production deployment:

- [ ] Add authentication
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Implement rate limiting
- [ ] Add error tracking
- [ ] Review security settings

## Need Help?

If you're stuck:

1. Check terminal output for errors
2. Review SETUP.md for detailed instructions
3. Verify all checklist items above
4. Check system requirements
5. Try with smallest Whisper model first

## Success Criteria

You're ready when:
- ✅ All checklist items complete
- ✅ First test call successful
- ✅ Can view call summary
- ✅ Data saved correctly
- ✅ No errors in console

## Next Steps

After successful setup:

1. Customize conversation in `src/config.py`
2. Adjust prompts for your use case
3. Test different scenarios
4. Review call summaries
5. Optimize settings for your needs

---

**All checkboxes checked?** You're ready to go! 🚀

Run `start.bat` (Windows) or `./start.sh` (Linux/Mac) and open http://localhost:3000
