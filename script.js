// --- 1. Değişkenler ve Ayarlar ---

// 'click' vs 'touchstart'
const clickEvent = 'ontouchstart' in window ? 'touchstart' : 'click';
// Zamanlayıcı için
let pressTimer = null; 

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
    currentOctave = max(minOctave, currentOctave - 1);
    updateKeys();
}
function octaveUp() {
    currentOctave = min(maxOctave, currentOctave + 1);
    updateKeys();
}

// --- 4. Olay Dinleyicileri (YENİ MANTIK) ---

// === YENİ ZAMANLAYICI MANTIĞI (PİYANO TUŞLARI) ===
keys.forEach(key => {
    
    // Masaüstü için basit 'click' (Nota Çal)
    key.addEventListener('click', () => {
        // Dokunmatik cihazda 'click' olayı 'touchstart'tan sonra da tetiklenebilir,
        // bunu engellemek için 'clickEvent'i kontrol et
        if (clickEvent === 'click') { 
            const noteBase = key.dataset.note;
            const fullNote = noteBase + currentOctave;
            playNote(fullNote);
            highlightKey(noteBase);
        }
    });

    // Masaüstü için 'contextmenu' (Panel Aç)
    key.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const fullNote = key.dataset.fullNote || key.dataset.note + currentOctave;
        optionsNoteName.textContent = fullNote;
        optionsPanel.style.display = 'block';
    });

    // --- Mobil (Dokunmatik) Cihazlar için Zamanlayıcı ---
    
    // Dokunma başladığında
    key.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Tarayıcı davranışını (kaydırma, menü) engelle
        
        // Zamanlayıcıyı başlat
        pressTimer = setTimeout(() => {
            // Zamanlayıcı bitince: Bu bir 'uzun basma'dır.
            // Paneli aç
            const fullNote = key.dataset.fullNote || key.dataset.note + currentOctave;
            optionsNoteName.textContent = fullNote;
            optionsPanel.style.display = 'block';
            pressTimer = null; // Zamanlayıcıyı temizle
        }, 400); // 400 milisaniye basılı tutarsa
    });

    // Dokunma bittiğinde
    key.addEventListener('touchend', (e) => {
        e.preventDefault();
        
        // Eğer zamanlayıcı HALA ÇALIŞIYORSA (yani 400ms geçmediyse)
        if (pressTimer) {
            // Bu bir 'kısa basma'dır.
            clearTimeout(pressTimer); // Zamanlayıcıyı iptal et (panel açılmasın)
            pressTimer = null;
            
            // Notayı çal
            const noteBase = key.dataset.note;
            const fullNote = noteBase + currentOctave;
            playNote(fullNote);
            highlightKey(noteBase);
        }
    });

    // Dokunma iptal olursa (parmak kayarsa vb.)
    key.addEventListener('touchcancel', () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    });
});
// === YENİ MANTIK BİTTİ ===


// --- DİĞER BUTONLAR (Basit Tıklama) ---

// Oktav Butonları
octaveDownBtn.addEventListener(clickEvent, (e) => {
    e.preventDefault();
    octaveDown();
});
octaveUpBtn.addEventListener(clickEvent, (e) => {
    e.preventDefault();
    octaveUp();
});

// Klavye (Masaüstü)
window.addEventListener('keydown', (e) => {
    if (optionsPanel.style.display === 'block') return;
    const keyChar = e.key.toLowerCase();
    if (keyChar === 'z') octaveDown();
    else if (keyChar === 'x') octaveUp();
    
    const noteBase = keyMap[keyChar];
    if (noteBase) {
        const fullNote = noteBase + currentOctave;
        playNote(fullNote);
        highlightKey(noteBase);
    }
});

// --- 5. Alt Panel Mantığı (Basit Tıklama) ---

// Kapatma Düğmesi
closeOptionsButton.addEventListener(clickEvent, (e) => {
    e.preventDefault();
    optionsPanel.style.display = 'none';
});

// Seçenek Tuşları (1-5)
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
console.log("HTML Piyano (Zamanlayıcı düzeltmesi) yüklendi.");