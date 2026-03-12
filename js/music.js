/* js/music.js — Background music, page-specific, starts on first user interaction */

var Music = (function () {
  var audio = null;

  function init(src, volume) {
    audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume || 0.15;

    function startMusic() {
      audio.play().then(function () {
        document.removeEventListener('touchstart', startMusic);
        document.removeEventListener('click', startMusic);
      }).catch(function () {});
    }

    // passive: true so we never interfere with scrolling
    document.addEventListener('touchstart', startMusic, { passive: true });
    document.addEventListener('click', startMusic, { passive: true });
  }

  return { init: init };
})();
