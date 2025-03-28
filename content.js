function handleCheckboxClick(event) {
  
  if (window.location.href.includes('opportunity')){

    if (event.target.classList.contains('task-checkbox__input')) {
      console.log('Task marked as complete!')

      if (!document.getElementById('custom-injected-popup')){
        injectCustomHTML();

      }
    }
  }
}

function injectCustomHTML() {

  const container = document.createElement('div')
  container.id = 'custom-injected-popup'
  container.innerHTML = `
    <div class="injected-content">
      <p>Was this call answered?</p>
      <button id="answered">Yes</button>
      <button id="unanswered">No</button>
    </div>
  `
  document.body.appendChild(container)

  document.getElementById('answered').addEventListener('click',()=>{removeCustomHTML()})

  document.getElementById('unanswered').addEventListener('click',()=>{
    removeCustomHTML();
    chrome.runtime.sendMessage({ action: "sendToZapier" });
  })

}

function removeCustomHTML() {
  const popup = document.getElementById('custom-injected-popup')
  if(popup){
    popup.remove()
  }
}

document.addEventListener('click', handleCheckboxClick);
