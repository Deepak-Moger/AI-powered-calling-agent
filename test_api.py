"""
Simple test script to verify Claude API key and available models
"""
import os
from dotenv import load_dotenv
import anthropic

load_dotenv()

api_key = os.getenv('ANTHROPIC_API_KEY')

print("="*60)
print("CLAUDE API TEST")
print("="*60)
print()
print(f"API Key: {api_key[:20]}...{api_key[-10:]}")
print()

# Try different model names
models_to_test = [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet-20240620",
    "claude-3-sonnet-20240229",
    "claude-3-opus-20240229",
    "claude-3-haiku-20240307",
]

client = anthropic.Anthropic(api_key=api_key)

for model in models_to_test:
    print(f"Testing model: {model}")
    try:
        response = client.messages.create(
            model=model,
            max_tokens=50,
            messages=[
                {"role": "user", "content": "Say 'Hello, I am working!'"}
            ]
        )
        print(f"  [OK] Model works! Response: {response.content[0].text}")
        print()
        break  # If one works, use it
    except Exception as e:
        print(f"  [ERROR] {str(e)}")
        print()

print("="*60)
