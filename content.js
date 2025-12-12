async function handleCheckboxClick(event) {
  if (window.location.href.includes("opportunity")) {
    if (event.target.classList.contains("task-checkbox__input")) {

      // Check if popup already exists
      if (document.getElementById("custom-injected-popup")) {
        return;
      }

      // Get party ID from URL
      const partyId = await getPartyIdFromUrl();
      
      if (partyId) {
        try {
          // Get the actual party ID (person ID) - handles organisations
          const actualPartyId = await getActualPartyIdForContact(partyId);
          
          // Check the last auto SMS date using the actual party ID (person)
          const lastAutoSmsDate = await window.CapsuleHelper.getLastAutoSmsDate(actualPartyId);
          const response = await window.CapsuleHelper.getCapsulePartyData(actualPartyId);

          // Check if a mobile phone number was found
          // getCapsulePartyData now returns the first mobile number found, or null if none
          if (!response.phone) {
            window.alert("Cannot send SMS: Phone number is not a mobile number");
            return;
          }
          
          if (lastAutoSmsDate) {
            // Check if the date is within 24 hours
            if (isWithin24Hours(lastAutoSmsDate)) {
              return;
            }
          }
        } catch (error) {
          console.error("Error checking party data:", error);
          // If we can't get person from organisation, alert and return
          if (error.message && error.message.includes("No people found")) {
            window.alert(error.message);
            return;
          }
          // Continue with popup if there's an error checking the date (other errors)
        }
      }

      // Show popup if date check passes or if no date found
      injectCustomHTML();
    }
  }
}

function isWithin24Hours(dateString) {
  if (!dateString) return false;
  
  // Parse the date string (format: "2025-12-11")
  const lastSmsDate = new Date(dateString + "T00:00:00");
  const now = new Date();
  
  // Calculate the difference in milliseconds
  const diffMs = now - lastSmsDate;
  
  // Convert to hours (24 hours = 24 * 60 * 60 * 1000 ms)
  const diffHours = diffMs / (1000 * 60 * 60);
  
  // Return true if within 24 hours
  return diffHours < 24;
}

function injectCustomHTML() {
  const container = document.createElement("div");
  container.id = "custom-injected-popup";
  container.innerHTML = `
    <div class="injected-content">
      <button class="close-button" id="close-popup">×</button>
      <p>Was this call answered?</p>
      <button id="answered">Yes</button>
      <button id="unanswered">No</button>
    </div>
  `;
  document.body.appendChild(container);

  document.getElementById("close-popup").addEventListener("click", () => {
    removeCustomHTML();
  });

  document.getElementById("answered").addEventListener("click", () => {
    removeCustomHTML();
  });

  document.getElementById("unanswered").addEventListener("click", () => {
    // open second popup
    removeCustomHTML();
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      injectErrorPopup();
    }, 50);

  });
}

