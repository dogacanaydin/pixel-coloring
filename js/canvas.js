/* js/canvas.js — Coloring screen: grid build, touch handling, progress, feedback */

(function () {
  var sheetId = parseInt(localStorage.getItem('currentSheet')) || 1;
  var sheetData = window['SHEET_DATA_' + sheetId];

  if (!sheetData) {
    alert('Sheet data not found for sheet ' + sheetId);
    window.location.href = 'index.html';
    return;
  }

  var gridSize = sheetData.gridSize;
  var palette = sheetData.palette;
  var colorGrid = sheetData.colorGrid;
  var title = sheetData.title || 'Sheet ' + sheetId;

  var totalCells = gridSize * gridSize;
  var filledCount = 0;
  var filledCells = [];
  var selectedColor = 0;
  var lastWrongKey = null;
  var isComplete = false;

  // Initialize filled tracking
  for (var r = 0; r < gridSize; r++) {
    filledCells[r] = [];
    for (var c = 0; c < gridSize; c++) {
      filledCells[r][c] = false;
    }
  }

  // DOM refs
  var backBtn = document.getElementById('back-btn');
  var progressEl = document.getElementById('progress-text');
  var gridContainer = document.getElementById('grid-container');
  var gridBg = document.getElementById('grid-bg');
  var pixelGrid = document.getElementById('pixel-grid');
  var palettePanel = document.getElementById('palette-panel');

  // Grayscale background no longer needed — each cell computes its own grayscale color
  // gridBg.style.backgroundImage = 'url(sheets/sheet' + sheetId + '/artwork.png)';

  // Build grid
  pixelGrid.style.gridTemplateColumns = 'repeat(' + gridSize + ', 1fr)';
  pixelGrid.style.gridTemplateRows = 'repeat(' + gridSize + ', 1fr)';

  for (var row = 0; row < gridSize; row++) {
    for (var col = 0; col < gridSize; col++) {
      var cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.dataset.correct = colorGrid[row][col];
      // Set grayscale version of the correct color as default background
      var rgb = hexToRgb(palette[colorGrid[row][col]]);
      var gray = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
      cell.style.backgroundColor = 'rgb(' + gray + ',' + gray + ',' + gray + ')';
      cell.dataset.grayColor = 'rgb(' + gray + ',' + gray + ',' + gray + ')';
      pixelGrid.appendChild(cell);
    }
  }

  // Pre-fill background cells (palette index 0) — skip from coloring
  var bgCells = pixelGrid.querySelectorAll('.grid-cell[data-correct="0"]');
  for (var b = 0; b < bgCells.length; b++) {
    var br = parseInt(bgCells[b].dataset.row);
    var bc = parseInt(bgCells[b].dataset.col);
    filledCells[br][bc] = true;
    bgCells[b].style.backgroundColor = palette[0];
    bgCells[b].classList.add('cell--filled');
    filledCount++;
  }

  // Build palette (skip index 0 — background)
  for (var i = 1; i < palette.length; i++) {
    var slot = document.createElement('div');
    slot.className = 'swatch-slot' + (i === 1 ? ' swatch-slot--selected' : '');
    slot.dataset.idx = i;

    var swatch = document.createElement('div');
    swatch.className = 'swatch' + (i === 1 ? ' swatch--selected' : '');
    swatch.dataset.idx = i;
    swatch.style.backgroundColor = palette[i];
    swatch.addEventListener('click', (function (idx) {
      return function () { selectColor(idx); };
    })(i));

    slot.appendChild(swatch);
    palettePanel.appendChild(slot);
  }

  // Slide in panel
  setTimeout(function () {
    palettePanel.classList.add('visible');
    SFX.panelSlideIn();
  }, 50);

  // Auto-select first non-background color
  selectColor(1);

  // Update progress display
  updateProgress();

  // Back button
  backBtn.addEventListener('click', function () {
    window.location.href = 'index.html';
  });

  // Fullscreen on first touch
  var didFullscreen = false;
  document.addEventListener('click', function () {
    if (didFullscreen) return;
    didFullscreen = true;
    enterFullscreen();
  }, { once: false });

  // === Touch handling ===
  pixelGrid.addEventListener('touchstart', function (e) {
    e.preventDefault();
    if (isComplete) return;
    var touch = e.touches[0];
    lastWrongKey = null;
    paintCellAtPoint(touch.clientX, touch.clientY);
  }, { passive: false });

  pixelGrid.addEventListener('touchmove', function (e) {
    e.preventDefault();
    if (isComplete) return;
    var touch = e.touches[0];
    paintCellAtPoint(touch.clientX, touch.clientY);
  }, { passive: false });

  pixelGrid.addEventListener('touchend', function () {
    lastWrongKey = null;
  });

  // Mouse support (for desktop testing)
  var mouseDown = false;
  pixelGrid.addEventListener('mousedown', function (e) {
    if (isComplete) return;
    mouseDown = true;
    lastWrongKey = null;
    paintCellAtPoint(e.clientX, e.clientY);
  });

  pixelGrid.addEventListener('mousemove', function (e) {
    if (!mouseDown || isComplete) return;
    paintCellAtPoint(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', function () {
    mouseDown = false;
    lastWrongKey = null;
  });

  // === Core functions ===

  function selectColor(idx) {
    selectedColor = idx;
    var slots = document.querySelectorAll('.swatch-slot');
    for (var s = 0; s < slots.length; s++) {
      var isSelected = parseInt(slots[s].dataset.idx) === idx;
      slots[s].classList.toggle('swatch-slot--selected', isSelected);
      var sw = slots[s].querySelector('.swatch');
      if (sw) sw.classList.toggle('swatch--selected', isSelected);
    }
    highlightCells();
    SFX.selectColor();
  }

  function highlightCells() {
    var cells = pixelGrid.querySelectorAll('.grid-cell');
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      if (cell.classList.contains('cell--filled')) continue;
      var isMatch = parseInt(cell.dataset.correct) === selectedColor;
      cell.classList.toggle('cell--highlighted', isMatch);
      // Restore grayscale bg when not highlighted (CSS animation overrides it when highlighted)
      if (!isMatch) {
        cell.style.backgroundColor = cell.dataset.grayColor;
      }
    }
  }

  function getCell(row, col) {
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return null;
    return pixelGrid.querySelector('.grid-cell[data-row="' + row + '"][data-col="' + col + '"]');
  }

  function paintCellAtPoint(clientX, clientY) {
    var el = document.elementFromPoint(clientX, clientY);
    if (!el || !el.classList.contains('grid-cell')) return;

    var row = parseInt(el.dataset.row);
    var col = parseInt(el.dataset.col);

    // 2x2 brush: tapped cell as top-left, shift if at edge
    var r0 = Math.min(row, gridSize - 2);
    var c0 = Math.min(col, gridSize - 2);
    var painted = false;
    var coords = [[r0,c0],[r0,c0+1],[r0+1,c0],[r0+1,c0+1]];
    for (var i = 0; i < coords.length; i++) {
      var cr = coords[i][0], cc = coords[i][1];
      if (filledCells[cr][cc]) continue;
      var target = getCell(cr, cc);
      if (!target) continue;
      var idx = parseInt(target.dataset.correct);
      if (selectedColor === idx) {
        painted = true;
        fillCell(target, cr, cc);
      }
    }
    if (!painted && !filledCells[row][col]) {
      var correctIdx = parseInt(el.dataset.correct);
      var cellKey = row + ',' + col;
      if (selectedColor !== correctIdx && cellKey !== lastWrongKey) {
        lastWrongKey = cellKey;
        showWrongFeedback(el);
        SFX.wrongCell();
      }
    } else {
      lastWrongKey = null;
    }
  }

  function fillCell(el, row, col) {
    filledCells[row][col] = true;
    var correctIdx = parseInt(el.dataset.correct);
    el.style.backgroundColor = palette[correctIdx];
    el.classList.add('cell--filled');
    el.classList.remove('cell--highlighted');
    SFX.fillCell();

    filledCount++;
    updateProgress();

    // Check if all cells of this color are done → dim swatch
    checkSwatchCompletion(correctIdx);

    if (filledCount === totalCells) {
      onComplete();
    }
  }

  function showWrongFeedback(el) {
    el.classList.remove('cell--wrong');
    // Force reflow to restart animation
    void el.offsetWidth;
    el.classList.add('cell--wrong');
    el.addEventListener('animationend', function () {
      el.classList.remove('cell--wrong');
    }, { once: true });
  }

  function updateProgress() {
    progressEl.textContent = filledCount + ' / ' + totalCells;
  }

  function checkSwatchCompletion(paletteIdx) {
    var cells = pixelGrid.querySelectorAll('.grid-cell');
    for (var i = 0; i < cells.length; i++) {
      if (parseInt(cells[i].dataset.correct) === paletteIdx && !cells[i].classList.contains('cell--filled')) {
        return; // still has unfilled cells
      }
    }
    // All cells of this color filled — dim the swatch
    var swatch = palettePanel.querySelector('.swatch[data-idx="' + paletteIdx + '"]');
    if (swatch) {
      swatch.classList.add('swatch--done');
    }
    SFX.colorComplete();
    // Auto-advance to next unfinished color
    autoAdvanceColor(paletteIdx);
  }

  function autoAdvanceColor(justFinished) {
    // Find next color that still has unfilled cells
    for (var i = 0; i < palette.length; i++) {
      var idx = (justFinished + 1 + i) % palette.length;
      var swatch = palettePanel.querySelector('.swatch[data-idx="' + idx + '"]');
      if (swatch && !swatch.classList.contains('swatch--done')) {
        selectColor(idx);
        return;
      }
    }
  }

  function onComplete() {
    isComplete = true;
    SFX.sheetComplete();
    // Step 1: slide out panel
    palettePanel.classList.remove('visible');
    // Step 2: reveal artwork after panel exits
    setTimeout(revealArtwork, 450);
  }

  function revealArtwork() {
    pixelGrid.classList.add('grid--complete');
    gridBg.classList.add('bg--hidden');
  }

  function enterFullscreen() {
    var el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }
})();
