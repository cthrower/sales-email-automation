async function getURL() {
  try {
    const tabs = await new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(tabs);
        }
      });
    });

    const tab = tabs[0];
    return tab.url;
  } catch (error) {
    console.log("Error fetching URL", error);
    throw error;
  }
}

let isSkype = false;

async function sendToZapier() {

  const pageURL = await getURL();
  console.log("url is", pageURL)
  const data = { url: pageURL, isSkype: isSkype };
  const zapierWebhookURL = "https://hooks.zapier.com/hooks/catch/2016169/251pvib/";

  fetch(zapierWebhookURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      console.log("response", response);

      if (response.ok) {
        console.log("Data sent to Zapier successfully!");
      } else {
        return response.json().then((error) => {
          console.error("Error sending data to Zapier:", error);
        });
      }
    })
    .catch((error) => {
      console.error("Network error:", error);
    });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "sendToZapier") {
    isSkype = message.data;
    sendToZapier();
  }
});

function handleUrlChange(details) {
  chrome.tabs.sendMessage(details.tabId, { action: "urlChanged" });
}
