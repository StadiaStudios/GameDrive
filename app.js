const DB_NAME = 'GameSavesDB';
const SAVES_STORE = 'saves'; 
const GAMES_STORE = 'games'; 
const DB_VERSION = 2; 
const DEFAULT_GAMES = ["GRAND THEFT AUTO V", "GRAND THEFT AUTO SAN ANDREAS", "GRAND THEFT AUTO VICE CITY", "GRAND THEFT AUTO: THE DEFINITIVE EDITION", "SCHEDULE 1", "The Elder Scrolls IV: Oblivion", "The Elder Scrolls V: Skyrim Special Edition", "Marvels Spiderman: Miles Morales", "Watch Dogs", "Watch Dogs 2", "Minecraft: Java Edition", "Red Dead Redemption 2", "Red Dead Redemption 1", "The Elder Scrolls V: Skyrim Anniversary Edition"];

let db, allGameNames = [], currentlySelectedGame = '', selectedFile = null, selectedImportFile = null;

const fileInput = document.getElementById('fileInput');
const gameSearchInput = document.getElementById('gameSearchInput');
const gameDropdownList = document.getElementById('gameDropdownList');
const newGameNameInput = document.getElementById('newGameNameInput');
const addNewGameButton = document.getElementById('addNewGameButton');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const uploadButton = document.getElementById('uploadButton');
const saveListContainer = document.getElementById('saveList');
const emptyState = document.getElementById('emptyState');
const settingsModal = document.getElementById('settingsModal');
const importFileInput = document.getElementById('importFileInput');
const importFileNameDisplay = document.getElementById('importFileNameDisplay');
const importDataBtn = document.getElementById('importDataBtn');
const modalOkBtn = document.getElementById('modalOkBtn');
const modalSpinner = document.getElementById('modalSpinner');
const storageUsageDisplay = document.getElementById('storageUsageDisplay');

const showMessage = (title, message, isLoading = false) => {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').innerHTML = message;
    modalOkBtn.style.display = isLoading ? 'none' : 'block';
    modalSpinner.classList.toggle('hidden', !isLoading);
    document.getElementById('messageModal').classList.replace('hidden', 'flex');
    if (!isLoading) modalOkBtn.onclick = hideMessage;
};

const hideMessage = () => {
    document.getElementById('messageModal').classList.replace('flex', 'hidden');
};

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + ['Bytes', 'KB', 'MB', 'GB', 'TB'][i];
};

const checkUploadReadiness = () => {
    uploadButton.disabled = !(currentlySelectedGame.trim() && selectedFile);
};

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
});

const base64ToBlob = (base64, mimeType = 'application/octet-stream') => {
    const byteChars = atob(base64), byteArrays = [], chunkSize = 1024 * 1024;
    for (let offset = 0; offset < byteChars.length; offset += chunkSize) {
        const slice = byteChars.slice(offset, offset + chunkSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
        byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: mimeType });
};

const openDB = () => new Promise((resolve, reject) => {
    if (db) return resolve(db);
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (e) => (showMessage('DB Error', 'Failed to open local database.'), reject(e.target.error));
    request.onupgradeneeded = (e) => {
        db = e.target.result;
        if (!db.objectStoreNames.contains(SAVES_STORE)) db.createObjectStore(SAVES_STORE, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(GAMES_STORE)) db.createObjectStore(GAMES_STORE, { keyPath: 'name' });
    };
    request.onsuccess = (e) => (db = e.target.result, resolve(db));
});

const transact = (storeName, mode, callback) => new Promise(async (resolve, reject) => {
    try {
        const dbInstance = await openDB();
        const tx = dbInstance.transaction(storeName, mode);
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => (e.target.error.name === 'QuotaExceededError' && showMessage('Full', 'Storage full.'), reject(e.target.error));
        callback(tx.objectStore(storeName), resolve, reject);
    } catch (e) { reject(e); }
});

const DB = {
    addGame: (name) => transact(GAMES_STORE, 'readwrite', (s, res, rej) => {
        const req = s.add({ name });
        req.onsuccess = res;
        req.onerror = (e) => (e.target.error.name === 'ConstraintError' ? res() : rej(e.target.error));
    }),
    clearStore: (name) => transact(name, 'readwrite', (s, res) => s.clear().onsuccess = res),
    getAllGames: () => transact(GAMES_STORE, 'readonly', (s, res) => s.getAll().onsuccess = (e) => res(e.target.result.map(g => g.name).sort())),
    getAllSaves: () => transact(SAVES_STORE, 'readonly', (s, res) => s.getAll().onsuccess = (e) => res(e.target.result)),
    addSave: (save) => transact(SAVES_STORE, 'readwrite', (s, res) => s.add(save).onsuccess = res),
    deleteSave: (id) => transact(SAVES_STORE, 'readwrite', (s, res) => s.delete(id).onsuccess = res),
    getSave: (id) => transact(SAVES_STORE, 'readonly', (s, res) => s.get(id).onsuccess = (e) => res(e.target.result)),
};

