/* js/music.js — Background music, starts on first user interaction */

(function () {
  var audio = new Audio('assets/Assets_Scenes_Home_Sounds_background_audio_home_bg_main_master.mp3');
  audio.loop = true;
  audio.volume = 0.25;

  function startMusic() {
    audio.play().then(function () {
      // Success — remove listeners
      document.removeEventListener('touchstart', startMusic);
      document.removeEventListener('click', startMusic);
    }).catch(function () {
      // Autoplay blocked — keep listeners for next interaction
    });
  }

  // passive: true so we never interfere with scrolling
  document.addEventListener('touchstart', startMusic, { passive: true });
  document.addEventListener('click', startMusic, { passive: true });
})();