function injectErrorPopup() {
  const container = document.createElement("div");
  container.id = "custom-injected-error-popup";
  container.innerHTML = `
    <div class="injected-content">
      <button class="close-button" id="close-error-popup">×</button>
      <p>Send SMS</p>
    </div>
  `;
  document.body.appendChild(container);

  document.getElementById("close-error-popup").addEventListener("click", () => {
    removeSecondCustomHTML();
  });

  // Display SMS dropdown options immediately
  const errorPopup = document.getElementById("custom-injected-error-popup");
  const contentDiv = errorPopup.querySelector(".injected-content");
  
  if (!contentDiv) {
    return;
  }
  
  // Check if dropdown already exists to avoid duplicates
  if (!document.getElementById("sms-dropdown")) {
    const dropdownContainer = document.createElement("div");
    dropdownContainer.id = "sms-dropdown-container";
    
    // Sales person input
    const salesPersonLabel = document.createElement("label");
    salesPersonLabel.className = "sms-dropdown-label";
    salesPersonLabel.textContent = "Sales person:";
    
    const salesPersonInput = document.createElement("input");
    salesPersonInput.type = "text";
    salesPersonInput.id = "sales-person-input";
    salesPersonInput.className = "sales-person-input";
    salesPersonInput.placeholder = "Enter your name";
    
    const label = document.createElement("label");
    label.className = "sms-dropdown-label";
    label.textContent = "Select SMS option:";
    
    const dropdown = document.createElement("select");
    dropdown.id = "sms-dropdown";
    
    // Add 3 options
    const option1 = document.createElement("option");
    option1.value = "option1";
    option1.textContent = "Generic";
    
    const option2 = document.createElement("option");
    option2.value = "option2";
    option2.textContent = "Partial";
    
    const option3 = document.createElement("option");
    option3.value = "option3";
    option3.textContent = "Book a call";
    
    const option4 = document.createElement("option");
    option4.value = "option4";
    option4.textContent = "Custom";
    
    dropdown.appendChild(option1);
    dropdown.appendChild(option2);
    dropdown.appendChild(option3);
    dropdown.appendChild(option4);
    
    // Custom message textarea (initially hidden)
    const customMessageLabel = document.createElement("label");
    customMessageLabel.className = "sms-dropdown-label";
    customMessageLabel.textContent = "Custom message:";
    customMessageLabel.id = "custom-message-label";
    customMessageLabel.style.display = "none";
    
    const customMessageTextarea = document.createElement("textarea");
    customMessageTextarea.id = "custom-message-textarea";
    customMessageTextarea.className = "custom-message-textarea";
    customMessageTextarea.placeholder = "Enter your custom SMS message";
    customMessageTextarea.rows = 4;
    customMessageTextarea.style.display = "none";
    
    // Show/hide custom message field and enable/disable sales person input based on dropdown selection
    dropdown.addEventListener("change", () => {
      if (dropdown.value === "option4") {
        customMessageLabel.style.display = "block";
        customMessageTextarea.style.display = "block";
        salesPersonInput.disabled = true;
        salesPersonLabel.style.opacity = "0.5";
      } else {
        customMessageLabel.style.display = "none";
        customMessageTextarea.style.display = "none";
        salesPersonInput.disabled = false;
        salesPersonLabel.style.opacity = "1";
      }
    });
    
    // Add submit button
    const submitButton = document.createElement("button");
    submitButton.id = "submit-option";
    submitButton.textContent = "Submit";
    
    submitButton.addEventListener("click", () => {
      const selectedOption = dropdown.value;
      
      // Validate custom message if custom option is selected
      if (selectedOption === "option4") {
        const customMessage = customMessageTextarea.value.trim();
        if (!customMessage) {
          alert("Please enter a custom message");
          return;
        }
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        sendCustomMessageToBackend(customMessage, submitButton);
        return;
      }
      
      // For other options, require sales person
      const salesPerson = salesPersonInput.value.trim();
      if (!salesPerson) {
        alert("Please enter a sales person name");
        return;
      }
      
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
      sendOptionToBackend(selectedOption, submitButton, salesPerson);
    });
    
    dropdownContainer.appendChild(salesPersonLabel);
    dropdownContainer.appendChild(salesPersonInput);
    dropdownContainer.appendChild(label);
    dropdownContainer.appendChild(dropdown);
    dropdownContainer.appendChild(customMessageLabel);
    dropdownContainer.appendChild(customMessageTextarea);
    dropdownContainer.appendChild(submitButton);
    
    contentDiv.appendChild(dropdownContainer);
  }
}

function removeCustomHTML() {
  const popup = document.getElementById('custom-injected-popup')
  if(popup){
    popup.remove()
  }
}

function removeSecondCustomHTML() {
  const popup = document.getElementById('custom-injected-error-popup')
  if(popup){
    popup.remove()
  }
}

function displayMessage(message, isSuccess) {
  const popup = document.getElementById('custom-injected-error-popup');
  if (!popup) return;
  
  const contentDiv = popup.querySelector(".injected-content");
  if (!contentDiv) return;
  
  // Remove existing message if any
  const existingMessage = contentDiv.querySelector(".status-message");
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create message element
  const messageDiv = document.createElement("div");
  messageDiv.className = "status-message";
  messageDiv.style.cssText = `
    padding: 10px;
    margin: 10px 0;
    border-radius: 4px;
    text-align: center;
    font-weight: bold;
    ${isSuccess ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
  `;
  messageDiv.textContent = message;
  
  // Insert message at the top of content (but after the close button)
  const closeButton = contentDiv.querySelector(".close-button");
  if (closeButton) {
    contentDiv.insertBefore(messageDiv, closeButton.nextSibling);
  } else {
    contentDiv.insertBefore(messageDiv, contentDiv.firstChild);
  }
}

