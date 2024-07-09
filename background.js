const MYEFREE_BASE_URL = "https://portal.myefree.tech";

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        // get cookies from https://www.myefrei.fr/
        chrome.cookies.getAll({domain: "www.myefrei.fr", name: "myefrei.sid"}, function(cookies) {
            fetch("https://www.myefrei.fr/user").then(response => {
                if (cookies.length > 0 && response.ok && response.url === "https://www.myefrei.fr/user") {
                    // set tab URL to MYEFREE_BASE_URL/auth/myefree-connect?myefrei.sid=<cookie>
                    chrome.tabs.update(details.tabId, {url: `${MYEFREE_BASE_URL}/auth/myefree-connect?myefrei.sid=${encodeURIComponent(cookies[0].value)}`});
                }
                else {
                    // launch myefrei login page
                    chrome.tabs.update(details.tabId, {url: "https://www.myefrei.fr/auth/efrei"});
                    // when the URL becomes https://www.myefrei.fr/portal/*, the cookie is set
                    // we need to redirect to MYEFREE_BASE_URL/auth/myefree-connect?myefrei.sid=<cookie>
                    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
                        if (tabId === details.tabId && changeInfo.url && changeInfo.url.startsWith("https://www.myefrei.fr/portal/")) {
                            chrome.cookies.getAll({domain: "www.myefrei.fr", name: "myefrei.sid"}, function(cookies) {
                                if (cookies.length > 0) {
                                    chrome.tabs.update(details.tabId, {url: `${MYEFREE_BASE_URL}/auth/myefree-connect?myefrei.sid=${encodeURIComponent(cookies[0].value)}`});
                                }
                            });
                        }
                    });
                }
            })
        });
        return {redirectUrl: `${MYEFREE_BASE_URL}/auth/myefree-connect`};
    },
    {urls: ["https://connect.myefree.tech/useConnect"]},
    ["blocking"]
);
