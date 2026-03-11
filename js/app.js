/* js/app.js — Home screen: card rendering, localStorage nav, fullscreen */

(function () {
  var sheetGrid = document.getElementById('sheet-grid');
  var banner = document.getElementById('fullscreen-banner');

  var sheetIds = [1, 2, 3, 4, 5];

  for (var i = 0; i < sheetIds.length; i++) {
    var id = sheetIds[i];
    var data = window['SHEET_DATA_' + id];
    if (!data) continue;

    var card = document.createElement('div');
    card.className = 'sheet-card';
    card.dataset.sheet = id;

    var thumb = document.createElement('div');
    thumb.className = 'sheet-card-thumb';
    thumb.style.backgroundImage = 'url(sheets/sheet' + id + '/artwork.png)';
    thumb.style.backgroundSize = 'cover';
    thumb.style.backgroundPosition = 'center';

    var titleEl = document.createElement('div');
    titleEl.className = 'sheet-card-title';
    titleEl.textContent = data.title || 'Sheet ' + id;

    card.appendChild(thumb);
    card.appendChild(titleEl);
    sheetGrid.appendChild(card);

    card.addEventListener('click', (function (sheetId) {
      return function () {
        enterFullscreen();
        localStorage.setItem('currentSheet', sheetId);
        window.location.href = 'color.html';
      };
    })(id));
  }

  // Fullscreen
  function enterFullscreen() {
    var el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(function () {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else {
      showFullscreenBanner();
    }
  }

  function showFullscreenBanner() {
    if (!banner) return;
    banner.classList.remove('hidden');
    setTimeout(function () {
      banner.classList.add('hidden');
    }, 5000);
  }

  // Check fullscreen support — show banner hint if not available
  if (!document.documentElement.requestFullscreen && !document.documentElement.webkitRequestFullscreen) {
    showFullscreenBanner();
  }
})();