async function getPartyIdFromUrl() {
  const url = window.location.href;
  
  // First, try to get party ID directly from URL
  const partyRegex = /\/party\/([^\/]+)/;
  const partyMatch = url.match(partyRegex);
  
  if (partyMatch && partyMatch[1]) {
    return partyMatch[1];
  }
  
  // If no party ID in URL, check if it's an opportunity URL
  const opportunityRegex = /\/opportunity\/([^\/]+)/;
  const opportunityMatch = url.match(opportunityRegex);
  
  if (opportunityMatch && opportunityMatch[1]) {
    const opportunityId = opportunityMatch[1];
    
    try {
      return await window.CapsuleHelper.getPartyIdFromOpportunity(opportunityId);
    } catch (error) {
      console.error('Error fetching party ID from opportunity:', error);
      return null;
    }
  }
  
  return null;
}

async function getActualPartyIdForContact(partyId) {
  // Check if party is an organisation or person
  const partyType = await window.CapsuleHelper.getPartyType(partyId);
  
  // If it's an organisation, get the first person's ID
  if (partyType === "organisation") {
    const firstPerson = await window.CapsuleHelper.getFirstPersonFromOrganisation(partyId);
    if (!firstPerson || !firstPerson.id) {
      throw new Error("No people found in organisation");
    }
    return firstPerson.id.toString();
  }
  
  // If it's a person, return the party ID as is
  return partyId;
}

async function sendOptionToBackend(selectedOption, submitButton, salesPerson) {
  const partyId = await getPartyIdFromUrl();
  
  if (!partyId) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
    }
    displayMessage("Error: Could not determine party ID", false);
    return;
  }
  
  // Get the actual party ID (person ID) - handles organisations
  let actualPartyId;
  try {
    actualPartyId = await getActualPartyIdForContact(partyId);
  } catch (error) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
    }
    displayMessage("Error: " + error.message, false);
    return;
  }
  
  // Check if chrome.runtime is available
  if (!chrome || !chrome.runtime) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
    }
    displayMessage("Extension context invalidated. Please reload the page.", false);
    return;
  }

  try {
    chrome.runtime.sendMessage({
      action: "sendOptionToBackend",
      data: {
        option: selectedOption,
        partyId: actualPartyId,
        salesPerson: salesPerson
      }
    }, (response) => {
      // Reset button state
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit";
      }
      
      if (chrome.runtime.lastError) {
        const errorMsg = chrome.runtime.lastError.message.includes("Extension context invalidated") 
          ? "Extension was reloaded. Please refresh the page." 
          : chrome.runtime.lastError.message;
        displayMessage("Error: " + errorMsg, false);
      } else if (response) {
        if (response.success) {
          displayMessage(response.message || "SMS sent successfully!", true);
        } else {
          displayMessage(response.message || "Failed to send SMS. Please try again.", false);
        }
      }
    });
  } catch (error) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
    }
    displayMessage("Error: " + error.message, false);
  }
}

async function sendCustomMessageToBackend(customMessage, submitButton) {
  const partyId = await getPartyIdFromUrl();
  
  if (!partyId) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
    }
    displayMessage("Error: Could not determine party ID", false);
    return;
  }
  
  // Get the actual party ID (person ID) - handles organisations
  let actualPartyId;
  try {
    actualPartyId = await getActualPartyIdForContact(partyId);
  } catch (error) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
    }
    displayMessage("Error: " + error.message, false);
    return;
  }
  
  // Check if chrome.runtime is available
  if (!chrome || !chrome.runtime) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
    }
    displayMessage("Extension context invalidated. Please reload the page.", false);
    return;
  }

  try {
    chrome.runtime.sendMessage({
      action: "sendCustomMessageToBackend",
      data: {
        message: customMessage,
        partyId: actualPartyId
      }
    }, (response) => {
      // Reset button state
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit";
      }
      
      if (chrome.runtime.lastError) {
        const errorMsg = chrome.runtime.lastError.message.includes("Extension context invalidated") 
          ? "Extension was reloaded. Please refresh the page." 
          : chrome.runtime.lastError.message;
        displayMessage("Error: " + errorMsg, false);
      } else if (response) {
        if (response.success) {
          displayMessage(response.message || "SMS sent successfully!", true);
        } else {
          displayMessage(response.message || "Failed to send SMS. Please try again.", false);
        }
      }
    });
  } catch (error) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
    }
    displayMessage("Error: " + error.message, false);
  }
}


document.addEventListener("click", handleCheckboxClick);
