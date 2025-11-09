"""
Data Storage module for conversation logs
"""
import json
import os
import logging
from datetime import datetime
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class DataStorage:
    """Handles storing and retrieving conversation data"""

    def __init__(self, data_dir: str = "./data"):
        """
        Initialize data storage

        Args:
            data_dir: Directory to store data files
        """
        self.data_dir = data_dir
        self.ensure_directories()
        logger.info(f"Initialized DataStorage with directory: {data_dir}")

    def ensure_directories(self):
        """Create necessary directories if they don't exist"""
        directories = [
            self.data_dir,
            os.path.join(self.data_dir, 'recordings'),
            os.path.join(self.data_dir, 'transcripts'),
            os.path.join(self.data_dir, 'summaries'),
            os.path.join(self.data_dir, 'calls')
        ]

        for directory in directories:
            os.makedirs(directory, exist_ok=True)

    def save_call(self, call_data: Dict) -> str:
        """
        Save call data to JSON file

        Args:
            call_data: Dictionary containing call information

        Returns:
            Call ID (filename without extension)
        """
        try:
            # Generate call ID based on timestamp
            call_id = datetime.now().strftime("%Y%m%d_%H%M%S")

            # Add metadata
            call_data['call_id'] = call_id
            call_data['timestamp'] = datetime.now().isoformat()

            # Save to file
            filename = os.path.join(self.data_dir, 'calls', f"{call_id}.json")

            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(call_data, f, indent=2, ensure_ascii=False)

            logger.info(f"Saved call data: {call_id}")
            return call_id

        except Exception as e:
            logger.error(f"Error saving call data: {str(e)}")
            raise

    def get_call(self, call_id: str) -> Optional[Dict]:
        """
        Retrieve call data by ID

        Args:
            call_id: Call ID to retrieve

        Returns:
            Call data dictionary or None if not found
        """
        try:
            filename = os.path.join(self.data_dir, 'calls', f"{call_id}.json")

            if not os.path.exists(filename):
                logger.warning(f"Call not found: {call_id}")
                return None

            with open(filename, 'r', encoding='utf-8') as f:
                return json.load(f)

        except Exception as e:
            logger.error(f"Error retrieving call data: {str(e)}")
            return None

    def list_calls(self, limit: int = 100) -> List[Dict]:
        """
        List recent calls

        Args:
            limit: Maximum number of calls to return

        Returns:
            List of call data dictionaries
        """
        try:
            calls_dir = os.path.join(self.data_dir, 'calls')
            files = [f for f in os.listdir(calls_dir) if f.endswith('.json')]

            # Sort by filename (timestamp) in descending order
            files.sort(reverse=True)

            calls = []
            for filename in files[:limit]:
                filepath = os.path.join(calls_dir, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    calls.append(json.load(f))

            return calls

        except Exception as e:
            logger.error(f"Error listing calls: {str(e)}")
            return []

    def save_transcript(self, call_id: str, transcript: str):
        """
        Save conversation transcript

        Args:
            call_id: Call ID
            transcript: Transcript text
        """
        try:
            filename = os.path.join(self.data_dir, 'transcripts', f"{call_id}.txt")

            with open(filename, 'w', encoding='utf-8') as f:
                f.write(transcript)

            logger.info(f"Saved transcript: {call_id}")

        except Exception as e:
            logger.error(f"Error saving transcript: {str(e)}")

    def save_summary(self, call_id: str, summary: Dict):
        """
        Save conversation summary

        Args:
            call_id: Call ID
            summary: Summary data
        """
        try:
            filename = os.path.join(self.data_dir, 'summaries', f"{call_id}.json")

            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(summary, f, indent=2, ensure_ascii=False)

            logger.info(f"Saved summary: {call_id}")

        except Exception as e:
            logger.error(f"Error saving summary: {str(e)}")

    def get_statistics(self) -> Dict:
        """
        Get overall statistics

        Returns:
            Dictionary with statistics
        """
        try:
            calls = self.list_calls()

            total_calls = len(calls)
            total_duration = sum(call.get('duration', 0) for call in calls)
            avg_duration = total_duration / total_calls if total_calls > 0 else 0

            return {
                "total_calls": total_calls,
                "total_duration_seconds": total_duration,
                "average_duration_seconds": avg_duration,
                "last_call": calls[0] if calls else None
            }

        except Exception as e:
            logger.error(f"Error getting statistics: {str(e)}")
            return {
                "total_calls": 0,
                "total_duration_seconds": 0,
                "average_duration_seconds": 0,
                "last_call": None
            }
