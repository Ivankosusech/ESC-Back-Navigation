const toggle = document.getElementById("toggle");
const statusText = document.getElementById("statusText");
const currentSite = document.getElementById("currentSite");

// Отображение текущего сайта
if (currentSite) {
  currentSite.textContent = window.location.hostname || 'chrome://';
}

// Загрузка состояния при открытии popup
chrome.storage.sync.get(["escEnabled"], function (result) {
  const enabled = result.escEnabled ?? true;
  toggle.checked = enabled;
  if (statusText) {
    updateStatus(enabled);
  }
});

// Обработка переключателя
toggle.addEventListener("change", function () {
  const enabled = toggle.checked;
  chrome.storage.sync.set({
    escEnabled: enabled
  }, function() {
    if (statusText) {
      updateStatus(enabled);
    }
    // Уведомляем content script об изменении
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "toggleEsc",
          enabled: enabled
        });
      }
    });
  });
});

// Обновление текста статуса
function updateStatus(enabled) {
  if (enabled) {
    statusText.textContent = "Активно";
    statusText.style.color = "#4CAF50";
  } else {
    statusText.textContent = "Отключено";
    statusText.style.color = "#f44336";
  }
}

// Обработка ошибок
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getStatus") {
    sendResponse({enabled: toggle.checked});
  }
});