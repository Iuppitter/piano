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
const optionKeys = document.querySelectorAll('.option-key');

// --- 2. FREKANS HARİTASI ---
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

const ALL_FREQUENCIES = {
    'A0':  { 'default': 27.50, '1': 27.81, '2': 28.12, '3': 28.43, '4': 28.74, '5': 29.05 },
    'A#0': { 'default': 29.14, '1': 29.45, '2': 29.76, '3': 30.07, '4': 30.38, '5': 30.69 },
    'B0':  { 'default': 30.87, '1': 31.17, '2': 31.47, '3': 31.77, '4': 32.07, '5': 32.37 },
    'C1':  { 'default': 32.70, '1': 33.15, '2': 33.60, '3': 34.05, '4': 34.50, '5': 34.95 },
    'C#1': { 'default': 34.65, '1': 35.10, '2': 35.55, '3': 36.00, '4': 36.45, '5': 36.90 },
    'D1':  { 'default': 36.71, '1': 37.16, '2': 37.61, '3': 38.06, '4': 38.51, '5': 38.96 },
    'D#1': { 'default': 38.89, '1': 39.34, '2': 39.79, '3': 40.24, '4': 40.69, '5': 41.14 },
    'E1':  { 'default': 41.20, '1': 41.65, '2': 42.10, '3': 42.55, '4': 43.00, '5': 43.45 },
    'F1':  { 'default': 43.65, '1': 44.10, '2': 44.55, '3': 45.00, '4': 45.45, '5': 45.90 },
    'F#1': { 'default': 46.25, '1': 46.70, '2': 47.15, '3': 47.60, '4': 48.05, '5': 48.50 },
    'G1':  { 'default': 49.00, '1': 49.45, '2': 49.90, '3': 50.35, '4': 50.80, '5': 51.25 },
    'G#1': { 'default': 51.91, '1': 52.36, '2': 52.81, '3': 53.26, '4': 53.71, '5': 54.16 },
    'A1':  { 'default': 55.00, '1': 55.45, '2': 55.90, '3': 56.35, '4': 56.80, '5': 57.25 },
    'A#1': { 'default': 58.27, '1': 58.72, '2': 59.17, '3': 59.62, '4': 60.07, '5': 60.52 },
    'B1':  { 'default': 61.74, '1': 62.19, '2': 62.64, '3': 63.09, '4': 63.54, '5': 63.99 },
    'C2':  { 'default': 65.41, '1': 66.39, '2': 67.37, '3': 68.35, '4': 69.33, '5': 70.31 },
    'C#2': { 'default': 69.30, '1': 70.28, '2': 71.26, '3': 72.24, '4': 73.22, '5': 74.20 },
    'D2':  { 'default': 73.42, '1': 74.40, '2': 75.38, '3': 76.36, '4': 77.34, '5': 78.32 },
    'D#2': { 'default': 77.78, '1': 78.76, '2': 79.74, '3': 80.72, '4': 81.70, '5': 82.68 },
    'E2':  { 'default': 82.41, '1': 83.39, '2': 84.37, '3': 85.35, '4': 86.33, '5': 87.31 },
    'F2':  { 'default': 87.31, '1': 88.29, '2': 89.27, '3': 90.25, '4': 91.23, '5': 92.21 },
    'F#2': { 'default': 92.50, '1': 93.48, '2': 94.46, '3': 95.44, '4': 96.42, '5': 97.40 },
    'G2':  { 'default': 98.00, '1': 98.98, '2': 99.96, '3': 100.94, '4': 101.92, '5': 102.90 },
    'G#2': { 'default': 103.83, '1': 104.81, '2': 105.79, '3': 106.77, '4': 107.75, '5': 108.73 },
    'A2':  { 'default': 110.00, '1': 110.98, '2': 111.96, '3': 112.94, '4': 113.92, '5': 114.90 },
    'A#2': { 'default': 116.54, '1': 117.52, '2': 118.50, '3': 119.48, '4': 120.46, '5': 121.44 },
    'B2':  { 'default': 123.47, '1': 124.45, '2': 125.43, '3': 126.41, '4': 127.39, '5': 128.37 },
    'C3':  { 'default': 130.81, '1': 132.63, '2': 134.45, '3': 136.27, '4': 138.09, '5': 139.91 },
    'C#3': { 'default': 138.59, '1': 140.41, '2': 142.23, '3': 144.05, '4': 145.87, '5': 147.69 },
    'D3':  { 'default': 146.83, '1': 148.65, '2': 150.47, '3': 152.29, '4': 154.11, '5': 155.93 },
    'D#3': { 'default': 155.56, '1': 157.38, '2': 159.20, '3': 161.02, '4': 162.84, '5': 164.66 },
    'E3':  { 'default': 164.81, '1': 166.63, '2': 168.45, '3': 170.27, '4': 172.09, '5': 173.91 },
    'F3':  { 'default': 174.61, '1': 176.43, '2': 178.25, '3': 180.07, '4': 181.89, '5': 183.71 },
    'F#3': { 'default': 185.00, '1': 186.82, '2': 188.64, '3': 190.46, '4': 192.28, '5': 194.10 },
    'G3':  { 'default': 196.00, '1': 197.82, '2': 199.64, '3': 201.46, '4': 203.28, '5': 205.10 },
    'G#3': { 'default': 207.65, '1': 209.47, '2': 211.29, '3': 213.11, '4': 214.93, '5': 216.75 },
    'A3':  { 'default': 220.00, '1': 221.82, '2': 223.64, '3': 225.46, '4': 227.28, '5': 229.10 },
    'A#3': { 'default': 233.08, '1': 234.90, '2': 236.72, '3': 238.54, '4': 240.36, '5': 242.18 },
    'B3':  { 'default': 246.94, '1': 248.76, '2': 250.58, '3': 252.40, '4': 254.22, '5': 256.04 },
    'C4':  { 'default': 261.63, '1': 264.03, '2': 266.43, '3': 268.83, '4': 271.23, '5': 273.63 },
    'C#4': { 'default': 277.18, '1': 279.58, '2': 281.98, '3': 284.38, '4': 286.78, '5': 289.18 },
    'D4':  { 'default': 293.66, '1': 296.06, '2': 298.46, '3': 300.86, '4': 303.26, '5': 305.66 },
    'D#4': { 'default': 311.13, '1': 313.53, '2': 315.93, '3': 318.33, '4': 320.73, '5': 323.13 },
    'E4':  { 'default': 329.63, '1': 332.03, '2': 334.43, '3': 336.83, '4': 339.23, '5': 341.63 },
    'F4':  { 'default': 349.23, '1': 351.63, '2': 354.03, '3': 356.43, '4': 358.83, '5': 361.23 },
    'F#4': { 'default': 369.99, '1': 372.39, '2': 374.79, '3': 377.19, '4': 379.59, '5': 381.99 },
    'G4':  { 'default': 392.00, '1': 394.40, '2': 396.80, '3': 399.20, '4': 401.60, '5': 404.00 },
    'G#4': { 'default': 415.30, '1': 417.70, '2': 420.10, '3': 422.50, '4': 424.90, '5': 427.30 },
    'A4':  { 'default': 440.00, '1': 442.40, '2': 444.80, '3': 447.20, '4': 449.60, '5': 452.00 },
    'A#4': { 'default': 466.16, '1': 468.56, '2': 470.96, '3': 473.36, '4': 475.76, '5': 478.16 },
    'B4':  { 'default': 493.88, '1': 496.28, '2': 498.68, '3': 501.08, '4': 503.48, '5': 505.88 },
    'C5':  { 'default': 523.25, '1': 528.02, '2': 532.79, '3': 537.56, '4': 542.33, '5': 547.10 },
    'C#5': { 'default': 554.37, '1': 559.14, '2': 563.91, '3': 568.68, '4': 573.45, '5': 578.22 },
    'D5':  { 'default': 587.33, '1': 592.10, '2': 596.87, '3': 601.64, '4': 606.41, '5': 611.18 },
    'D#5': { 'default': 622.25, '1': 627.02, '2': 631.79, '3': 636.56, '4': 641.33, '5': 646.10 },
    'E5':  { 'default': 659.26, '1': 664.03, '2': 668.80, '3': 673.57, '4': 678.34, '5': 683.11 },
    'F5':  { 'default': 698.46, '1': 703.23, '2': 708.00, '3': 712.77, '4': 717.54, '5': 722.31 },
    'F#5': { 'default': 739.99, '1': 744.76, '2': 749.53, '3': 754.30, '4': 759.07, '5': 763.84 },
    'G5':  { 'default': 783.99, '1': 788.76, '2': 793.53, '3': 798.30, '4': 803.07, '5': 807.84 },
    'G#5': { 'default': 830.61, '1': 835.38, '2': 840.15, '3': 844.92, '4': 849.69, '5': 854.46 },
    'A5':  { 'default': 880.00, '1': 884.77, '2': 889.54, '3': 894.31, '4': 899.08, '5': 903.85 },
    'A#5': { 'default': 932.33, '1': 937.10, '2': 941.87, '3': 946.64, '4': 951.41, '5': 956.18 },
    'B5':  { 'default': 987.77, '1': 992.54, '2': 997.31, '3': 1002.08, '4': 1006.85, '5': 1011.62 },
    'C6':  { 'default': 1046.50, '1': 1055.55, '2': 1064.60, '3': 1073.65, '4': 1082.70, '5': 1091.75 },
    'C#6': { 'default': 1108.73, '1': 1117.78, '2': 1126.83, '3': 1135.88, '4': 1144.93, '5': 1153.98 },
    'D6':  { 'default': 1174.66, '1': 1183.71, '2': 1192.76, '3': 1201.81, '4': 1210.86, '5': 1219.91 },
    'D#6': { 'default': 1244.51, '1': 1253.56, '2': 1262.61, '3': 1271.66, '4': 1280.71, '5': 1289.76 },
    'E6':  { 'default': 1318.51, '1': 1327.56, '2': 1336.61, '3': 1345.66, '4': 1354.71, '5': 1363.76 },
    'F6':  { 'default': 1396.91, '1': 1405.96, '2': 1415.01, '3': 1424.06, '4': 1433.11, '5': 1442.16 },
    'F#6': { 'default': 1479.98, '1': 1489.03, '2': 1498.08, '3': 1507.13, '4': 1516.18, '5': 1525.23 },
    'G6':  { 'default': 1567.98, '1': 1577.03, '2': 1586.08, '3': 1595.13, '4': 1604.18, '5': 1613.23 },
    'G#6': { 'default': 1661.22, '1': 1670.27, '2': 1679.32, '3': 1688.37, '4': 1697.42, '5': 1706.47 },
    'A6':  { 'default': 1760.00, '1': 1769.05, '2': 1778.10, '3': 1787.15, '4': 1796.20, '5': 1805.25 },
    'A#6': { 'default': 1864.66, '1': 1873.71, '2': 1882.76, '3': 1891.81, '4': 1900.86, '5': 1909.91 },
    'B6':  { 'default': 1975.53, '1': 1984.58, '2': 1993.63, '3': 2002.68, '4': 2011.73, '5': 2020.78 },
    'C7':  { 'default': 2093.00, '1': 2115.49, '2': 2137.98, '3': 2160.47, '4': 2182.96, '5': 2205.45 },
    'C#7': { 'default': 2217.46, '1': 2239.95, '2': 2262.44, '3': 2284.93, '4': 2307.42, '5': 2329.91 },
    'D7':  { 'default': 2349.32, '1': 2371.81, '2': 2394.30, '3': 2416.79, '4': 2439.28, '5': 2461.77 },
    'D#7': { 'default': 2489.02, '1': 2511.51, '2': 2534.00, '3': 2556.49, '4': 2578.98, '5': 2601.47 },
    'E7':  { 'default': 2637.02, '1': 2659.51, '2': 2682.00, '3': 2704.49, '4': 2726.98, '5': 2749.47 },
    'F7':  { 'default': 2793.83, '1': 2816.32, '2': 2838.81, '3': 2861.30, '4': 2883.79, '5': 2906.28 },
    'F#7': { 'default': 2959.96, '1': 2982.45, '2': 3004.94, '3': 3027.43, '4': 3049.92, '5': 3072.41 },
    'G7':  { 'default': 3135.96, '1': 3158.45, '2': 3180.94, '3': 3203.43, '4': 3225.92, '5': 3248.41 },
    'G#7': { 'default': 3322.44, '1': 3344.93, '2': 3367.42, '3': 3389.91, '4': 3412.40, '5': 3434.89 },
    'A7':  { 'default': 3520.00, '1': 3542.49, '2': 3564.98, '3': 3587.47, '4': 3609.96, '5': 3632.45 },
    'A#7': { 'default': 3729.31, '1': 3751.80, '2': 3774.29, '3': 3796.78, '4': 3819.27, '5': 3841.76 },
    'B7':  { 'default': 3951.07, '1': 3973.56, '2': 3996.05, '3': 4018.54, '4': 4041.03, '5': 4063.52 },
    'C8':  { 'default': 4186.01, '1': 0.0, '2': 0.0, '3': 0.0, '4': 0.0, '5': 0.0 } 
};

