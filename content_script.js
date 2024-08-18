// Injected into pages that need to be checked for the cookie and redirected
(function() {
  // Define the base URL for MYEFREE_BASE_URL
  const MYEFREE_BASE_URL = "https://portal.myefree.tech";

  // Send a message to the service worker to check the cookie and handle redirection
  chrome.runtime.sendMessage({ action: "checkAndRedirect", myefreeBaseUrl: MYEFREE_BASE_URL });
})();
