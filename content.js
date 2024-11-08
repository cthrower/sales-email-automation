// Function to handle checkbox clicks and check if the task is completed
function handleCheckboxClick(event) {
  
  if (window.location.href.includes('opportunity')){

   // Check if the clicked element is a checkbox with the class 'form-checkbox__input'
    if (event.target.classList.contains('form-checkbox__input')) {
      console.log('Task marked as complete!')

      //only inject html if not already present
      if (!document.getElementById('custom-injected-popup')){
        injectCustomHTML();

      }
    }
  }
}

// function to inject html into page
function injectCustomHTML() {

  // container for custom html 
  const container = document.createElement('div')
  container.id = 'custom-injected-popup'
  container.innerHTML = `
    <div class="injected-content">
      <p>Was this call answered?</p>
      <button id="answered">Yes</button>
      <button id="unanswered">No</button>
    </div>
  `
  // add container to body
  document.body.appendChild(container)

  // add listeners for button clicks on injected html 
  document.getElementById('answered').addEventListener('click',()=>{removeCustomHTML()})

  document.getElementById('unanswered').addEventListener('click',()=>{
    removeCustomHTML();
    chrome.runtime.sendMessage({ action: "sendToZapier" });
  })

}

// function to remove popup once button clicked
function removeCustomHTML() {
  const popup = document.getElementById('custom-injected-popup')
  if(popup){
    popup.remove()
  }
}



// Add an event listener to detect clicks on checkboxes with the specific class
document.addEventListener('click', handleCheckboxClick);
