// --- 1. Değişkenler ve Ayarlar ---
const clickEvent = 'ontouchstart' in window ? 'touchstart' : 'click';
let pressTimer = null; 

const keys = document.querySelectorAll('.piano .key'); 
const octaveDisplay = document.getElementById('current-octave-display');
const octaveUpBtn = document.getElementById('octave-up');
const octaveDownBtn = document.getElementById('octave-down');
const volumeSlider = document.getElementById('volume-slider');
const volumeDisplay = document.getElementById('volume-display');

const keyMap = {
    'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E', 'f': 'F',
    't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'A#', 'j': 'B'
};
let currentOctave = 4;
const minOctave = 0;
const maxOctave = 8;
const optionsPanel = document.getElementById('options-panel');
const optionsNoteName = document.getElementById('options-note-name');
const closeOptionsButton = document.getElementById('close-options-panel');
const optionKeys = document.querySelectorAll('.option-key'); // 4 tuş

// --- 2. YENİ BEYİN: CENT HARİTASI (A0 = 0 cent) ---

// 2.1. Ana Referans Frekansı (A0)
const A0_HZ = 27.50;

// 2.2. Multi-Sampling için 8 Temel Ses Dosyamız ve Frekansları
const BASE_NOTES = {
    'A0': { 'freq': 27.50, 'path': 'sounds/A0.wav' },
    'A1': { 'freq': 55.00, 'path': 'sounds/A1.wav' },
    'A2': { 'freq': 110.00, 'path': 'sounds/A2.wav' },
    'A3': { 'freq': 220.00, 'path': 'sounds/A3.wav' },
    'A4': { 'freq': 440.00, 'path': 'sounds/A4.wav' },
    'A5': { 'freq': 880.00, 'path': 'sounds/A5.wav' },
    'A6': { 'freq': 1760.00, 'path': 'sounds/A6.wav' },
    'A7': { 'freq': 3520.00, 'path': 'sounds/A7.wav' }
};

// 2.3. A0=0c referansına göre 88 tuşun Mutlak Cent Değerleri
const ABSOLUTE_CENT_MAP = {
    'A0': 0, 'A#0': 100, 'B0': 200,
    'C1': 300, 'C#1': 400, 'D1': 500, 'D#1': 600, 'E1': 700, 'F1': 800, 'F#1': 900, 'G1': 1000, 'G#1': 1100, 'A1': 1200, 'A#1': 1300, 'B1': 1400,
    'C2': 1500, 'C#2': 1600, 'D2': 1700, 'D#2': 1800, 'E2': 1900, 'F2': 2000, 'F#2': 2100, 'G2': 2200, 'G#2': 2300, 'A2': 2400, 'A#2': 2500, 'B2': 2600,
    'C3': 2700, 'C#3': 2800, 'D3': 2900, 'D#3': 3000, 'E3': 3100, 'F3': 3200, 'F#3': 3300, 'G3': 3400, 'G#3': 3500, 'A3': 3600, 'A#3': 3700, 'B3': 3800,
    'C4': 3900, 'C#4': 4000, 'D4': 4100, 'D#4': 4200, 'E4': 4300, 'F4': 4400, 'F#4': 4500, 'G4': 4600, 'G#4': 4700, 'A4': 4800, 'A#4': 4900, 'B4': 5000,
    'C5': 5100, 'C#5': 5200, 'D5': 5300, 'D#5': 5400, 'E5': 5500, 'F5': 5600, 'F#5': 5700, 'G5': 5800, 'G#5': 5900, 'A5': 6000, 'A#5': 6100, 'B5': 6200,
    'C6': 6300, 'C#6': 6400, 'D6': 6500, 'D#6': 6600, 'E6': 6700, 'F6': 6800, 'F#6': 6900, 'G6': 7000, 'G#6': 7100, 'A6': 7200, 'A#6': 7300, 'B6': 7400,
    'C7': 7500, 'C#7': 7600, 'D7': 7700, 'D#7': 7800, 'E7': 7900, 'F7': 8000, 'F#7': 8100, 'G7': 8200, 'G#7': 8300, 'A7': 8400, 'A#7': 8500, 'B7': 8600,
    'C8': 8700
};

