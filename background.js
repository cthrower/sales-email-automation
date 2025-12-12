import { getCapsulePartyData, updateLastAutoSmsDate } from './helpers/capsule-helper-module.js';
import { sendOptionSms, sendCustomSms } from './helpers/sms-helper.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendOptionToBackend") {
    sendOptionToBackend(request.data.option, request.data.partyId, request.data.salesPerson)
      .then((result) => {
        sendResponse({ success: true, message: result.message });
      })
      .catch((error) => {
        console.error("Error in sendOptionToBackend:", error);
        sendResponse({ success: false, message: error.message || "Failed to send SMS. Please try again." });
      });
    return true; // Indicates we will send a response asynchronously

  } else if (request.action === "sendCustomMessageToBackend") {
    sendCustomMessageToBackend(request.data.message, request.data.partyId)
      .then((result) => {
        sendResponse({ success: true, message: result.message });
      })
      .catch((error) => {
        console.error("Error in sendCustomMessageToBackend:", error);
        sendResponse({ success: false, message: error.message || "Failed to send SMS. Please try again." });
      });
    return true; // Indicates we will send a response asynchronously
  }
});

async function sendOptionToBackend(option, partyId, salesPerson) {
  console.log("Sending option to backend:", option, "for party:", partyId, "from sales person:", salesPerson);
  const { datasoapApiKey, capsuleApiKey, capsuleKeyType } = await getApiKeys();
  console.log("Datasoap API key:", datasoapApiKey, "Capsule API key:", capsuleApiKey);
  let from = "";

  if (capsuleKeyType === "apiKeySbf") {
    from = "07460377764";
  } else {
    from = "07700140222";
  }

  const capsulePartyData = await getCapsulePartyData(partyId, capsuleApiKey);
  const result = await sendOptionSms(capsulePartyData.phone, option, capsulePartyData.firstName, salesPerson, datasoapApiKey, from);
  await updateLastAutoSmsDate(partyId, capsuleApiKey);
  return result;
}

async function sendCustomMessageToBackend(message, partyId) {
  console.log("Sending custom message to backend for party:", partyId);
  const { datasoapApiKey, capsuleApiKey, capsuleKeyType } = await getApiKeys();
  let from = "";

  if (capsuleKeyType === "apiKeySbf") {
    from = "07460377764";
  } else {
    from = "07700140222";
  }

  const capsulePartyData = await getCapsulePartyData(partyId, capsuleApiKey);
  const result = await sendCustomSms(capsulePartyData.phone, message, datasoapApiKey, from);
  await updateLastAutoSmsDate(partyId, capsuleApiKey);
  return result;
}

function getApiKeysFromStorage(url) {
  return new Promise((resolve, reject) => {
    // Determine which Capsule CRM key to fetch
    const capsuleKeyName = (url && url.includes('switchboardfree.capsulecrm')) ? 'apiKeySbf' : 'apiKeyPhonely';

    // Fetch both DataSoap and Capsule CRM API keys
    chrome.storage.local.get(['apiKeyDatasoap', capsuleKeyName], function (result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      // Check DataSoap API key
      if (!result.apiKeyDatasoap) {
        reject(new Error('DataSoap API key not found. Please set up your API keys.'));
        return;
      }

      // Check Capsule CRM API key
      const capsuleKey = result[capsuleKeyName];
      if (!capsuleKey) {
        const keyType = capsuleKeyName === 'apiKeySbf' ? 'SBF' : 'Phonely';
        reject(new Error(`${keyType} API key not found. Please set up your API keys.`));
        return;
      }

      // Resolve with both keys and the key type
      resolve({
        datasoapApiKey: result.apiKeyDatasoap,
        capsuleApiKey: capsuleKey,
        capsuleKeyType: capsuleKeyName // 'apiKeySbf' or 'apiKeyPhonely'
      });
    });
  });
}

async function getApiKeys() {

  try {
    const focusedWindowId = await new Promise((resolve, reject) => {
      chrome.windows.getCurrent((window) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(window.id)
        }
      })
    })

    const tabs = await new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, windowId: focusedWindowId }, function (tabs) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(tabs);
        }
      });
    });

    if (!tabs || tabs.length === 0) {
      throw new Error('No active tab found in the focused window')
    }

    const tab = tabs[0];
    const url = tab.url;

    const apiKeys = await getApiKeysFromStorage(url);
    return apiKeys;

  } catch (error) {
    console.error("Error getting API keys:", error);
    throw error;
  }
}