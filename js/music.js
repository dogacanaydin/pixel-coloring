/* js/music.js — Background music, starts on first user interaction */

(function () {
  var audio = new Audio('assets/Assets_Scenes_Home_Sounds_background_audio_home_bg_main_master.mp3');
  audio.loop = true;
  audio.volume = 0.5;

  var started = false;

  function startMusic() {
    if (started) return;
    started = true;
    audio.play().catch(function () {
      // Autoplay blocked — retry on next interaction
      started = false;
    });
  }

  // iOS Safari requires user gesture to play audio
  document.addEventListener('touchstart', startMusic, { once: false });
  document.addEventListener('click', startMusic, { once: false });
})();
