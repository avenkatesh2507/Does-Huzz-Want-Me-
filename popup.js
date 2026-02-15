document.getElementById("analyzeBtn").addEventListener("click", async () => {

  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const activeTab = tabs[0];

  if (!activeTab.url.includes("instagram.com")) {
    const resultBox = document.getElementById("result");
    resultBox.innerText = "Open an Instagram DM first.";
    resultBox.style.display = "block";
    return;
  }

  chrome.tabs.sendMessage(
    activeTab.id,
    { type: "GET_MESSAGES" },
    (response) => {

      const resultBox = document.getElementById("result");
      if (chrome.runtime.lastError) {
        resultBox.innerText = "Could not connect to Instagram DM. Make sure you are on an Instagram DM page.";
        resultBox.style.display = "block";
        return;
      }

      if (!response || !response.messages) {
        resultBox.innerText = "No messages found.";
        resultBox.style.display = "block";
        return;
      }

      chrome.runtime.sendMessage(
        { type: "ANALYZE", payload: response.messages },
        (analysisResult) => {
          if (!analysisResult || !analysisResult.aiAnalysis || analysisResult.score === undefined) {
            resultBox.innerText = "Analysis failed. Please try again or check your internet connection.";
            resultBox.style.display = "block";
            return;
          }
          resultBox.innerText =
            analysisResult.aiAnalysis +
            "\nBehavior Score: " +
            analysisResult.score + "%";
          resultBox.style.display = "block";
        }
      );
    }
  );
});
