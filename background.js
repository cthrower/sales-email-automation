chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.includes('capsulecrm.com')) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["content.js"]
      });
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'sendEmail') {
      console.log("Email sent:", message.content);
      // Actual email integration here
    } else if (message.action === 'sendSMS') {
      console.log("SMS sent:", message.content);
      // Actual SMS integration here
    }
  });
  