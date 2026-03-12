/* js/music.js — Background music via Web Audio API decodeAudioData (reliable on iOS) */

var Music = (function () {
  function init(src, volume) {
    var vol = volume || 0.15;
    var started = false;

    function startMusic() {
      if (started) return;
      started = true;

      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();

      var xhr = new XMLHttpRequest();
      xhr.open('GET', src, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function () {
        ctx.decodeAudioData(xhr.response, function (buffer) {
          var gainNode = ctx.createGain();
          gainNode.gain.value = vol;
          gainNode.connect(ctx.destination);

          function playLoop() {
            var source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(gainNode);
            source.onended = playLoop;
            source.start(0);
          }
          playLoop();

          document.removeEventListener('touchstart', startMusic);
          document.removeEventListener('click', startMusic);
        }, function () {
          // Decode failed — allow retry
          started = false;
        });
      };
      xhr.onerror = function () {
        started = false;
      };
      xhr.send();
    }

    document.addEventListener('touchstart', startMusic, { passive: true });
    document.addEventListener('click', startMusic, { passive: true });
  }

  return { init: init };
})();
