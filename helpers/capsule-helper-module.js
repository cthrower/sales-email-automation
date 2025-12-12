// Module version for background.js (ES6 modules)
// This file re-exports the functions from capsule-helper.js for use in background service worker

// Since we can't import from a non-module file, we'll duplicate the functions here
// but they're the same implementation

function findFirstMobileNumber(phoneNumbers) {
    if (!phoneNumbers || phoneNumbers.length === 0) {
        return null;
    }

    // Iterate through all phone numbers to find the first mobile number
    for (const phoneObj of phoneNumbers) {
        if (phoneObj && phoneObj.number) {
            // Normalize phone number (remove spaces, dashes, parentheses, plus signs, etc.)
            const normalizedPhone = phoneObj.number.replace(/[\s\-\(\)+]/g, '');
            
            // Check if it's a mobile number (starts with 07 or 447)
            if (normalizedPhone.startsWith('07') || normalizedPhone.startsWith('447')) {
                return phoneObj.number; // Return the original number (not normalized)
            }
        }
    }

    // No mobile number found
    return null;
}

export async function getCapsulePartyData(partyId, capsuleApiKey) {
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

    // Find first mobile number from all phone numbers
    const phone = findFirstMobileNumber(data.party.phoneNumbers);

    const firstName = data.party.firstName;

    return { email, phone, firstName };
}

export async function getLastAutoSmsDate(partyId, capsuleApiKey) {
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

export async function updateLastAutoSmsDate(partyId, capsuleApiKey) {
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
            'Authorization': `Bearer ${capsuleApiKey}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true, message: "Last auto SMS date updated successfully" };
}

