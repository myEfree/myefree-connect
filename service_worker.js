let loginTabId = null;  // To store the tab ID of the login page launched by the extension

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

const MYEFREE_BASE_URL = "https://portal.myefree.tech";

async function isCookieValid() {
  try {
    const userReq = await fetch("https://www.myefrei.fr/user", {
      method: "GET",
      credentials: "include",
      redirect: "manual"
    });
    return userReq.status === 200 && userReq.url === "https://www.myefrei.fr/user";
  } catch (e) {
    return false;
  }
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkAndRedirect") {
    chrome.tabs.update(sender.tab.id, { url: `${request.myefreeBaseUrl}/auth/myefree-connect` });
    chrome.cookies.getAll({ domain: "www.myefrei.fr", name: "myefrei.sid" }, (cookies) => {
      if (cookies.length > 0) {
        // Redirect the tab to MYEFREE_BASE_URL with the cookie value
        isCookieValid().then((valid) => {
          if (valid) {
            return chrome.tabs.update(sender.tab.id, { url: `${request.myefreeBaseUrl}/auth/myefree-connect?myefrei.sid=${encodeURIComponent(cookies[0].value)}` });
          } else {
            // Launch the login page and store the tab ID
            chrome.tabs.update(sender.tab.id, { url: "https://www.myefrei.fr/auth/efrei" }, (tab) => {
              loginTabId = tab.id;  // Store the tab ID where the login page is opened
            });
          }
        });
      } else {
        // Launch the login page and store the tab ID
        chrome.tabs.update(sender.tab.id, { url: "https://www.myefrei.fr/auth/efrei" }, (tab) => {
          loginTabId = tab.id;  // Store the tab ID where the login page is opened
        });
      }
    });
  }
});

// Listen for tab updates to detect when the user reaches the portal URL in the login tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if this is the login tab and the URL has changed to the portal URL
  if (tabId === loginTabId && changeInfo.url && changeInfo.url.startsWith("https://www.myefrei.fr/portal/")) {
    // Check if the necessary cookie is set
    chrome.cookies.getAll({ domain: "www.myefrei.fr", name: "myefrei.sid" }, (cookies) => {
      if (cookies.length > 0) {
        // Redirect the tab to MYEFREE_BASE_URL/auth/myefree-connect with the cookie value
        chrome.tabs.update(tabId, { url: `${MYEFREE_BASE_URL}/auth/myefree-connect?myefrei.sid=${encodeURIComponent(cookies[0].value)}` });

        // Clear the loginTabId after the redirection to avoid accidental future redirects
        loginTabId = null;
      }
    });
  }
});
