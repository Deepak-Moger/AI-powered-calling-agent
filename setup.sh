#!/bin/bash

echo "AI Calling Agent - Quick Setup"
echo "================================"
echo ""

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "Installing Node dependencies..."
npm install

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env"
echo "2. Add your ANTHROPIC_API_KEY to .env"
echo "3. Run ./start.sh to launch the application"
echo ""
