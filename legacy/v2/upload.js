// ===== Upload Module (IndexedDB) =====

const Uploads = (() => {
  const DB_NAME = 'luo_music_db';
  const DB_VERSION = 1;
  const STORE_NAME = 'uploads';
  let db = null;

  function init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('artist', 'artist', { unique: false });
          store.createIndex('uploadedAt', 'uploadedAt', { unique: false });
        }
      };

      request.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
      };

      request.onerror = (e) => {
        console.error('IndexedDB error:', e);
        reject(e);
      };
    });
  }

  function addSong(songData) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record = {
        name: songData.name || 'Untitled',
        artist: songData.artist || 'Unknown Artist',
        category: songData.category || 'uploaded',
        audioBlob: songData.audioBlob,
        audioType: songData.audioType || 'audio/mpeg',
        posterBlob: songData.posterBlob || null,
        posterType: songData.posterType || null,
        duration: songData.duration || '0:00',
        uploadedAt: Date.now()
      };

      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function getAllSongs() {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  function getSong(id) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function deleteSong(id) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  function getAudioURL(song) {
    if (!song.audioBlob) return null;
    return URL.createObjectURL(song.audioBlob);
  }

  function getPosterURL(song) {
    if (!song.posterBlob) return null;
    return URL.createObjectURL(song.posterBlob);
  }

  function getSongCount() {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  return {
    init,
    addSong,
    getAllSongs,
    getSong,
    deleteSong,
    getAudioURL,
    getPosterURL,
    getSongCount
  };
})();
