// ===== Music Player Module =====

const Player = (() => {
  let audio = new Audio();
  let currentIndex = -1;
  let isPlaying = false;
  let shuffleMode = 'off'; // off, on, repeat
  let queue = [...SONGS];
  let originalQueue = [...SONGS];

  // DOM elements
  const els = {};

  function init() {
    els.playBtn = document.getElementById('play-btn');
    els.playIcon = document.getElementById('play-icon');
    els.prevBtn = document.getElementById('prev-btn');
    els.nextBtn = document.getElementById('next-btn');
    els.shuffleBtn = document.getElementById('shuffle-btn');
    els.repeatBtn = document.getElementById('repeat-btn');
    els.seekBar = document.getElementById('seek-bar');
    els.currentTime = document.getElementById('current-time');
    els.totalTime = document.getElementById('total-time');
    els.playerProgress = document.getElementById('player-progress');
    els.playerTitle = document.getElementById('player-title');
    els.playerArtist = document.getElementById('player-artist');
    els.playerPoster = document.getElementById('player-poster');
    els.playerFavBtn = document.getElementById('player-fav-btn');
    els.volumeBar = document.getElementById('volume-bar');
    els.volumeBtn = document.getElementById('volume-btn');
    els.volumeIcon = document.getElementById('volume-icon');
    els.queueBtn = document.getElementById('queue-btn');
    els.queuePanel = document.getElementById('queue-panel');
    els.queueClose = document.getElementById('queue-close');
    els.queueList = document.getElementById('queue-list');

    audio.volume = 0.8;
    bindEvents();
    renderQueue();
  }

  function bindEvents() {
    // Play/Pause
    els.playBtn.addEventListener('click', togglePlay);

    // Prev/Next
    els.prevBtn.addEventListener('click', playPrev);
    els.nextBtn.addEventListener('click', playNext);

    // Shuffle
    els.shuffleBtn.addEventListener('click', cycleShuffle);

    // Repeat
    els.repeatBtn.addEventListener('click', cycleShuffle);

    // Seek
    els.seekBar.addEventListener('input', () => {
      const seekTo = (els.seekBar.value / 100) * audio.duration;
      audio.currentTime = seekTo;
    });

    // Volume
    els.volumeBar.addEventListener('input', () => {
      audio.volume = els.volumeBar.value / 100;
      updateVolumeIcon();
    });

    els.volumeBtn.addEventListener('click', () => {
      if (audio.volume > 0) {
        audio.dataset.prevVolume = audio.volume;
        audio.volume = 0;
        els.volumeBar.value = 0;
      } else {
        audio.volume = parseFloat(audio.dataset.prevVolume || 0.8);
        els.volumeBar.value = audio.volume * 100;
      }
      updateVolumeIcon();
    });

    // Audio events
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', () => {
      els.totalTime.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('ended', handleSongEnd);
    audio.addEventListener('play', () => { isPlaying = true; updatePlayUI(); });
    audio.addEventListener('pause', () => { isPlaying = false; updatePlayUI(); });

    // Player fav button
    els.playerFavBtn.addEventListener('click', () => {
      if (currentIndex >= 0) {
        App.toggleFavorite(queue[currentIndex].id);
        updatePlayerFavBtn();
      }
    });

    // Queue
    els.queueBtn.addEventListener('click', () => {
      els.queuePanel.classList.toggle('open');
    });

    els.queueClose.addEventListener('click', () => {
      els.queuePanel.classList.remove('open');
    });

    // Progress bar click
    document.querySelector('.player-progress-bar').addEventListener('click', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });
  }

  function loadSong(index) {
    if (index < 0 || index >= queue.length) return;
    currentIndex = index;
    const song = queue[index];

    audio.src = song.audio;
    audio.load();

    els.playerTitle.textContent = song.name;
    els.playerArtist.textContent = song.artist;
    els.playerPoster.src = song.poster;

    updatePlayerFavBtn();
    renderQueue();
    updateAllSongRows();

    // Add to recently played
    App.addToRecent(song.id);
  }

  function loadUploadedSong(song) {
    // Set queue to just this uploaded song
    queue = [song];
    currentIndex = 0;

    audio.src = song.audio;
    audio.load();

    els.playerTitle.textContent = song.name;
    els.playerArtist.textContent = song.artist;
    els.playerPoster.src = song.poster;

    audio.play().catch(() => {});
    isPlaying = true;
    updatePlayUI();
    renderQueue();
    updateAllSongRows();
  }

  function play(index) {
    if (index !== undefined) {
      loadSong(index);
    }
    audio.play().catch(() => {});
    isPlaying = true;
    updatePlayUI();
  }

  function togglePlay() {
    if (currentIndex < 0) {
      play(0);
      return;
    }
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }

  function playPrev() {
    if (currentIndex < 0) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prev = (currentIndex - 1 + queue.length) % queue.length;
    play(prev);
  }

  function playNext() {
    if (currentIndex < 0) return;
    const next = (currentIndex + 1) % queue.length;
    play(next);
  }

  function handleSongEnd() {
    if (shuffleMode === 'repeat') {
      audio.currentTime = 0;
      audio.play();
    } else if (shuffleMode === 'on') {
      let rand;
      do { rand = Math.floor(Math.random() * queue.length); } while (rand === currentIndex && queue.length > 1);
      play(rand);
    } else {
      playNext();
    }
  }

  function cycleShuffle() {
    const modes = ['off', 'on', 'repeat'];
    const idx = modes.indexOf(shuffleMode);
    shuffleMode = modes[(idx + 1) % modes.length];

    els.shuffleBtn.classList.toggle('active', shuffleMode === 'on');
    els.repeatBtn.classList.toggle('active', shuffleMode === 'repeat');

    const labels = { off: 'Shuffle off', on: 'Shuffle on', repeat: 'Repeat one' };
    App.toast(labels[shuffleMode], 'info');
  }

  function updateProgress() {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    els.seekBar.value = pct;
    els.playerProgress.style.width = pct + '%';
    els.currentTime.textContent = formatTime(audio.currentTime);
  }

  function updatePlayUI() {
    if (isPlaying) {
      els.playIcon.className = 'bi bi-pause-fill';
    } else {
      els.playIcon.className = 'bi bi-play-fill';
    }

    // Update all playing indicators
    document.querySelectorAll('.song-row').forEach(row => {
      row.classList.toggle('playing', parseInt(row.dataset.id) === queue[currentIndex]?.id);
    });

    // Update quick cards
    document.querySelectorAll('.quick-card').forEach(card => {
      card.classList.toggle('playing', parseInt(card.dataset.id) === queue[currentIndex]?.id);
    });
  }

  function updateVolumeIcon() {
    if (audio.volume === 0) {
      els.volumeIcon.className = 'bi bi-volume-mute-fill';
    } else if (audio.volume < 0.5) {
      els.volumeIcon.className = 'bi bi-volume-down-fill';
    } else {
      els.volumeIcon.className = 'bi bi-volume-up-fill';
    }
  }

  function updatePlayerFavBtn() {
    if (currentIndex < 0) return;
    const song = queue[currentIndex];
    const isFav = App.isFavorite(song.id);
    els.playerFavBtn.classList.toggle('active', isFav);
    els.playerFavBtn.querySelector('i').className = isFav ? 'bi bi-heart-fill' : 'bi bi-heart';
  }

  function updateAllSongRows() {
    const currentId = currentIndex >= 0 ? queue[currentIndex].id : -1;
    document.querySelectorAll('.song-row').forEach(row => {
      const id = parseInt(row.dataset.id);
      row.classList.toggle('playing', id === currentId);

      const numEl = row.querySelector('.col-num');
      if (id === currentId && isPlaying) {
        numEl.innerHTML = '<div class="playing-anim"><span></span><span></span><span></span><span></span></div>';
      } else {
        numEl.textContent = row.dataset.num;
      }
    });
  }

  function renderQueue() {
    els.queueList.innerHTML = '';
    queue.forEach((song, i) => {
      const item = document.createElement('div');
      item.className = 'queue-item' + (i === currentIndex ? ' active' : '');
      item.innerHTML = `
        <img src="${song.poster}" alt="">
        <div class="queue-item-info">
          <h4>${song.name}</h4>
          <p>${song.artist}</p>
        </div>
      `;
      item.addEventListener('click', () => play(i));
      els.queueList.appendChild(item);
    });
  }

  function setQueue(songs) {
    queue = songs.length ? [...songs] : [...SONGS];
    renderQueue();
  }

  function resetQueue() {
    queue = [...SONGS];
    renderQueue();
  }

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function getQueue() { return queue; }
  function getCurrentSong() { return currentIndex >= 0 ? queue[currentIndex] : null; }
  function getCurrentIndex() { return currentIndex; }
  function getIsPlaying() { return isPlaying; }

  return {
    init,
    play,
    togglePlay,
    playPrev,
    playNext,
    loadSong,
    loadUploadedSong,
    setQueue,
    resetQueue,
    getQueue,
    getCurrentSong,
    getCurrentIndex,
    getIsPlaying,
    updatePlayerFavBtn,
    updateAllSongRows
  };
})();
