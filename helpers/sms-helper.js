export async function sendOptionSms(phone, option, firstName, salesPerson, datasoapApiKey, from) {

    console.log("FROM:", from);

    const url = "https://api.datasoap.co.uk/v1/sms/single";
    const to = phone;
    let message;

    if (from === "07460377764") {
        if (option === "option1") {
            message = "Hi " + firstName + ". Thank you for your interest in SwitchboardFREE. \n\nI just tried to call but couldn't reach you. Don't worry — I'll try calling you back soon! In the meantime, if you'd like to chat or have any questions, I'm ready to help — just give me a ring on 0203 189 1213.\n\nLooking forward to speaking with you!\n\nWarm regards,\n" + salesPerson + "- SwitchboardFREE";
        } else if (option === "option2") {
            message = "Hi " + firstName + ". I received an enquiry for a digital landline service, and just tried to call to discuss it. If you are wondering how this can work for you or how much this would cost, please get back in touch on 0203 189 1213.\n\nLooking forward to speaking with you!\n\nWarm regards,\n" + salesPerson + "- SwitchboardFREE";
        } else if (option === "option3") {
            message = "Hi " + firstName + ". I have tried to get in touch a few times but haven't been able to reach you. Please could you let me know a good time to call you back? Or you can book a call in using this link: https://calendly.com/switchboardfree/discovery .\n\nLooking forward to speaking with you!\n\nWarm regards,\n" + salesPerson + "- SwitchboardFREE";
        }
    } else if (from === "07700140222") {
        if (option === "option1") {
            message = "Hi " + firstName + ". Thank you for your interest in Phonely. \n\nI just tried to call but couldn't reach you. Don't worry — I'll try calling you back soon! In the meantime, if you'd like to chat or have any questions, I'm ready to help — just give me a ring on 0800 112 5000.\n\nLooking forward to speaking with you!\n\nWarm regards,\n" + salesPerson + "- Phonely";
        } else if (option === "option2") {
            message = "Hi " + firstName + ". I received an enquiry for a digital landline service, and just tried to call to discuss it. If you are wondering how this can work for you or how much this would cost, please get back in touch on 0800 112 5000.\n\nLooking forward to speaking with you!\n\nWarm regards,\n" + salesPerson + "- Phonely";
        } else if (option === "option3") {
            message = "Hi " + firstName + ". I have tried to get in touch a few times but haven't been able to reach you. Please could you let me know a good time to call you back? Or you can book a call in using this link: https://calendly.com/phonely_uk/callback .\n\nLooking forward to speaking with you!\n\nWarm regards,\n" + salesPerson + "- Phonely";
        }
    }

    const data = {
        to: to,
        from: from,
        message: message,
    };

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + datasoapApiKey,
        },
        body: JSON.stringify(data),
    };

    try {
        const res = await fetch(url, options);
        const json = await res.json();

        if (!res.ok) {
            console.error("Error sending sms", json);
            throw new Error(json.message || "Failed to send SMS");
        } else {
            console.log("SMS sent successfully");
            return { success: true, message: "SMS sent successfully!" };
        }
    } catch (error) {
        console.error("Error sending sms:", error);
        throw new Error(error.message || "Failed to send SMS. Please try again.");
    }
}

export async function sendCustomSms(phone, message, datasoapApiKey, from) {

    const url = "https://api.datasoap.co.uk/v1/sms/single";
    const to = phone;

    const data = {
        to: to,
        from: from,
        message: message,
    };

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + datasoapApiKey,
        },
        body: JSON.stringify(data),
    };

    try {
        const res = await fetch(url, options);
        const json = await res.json();

        if (!res.ok) {
            console.error("Error sending sms", json);
            throw new Error(json.message || "Failed to send SMS");
        } else {
            console.log("SMS sent successfully");
            return { success: true, message: "SMS sent successfully!" };
        }
    } catch (error) {
        console.error("Error sending sms:", error);
        throw new Error(error.message || "Failed to send SMS. Please try again.");
    }
}