const updateStorageDisplay = async () => {
    if (!storageUsageDisplay) return;
    storageUsageDisplay.textContent = '...';
    const saves = await DB.getAllSaves();
    storageUsageDisplay.textContent = formatBytes(saves.reduce((sum, s) => sum + (s.size || 0), 0));
};

const initializeGamesStore = async () => {
    allGameNames = await DB.getAllGames();
    if (allGameNames.length === 0) {
        await transact(GAMES_STORE, 'readwrite', (s, res) => {
            DEFAULT_GAMES.forEach(name => s.add({ name }));
            res();
        });
        allGameNames = await DB.getAllGames();
    }
};

const filterGameOptions = (term = '') => {
    const norm = term.toLowerCase();
    gameDropdownList.innerHTML = '';
    const filtered = allGameNames.filter(n => n.toLowerCase().includes(norm));
    if (filtered.length === 0) {
        gameDropdownList.innerHTML = `<div class="p-3 text-gray-500 italic text-sm">None found.</div>`;
        return;
    }
    filtered.forEach(name => {
        const opt = document.createElement('div');
        opt.className = 'p-3.5 cursor-pointer text-gray-300 hover:bg-brand hover:text-white transition-colors text-sm font-medium border-b border-[#2a2a2a] last:border-0';
        const idx = name.toLowerCase().indexOf(norm);
        opt.innerHTML = idx !== -1 ? `${name.substring(0, idx)}<span class="text-white font-bold">${name.substring(idx, idx + norm.length)}</span>${name.substring(idx + norm.length)}` : name;
        opt.onclick = () => (currentlySelectedGame = name, gameSearchInput.value = name, gameDropdownList.classList.add('hidden'), checkUploadReadiness());
        gameDropdownList.appendChild(opt);
    });
};

const renderSaves = async () => {
    const saves = await DB.getAllSaves();
    saveListContainer.innerHTML = '';
    if (saves.length === 0) return emptyState.classList.remove('hidden'), saveListContainer.appendChild(emptyState);
    emptyState.classList.add('hidden');
    saves.sort((a, b) => b.uploadDate - a.uploadDate).forEach(s => {
        const item = document.createElement('div');
        item.className = 'card-pro flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 transition-all hover:border-brand/40 group';
        item.innerHTML = `
            <div class="flex-1 w-full truncate mb-4 sm:mb-0">
                <h3 class="text-lg font-semibold text-white truncate mb-1">${s.gameName}</h3>
                <p class="text-sm text-gray-400 truncate font-mono flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-brand/50"></span>${s.fileName}</p>
                <p class="text-xs text-gray-500 mt-2 font-medium">${formatBytes(s.size)} &bull; ${new Date(s.uploadDate).toLocaleDateString()}</p>
            </div>
            <div class="flex space-x-3">
                <button data-id="${s.id}" class="download-btn btn-ghost px-4 py-2 text-xs border border-gray-700 hover:border-brand">Download</button>
                <button data-id="${s.id}" class="delete-btn btn-ghost px-4 py-2 text-xs text-red-400 border border-gray-700 hover:border-red-500">Delete</button>
            </div>`;
        saveListContainer.appendChild(item);
    });
    document.querySelectorAll('.download-btn').forEach(b => b.onclick = handleDownload);
    document.querySelectorAll('.delete-btn').forEach(b => b.onclick = handleDelete);
};

const handleDownload = async (e) => {
    const btn = e.target.closest('button'), id = btn.dataset.id, text = btn.innerHTML;
    btn.innerHTML = 'Syncing...'; btn.disabled = true;
    try {
        const save = await DB.getSave(id);
        if (save?.data instanceof Blob) {
            const url = URL.createObjectURL(save.data), a = document.createElement('a');
            a.href = url; a.download = save.fileName; a.click(); URL.revokeObjectURL(url);
        }
    } catch (err) { console.error(err); }
    btn.innerHTML = text; btn.disabled = false;
};

const handleDelete = async (e) => {
    const id = e.target.closest('button').dataset.id;
    if (await window.customConfirm("Delete this save permanently?")) {
        await DB.deleteSave(id);
        renderSaves();
        updateStorageDisplay();
    }
};

