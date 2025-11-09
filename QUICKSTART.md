# Quick Reference Guide

## Installation (One-Time Setup)

### Windows
```bash
setup.bat
```

### Linux/Mac
```bash
chmod +x setup.sh start.sh
./setup.sh
```

Then edit `.env` and add your Claude API key.

## Running the Application

### Windows
```bash
start.bat
```

### Linux/Mac
```bash
./start.sh
```

### Manual Start

Terminal 1:
```bash
python src/server.py
```

Terminal 2:
```bash
npm start
```

Then open: **http://localhost:3000**

## Quick Commands

### Install Dependencies
```bash
pip install -r requirements.txt
npm install
```

### Get API Key
Visit: https://console.anthropic.com/

### Check Status
```bash
curl http://localhost:5000/
```

### View Statistics
```bash
curl http://localhost:5000/api/stats
```

### List Calls
```bash
curl http://localhost:5000/api/calls
```

## File Locations

- **Configuration:** `.env`
- **Call Data:** `data/calls/*.json`
- **Transcripts:** `data/transcripts/*.txt`
- **Summaries:** `data/summaries/*.json`

## Customization

### Change Conversation Flow
Edit: `src/config.py` → `CONVERSATION_FLOW`

### Change AI Prompts
Edit: `src/config.py` → `SYSTEM_PROMPT`

### Change Whisper Model
Edit: `.env` → `STT_MODEL=tiny|base|small|medium|large`

### Change Speech Rate
Edit: `.env` → `TTS_RATE=150` (words per minute)

## Troubleshooting

### Microphone Not Working
- Check browser permissions
- Use Chrome/Edge
- Check system microphone settings

### API Errors
- Verify `ANTHROPIC_API_KEY` in `.env`
- Check API quota at console.anthropic.com
- Ensure internet connection

### Port Already in Use
Change ports in `.env`:
```
SERVER_PORT=5001
```

### Whisper Slow
Use smaller model:
```
STT_MODEL=tiny
```

### Connection Refused
- Ensure backend is running on port 5000
- Check firewall settings
- Verify localhost not blocked

## Performance Tips

1. Use `STT_MODEL=tiny` for faster transcription
2. Close other applications
3. Use wired internet connection
4. Ensure good microphone quality

## Development

### Watch Mode (Auto-reload)
```bash
FLASK_DEBUG=1 python src/server.py
npm run dev
```

### View Logs
Check terminal output or redirect:
```bash
python src/server.py > app.log 2>&1
```

### Test API
```bash
# Health check
curl http://localhost:5000/

# Statistics
curl http://localhost:5000/api/stats

# Recent calls
curl http://localhost:5000/api/calls?limit=5
```

## Common Issues

| Issue | Solution |
|-------|----------|
| "Module not found" | Run `pip install -r requirements.txt` |
| "Port in use" | Change `SERVER_PORT` in `.env` |
| "API key invalid" | Check `.env` file has correct key |
| "Microphone blocked" | Allow in browser settings |
| "Whisper download" | Wait for model download (first run) |

## Support

1. Check `SETUP.md` for detailed installation
2. Check `USAGE.md` for examples
3. Check `PROJECT_OVERVIEW.md` for architecture
4. Review terminal logs for errors
5. Verify all prerequisites installed

## Keyboard Shortcuts

- **Start Call:** Click button (no shortcut)
- **End Call:** Click button or Ctrl+C in terminal
- **Reload Page:** F5 or Ctrl+R

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ⚠️ Safari (limited WebRTC support)
- ❌ IE (not supported)

## System Requirements

- **OS:** Windows 10+, macOS 10.14+, Ubuntu 20.04+
- **RAM:** 4GB minimum, 8GB recommended
- **Disk:** 500MB free space
- **Network:** Stable internet connection
- **Microphone:** Any USB or built-in mic

## URLs

- **Web Interface:** http://localhost:3000
- **API Backend:** http://localhost:5000
- **API Docs:** http://localhost:5000/api/stats
- **Claude Console:** https://console.anthropic.com

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-xxx     # Required
SERVER_HOST=localhost             # Optional
SERVER_PORT=5000                  # Optional
AI_MODEL=claude-3-5-sonnet-20241022  # Optional
STT_MODEL=base                    # Optional
TTS_RATE=150                      # Optional
TTS_VOLUME=0.9                    # Optional
MAX_CALL_DURATION=600             # Optional
```

## Data Files

After a call, find data in:
```
data/
├── calls/20240109_143022.json       # Complete call data
├── transcripts/20240109_143022.txt  # Text transcript
└── summaries/20240109_143022.json   # AI summary
```

## Quick Tips

1. **First Run:** Whisper downloads models (~150MB)
2. **Best Results:** Use quiet environment
3. **Speech Rate:** Adjust `TTS_RATE` if too fast/slow
4. **Better Accuracy:** Use larger Whisper model
5. **Save Money:** Use smaller Claude context

## Next Steps

1. ✅ Complete setup
2. ✅ Get API key
3. ✅ Make first test call
4. 📝 Customize conversation flow
5. 🚀 Deploy to production (optional)

---

**Need help?** Check the full documentation in `SETUP.md` and `USAGE.md`
