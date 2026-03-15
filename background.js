// Обработка нажатий клавиш на уровне браузера
chrome.commands.onCommand.addListener(function(command) {
  if (command === "go-back") {
    goBack();
  }
});

// Сообщения от content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "goBack") {
    goBack();
    sendResponse({success: true});
  }
  if (request.action === "canGoBack") {
    chrome.tabs.get(sender.tab.id, function(tab) {
      sendResponse({canGoBack: tab.url !== 'chrome://newtab/'});
    });
    return true;
  }
});

// Функция перехода назад
function goBack() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      const currentUrl = tabs[0].url;
      
      // Если это chrome:// страница - закрываем вкладку или переходим на новую
      if (currentUrl.startsWith('chrome://') || currentUrl.startsWith('about:')) {
        chrome.tabs.remove(tabs[0].id);
      } else {
        // Для обычных сайтов используем history API
        chrome.history.search({text: '', maxResults: 100}, function(historyItems) {
          const currentIndex = historyItems.findIndex(item => item.url === currentUrl);
          
          if (currentIndex >= 0 && currentIndex < historyItems.length - 1) {
            const previousUrl = historyItems[currentIndex + 1].url;
            chrome.tabs.update(tabs[0].id, {url: previousUrl});
          } else {
            // Если нет истории - закрываем вкладку
            chrome.tabs.remove(tabs[0].id);
          }
        });
      }
    }
  });
}

// Отслеживание навигации
chrome.webNavigation.onCommitted.addListener(function(details) {
  if (details.frameId === 0) {
    // Главная фрейм изменился
    chrome.tabs.get(details.tabId, function(tab) {
      if (tab.active) {
        // Можно добавить логирование или обновление состояния
      }
    });
  }
});