// --- 3. SES YÜKLEME VE BAĞLAM ---
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let baseSoundBuffers = {
    'A0': null, 'A1': null, 'A2': null, 'A3': null,
    'A4': null, 'A5': null, 'A6': null, 'A7': null
};
const gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);

function loadSound(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Ses dosyası yüklenemedi: ${url}`);
            return response.arrayBuffer();
        })
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
}

function loadBaseSounds() {
    const loadPromises = Object.keys(BASE_NOTES).map(noteKey => {
        return loadSound(BASE_NOTES[noteKey].path)
            .then(buffer => ({ key: noteKey, buffer: buffer }))
            .catch(err => {
                console.error(`UYARI: ${BASE_NOTES[noteKey].path} yüklenemedi.`, err.message);
                return { key: noteKey, buffer: null };
            });
    });

    Promise.all(loadPromises)
        .then(results => {
            results.forEach(result => {
                if (result.buffer) {
                    baseSoundBuffers[result.key] = result.buffer;
                }
            });
            console.log("Temel ses dosyası yüklemesi tamamlandı.");
            const missing = Object.keys(baseSoundBuffers).filter(k => baseSoundBuffers[k] === null);
            if(missing.length > 0) {
                alert(`UYARI: Şu temel ses dosyaları 'sounds' klasöründe bulunamadı: ${missing.join(', ')}. Bu oktavlardaki sesler bozuk çıkabilir.`);
            }
        });
}

// --- 4. SES ÇALMA (CENT HESAPLAMALI) ---
function centToHz(centValue) {
    return A0_HZ * Math.pow(2, centValue / 1200);
}

function playFrequency(targetFrequency) {
    if (targetFrequency <= 0.0) { 
        console.warn(`UYARI: Frekans 0.0'dır. Çalınmıyor.`);
        return;
    }
    let bestSampleKey = null;
    let minDiff = Infinity;
    for (const noteKey in baseSoundBuffers) {
        if (baseSoundBuffers[noteKey]) {
            const baseFreq = BASE_NOTES[noteKey].freq;
            const diff = Math.abs(Math.log(targetFrequency) - Math.log(baseFreq));
            if (diff < minDiff) {
                minDiff = diff;
                bestSampleKey = noteKey;
            }
        }
    }
    if (!bestSampleKey) {
        console.error("Hiç temel ses dosyası yüklenemedi! 'sounds' klasörünü kontrol edin.");
        return;
    }
    
    const baseSoundBuffer = baseSoundBuffers[bestSampleKey];
    const baseFreq = BASE_NOTES[bestSampleKey].freq;
    const playbackRate = targetFrequency / baseFreq;
    const source = audioContext.createBufferSource();
    source.buffer = baseSoundBuffer;
    source.playbackRate.value = playbackRate;
    source.connect(gainNode);
    source.start(0);
}

function highlightKey(keyElement) {
    if (keyElement) {
        keyElement.classList.add('playing');
        setTimeout(() => {
            keyElement.classList.remove('playing');
        }, 150);
    }
}

