/* js/setup.js — Image sampling: reads reference PNG → outputs data.js content */

(function () {
  var fileInput = document.getElementById('file-input');
  var gridSizeInput = document.getElementById('grid-size');
  var sheetNumInput = document.getElementById('sheet-num');
  var paletteInput = document.getElementById('palette-input');
  var titleInput = document.getElementById('sheet-title');
  var previewCanvas = document.getElementById('preview-canvas');
  var outputArea = document.getElementById('output');
  var generateBtn = document.getElementById('generate-btn');
  var copyBtn = document.getElementById('copy-btn');
  var previewGrid = document.getElementById('preview-grid');

  var loadedImage = null;

  fileInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      loadedImage = img;
      previewCanvas.width = img.width;
      previewCanvas.height = img.height;
      var ctx = previewCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      previewCanvas.style.display = 'block';
      generateBtn.disabled = false;
    };
    img.src = url;
  });

  generateBtn.addEventListener('click', function () {
    if (!loadedImage) return;

    var gridSize = parseInt(gridSizeInput.value) || 12;
    var sheetNum = parseInt(sheetNumInput.value) || 1;
    var title = titleInput.value.trim() || 'Sheet ' + sheetNum;
    var paletteHexes = paletteInput.value.split('\n')
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return /^#[0-9a-fA-F]{6}$/.test(s); });

    if (paletteHexes.length < 2) {
      alert('Enter at least 2 valid hex colors (e.g. #FF0000), one per line.');
      return;
    }

    // Draw image to offscreen canvas to get pixel data
    var canvas = document.createElement('canvas');
    canvas.width = loadedImage.width;
    canvas.height = loadedImage.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(loadedImage, 0, 0);
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    var cellW = loadedImage.width / gridSize;
    var cellH = loadedImage.height / gridSize;

    var colorGrid = [];

    for (var row = 0; row < gridSize; row++) {
      var rowData = [];
      for (var col = 0; col < gridSize; col++) {
        // Sample 3x3 region at cell center
        var cx = Math.floor(col * cellW + cellW / 2);
        var cy = Math.floor(row * cellH + cellH / 2);
        var pixels = [];

        for (var dy = -1; dy <= 1; dy++) {
          for (var dx = -1; dx <= 1; dx++) {
            var px = Math.min(Math.max(cx + dx, 0), loadedImage.width - 1);
            var py = Math.min(Math.max(cy + dy, 0), loadedImage.height - 1);
            var idx = (py * loadedImage.width + px) * 4;
            var a = data[idx + 3];
            if (a > 128) { // non-transparent
              pixels.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
            }
          }
        }

        var avg = averageRgb(pixels);
        var paletteIdx = nearestPaletteIndex(avg, paletteHexes);
        rowData.push(paletteIdx);
      }
      colorGrid.push(rowData);
    }

    // Generate output
    var output = 'window.SHEET_DATA_' + sheetNum + ' = {\n';
    output += '  title: "' + title.replace(/"/g, '\\"') + '",\n';
    output += '  gridSize: ' + gridSize + ',\n';
    output += '  palette: [' + paletteHexes.map(function (h) { return '"' + h + '"'; }).join(', ') + '],\n';
    output += '  colorGrid: [\n';
    for (var r = 0; r < colorGrid.length; r++) {
      output += '    [' + colorGrid[r].join(',') + ']';
      if (r < colorGrid.length - 1) output += ',';
      output += '\n';
    }
    output += '  ]\n';
    output += '};\n';

    outputArea.value = output;
    copyBtn.disabled = false;

    // Show preview grid
    renderPreviewGrid(gridSize, paletteHexes, colorGrid);
  });

  copyBtn.addEventListener('click', function () {
    outputArea.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    setTimeout(function () { copyBtn.textContent = 'Copy to Clipboard'; }, 2000);
  });

  function renderPreviewGrid(gridSize, palette, grid) {
    previewGrid.innerHTML = '';
    previewGrid.style.display = 'grid';
    previewGrid.style.gridTemplateColumns = 'repeat(' + gridSize + ', 1fr)';
    previewGrid.style.width = '300px';
    previewGrid.style.height = '300px';
    previewGrid.style.gap = '1px';
    previewGrid.style.margin = '16px auto';

    for (var r = 0; r < gridSize; r++) {
      for (var c = 0; c < gridSize; c++) {
        var cell = document.createElement('div');
        cell.style.backgroundColor = palette[grid[r][c]];
        previewGrid.appendChild(cell);
      }
    }
  }
})();
