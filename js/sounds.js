/* js/sounds.js — Procedural sound effects via Web Audio API */

var SFX = (function () {
  var ctx = null;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  // Rising pitch pop — satisfying cell fill
  // pitch shifts up slightly based on combo count for rapid painting
  var lastFillTime = 0;
  var combo = 0;

  function fillCell() {
    var c = getCtx();
    var now = c.currentTime;
    var realNow = Date.now();

    // Build combo for rapid fills (within 300ms)
    if (realNow - lastFillTime < 300) {
      combo = Math.min(combo + 1, 16);
    } else {
      combo = 0;
    }
    lastFillTime = realNow;

    // Base frequency rises with combo — pentatonic-ish scale feel
    var baseFreq = 440 + combo * 40;

    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + 0.06);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Soft thud — wrong color
  function wrongCell() {
    var c = getCtx();
    var now = c.currentTime;

    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Gentle click — color swatch selected
  function selectColor() {
    var c = getCtx();
    var now = c.currentTime;

    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Cheerful ascending arpeggio — one color fully completed
  function colorComplete() {
    var c = getCtx();
    var now = c.currentTime;
    var notes = [523, 659, 784, 1047]; // C5 E5 G5 C6

    for (var i = 0; i < notes.length; i++) {
      var osc = c.createOscillator();
      var gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);

      osc.type = 'sine';
      var t = now + i * 0.1;
      osc.frequency.setValueAtTime(notes[i], t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.start(t);
      osc.stop(t + 0.25);
    }
  }

  // Celebration fanfare — sheet complete!
  function sheetComplete() {
    var c = getCtx();
    var now = c.currentTime;

    // Two-part fanfare: rising arpeggio then sparkle
    var fanfare = [523, 659, 784, 1047, 1319, 1568]; // C5 E5 G5 C6 E6 G6
    for (var i = 0; i < fanfare.length; i++) {
      var osc = c.createOscillator();
      var gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);

      osc.type = 'sine';
      var t = now + i * 0.12;
      osc.frequency.setValueAtTime(fanfare[i], t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.start(t);
      osc.stop(t + 0.5);
    }

    // Sparkle shimmer after the arpeggio
    var sparkleStart = now + fanfare.length * 0.12 + 0.1;
    for (var j = 0; j < 8; j++) {
      var osc2 = c.createOscillator();
      var gain2 = c.createGain();
      osc2.connect(gain2);
      gain2.connect(c.destination);

      osc2.type = 'sine';
      var st = sparkleStart + j * 0.06;
      var freq = 1800 + Math.random() * 1200;
      osc2.frequency.setValueAtTime(freq, st);

      gain2.gain.setValueAtTime(0, st);
      gain2.gain.linearRampToValueAtTime(0.08, st + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, st + 0.2);

      osc2.start(st);
      osc2.stop(st + 0.2);
    }
  }

  // Panel slide-in whoosh
  function panelSlideIn() {
    var c = getCtx();
    var now = c.currentTime;

    // Filtered noise via oscillator sweep
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  return {
    fillCell: fillCell,
    wrongCell: wrongCell,
    selectColor: selectColor,
    colorComplete: colorComplete,
    sheetComplete: sheetComplete,
    panelSlideIn: panelSlideIn
  };
})();
