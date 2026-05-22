// ===== App Module =====

const App = (() => {
  let favorites = JSON.parse(localStorage.getItem('luo_favorites') || '[]');
  let recentlyPlayed = JSON.parse(localStorage.getItem('luo_recent') || '[]');
  let uploadedSongs = [];
  let pendingAudioFile = null;
  let pendingCoverFile = null;

  // DOM
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarClose = document.getElementById('sidebar-close');
  const mainContent = document.getElementById('main');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchPageInput = document.getElementById('search-page-input');
  const searchPageResults = document.getElementById('search-page-results');
  const searchCategories = document.getElementById('search-categories');
  const playlistModal = document.getElementById('playlist-modal');
  const favCount = document.getElementById('fav-count');
  const uploadCount = document.getElementById('upload-count');

  async function init() {
    // Initialize upload database
    await Uploads.init();
    uploadedSongs = await Uploads.getAllSongs();
    updateUploadCount();

    Player.init();
    renderDiscoverPage();
    renderLibraryPage();
    bindEvents();
    updateFavCount();
    updateFavBadges();

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

    // Click outside to close search results
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-box')) {
        searchResults.classList.remove('show');
      }
    });

    // Mobile overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebar-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', closeSidebar);
  }

  function bindEvents() {
    // Sidebar toggle
    sidebarToggle.addEventListener('click', openSidebar);
    sidebarClose.addEventListener('click', closeSidebar);

    // Navigation
    document.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.page);
        closeSidebar();
      });
    });

    // Topbar search
    searchInput.addEventListener('input', handleTopSearch);
    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim()) handleTopSearch();
    });

    // Search page
    searchPageInput.addEventListener('input', handleSearchPage);

    // Hero buttons
    document.getElementById('hero-play-btn').addEventListener('click', () => {
      Player.resetQueue();
      Player.play(0);
    });

    document.getElementById('hero-shuffle-btn').addEventListener('click', () => {
      Player.resetQueue();
      const rand = Math.floor(Math.random() * SONGS.length);
      Player.play(rand);
    });

    // Category play buttons
    document.getElementById('luo-play-btn')?.addEventListener('click', () => {
      const luoSongs = SONGS.filter(s => s.category === 'luo');
      Player.setQueue(luoSongs);
      Player.play(0);
    });

    document.getElementById('bollywood-play-btn')?.addEventListener('click', () => {
      const bollySongs = SONGS.filter(s => s.category === 'bollywood');
      Player.setQueue(bollySongs);
      Player.play(0);
    });

    // Carousel buttons
    document.querySelectorAll('.carousel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        const dir = btn.dataset.dir === 'left' ? -300 : 300;
        target.scrollBy({ left: dir, behavior: 'smooth' });
      });
    });

    // Library tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderLibraryPage(btn.dataset.tab);
      });
    });

    // Create playlist modal
    document.getElementById('create-playlist-btn').addEventListener('click', () => {
      playlistModal.classList.add('show');
      document.getElementById('playlist-name-input').focus();
    });

    document.getElementById('modal-close').addEventListener('click', () => playlistModal.classList.remove('show'));
    document.getElementById('modal-cancel').addEventListener('click', () => playlistModal.classList.remove('show'));
    document.getElementById('modal-create').addEventListener('click', () => {
      const name = document.getElementById('playlist-name-input').value.trim();
      if (name) {
        toast('Playlist "' + name + '" created!', 'success');
        document.getElementById('playlist-name-input').value = '';
        playlistModal.classList.remove('show');
      }
    });

    // Category cards
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const text = card.textContent.trim().toLowerCase();
        searchPageInput.value = text;
        handleSearchPage();
      });
    });

    // See all links
    document.querySelectorAll('.see-all').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.page);
      });
    });

    // Upload page events
    bindUploadEvents();

    // My Uploads page events
    document.getElementById('uploads-play-btn')?.addEventListener('click', () => {
      if (uploadedSongs.length) {
        playUploadedSongs();
      }
    });

    document.getElementById('uploads-upload-btn')?.addEventListener('click', () => {
      navigateTo('upload');
    });
  }

  // ===== Upload Events =====
  function bindUploadEvents() {
    const dropzone = document.getElementById('dropzone');
    const audioInput = document.getElementById('audio-file-input');
    const coverInput = document.getElementById('cover-file-input');
    const coverBtn = document.getElementById('cover-btn');
    const uploadCover = document.getElementById('upload-cover');
    const removeAudioBtn = document.getElementById('remove-audio-btn');
    const submitBtn = document.getElementById('upload-submit-btn');

    // Click dropzone to select file
    dropzone.addEventListener('click', () => audioInput.click());

    // Drag and drop
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('audio/')) {
        handleAudioFile(file);
      } else {
        toast('Please drop an audio file', 'error');
      }
    });

    // File input change
    audioInput.addEventListener('change', (e) => {
      if (e.target.files[0]) handleAudioFile(e.target.files[0]);
    });

    // Remove audio
    removeAudioBtn.addEventListener('click', () => {
      pendingAudioFile = null;
      document.getElementById('upload-preview').style.display = 'none';
      dropzone.style.display = 'block';
      audioInput.value = '';
      validateUploadForm();
    });

    // Cover image
    coverBtn.addEventListener('click', () => coverInput.click());
    uploadCover.addEventListener('click', () => coverInput.click());

    coverInput.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        pendingCoverFile = e.target.files[0];
        const url = URL.createObjectURL(pendingCoverFile);
        uploadCover.innerHTML = `<img src="${url}" alt="Cover">`;
        validateUploadForm();
      }
    });

    // Form inputs
    document.getElementById('upload-title').addEventListener('input', validateUploadForm);
    document.getElementById('upload-artist').addEventListener('input', validateUploadForm);

    // Submit
    submitBtn.addEventListener('click', handleUploadSubmit);
  }

  function handleAudioFile(file) {
    if (file.size > 50 * 1024 * 1024) {
      toast('File too large. Max 50MB.', 'error');
      return;
    }

    pendingAudioFile = file;

    // Show preview
    document.getElementById('dropzone').style.display = 'none';
    document.getElementById('upload-preview').style.display = 'block';
    document.getElementById('preview-filename').textContent = file.name;
    document.getElementById('preview-filesize').textContent = formatFileSize(file.size);

    // Auto-fill title from filename
    const titleInput = document.getElementById('upload-title');
    if (!titleInput.value) {
      const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      titleInput.value = name;
    }

    validateUploadForm();
  }

  function validateUploadForm() {
    const title = document.getElementById('upload-title').value.trim();
    const artist = document.getElementById('upload-artist').value.trim();
    const submitBtn = document.getElementById('upload-submit-btn');
    submitBtn.disabled = !(pendingAudioFile && title && artist);
  }

  async function handleUploadSubmit() {
    const title = document.getElementById('upload-title').value.trim();
    const artist = document.getElementById('upload-artist').value.trim();
    const category = document.getElementById('upload-category').value;
    const submitBtn = document.getElementById('upload-submit-btn');
    const progressEl = document.getElementById('upload-progress');
    const progressFill = document.getElementById('upload-progress-fill');
    const progressText = document.getElementById('upload-progress-text');

    if (!pendingAudioFile || !title || !artist) return;

    // Show progress
    submitBtn.style.display = 'none';
    progressEl.style.display = 'block';
    progressFill.style.width = '30%';
    progressText.textContent = 'Processing audio...';

    try {
      // Get audio duration
      const duration = await getAudioDuration(pendingAudioFile);
      progressFill.style.width = '60%';
      progressText.textContent = 'Saving...';

      // Save to IndexedDB
      const id = await Uploads.addSong({
        name: title,
        artist: artist,
        category: category,
        audioBlob: pendingAudioFile,
        audioType: pendingAudioFile.type,
        posterBlob: pendingCoverFile,
        posterType: pendingCoverFile ? pendingCoverFile.type : null,
        duration: duration
      });

      progressFill.style.width = '100%';
      progressText.textContent = 'Upload complete!';

      // Refresh uploads list
      uploadedSongs = await Uploads.getAllSongs();
      updateUploadCount();

      toast('Song uploaded successfully!', 'success');

      // Reset form after delay
      setTimeout(() => {
        resetUploadForm();
        navigateTo('uploads');
      }, 1200);

    } catch (err) {
      console.error('Upload error:', err);
      toast('Upload failed. Please try again.', 'error');
      submitBtn.style.display = 'flex';
      progressEl.style.display = 'none';
    }
  }

  function resetUploadForm() {
    pendingAudioFile = null;
    pendingCoverFile = null;
    document.getElementById('dropzone').style.display = 'block';
    document.getElementById('upload-preview').style.display = 'none';
    document.getElementById('upload-progress').style.display = 'none';
    document.getElementById('upload-submit-btn').style.display = 'flex';
    document.getElementById('upload-submit-btn').disabled = true;
    document.getElementById('audio-file-input').value = '';
    document.getElementById('cover-file-input').value = '';
    document.getElementById('upload-title').value = '';
    document.getElementById('upload-artist').value = '';
    document.getElementById('upload-category').value = 'uploaded';
    document.getElementById('upload-cover').innerHTML = '<i class="bi bi-image"></i><span>Cover Art</span>';
  }

  function getAudioDuration(file) {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        const m = Math.floor(audio.duration / 60);
        const s = Math.floor(audio.duration % 60);
        resolve(m + ':' + (s < 10 ? '0' : '') + s);
      });
      audio.addEventListener('error', () => resolve('0:00'));
      audio.src = URL.createObjectURL(file);
    });
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  // ===== My Uploads Page =====
  async function renderUploadsPage() {
    uploadedSongs = await Uploads.getAllSongs();
    const container = document.getElementById('uploads-list');
    const emptyState = document.getElementById('uploads-empty');

    if (uploadedSongs.length === 0) {
      container.innerHTML = '';
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      container.innerHTML = await buildUploadedSongRows(uploadedSongs);
      bindUploadedRowEvents(container);
    }

    document.getElementById('uploads-subtitle').textContent = uploadedSongs.length + ' songs';
  }

  async function buildUploadedSongRows(songs) {
    const rows = [];
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      const posterUrl = song.posterBlob ? Uploads.getPosterURL(song) : '../img/1.jpg';
      rows.push(`
        <div class="song-row" data-uploaded-id="${song.id}" data-num="${i + 1}">
          <span class="col-num">${i + 1}</span>
          <span class="col-title">
            <img src="${posterUrl}" alt="">
            <div class="col-title-info">
              <h4>${escapeHtml(song.name)}</h4>
              <p>${escapeHtml(song.artist)}</p>
            </div>
          </span>
          <span class="col-artist">${escapeHtml(song.artist)}</span>
          <span class="col-category"><span>${song.category}</span></span>
          <span class="col-duration">${song.duration}</span>
          <span class="col-actions">
            <button class="btn-icon delete-btn" data-uploaded-id="${song.id}" title="Delete">
              <i class="bi bi-trash3"></i>
            </button>
          </span>
        </div>
      `);
    }
    return rows.join('');
  }

  function bindUploadedRowEvents(container) {
    container.querySelectorAll('.song-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) return;
        const id = parseInt(row.dataset.uploadedId);
        playUploadedSong(id);
      });
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.uploadedId);
        if (confirm('Delete this song?')) {
          await Uploads.deleteSong(id);
          uploadedSongs = await Uploads.getAllSongs();
          updateUploadCount();
          renderUploadsPage();
          toast('Song deleted', 'info');
        }
      });
    });
  }

  async function playUploadedSong(id) {
    const song = await Uploads.getSong(id);
    if (!song) return;

    const audioUrl = Uploads.getAudioURL(song);
    const posterUrl = song.posterBlob ? Uploads.getPosterURL(song) : '../img/1.jpg';

    // Create a temporary song object for the player
    const tempSong = {
      id: 'upload_' + song.id,
      name: song.name,
      artist: song.artist,
      category: song.category,
      poster: posterUrl,
      audio: audioUrl,
      duration: song.duration
    };

    // Load directly into player
    Player.loadUploadedSong(tempSong);
    addToRecent('upload_' + song.id);
  }

  function playUploadedSongs() {
    if (!uploadedSongs.length) return;
    playUploadedSong(uploadedSongs[0].id);
  }

  function updateUploadCount() {
    uploadCount.textContent = uploadedSongs.length;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ===== Navigation =====
  function navigateTo(page) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll(`.nav-link[data-page="${page}"]`).forEach(l => l.classList.add('active'));

    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById('page-' + page);
    if (pageEl) {
      pageEl.classList.add('active');
      mainContent.scrollTop = 0;
    }

    // Render page-specific content
    if (page === 'favorites') renderFavoritesPage();
    if (page === 'recent') renderRecentPage();
    if (page === 'library') renderLibraryPage();
    if (page === 'uploads') renderUploadsPage();
  }

  // ===== Sidebar =====
  function openSidebar() {
    sidebar.classList.add('open');
    document.getElementById('sidebar-overlay').classList.add('show');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('show');
  }

  // ===== Render: Discover Page =====
  function renderDiscoverPage() {
    renderQuickPicks();
    renderTrendingCarousel();
    renderArtistsCarousel();
    renderAllSongs();
  }

  function renderQuickPicks() {
    const container = document.getElementById('quick-picks');
    const picks = SONGS.slice(0, 6);
    container.innerHTML = picks.map(song => `
      <div class="quick-card" data-id="${song.id}">
        <img src="${song.poster}" alt="${song.name}">
        <div class="quick-card-info">
          <h4>${song.name}</h4>
          <p>${song.artist}</p>
        </div>
        <button class="quick-card-play"><i class="bi bi-play-fill"></i></button>
      </div>
    `).join('');

    container.querySelectorAll('.quick-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        const idx = SONGS.findIndex(s => s.id === id);
        Player.resetQueue();
        Player.play(idx);
      });
    });
  }

  function renderTrendingCarousel() {
    const container = document.getElementById('trending-scroll');
    container.innerHTML = SONGS.map(song => `
      <div class="song-card" data-id="${song.id}">
        <div class="song-card-img">
          <img src="${song.poster}" alt="${song.name}">
          <button class="song-card-play"><i class="bi bi-play-fill"></i></button>
        </div>
        <h4>${song.name}</h4>
        <p>${song.artist}</p>
      </div>
    `).join('');

    container.querySelectorAll('.song-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        const idx = SONGS.findIndex(s => s.id === id);
        Player.resetQueue();
        Player.play(idx);
      });
    });
  }

  function renderArtistsCarousel() {
    const container = document.getElementById('artists-scroll');
    container.innerHTML = ARTISTS.map(artist => `
      <div class="artist-card">
        <div class="artist-card-img">
          <img src="${artist.image}" alt="${artist.name}">
        </div>
        <h4>${artist.name}</h4>
        <p>${artist.role}</p>
      </div>
    `).join('');

    container.querySelectorAll('.artist-card').forEach((card, i) => {
      card.addEventListener('click', () => {
        const artistName = ARTISTS[i].name;
        const artistSongs = SONGS.filter(s => s.artist === artistName);
        if (artistSongs.length) {
          Player.setQueue(artistSongs);
          Player.play(0);
          toast('Playing ' + artistName + ' songs', 'info');
        }
      });
    });
  }

  function renderAllSongs() {
    const container = document.getElementById('all-songs-list');
    container.innerHTML = buildSongTableRows(SONGS);
    bindSongRowEvents(container);
  }

  // ===== Render: Library =====
  function renderLibraryPage(filter = 'all') {
    const container = document.getElementById('library-songs-list');
    let songs = SONGS;
    if (filter === 'luo') songs = SONGS.filter(s => s.category === 'luo');
    if (filter === 'bollywood') songs = SONGS.filter(s => s.category === 'bollywood');

    container.innerHTML = buildSongTableRows(songs);
    bindSongRowEvents(container);
  }

  // ===== Render: Favorites =====
  function renderFavoritesPage() {
    const container = document.getElementById('favorites-list');
    const emptyState = document.getElementById('favorites-empty');
    const favSongs = SONGS.filter(s => favorites.includes(s.id));

    if (favSongs.length === 0) {
      container.innerHTML = '';
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      container.innerHTML = buildSongTableRows(favSongs);
      bindSongRowEvents(container);
    }

    document.getElementById('fav-subtitle').textContent = favSongs.length + ' songs';
  }

  // ===== Render: Recently Played =====
  function renderRecentPage() {
    const container = document.getElementById('recent-list');
    const emptyState = document.getElementById('recent-empty');
    const recentSongs = recentlyPlayed
      .map(id => SONGS.find(s => s.id === id))
      .filter(Boolean);

    if (recentSongs.length === 0) {
      container.innerHTML = '';
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      container.innerHTML = buildSongTableRows(recentSongs);
      bindSongRowEvents(container);
    }

    document.getElementById('recent-subtitle').textContent = recentSongs.length + ' songs';
  }

  // ===== Song Table Builder =====
  function buildSongTableRows(songs) {
    return songs.map((song, i) => `
      <div class="song-row" data-id="${song.id}" data-num="${i + 1}">
        <span class="col-num">${i + 1}</span>
        <span class="col-title">
          <img src="${song.poster}" alt="">
          <div class="col-title-info">
            <h4>${song.name}</h4>
            <p>${song.artist}</p>
          </div>
        </span>
        <span class="col-artist">${song.artist}</span>
        <span class="col-category"><span>${song.category}</span></span>
        <span class="col-duration">${song.duration}</span>
        <span class="col-actions">
          <button class="btn-icon fav-btn ${favorites.includes(song.id) ? 'active' : ''}" data-id="${song.id}" title="Favorite">
            <i class="bi ${favorites.includes(song.id) ? 'bi-heart-fill' : 'bi-heart'}"></i>
          </button>
        </span>
      </div>
    `).join('');
  }

  function bindSongRowEvents(container) {
    container.querySelectorAll('.song-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.fav-btn')) return;
        const id = parseInt(row.dataset.id);
        const queue = Player.getQueue();
        const idx = queue.findIndex(s => s.id === id);
        if (idx >= 0) {
          Player.play(idx);
        } else {
          const globalIdx = SONGS.findIndex(s => s.id === id);
          Player.resetQueue();
          Player.play(globalIdx);
        }
      });
    });

    container.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(parseInt(btn.dataset.id));
      });
    });
  }

  // ===== Favorites =====
  function toggleFavorite(id) {
    const idx = favorites.indexOf(id);
    if (idx >= 0) {
      favorites.splice(idx, 1);
      toast('Removed from favorites', 'info');
    } else {
      favorites.push(id);
      toast('Added to favorites', 'success');
    }
    localStorage.setItem('luo_favorites', JSON.stringify(favorites));
    updateFavCount();
    updateFavBadges();
    Player.updatePlayerFavBtn();
  }

  function isFavorite(id) {
    return favorites.includes(id);
  }

  function updateFavCount() {
    favCount.textContent = favorites.length;
  }

  function updateFavBadges() {
    document.querySelectorAll('.fav-btn').forEach(btn => {
      const id = parseInt(btn.dataset.id);
      const active = favorites.includes(id);
      btn.classList.toggle('active', active);
      btn.querySelector('i').className = active ? 'bi bi-heart-fill' : 'bi bi-heart';
    });
  }

  // ===== Recently Played =====
  function addToRecent(id) {
    recentlyPlayed = recentlyPlayed.filter(r => r !== id);
    recentlyPlayed.unshift(id);
    if (recentlyPlayed.length > 50) recentlyPlayed = recentlyPlayed.slice(0, 50);
    localStorage.setItem('luo_recent', JSON.stringify(recentlyPlayed));
  }

  // ===== Search =====
  function handleTopSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      searchResults.classList.remove('show');
      return;
    }

    const matches = SONGS.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.artist.toLowerCase().includes(query)
    ).slice(0, 8);

    if (matches.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
    } else {
      searchResults.innerHTML = matches.map(song => `
        <div class="search-result-item" data-id="${song.id}">
          <img src="${song.poster}" alt="">
          <div class="search-result-info">
            <h4>${song.name}</h4>
            <p>${song.artist}</p>
          </div>
        </div>
      `).join('');

      searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = parseInt(item.dataset.id);
          const idx = SONGS.findIndex(s => s.id === id);
          Player.resetQueue();
          Player.play(idx);
          searchInput.value = '';
          searchResults.classList.remove('show');
        });
      });
    }

    searchResults.classList.add('show');
  }

  function handleSearchPage() {
    const query = searchPageInput.value.trim().toLowerCase();

    if (!query) {
      searchCategories.style.display = 'block';
      searchPageResults.style.display = 'none';
      return;
    }

    searchCategories.style.display = 'none';
    searchPageResults.style.display = 'block';

    const matches = SONGS.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.artist.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query)
    );

    const container = document.getElementById('search-results-list');
    if (matches.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">No songs found</div>';
    } else {
      container.innerHTML = buildSongTableRows(matches);
      bindSongRowEvents(container);
    }
  }

  // ===== Keyboard Shortcuts =====
  function handleKeyboard(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        Player.togglePlay();
        break;
      case 'ArrowRight':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          Player.playNext();
        }
        break;
      case 'ArrowLeft':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          Player.playPrev();
        }
        break;
      case 'ArrowUp':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const vol = Math.min(1, (document.getElementById('volume-bar').value / 100) + 0.1);
          document.getElementById('volume-bar').value = vol * 100;
          document.getElementById('volume-bar').dispatchEvent(new Event('input'));
        }
        break;
      case 'ArrowDown':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const volDown = Math.max(0, (document.getElementById('volume-bar').value / 100) - 0.1);
          document.getElementById('volume-bar').value = volDown * 100;
          document.getElementById('volume-bar').dispatchEvent(new Event('input'));
        }
        break;
      case 'KeyM':
        document.getElementById('volume-btn').click();
        break;
      case 'KeyS':
        if (!e.ctrlKey && !e.metaKey) {
          document.getElementById('shuffle-btn').click();
        }
        break;
      case 'Slash':
        if (e.shiftKey) {
          e.preventDefault();
          searchInput.focus();
        }
        break;
    }
  }

  // ===== Toast =====
  function toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = {
      success: 'bi-check-circle-fill',
      error: 'bi-exclamation-circle-fill',
      info: 'bi-info-circle-fill'
    };

    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = `<i class="bi ${icons[type]}"></i><span>${message}</span>`;
    container.appendChild(el);

    setTimeout(() => el.remove(), 3000);
  }

  // Expose public API
  return {
    init,
    toast,
    toggleFavorite,
    isFavorite,
    addToRecent,
    navigateTo
  };
})();

// Start the app
document.addEventListener('DOMContentLoaded', App.init);
