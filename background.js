chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.includes('capsulecrm.com')) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["content.js"]
      });
    }
  });

  async function getURL(){
    try{
  
      const tabs = await new Promise((resolve, reject) => {

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
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
      console.log('Error fetching URL', error)
      throw error
    }
  
  }
  
  async function sendToZapier(){
  
    const pageURL = await getURL()
    const data = {url:pageURL}
    const zapierWebhookURL = 'https://hooks.zapier.com/hooks/catch/2016169/251pvib/'

    fetch(zapierWebhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (response.ok) {
        console.log('URL sent to Zapier successfully!');
      } else {
        return response.json().then(error => {
          console.error('Error sending URL to Zapier:', error);
        });
      }
    })
    .catch(error => {
      console.error('Network error:', error);
    })
  
  }
  

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'sendToZapier') {
      sendToZapier();
    }
  })

  