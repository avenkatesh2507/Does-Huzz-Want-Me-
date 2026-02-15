# DHWM (Does Huzz Want Me?) Chrome Extension

This Chrome extension analyzes your Instagram DM conversations and uses AI to determine the emotional and romantic intent of the other person. It provides a detailed classification, sentiment score, romantic interest score, confidence, and reasoning based on your chat history.

## Features
- Extracts messages from Instagram DMs
- Sends conversation to Gemini AI for relationship analysis
- Returns a JSON summary with:
  - Classification (e.g., Likes you romantically, Just friends, Not interested, etc.)
  - Sentiment score (0–100)
  - Romantic interest score (0–100)
  - Confidence score (0–100)
  - Explanation and behavioral signals
- Displays results in a modern, scrollable popup

## Setup
1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd DHWM
   ```
2. **Add your Gemini API key:**
   - Open `background.js` and replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key.
   - Set the correct model name in the API endpoint if needed.
3. **Load the extension in Chrome:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select this project folder

## Usage
1. Open an Instagram DM thread in your browser.
2. Click the extension icon and press **Analyze DM**.
3. View the AI-powered analysis in the popup.

## Security
- **Never commit your real API key to version control.**
- The extension uses placeholders for API keys and model names by default.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
MIT
