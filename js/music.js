/* js/music.js — Background music through shared AudioContext */

var Music = (function () {
  function init(src, volume) {
    var vol = volume || 0.15;
    var started = false;

    function startMusic() {
      if (started) return;
      started = true;

      var ctx = AudioCtx.get();
      var audio = new Audio(src);
      audio.loop = true;
      audio.crossOrigin = 'anonymous';

      var source = ctx.createMediaElementSource(audio);
      var gainNode = ctx.createGain();
      gainNode.gain.value = vol;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      audio.play().then(function () {
        document.removeEventListener('touchstart', startMusic);
        document.removeEventListener('click', startMusic);
      }).catch(function () {
        started = false;
      });
    }

    document.addEventListener('touchstart', startMusic, { passive: true });
    document.addEventListener('click', startMusic, { passive: true });
  }

  return { init: init };
})();