const handleExport = async () => {
    settingsModal.classList.add('hidden');
    showMessage('Exporting...', 'Preparing files...', true);
    try {
        const saves = await DB.getAllSaves(), games = await DB.getAllGames(), encoded = [];
        for (let s of saves) {
            encoded.push({...s, data: await blobToBase64(s.data), type: s.data.type});
        }
        const blob = new Blob([JSON.stringify({version: DB_VERSION, timestamp: new Date(), games: games.map(n => ({name: n})), saves: encoded})], {type: 'application/json'});
        const url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url; a.download = `backup_${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url);
        hideMessage();
    } catch (err) { hideMessage(); showMessage('Error', 'Export failed.'); }
};

const handleImport = async () => {
    if (!selectedImportFile || !await window.customConfirm("Overwrite ALL current data?")) return;
    settingsModal.classList.add('hidden');
    showMessage('Importing...', 'Restoring data...', true);
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            await DB.clearStore(SAVES_STORE); await DB.clearStore(GAMES_STORE);
            await transact(GAMES_STORE, 'readwrite', (s, res) => (data.games.forEach(g => s.add(g)), res()));
            for (let s of data.saves) await DB.addSave({...s, data: base64ToBlob(s.data, s.type)});
            await initializeGamesStore(); await renderSaves(); await updateStorageDisplay();
            hideMessage(); showMessage('Success', 'Vault restored.');
        } catch (err) { hideMessage(); showMessage('Error', 'Import failed.'); }
    };
    reader.readAsText(selectedImportFile);
};

const handleUpload = async () => {
    const name = currentlySelectedGame.trim();
    if (!selectedFile || !name) return;
    uploadButton.innerHTML = 'Uploading...'; uploadButton.disabled = true;
    const reader = new FileReader();
    reader.onload = async (e) => {
        await DB.addGame(name);
        await DB.addSave({id: crypto.randomUUID(), gameName: name, fileName: selectedFile.name, uploadDate: Date.now(), size: selectedFile.size, data: new Blob([e.target.result], {type: selectedFile.type})});
        currentlySelectedGame = ''; gameSearchInput.value = ''; selectedFile = null; fileNameDisplay.textContent = 'No file selected.';
        await renderSaves(); await updateStorageDisplay(); checkUploadReadiness();
        uploadButton.innerHTML = 'Install to Drive';
    };
    reader.readAsArrayBuffer(selectedFile);
};

window.customConfirm = (msg) => new Promise((res) => {
    const m = document.createElement('div');
    m.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70]';
    m.innerHTML = `<div class="card-pro p-6 w-full max-w-sm border-l-4 border-brand"><h3 class="text-lg font-bold mb-4 text-white">Confirm</h3><p class="text-gray-400 mb-6 text-sm">${msg}</p><div class="flex justify-end space-x-3"><button id="c" class="px-4 py-2 text-gray-400 text-xs">Cancel</button><button id="o" class="px-4 py-2 bg-brand text-white text-xs">Confirm</button></div></div>`;
    document.body.appendChild(m);
    m.querySelector('#o').onclick = () => (document.body.removeChild(m), res(true));
    m.querySelector('#c').onclick = () => (document.body.removeChild(m), res(false));
});

window.onload = async () => {
    document.getElementById('openSettingsBtn').onclick = () => (updateStorageDisplay(), settingsModal.classList.replace('hidden', 'flex'));
    document.getElementById('closeSettingsBtn').onclick = () => settingsModal.classList.replace('flex', 'hidden');
    document.getElementById('exportDataBtn').onclick = handleExport;
    document.getElementById('importDataBtn').onclick = handleImport;
    
    document.getElementById('selectImportFileBtn').onclick = (e) => {
        e.preventDefault();
        importFileInput.click();
    };
    
    importFileInput.onchange = (e) => {
        selectedImportFile = e.target.files[0];
        importFileNameDisplay.textContent = selectedImportFile?.name || 'No file selected.';
        importDataBtn.disabled = !selectedImportFile;
    };
    
    gameSearchInput.oninput = (e) => (filterGameOptions(e.target.value.trim()), gameDropdownList.classList.remove('hidden'), currentlySelectedGame = '', checkUploadReadiness());
    gameSearchInput.onfocus = (e) => (e.target.value.trim() === '' && filterGameOptions(''), gameDropdownList.classList.remove('hidden'));
    document.onclick = (e) => !gameDropdownList.parentNode.contains(e.target) && gameDropdownList.classList.add('hidden');
    
    newGameNameInput.oninput = () => addNewGameButton.disabled = !newGameNameInput.value.trim();
    addNewGameButton.onclick = async () => {
        const n = newGameNameInput.value.trim();
        await DB.addGame(n); allGameNames = await DB.getAllGames(); handleGameSelection(n); newGameNameInput.value = '';
    };
    
    fileInput.onchange = (e) => {
        selectedFile = e.target.files[0];
        fileNameDisplay.textContent = selectedFile?.name || 'No file selected.';
        checkUploadReadiness();
    };
    
    document.getElementById('selectFileButton').onclick = (e) => {
        e.preventDefault();
        fileInput.click();
    };
    
    uploadButton.onclick = handleUpload;

    await openDB(); await initializeGamesStore(); await renderSaves(); await updateStorageDisplay();
    document.getElementById('loading-overlay')?.classList.add('opacity-0', 'pointer-events-none');
};

const handleGameSelection = (n) => (currentlySelectedGame = n, gameSearchInput.value = n, gameDropdownList.classList.add('hidden'), checkUploadReadiness());