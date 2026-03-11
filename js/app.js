/* js/app.js — Home screen: card rendering, localStorage nav, fullscreen */

(function () {
  var sheetGrid = document.getElementById('sheet-grid');
  var banner = document.getElementById('fullscreen-banner');

  var sheetIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  for (var i = 0; i < sheetIds.length; i++) {
    var id = sheetIds[i];
    var data = window['SHEET_DATA_' + id];
    if (!data) continue;

    var card = document.createElement('div');
    card.className = 'sheet-card';
    card.dataset.sheet = id;

    // Render pixel art thumbnail from colorGrid data
    var thumb = document.createElement('div');
    thumb.className = 'sheet-card-thumb';
    var thumbGrid = document.createElement('div');
    thumbGrid.className = 'thumb-grid';
    thumbGrid.style.gridTemplateColumns = 'repeat(' + data.gridSize + ', 1fr)';
    thumbGrid.style.gridTemplateRows = 'repeat(' + data.gridSize + ', 1fr)';
    for (var r = 0; r < data.gridSize; r++) {
      for (var c = 0; c < data.gridSize; c++) {
        var px = document.createElement('div');
        px.style.backgroundColor = data.palette[data.colorGrid[r][c]];
        thumbGrid.appendChild(px);
      }
    }
    thumb.appendChild(thumbGrid);

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