// --- 5. OKTAV GÜNCELLEME ---
function updateKeys() {
    octaveDisplay.textContent = currentOctave;
    keys.forEach(key => {
        const noteBase = key.dataset.note; 
        const fullNote = noteBase + currentOctave;
        if (ABSOLUTE_CENT_MAP[fullNote] === undefined) {
            key.querySelector('span').textContent = '-';
            key.dataset.fullNote = null;
        } else {
            key.querySelector('span').textContent = fullNote;
            key.dataset.fullNote = fullNote;
        }
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

// === {DÜZELTİLDİ} PANEL AÇMA MANTIĞI (BASİT ETİKETLİ) ===
const openOptionsPanel = (noteData) => {
    const fullNote = noteData.fullNote;
    const baseCentValue = noteData.baseCentValue;
    
    optionsNoteName.textContent = fullNote;

    // 4 panel tuşunu güncelle
    optionKeys.forEach((optKey, index) => {
        const centOffset = (index + 1) * 20; // +20, +40, +60, +80
        const finalCentValue = baseCentValue + centOffset;
        
        // 1. Frekansı hesapla ve tuşun verisine kaydet
        const targetHz = centToHz(finalCentValue);
        optKey.dataset.frequency = targetHz;
        
        // 2. {SİLİNDİ} Etiket değiştirme kodu kaldırıldı.
        // optKey.querySelector('span').textContent = `+${centOffset}c`;
    });
    
    optionsPanel.style.display = 'block';
};

// --- 6. Olay Dinleyicileri (Piyano Tuşları) ---
keys.forEach(key => {
    
    const getNoteData = () => {
        const fullNote = key.dataset.fullNote;
        if (!fullNote || ABSOLUTE_CENT_MAP[fullNote] === undefined) return null;
        const noteBase = key.dataset.note;
        const baseCentValue = ABSOLUTE_CENT_MAP[fullNote];
        return { noteBase, fullNote, baseCentValue };
    };

    // Masaüstü 'click'
    key.addEventListener('click', () => {
        if (clickEvent === 'click') { 
            const noteData = getNoteData();
            if (!noteData) return;
            const targetFrequency = centToHz(noteData.baseCentValue);
            playFrequency(targetFrequency);
            highlightKey(key);
        }
    });
    
    // Masaüstü 'contextmenu' (PANELİ AÇ)
    key.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const noteData = getNoteData();
        if (!noteData) return;
        openOptionsPanel(noteData);
    });

    // --- Mobil (Dokunmatik) Zamanlayıcı ---
    key.addEventListener('touchstart', (e) => {
        e.preventDefault(); 
        const noteData = getNoteData();
        if (!noteData) return;
        pressTimer = setTimeout(() => {
            openOptionsPanel(noteData);
            pressTimer = null;
        }, 400); 
    });

    key.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (pressTimer) { 
            clearTimeout(pressTimer); 
            pressTimer = null;
            const noteData = getNoteData();
            if (!noteData) return;
            const targetFrequency = centToHz(noteData.baseCentValue);
            playFrequency(targetFrequency);
            highlightKey(key);
        }
    });

    key.addEventListener('touchcancel', () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    });
});

// --- 7. Diğer Olay Dinleyicileri ---

// SES AYARI DİNLEYİCİSİ
volumeSlider.addEventListener('input', () => {
    gainNode.gain.value = volumeSlider.value;
    volumeDisplay.textContent = Math.round(volumeSlider.value * 100);
});

// Oktav Butonları
octaveDownBtn.addEventListener(clickEvent, (e) => { e.preventDefault(); octaveDown(); });
octaveUpBtn.addEventListener(clickEvent, (e) => { e.preventDefault(); octaveUp(); });

// Klavye (Masaüstü)
window.addEventListener('keydown', (e) => {
    if (optionsPanel.style.display === 'block') return;
    const keyChar = e.key.toLowerCase();
    if (keyChar === 'z') octaveDown();
    else if (keyChar === 'x') octaveUp();
    
    const noteBase = keyMap[keyChar];
    if (noteBase) {
        const fullNote = noteBase + currentOctave;
        if (ABSOLUTE_CENT_MAP[fullNote] !== undefined) { 
            const baseCentValue = ABSOLUTE_CENT_MAP[fullNote];
            const targetFrequency = centToHz(baseCentValue);
            playFrequency(targetFrequency);
            highlightKey(document.querySelector(`.piano .key[data-note="${noteBase}"]`));
        }
    }
});

// Panel Kapatma Düğmesi
closeOptionsButton.addEventListener(clickEvent, (e) => {
    e.preventDefault();
    optionsPanel.style.display = 'none';
});

// Panel Seçenek Tuşları (1-4)
optionKeys.forEach(key => {
    key.addEventListener(clickEvent, (e) => {
        e.preventDefault();
        const freqToPlay = parseFloat(key.dataset.frequency);
        playFrequency(freqToPlay);
        highlightKey(key);
        console.log(`Panelden çalındı: ${freqToPlay} Hz`);
    });
});

// --- 8. Başlangıç ---
gainNode.gain.value = volumeSlider.value;
loadBaseSounds();
updateKeys(); 
console.log("HTML Piyano (Cent Motoru + 4 Basit Etiketli Panel) yüklendi.");