// --- 3. SES YÜKLEME VE BAĞLAM ---
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
// {DÜZELTME} Hatalı objeyi düzelt
let baseSoundBuffers = {
    'A0': null, 'A1': null, 'A2': null, 'A3': null,
    'A4': null, 'A5': null, 'A6': null, 'A7': null
};
const gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);

// Tek bir sesi yükleyen yardımcı fonksiyon
function loadSound(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Ses dosyası yüklenemedi: ${url}`);
            return response.arrayBuffer();
        })
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
}

// {YENİ} 8 temel sesi aynı anda yükle
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

// --- 4. SES ÇALMA (MULTI-SAMPLING MANTIĞI) ---
function playFrequency(targetFrequency) {
    if (targetFrequency <= 0.0) { 
        console.warn(`UYARI: Frekans 0.0'dır. Çalınmıyor.`);
        return;
    }

    let bestSampleKey = null;
    let minDiff = Infinity;

    // Yüklü olan temel sesler arasından en yakınını bul
    for (const noteKey in baseSoundBuffers) {
        if (baseSoundBuffers[noteKey]) { // Sadece yüklenmiş olanları dikkate al
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

// Vurgulama fonksiyonu
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
        if (!ALL_FREQUENCIES[fullNote]) {
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

// --- 6. Olay Dinleyicileri (Piyano Tuşları) ---
keys.forEach(key => {
    
    const getNoteData = () => {
        const fullNote = key.dataset.fullNote;
        if (!fullNote || !ALL_FREQUENCIES[fullNote]) return null;
        const noteBase = key.dataset.note;
        const frequency = ALL_FREQUENCIES[fullNote]['default'];
        return { noteBase, fullNote, frequency };
    };

    // Masaüstü 'click'
    key.addEventListener('click', () => {
        if (clickEvent === 'click') { 
            const noteData = getNoteData();
            if (!noteData) return;
            playFrequency(noteData.frequency);
            highlightKey(key);
        }
    });

    const openOptionsPanel = (noteData) => {
        const fullNote = noteData.fullNote;
        optionsNoteName.textContent = fullNote;
        const freqs = ALL_FREQUENCIES[fullNote];
        if (!freqs) {
            console.error(`Frekans haritasında ${fullNote} için veri yok.`);
            return;
        }
        optionKeys.forEach((optKey, index) => {
            const optionNum = (index + 1).toString(); // "1", "2", ... "5"
            const frequency = freqs[optionNum];
            optKey.dataset.frequency = frequency || '0.0';
            optKey.classList.remove('selected');
            // Etiketi "1", "2" vb. olarak ayarla
            optKey.querySelector('span').textContent = optionNum;
        });
        optionsPanel.style.display = 'block';
    };
    
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
            playFrequency(noteData.frequency);
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
        if (ALL_FREQUENCIES[fullNote]) { 
            const freq = ALL_FREQUENCIES[fullNote]['default'];
            playFrequency(freq);
            highlightKey(document.querySelector(`.piano .key[data-note="${noteBase}"]`));
        }
    }
});

// Panel Kapatma Düğmesi
closeOptionsButton.addEventListener(clickEvent, (e) => {
    e.preventDefault();
    optionsPanel.style.display = 'none';
});

// Panel Seçenek Tuşları (1-5)
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
// Global gain'i slider'ın varsayılan değerine ayarla
gainNode.gain.value = volumeSlider.value;
// 8 temel sesi yükle
loadBaseSounds();
updateKeys(); 
console.log("HTML Piyano (Multi-Sample + Basit Etiket) yüklendi.");