// --- 1. Değişkenler ve Ayarlar ---

// YENİ: Dokunmatik ekranı algıla
// Eğer dokunmatik ekran varsa 'touchstart' (dokunma) olayını,
// yoksa (masaüstü gibi) 'click' (tıklama) olayını kullan.
const clickEvent = 'ontouchstart' in window ? 'touchstart' : 'click';

const keys = document.querySelectorAll('.piano .key'); 
const octaveDisplay = document.getElementById('current-octave-display');
const octaveUpBtn = document.getElementById('octave-up');
const octaveDownBtn = document.getElementById('octave-down');
const keyMap = {
    'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E', 'f': 'F',
    't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'A#', 'j': 'B'
};
let currentOctave = 4;
const minOctave = 0;
const maxOctave = 8;
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let loadedSounds = {};
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
function updateKeys() {
    octaveDisplay.textContent = currentOctave;
    keys.forEach(key => {
        const noteBase = key.dataset.note; 
        const newNote = noteBase + currentOctave;
        key.querySelector('span').textContent = newNote;
        key.dataset.fullNote = newNote;
    });
    console.log(`Oktav değiştirildi: ${currentOctave}`);
}
function octaveDown() {
    currentOctave = Math.max(minOctave, currentOctave - 1);
    updateKeys();
}
function octaveUp() {
    currentOctave = Math.min(maxOctave, currentOctave + 1);
    updateKeys();
}

// --- 4. Olay Dinleyicileri (DÜZELTİLDİ) ---

// Ana Piyano Tuşları
keys.forEach(key => {
    // 'click' yerine 'clickEvent' kullanılıyor
    key.addEventListener(clickEvent, (e) => {
        e.preventDefault(); // Dokunmatik kaydırmayı vb. engelle
        const noteBase = key.dataset.note;
        const fullNote = noteBase + currentOctave;
        playNote(fullNote);
        highlightKey(noteBase);
    });
});

// Oktav Butonları
// 'click' yerine 'clickEvent' kullanılıyor
octaveDownBtn.addEventListener(clickEvent, (e) => {
    e.preventDefault();
    octaveDown();
});
octaveUpBtn.addEventListener(clickEvent, (e) => {
    e.preventDefault();
    octaveUp();
});

// Klavye (Masaüstü için, bu 'keydown' olarak kalmalı)
window.addEventListener('keydown', (e) => {
    if (optionsPanel.style.display === 'block') return;
    const keyChar = e.key.toLowerCase();
    if (keyChar === 'z') {
        octaveDown();
    } else if (keyChar === 'x') {
        octaveUp();
    }
    const noteBase = keyMap[keyChar];
    if (noteBase) {
        const fullNote = noteBase + currentOctave;
        playNote(fullNote);
        highlightKey(noteBase);
    }
});

// --- 5. Alt Panel Mantığı (DÜZELTİLDİ) ---

// Paneli Açma (Bu 'contextmenu' olarak kalmalı, çünkü 'sağ tık' veya 'uzun basma' anlamına gelir)
document.querySelectorAll('.piano .key').forEach(key => {
    key.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // Hem masaüstü sağ tık menüsünü hem de mobil uzun basma menüsünü engelle
        const fullNote = key.dataset.fullNote || key.dataset.note + currentOctave;
        optionsNoteName.textContent = fullNote;
        optionsPanel.style.display = 'block';
    });
});

// Paneli Kapatma Düğmesi
// 'click' yerine 'clickEvent' kullanılıyor
closeOptionsButton.addEventListener(clickEvent, (e) => {
    e.preventDefault();
    optionsPanel.style.display = 'none';
});

// Seçenek Tuşları (1-5)
// 'click' yerine 'clickEvent' kullanılıyor
optionKeys.forEach(key => {
    key.addEventListener(clickEvent, (e) => {
        e.preventDefault();
        const selectedOption = key.dataset.option;
        const targetNote = optionsNoteName.textContent;
        console.log(`Nota '${targetNote}' için seçenek '${selectedOption}' seçildi.`);
    });
});

// --- 6. Başlangıç ---
updateKeys(); 
console.log("HTML Piyano (touchstart etkin) yüklendi.");