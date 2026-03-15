let escEnabled = true;
let eventListener = null;

// Список исключений (убрал Gmail!)
const excludedDomains = [
  'docs.google.com',
  'sheets.google.com',
  'slides.google.com'
];

// Проверка состояния функции при загрузке страницы
chrome.storage.sync.get(["escEnabled"], function (result) {
  escEnabled = result.escEnabled ?? true;
  if (escEnabled && !isExcludedSite()) {
    enableEscNavigation();
  }
});

// Слушаем изменения из popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleEsc") {
    escEnabled = request.enabled;
    if (escEnabled && !isExcludedSite()) {
      enableEscNavigation();
    } else {
      disableEscNavigation();
    }
  }
  if (request.action === "getStatus") {
    sendResponse({enabled: escEnabled});
  }
  return true;
});

// Проверка на исключённые сайты
function isExcludedSite() {
  try {
    return excludedDomains.includes(window.location.hostname);
  } catch (e) {
    return false;
  }
}

// Функция включения навигации
function enableEscNavigation() {
  if (eventListener) {
    return;
  }
  
  eventListener = function(event) {
    if (event.key === "Escape") {
      // Не срабатываем в полях ввода
      if (isInputFocused()) {
        return;
      }
      
      // Проверяем есть ли история назад
      if (window.history.length > 1) {
        showBackIndicator();
        window.history.back();
      }
    }
  };
  
  try {
    document.addEventListener("keydown", eventListener);
  } catch (e) {
    console.error('ESC Navigation error:', e);
  }
}

// Функция выключения навигации
function disableEscNavigation() {
  if (eventListener) {
    try {
      document.removeEventListener("keydown", eventListener);
    } catch (e) {}
    eventListener = null;
  }
}

// Проверка фокуса на полях ввода
function isInputFocused() {
  try {
    const activeElement = document.activeElement;
    return activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT' ||
      activeElement.isContentEditable
    );
  } catch (e) {
    return false;
  }
}

// Визуальный индикатор перехода назад
function showBackIndicator() {
  try {
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px 30px;
      border-radius: 8px;
      font-size: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 999999;
      pointer-events: none;
      animation: fadeInOut 0.5s ease-in-out;
    `;
    indicator.textContent = '← Назад';
    document.body.appendChild(indicator);
    
    setTimeout(() => {
      indicator.remove();
    }, 500);
  } catch (e) {}
}

// Добавляем анимацию
try {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
      50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    }
  `;
  document.head.appendChild(style);
} catch (e) {}