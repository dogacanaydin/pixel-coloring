/* js/music.js — Background music via Web Audio API GainNode (works on iOS) */

var Music = (function () {
  function init(src, volume) {
    var vol = volume || 0.15;
    var ctx = null;
    var gainNode = null;
    var source = null;
    var audio = new Audio(src);
    audio.loop = true;
    audio.volume = 1; // iOS ignores this, but set it anyway

    function startMusic() {
      if (ctx) return; // already started
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = ctx.createGain();
      gainNode.gain.value = vol;
      source = ctx.createMediaElementSource(audio);
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      audio.play().then(function () {
        document.removeEventListener('touchstart', startMusic);
        document.removeEventListener('click', startMusic);
      }).catch(function () {
        // Reset so next interaction retries
        ctx = null;
      });
    }

    document.addEventListener('touchstart', startMusic, { passive: true });
    document.addEventListener('click', startMusic, { passive: true });
  }

  return { init: init };
})();
