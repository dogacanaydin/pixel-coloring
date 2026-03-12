/* js/audio-ctx.js — Shared AudioContext for all audio (music + SFX) */

var AudioCtx = (function () {
  // Create context immediately — iOS will put it in 'suspended' state
  var ctx = new (window.AudioContext || window.webkitAudioContext)();

  function get() {
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  // Unlock on every gesture type — resume is idempotent
  function unlock() {
    if (ctx.state === 'suspended') ctx.resume();
  }

  document.addEventListener('touchstart', unlock, { passive: true });
  document.addEventListener('touchend', unlock, { passive: true });
  document.addEventListener('click', unlock, { passive: true });

  return { get: get };
})();
