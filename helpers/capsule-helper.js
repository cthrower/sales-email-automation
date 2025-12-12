// Helper function to get the Capsule API key based on current URL
async function getCapsuleApiKey() {
    return new Promise((resolve, reject) => {
        // Determine which key to use based on current URL
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const capsuleKeyName = (url && url.includes('switchboardfree.capsulecrm')) ? 'apiKeySbf' : 'apiKeyPhonely';
        
        chrome.storage.local.get(capsuleKeyName, function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else if (!result[capsuleKeyName]) {
                const keyType = capsuleKeyName === 'apiKeySbf' ? 'SBF' : 'Phonely';
                reject(new Error(`${keyType} API key not found. Please set up your API keys.`));
            } else {
                resolve(result[capsuleKeyName]);
            }
        });
    });
}

async function getCapsulePartyData(partyId, capsuleApiKey) {
    // If no API key provided, fetch it automatically
    if (!capsuleApiKey) {
        capsuleApiKey = await getCapsuleApiKey();
    }

    const response = await fetch(`https://api.capsulecrm.com/api/v2/parties/${partyId}?embed=fields`, {
        headers: {
            'Authorization': `Bearer ${capsuleApiKey}`
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Safely extract email if it exists
    const email = data.party.emailAddresses &&
        data.party.emailAddresses.length > 0 &&
        data.party.emailAddresses[0].address
        ? data.party.emailAddresses[0].address
        : null;

    // Safely extract phone if it exists
    const phone = data.party.phoneNumbers &&
        data.party.phoneNumbers.length > 0 &&
        data.party.phoneNumbers[0].number
        ? data.party.phoneNumbers[0].number
        : null;

    const firstName = data.party.firstName;

    return { email, phone, firstName };
}

async function getLastAutoSmsDate(partyId, capsuleApiKey) {
    // If no API key provided, fetch it automatically
    if (!capsuleApiKey) {
        capsuleApiKey = await getCapsuleApiKey();
    }

    const response = await fetch(`https://api.capsulecrm.com/api/v2/parties/${partyId}?embed=fields`, {
        headers: {
            'Authorization': `Bearer ${capsuleApiKey}`
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const lastAutoSmsField = data.party.fields?.find(
        field => field.definition?.name === "Last Auto SMS"
    );

    const lastAutoSmsDate = lastAutoSmsField?.value || null;

    return lastAutoSmsDate;
}

async function updateLastAutoSmsDate(partyId, capsuleApiKey) {
    // If no API key provided, fetch it automatically
    if (!capsuleApiKey) {
        capsuleApiKey = await getCapsuleApiKey();
    }

    // Format today's date as YYYY-MM-DD in local timezone
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayFormatted = `${year}-${month}-${day}`;

    const body = {
        party: {
            fields: [
                {
                    definition: { name: "Last Auto SMS" },
                    value: todayFormatted
                }
            ]
        }
    }

    const response = await fetch(`https://api.capsulecrm.com/api/v2/parties/${partyId}?embed=fields`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            method: 'PUT',
            'Authorization': `Bearer ${capsuleApiKey}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true, message: "Last auto SMS date updated successfully" };
}

// Make available globally for content.js (non-module context)
if (typeof window !== 'undefined') {
    window.CapsuleHelper = window.CapsuleHelper || {};
    window.CapsuleHelper.getCapsulePartyData = getCapsulePartyData;
    window.CapsuleHelper.getLastAutoSmsDate = getLastAutoSmsDate;
    window.CapsuleHelper.updateLastAutoSmsDate = updateLastAutoSmsDate;
}
