document.getElementById('yes').addEventListener('click', () => {
    window.close();
  });
  
  document.getElementById('no').addEventListener('click', () => {
    sendFollowUp();
    window.close();
  });
  
  function sendFollowUp() {
    // Placeholder data for demonstration
    const emailContent = {
      to: "prospect@example.com",
      subject: "Follow-up on missed call",
      body: "Hello, we missed your call. Please reach back at your convenience."
    };
  
    const smsContent = {
      to: "1234567890",
      message: "We missed your call. Contact us at your convenience."
    };
  
    // Replace with Capsule CRM API integration or backend service
    console.log("Sending email:", emailContent);
    console.log("Sending SMS:", smsContent);
    
    // Placeholder: Replace with real API calls
    chrome.runtime.sendMessage({ action: 'sendEmail', content: emailContent });
    chrome.runtime.sendMessage({ action: 'sendSMS', content: smsContent });
  }
  