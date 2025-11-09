"""
AI Conversation Handler using Claude API
"""
import anthropic
import logging
from typing import List, Dict, Optional
from config import SYSTEM_PROMPT, CONVERSATION_FLOW

logger = logging.getLogger(__name__)


class ConversationHandler:
    """Manages AI-powered conversation flow using Claude"""

    def __init__(self, api_key: str, model: str = "claude-3-5-sonnet-20241022"):
        """
        Initialize conversation handler

        Args:
            api_key: Anthropic API key
            model: Claude model to use
        """
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = model
        self.conversation_history: List[Dict[str, str]] = []
        self.current_stage = 0
        logger.info(f"Initialized ConversationHandler with model: {model}")

    def start_conversation(self) -> str:
        """
        Start a new conversation

        Returns:
            Initial greeting message
        """
        self.conversation_history = []
        self.current_stage = 0

        # Get initial greeting
        initial_message = self._generate_response(
            "Generate a professional greeting introducing yourself as an AI assistant calling on behalf of a job seeker to inquire about job openings. Keep it brief (1-2 sentences)."
        )

        logger.info(f"Started conversation: {initial_message}")
        return initial_message

    def process_response(self, user_input: str) -> Optional[str]:
        """
        Process user's response and generate next message

        Args:
            user_input: Transcribed speech from HR representative

        Returns:
            AI's response or None if conversation is complete
        """
        # Add user input to history
        self.conversation_history.append({
            "role": "user",
            "content": user_input
        })

        # Check if conversation should end
        if self._should_end_conversation(user_input):
            closing_message = self._generate_response(
                "The person wants to end the call. Thank them warmly for their time and say goodbye professionally. Keep it very brief (1 sentence)."
            )
            self.conversation_history.append({
                "role": "assistant",
                "content": closing_message
            })
            logger.info("Conversation ended")
            return closing_message

        # Move to next stage if needed
        self.current_stage += 1

        # Check if we've completed all stages
        if self.current_stage >= len(CONVERSATION_FLOW):
            logger.info("All conversation stages completed")
            return None

        # Generate next response based on current stage
        stage_info = CONVERSATION_FLOW[self.current_stage]
        prompt = f"{stage_info['prompt']} Keep your response brief and natural (1-2 sentences)."

        response = self._generate_response(prompt)

        self.conversation_history.append({
            "role": "assistant",
            "content": response
        })

        logger.info(f"Stage {self.current_stage} ({stage_info['stage']}): {response}")
        return response

    def _generate_response(self, prompt: str) -> str:
        """
        Generate AI response using Claude

        Args:
            prompt: Prompt for response generation

        Returns:
            Generated response
        """
        try:
            # Build messages for API
            messages = self.conversation_history.copy()
            messages.append({
                "role": "user",
                "content": prompt
            })

            # Call Claude API
            response = self.client.messages.create(
                model=self.model,
                max_tokens=150,
                system=SYSTEM_PROMPT,
                messages=messages
            )

            # Extract text from response
            generated_text = response.content[0].text.strip()

            return generated_text

        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return "I apologize, I'm having technical difficulties. Thank you for your time."

    def _should_end_conversation(self, user_input: str) -> bool:
        """
        Determine if conversation should end based on user input

        Args:
            user_input: User's message

        Returns:
            True if conversation should end
        """
        end_phrases = [
            "goodbye",
            "bye",
            "have to go",
            "can't talk",
            "busy right now",
            "call back later",
            "not interested",
            "no thank you"
        ]

        user_lower = user_input.lower()
        return any(phrase in user_lower for phrase in end_phrases)

    def get_conversation_summary(self) -> Dict[str, any]:
        """
        Generate a summary of the conversation

        Returns:
            Dictionary with conversation summary
        """
        try:
            # Build full conversation text
            conversation_text = ""
            for msg in self.conversation_history:
                role = "Agent" if msg["role"] == "assistant" else "HR Rep"
                conversation_text += f"{role}: {msg['content']}\n"

            # Generate summary using Claude
            summary_prompt = f"""Based on this conversation, provide a structured summary:

{conversation_text}

Please provide:
1. Key information gathered
2. Job availability status
3. Required qualifications (if mentioned)
4. Next steps (if any)
5. Overall outcome

Format as a clear, bullet-pointed summary."""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=500,
                messages=[{
                    "role": "user",
                    "content": summary_prompt
                }]
            )

            summary = response.content[0].text.strip()

            return {
                "conversation": self.conversation_history,
                "summary": summary,
                "stages_completed": self.current_stage,
                "total_exchanges": len(self.conversation_history) // 2
            }

        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            return {
                "conversation": self.conversation_history,
                "summary": "Error generating summary",
                "stages_completed": self.current_stage,
                "total_exchanges": len(self.conversation_history) // 2
            }
