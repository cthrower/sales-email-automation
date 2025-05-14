function handleCheckboxClick(event) {
  if (window.location.href.includes("opportunity")) {
    if (event.target.classList.contains("task-checkbox__input")) {
      console.log("Task marked as complete!");

      if (!document.getElementById("custom-injected-popup")) {
        injectCustomHTML();
      }
    }
  }
}

function injectCustomHTML() {
  const container = document.createElement("div");
  container.id = "custom-injected-popup";
  container.innerHTML = `
    <div class="injected-content">
      <p>Was this call answered?</p>
      <button id="answered">Yes</button>
      <button id="unanswered">No</button>
    </div>
  `;
  document.body.appendChild(container);

  document.getElementById("answered").addEventListener("click", () => {
    removeCustomHTML();
  });

  document.getElementById("unanswered").addEventListener("click", () => {
    const opportunity = document.querySelector(".entity-details__title");
    const opportunityName = opportunity.textContent.trim();
    if (opportunityName.includes("skype" || "Skype")) {
      removeCustomHTML();
      injectSkypePopup();
    } else {
      removeCustomHTML();
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: "sendToZapier", data: false });
      } else {
        console.error("chrome.runtime.sendMessage is undefined");
      }
    }
  });
}

function injectSkypePopup() {
  const container = document.createElement("div");
  container.id = "custom-injected-popup";
  container.innerHTML = `
    <div class="injected-content">
      <p>Is this Skype number cut off?</p>
      <button id="cut-off">Yes</button>
      <button id="not-cut-off">No</button>
    </div>
  `;
  document.body.appendChild(container);

  document.getElementById("cut-off").addEventListener("click", () => {
    removeCustomHTML();
    console.log("is anything happening?")
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: "sendToZapier", data: true });
    } else {
      console.error("chrome.runtime.sendMessage is undefined");
    }
  });

  document.getElementById("not-cut-off").addEventListener("click", () => {
    removeCustomHTML();
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: "sendToZapier", data: false });
    } else {
      console.error("chrome.runtime.sendMessage is undefined");
    }
  });
}

function removeCustomHTML() {
  const popup = document.getElementById('custom-injected-popup')
  if(popup){
    popup.remove()
  }
}

document.addEventListener("click", handleCheckboxClick);
