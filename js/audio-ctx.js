/* js/audio-ctx.js — Shared AudioContext for all audio (music + SFX) */

var AudioCtx = (function () {
  var ctx = null;

  function get() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  // Ensure context is resumed on first user gesture
  function unlock() {
    var c = get();
    if (c.state === 'suspended') c.resume();
  }

  document.addEventListener('touchstart', unlock, { passive: true, once: true });
  document.addEventListener('click', unlock, { once: true });

  return { get: get };
})();
