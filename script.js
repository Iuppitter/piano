// --- 1. Değişkenler ve Ayarlar ---

// DÜZELTME 1: Seçici (selector) daha spesifik hale getirildi.
// Artık sadece ana .piano'nun içindeki .key'leri seçiyor.
const keys = document.querySelectorAll('.piano .key'); 
const octaveDisplay = document.getElementById('current-octave-display');

// Klavye haritası (Değişiklik yok)
const keyMap = {
    'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E', 'f': 'F',
    't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'A#', 'j': 'B'
};

let currentOctave = 4;
const minOctave = 0;
const maxOctave = 8;

let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let loadedSounds = {};

// Alt Panel için Değişkenler (Değişiklik yok)
const optionsPanel = document.getElementById('options-panel');
const optionsNoteName = document.getElementById('options-note-name');
const closeOptionsButton = document.getElementById('close-options-panel');
const optionKeys = document.querySelectorAll('.option-key');


// --- 2. Ses Çalma Fonksiyonları (Değişiklik yok) ---

function loadSound(note) {
    const path = `sounds/${note}.wav`;
    if (loadedSounds[path]) {
        return Promise.resolve(loadedSounds[path]);
    }
    return fetch(path)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            loadedSounds[path] = audioBuffer;
            return audioBuffer;
        });
}

function playNote(note) {
    loadSound(note).then(audioBuffer => {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
    }).catch(err => {
        console.warn(`UYARI: Ses dosyası bulunamadı veya yüklenemedi: sounds/${note}.wav`);
    });
}

function highlightKey(noteBase) {
    const key = document.querySelector(`.piano .key[data-note="${noteBase}"]`);
    if (key) {
        key.classList.add('playing');
        setTimeout(() => {
            key.classList.remove('playing');
        }, 150);
    }
}

// --- 3. Oktav Güncelleme (Değişiklik yok) ---
// (Düzeltme 1 sayesinde bu fonksiyon artık "1-5" tuşlarına dokunmayacak)
function updateKeys() {
    octaveDisplay.textContent = currentOctave;
    keys.forEach(key => {
        const noteBase = key.dataset.note; 
        const newNote = noteBase + currentOctave;
        key.querySelector('span').textContent = newNote;
        key.dataset.fullNote = newNote; // Tam notayı data özelliğinde sakla
    });
    console.log(`Oktav değiştirildi: ${currentOctave}`);
}

// --- 4. Olay Dinleyicileri (Klavye ve Sol Tık) (Değişiklik yok) ---

// Sol Tıklama
keys.forEach(key => {
    key.addEventListener('click', () => {
        const noteBase = key.dataset.note;
        const fullNote = noteBase + currentOctave;
        playNote(fullNote);
        highlightKey(noteBase);
    });
});

// Klavye
window.addEventListener('keydown', (e) => {
    if (optionsPanel.style.display === 'block') return;
    
    const keyChar = e.key.toLowerCase();
    
    if (keyChar === 'z') {
        currentOctave = Math.max(minOctave, currentOctave - 1);
        updateKeys();
    } else if (keyChar === 'x') {
        currentOctave = Math.min(maxOctave, currentOctave + 1);
        updateKeys();
    }
    
    const noteBase = keyMap[keyChar];
    if (noteBase) {
        const fullNote = noteBase + currentOctave;
        playNote(fullNote);
        highlightKey(noteBase);
    }
});

// --- 5. Alt Panel Mantığı (Sağ Tık) ---

// Tüm tuşlara (siyah ve beyaz) sağ tıklandığında paneli aç
// (Buradaki "keys" seçicisi de düzeltildi)
document.querySelectorAll('.piano .key').forEach(key => {
    key.addEventListener('contextmenu', (e) => {
        e.preventDefault(); 
        const fullNote = key.dataset.fullNote || key.dataset.note + currentOctave;
        optionsNoteName.textContent = fullNote;
        optionsPanel.style.display = 'block';
    });
});

// Paneli Kapatma Düğmesi
closeOptionsButton.addEventListener('click', () => {
    optionsPanel.style.display = 'none';
});

// Paneldeki 5 Seçenek Tuşuna Tıklama
optionKeys.forEach(key => {
    key.addEventListener('click', () => {
        const selectedOption = key.dataset.option;
        const targetNote = optionsNoteName.textContent;

        console.log(`Nota '${targetNote}' için seçenek '${selectedOption}' seçildi.`);
        
        // DÜZELTME 2: Bu satır kaldırıldı, artık panel otomatik kapanmıyor.
        // optionsPanel.style.display = 'none';
        
        // (İsteğe bağlı) Seçenek tuşuna bastığınızda bir onay sesi çalabilirsiniz
        // playNote('C6'); 
    });
});
// --- BİTİŞ ---

// --- 6. Başlangıç ---
updateKeys(); // Piyanoyu ilk oktav (4) için kur
console.log("HTML Piyano yüklendi. Alt panel için tuşlara sağ tıklayın.");