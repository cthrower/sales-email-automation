document.addEventListener('DOMContentLoaded', async () => {
    const apiKeyForm = document.getElementById('apiKeyForm');
    
    chrome.storage.local.get(['apiKeyPhonely', 'apiKeySbf', 'apiKeyDatasoap'], function(result) {
        if (!result.apiKeyPhonely || !result.apiKeySbf || !result.apiKeyDatasoap) {
            apiKeyForm.classList.remove('hidden');
        } else {
            apiKeyForm.classList.add('hidden');
        }
    });
});

document.getElementById('saveKeys').addEventListener('click', () => {
    const phonelyKey = document.getElementById('phonelyKey').value.trim();
    const sbfKey = document.getElementById('sbfKey').value.trim();
    const datasoapKey = document.getElementById('datasoapKey').value.trim();
    
    if (!phonelyKey || !sbfKey || !datasoapKey) {
        alert('Please enter all API keys');
        return;
    }
    
    chrome.storage.local.set({
        apiKeyPhonely: phonelyKey,
        apiKeySbf: sbfKey,
        apiKeyDatasoap: datasoapKey
    }, function() {
        if (chrome.runtime.lastError) {
            alert('Error saving API keys: ' + chrome.runtime.lastError.message);
        } else {
            document.getElementById('apiKeyForm').classList.add('hidden');
        }
    });
});