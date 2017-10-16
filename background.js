const TITLE_APPLY = "Use Cached";
const TITLE_REMOVE = "Back to Source";
const TITLE_FAILED = "Cached page dosen't exist!"
const CACHE_SERVICE_URL = "//webcache.googleusercontent.com/search?q=cache:";
const CACHE_SERVICE_HOST = "webcache.googleusercontent.com";

// https://stackoverflow.com/a/333657/6431190
function UrlExists(url, callback)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url);
    http.onreadystatechange = function() {
        if (this.readyState == this.DONE) {
            callback(this.status != 404);
        }
    };
    http.send();
}

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
  if (!tab.url.startsWith("http")) {
    return;
  }
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

  if (isGoogleCached(tab.url)) {
    chrome.tabs.update(tab.id, {url: parseSourceUrl(tab.url)});
  } else {
    cachedUrl = genCachedUrl(tab.url);
    UrlExists(cachedUrl, function(hasCache) {
      if (hasCache) {
        chrome.tabs.update(tab.id, {url: genCachedUrl(tab.url)});
      } else {
        chrome.pageAction.setIcon({tabId: tab.id, path: "icons/fail.svg"});
        chrome.pageAction.setTitle({tabId: tab.id, title: TITLE_FAILED});
      }
    });
  }


});
