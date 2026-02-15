console.log("✅ Huzz content script injected");

function extractMessages() {
  const messages = [];

  const bubbles = document.querySelectorAll("div[dir='auto']");
  console.log("Found bubbles:", bubbles.length);

  bubbles.forEach((bubble, index) => {
    const text = bubble.innerText.trim();
    if (!text) return;

    const container = bubble.closest("div");
    const isOutgoing =
      container && container.innerHTML.includes("You sent");

    messages.push({
      text,
      timestamp: Date.now() + index,
      isOutgoing: !!isOutgoing
    });
  });

  console.log("Extracted messages:", messages);
  return messages;
}

function computeBehaviorScore(messages) {
  let responseTimes = [];
  let lastOutgoing = null;

  messages.forEach(m => {
    if (m.isOutgoing) lastOutgoing = m.timestamp;
    else if (lastOutgoing) responseTimes.push(m.timestamp - lastOutgoing);
  });

  const avgResponse =
    responseTimes.reduce((a, b) => a + b, 0) /
    (responseTimes.length || 1);

  const responseScore = avgResponse < 600000 ? 100 : 50;
  const outgoing = messages.filter(m => m.isOutgoing).length;
  const incoming = messages.length - outgoing;
  const balanceScore = 100 - Math.abs(outgoing - incoming) * 3;

  return Math.round(responseScore * 0.5 + balanceScore * 0.5);
}


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log("📩 Message received in content:", request);

  if (request.type === "GET_MESSAGES") {
    try {
      if (!window.location.href.includes("/direct/t/")) {
        sendResponse({ error: "Not inside DM thread" });
        return true;
      }

      const messages = extractMessages();

      if (!messages || messages.length === 0) {
        sendResponse({ error: "No messages found." });
        return true;
      }

      sendResponse({ messages });
    } catch (err) {
      console.error("Content crashed:", err);
      sendResponse({ error: "Content script crashed." });
    }

    return true;
  }


});
