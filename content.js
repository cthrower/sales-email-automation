// Simulate a task completion check (replace with real API check if available)
function checkForCompletedTask() {
  // Assuming a specific class or id indicates task completion in Capsule CRM
  const taskCompleted = document.querySelector('.task-complete');
  
  if (taskCompleted) {
    chrome.runtime.sendMessage({ action: 'showPopup' });
  }
}

// Monitor DOM changes (simplified; may need fine-tuning for Capsule CRM)
new MutationObserver(checkForCompletedTask).observe(document.body, {
  childList: true,
  subtree: true
});
