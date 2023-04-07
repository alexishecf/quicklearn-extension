chrome.contextMenus.create({
  id: 'quick-learn-context-menu',
  title: 'Learn',
  contexts: ['selection'],
});

let selectedText = '';
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'quick-learn-context-menu') {
    learnSelectedText(info.selectionText);
  }
});

function learnSelectedText(text) {
  selectedText = text;

  chrome.windows.create(
    {
      url: chrome.runtime.getURL('gui.html'),
      type: 'popup',
      width: 600,
      height: 400,
    },
    function (window) {}
  );
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'window_loaded') {
    console.log('window_loaded');

    sendResponse({ text: selectedText });
  }
});
