const TITLE_APPLY = "Use Cached";
const TITLE_REMOVE = "Back to Source";
const CACHE_SERVICE_URL = "https://webcache.googleusercontent.com/search?q=cache:";
const CACHE_SERVICE_HOST = "webcache.googleusercontent.com";

// checks if google cahced-page or not
isGoogleCached = function(url) {
  if (url.includes(CACHE_SERVICE_HOST) && url.includes("?q=cache:")) {
    return true;
  } else {
    return false;
  }
}

// generate google cached page url
genCachedUrl = function(url) {
  return CACHE_SERVICE_URL + url;
}

//parse source url from cache service url
parseSourceUrl = function(url) {
  cacheUrl = new URL(url);
  parsed =  cacheUrl.searchParams.get("q");
  return parsed.replace("cache:", "");
}

//init page icon behaviour
function initializePageAction(tab) {
  if (isGoogleCached(tab.url)) {
    chrome.pageAction.setIcon({tabId: tab.id, path: "icons/on.svg"});
    chrome.pageAction.setTitle({tabId: tab.id, title: TITLE_REMOVE});
  } else {
    chrome.pageAction.setIcon({tabId: tab.id, path: "icons/off.svg"});
    chrome.pageAction.setTitle({tabId: tab.id, title: TITLE_APPLY});
  }
  chrome.pageAction.show(tab.id);
}

//apply init-func on each tab (first load)
chrome.tabs.query({}, (tabs) => {
  for (tab of tabs) {
    initializePageAction(tab);
  }
});


// tab listener
chrome.tabs.onUpdated.addListener((id, changeInfo, tab) => {
  initializePageAction(tab);
});

// tab icon click event
chrome.pageAction.onClicked.addListener(function(tab) {
  initializePageAction(tab);

  if (isGoogleCached(tab.url)) {
    chrome.tabs.update(tab.id, {url: parseSourceUrl(tab.url)});
  } else {
    chrome.tabs.update(tab.id, {url: genCachedUrl(tab.url)});
  }
});
