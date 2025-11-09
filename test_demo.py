"""
Automated test demo of the AI Calling Agent
Tests the complete system without user interaction
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from config import Config
from ai_handler import ConversationHandler
from tts import TextToSpeech
from storage import DataStorage
import time

# Simulated user responses
SIMULATED_RESPONSES = [
    "Hi, yes, how can I help you?",
    "Yes, we have two openings for senior software engineers.",
    "We're looking for candidates with 5+ years of experience in Python and React, and experience with cloud platforms.",
    "Candidates can apply through our careers page on our website, or send their resume to jobs@company.com.",
    "Thank you for calling. Have a great day!"
]

def main():
    print("=" * 70)
    print(" AI CALLING AGENT - AUTOMATED TEST DEMO")
    print("=" * 70)
    print()

    # Validate configuration
    try:
        Config.validate()
        print("[OK] Configuration validated")
    except ValueError as e:
        print(f"[ERROR] Configuration error: {e}")
        return

    # Initialize components
    print("[*] Initializing components...")

    try:
        conversation_handler = ConversationHandler(
            api_key=Config.ANTHROPIC_API_KEY,
            model=Config.AI_MODEL
        )
        print("[OK] AI conversation handler initialized")

        tts = TextToSpeech(rate=Config.TTS_RATE, volume=Config.TTS_VOLUME)
        tts.initialize()
        print("[OK] Text-to-speech initialized")

        storage = DataStorage(data_dir=Config.DATA_DIR)
        print("[OK] Data storage initialized")

    except Exception as e:
        print(f"[ERROR] Initialization error: {e}")
        import traceback
        traceback.print_exc()
        return

    print()
    print("=" * 70)
    print(" SIMULATED CALL STARTING")
    print("=" * 70)
    print()

    # Start conversation
    call_start_time = time.time()
    conversation_log = []

    try:
        # Get initial greeting
        print("[AI AGENT] Generating greeting...")
        greeting = conversation_handler.start_conversation()
        print(f"[AI AGENT] {greeting}")
        print()

        # Speak the greeting
        print("[TTS] Speaking greeting...")
        tts.speak(greeting)
        print()

        conversation_log.append({
            "role": "assistant",
            "content": greeting
        })

        # Conversation loop with simulated responses
        for i, simulated_response in enumerate(SIMULATED_RESPONSES):
            print("-" * 70)
            print(f"[EXCHANGE {i+1}]")
            print()

            # Simulated user input
            print(f"[HR REP] {simulated_response}")
            print()

            conversation_log.append({
                "role": "user",
                "content": simulated_response
            })

            # Generate AI response
            print("[AI AGENT] Thinking...")
            response = conversation_handler.process_response(simulated_response)

            if response is None:
                print("[OK] Conversation completed naturally!")
                break

            print(f"[AI AGENT] {response}")
            print()

            # Speak the response
            print("[TTS] Speaking response...")
            tts.speak(response)
            print()

            conversation_log.append({
                "role": "assistant",
                "content": response
            })

        # End of call
        call_duration = time.time() - call_start_time

        print()
        print("=" * 70)
        print(" CALL ENDED")
        print("=" * 70)
        print()

        # Generate summary
        print("[INFO] Generating call summary...")
        summary = conversation_handler.get_conversation_summary()

        print()
        print("=" * 70)
        print(" CALL SUMMARY")
        print("=" * 70)
        print()
        print(summary['summary'])
        print()
        print(f"Duration: {int(call_duration)} seconds")
        print(f"Exchanges: {summary['total_exchanges']}")
        print(f"Stages completed: {summary['stages_completed']}")
        print()

        # Save data
        print("[SAVE] Saving call data...")

        call_data = {
            "duration": call_duration,
            "conversation": conversation_log,
            "summary": summary['summary'],
            "stages_completed": summary['stages_completed'],
            "total_exchanges": summary['total_exchanges'],
            "test_mode": True
        }

        call_id = storage.save_call(call_data)

        # Build transcript
        transcript = ""
        for msg in conversation_log:
            role = "AI Agent" if msg["role"] == "assistant" else "HR Rep"
            transcript += f"{role}: {msg['content']}\n\n"

        storage.save_transcript(call_id, transcript)
        storage.save_summary(call_id, summary)

        print(f"[OK] Call saved with ID: {call_id}")
        print(f"[FILE] Data saved to: {Config.DATA_DIR}/")
        print()
        print("=" * 70)
        print(" TEST DEMO COMPLETE - ALL FEATURES WORKING!")
        print("=" * 70)
        print()
        print("Check the following files for results:")
        print(f"  - {Config.DATA_DIR}/calls/{call_id}.json")
        print(f"  - {Config.DATA_DIR}/transcripts/{call_id}.txt")
        print(f"  - {Config.DATA_DIR}/summaries/{call_id}.json")
        print()

        return True

    except KeyboardInterrupt:
        print("\n\n[WARN] Test interrupted by user")
        return False
    except Exception as e:
        print(f"\n[ERROR] Error during test: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
