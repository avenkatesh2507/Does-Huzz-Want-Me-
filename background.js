const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
async function callGemini(conversationText) {
  try {
    const prompt = `
You are an expert relationship analyst AI.

Your job is to analyze an Instagram DM conversation and determine the emotional and romantic intent of the OTHER person.

Be realistic.
Do NOT be overly optimistic.
Do NOT give false hope.
If signals are weak or ambiguous, say so clearly.

Analyze based on:
- Tone and emotional warmth
- Flirting indicators
- Response enthusiasm
- Effort in conversation
- Reciprocity
- Sarcasm or teasing
- Emotional investment
- Avoidance or dryness
- Message length patterns
- Conversation balance

Classify the OTHER person into ONE primary category:

1. Likes you romantically
2. Flirting
3. Just friends
4. Neutral / polite
5. Sarcastic
6. Not interested
7. Negative / hostile
8. Making fun of you

Then provide:

- Sentiment score (0–100)
- Romantic interest score (0–100)
- Confidence score (0–100)
- 2–4 sentence explanation of reasoning
- List 3 behavioral signals that influenced your decision

Return your response STRICTLY in this JSON format:

{
  "classification": "",
  "sentiment_score": 0,
  "romantic_interest_score": 0,
  "confidence": 0,
  "reasoning": "",
  "signals": []
}

Conversation:
${conversationText}
`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/YOUR_GEMINI_MODEL:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    console.log("Gemini status:", response.status);

    const text = await response.text();
    console.log("Gemini full response:", text);

    if (!response.ok) {
      let errorMsg = `Gemini failed with status ${response.status}`;
      try {
        const errorData = JSON.parse(text);
        errorMsg += `\nError message: ${errorData.error?.message || text}`;
      } catch (parseErr) {
        errorMsg += `\nRaw response: ${text}`;
      }
      console.error(errorMsg);
      return errorMsg;
    }

    const data = JSON.parse(text);

    return data.candidates?.[0]?.content?.parts?.[0]?.text
      || "AI returned no result.";

  } catch (err) {
    console.error("Gemini error:", err);
    return `AI analysis failed: ${err.message}`;
  }
}


function computeBehaviorScore(messages) {
  let responseTimes = [];

  const avgResponse =
    responseTimes.reduce((a, b) => a + b, 0) /
    (responseTimes.length || 1);

  const responseScore = avgResponse < 600000 ? 100 : 50;
  const outgoing = messages.filter(m => m.isOutgoing).length;
  const incoming = messages.length - outgoing;
  const balanceScore = 100 - Math.abs(outgoing - incoming) * 3;
  return responseScore * 0.5 + balanceScore * 0.5;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "ANALYZE") {
      (async () => {
        try {
          const messages = request.payload;
          if (!messages || !messages.length) {
            sendResponse({ error: "No messages received." });
            return;
          }
          const conversationText = messages
            .map(m => `${m.isOutgoing ? "Me" : "Them"}: ${m.text}`)
            .join("\n");
          const behaviorScore = computeBehaviorScore(messages);
          const aiResult = await callGemini(conversationText);
          sendResponse({
            score: Math.round(behaviorScore),
            aiAnalysis: aiResult
          });
        } catch (err) {
          console.error("Background error:", err);
          sendResponse({ error: "Background crashed." });
        }
      })();
      return true;
    }
  });