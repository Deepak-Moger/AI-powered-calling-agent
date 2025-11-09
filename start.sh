#!/bin/bash

echo "AI Calling Agent - Starting Services"
echo "====================================="
echo ""

echo "Starting Python backend server..."
python src/server.py &
BACKEND_PID=$!

sleep 3

echo "Starting web interface..."
npm start &
WEB_PID=$!

echo ""
echo "Services started!"
echo ""
echo "Backend: http://localhost:5000"
echo "Web Interface: http://localhost:3000"
echo ""
echo "Open http://localhost:3000 in your browser"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $WEB_PID; exit" INT
wait
