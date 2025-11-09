"""
Simple command-line demo of the AI Calling Agent
No web browser required - runs entirely in the terminal
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

def main():
    print("=" * 60)
    print("AI CALLING AGENT - COMMAND LINE DEMO")
    print("=" * 60)
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
        return

    print()
    print("=" * 60)
    print("CALL SIMULATION STARTING")
    print("=" * 60)
    print()
    print("NOTE: This demo simulates a call conversation.")
    print("The AI will speak, then you type your responses.")
    print()
    input("Press ENTER to start the call...")
    print()

    # Start conversation
    call_start_time = time.time()
    conversation_log = []

    try:
        # Get initial greeting
        print("🤖 AI Agent is speaking...")
        greeting = conversation_handler.start_conversation()
        print(f"🗣️  AI: {greeting}")
        print()

        # Speak the greeting
        tts.speak(greeting)

        conversation_log.append({
            "role": "assistant",
            "content": greeting
        })

        # Conversation loop
        stage = 1
        max_stages = 6

        while stage < max_stages:
            # Get user input
            print("👤 You (type your response, or 'quit' to end):")
            user_input = input("   > ").strip()
            print()

            if not user_input:
                print("[WARN]  No input detected, please try again.")
                print()
                continue

            if user_input.lower() in ['quit', 'exit', 'bye', 'goodbye']:
                print("👋 Ending call...")
                break

            conversation_log.append({
                "role": "user",
                "content": user_input
            })

            # Generate AI response
            print("🤖 AI Agent is thinking...")
            response = conversation_handler.process_response(user_input)

            if response is None:
                print("[OK] Conversation completed!")
                break

            print(f"🗣️  AI: {response}")
            print()

            # Speak the response
            tts.speak(response)

            conversation_log.append({
                "role": "assistant",
                "content": response
            })

            stage += 1

        # End of call
        call_duration = time.time() - call_start_time

        print()
        print("=" * 60)
        print("CALL ENDED")
        print("=" * 60)
        print()

        # Generate summary
        print("📊 Generating call summary...")
        summary = conversation_handler.get_conversation_summary()

        print()
        print("=" * 60)
        print("CALL SUMMARY")
        print("=" * 60)
        print()
        print(summary['summary'])
        print()
        print(f"Duration: {int(call_duration)} seconds")
        print(f"Exchanges: {summary['total_exchanges']}")
        print(f"Stages completed: {summary['stages_completed']}")
        print()

        # Save data
        print("💾 Saving call data...")

        call_data = {
            "duration": call_duration,
            "conversation": conversation_log,
            "summary": summary['summary'],
            "stages_completed": summary['stages_completed'],
            "total_exchanges": summary['total_exchanges']
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
        print(f"📁 Data saved to: {Config.DATA_DIR}/")
        print()
        print("=" * 60)
        print("DEMO COMPLETE")
        print("=" * 60)

    except KeyboardInterrupt:
        print("\n\n[WARN]  Call interrupted by user")
    except Exception as e:
        print(f"\n[ERROR] Error during call: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
