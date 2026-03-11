/* js/utils.js — Color math utilities shared by setup and runtime */

function hexToRgb(hex) {
  var h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16)
  };
}

function rgbToHex(r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function rgbDistance(a, b) {
  var dr = a.r - b.r;
  var dg = a.g - b.g;
  var db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function nearestPaletteIndex(rgb, palette) {
  var bestIdx = 0;
  var bestDist = Infinity;
  for (var i = 0; i < palette.length; i++) {
    var pRgb = hexToRgb(palette[i]);
    var d = rgbDistance(rgb, pRgb);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function averageRgb(pixels) {
  // pixels: array of {r, g, b}
  if (pixels.length === 0) return { r: 0, g: 0, b: 0 };
  var sumR = 0, sumG = 0, sumB = 0;
  for (var i = 0; i < pixels.length; i++) {
    sumR += pixels[i].r;
    sumG += pixels[i].g;
    sumB += pixels[i].b;
  }
  var n = pixels.length;
  return {
    r: Math.round(sumR / n),
    g: Math.round(sumG / n),
    b: Math.round(sumB / n)
  };
}
