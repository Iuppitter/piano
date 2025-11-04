// --- 1. Değişkenler ve Ayarlar ---
const clickEvent = 'ontouchstart' in window ? 'touchstart' : 'click';
let pressTimer = null; 

const keys = document.querySelectorAll('.piano .key'); 
const octaveDisplay = document.getElementById('current-octave-display');
const octaveUpBtn = document.getElementById('octave-up');
const octaveDownBtn = document.getElementById('octave-down');
const volumeSlider = document.getElementById('volume-slider');
const volumeDisplay = document.getElementById('volume-display');
const freqDisplay = document.getElementById('freq-display');

const modeSelector = document.getElementById('mode-selector');
const modeButtons = document.querySelectorAll('.mode-btn');
let currentMode = '4ses'; // Varsayılan

const sustainSwitch = document.getElementById('sustain-switch');

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
const optionKeys = document.querySelectorAll('.option-key'); // 5 tuş

// --- 2. BEYİN: CENT HARİTASI (A0 = 0 cent) ---
const A0_HZ = 27.50;

// {YENİ} 8 temel ses dosyası için 2 ayrı yol (path)
const BASE_NOTES = {
    'A0': { 'freq': 27.50, 'path_normal': 'sounds/A0.wav', 'path_sustain': 'sounds/sustain/A0.wav' },
    'A1': { 'freq': 55.00, 'path_normal': 'sounds/A1.wav', 'path_sustain': 'sounds/sustain/A1.wav' },
    'A2': { 'freq': 110.00, 'path_normal': 'sounds/A2.wav', 'path_sustain': 'sounds/sustain/A2.wav' },
    'A3': { 'freq': 220.00, 'path_normal': 'sounds/A3.wav', 'path_sustain': 'sounds/sustain/A3.wav' },
    'A4': { 'freq': 440.00, 'path_normal': 'sounds/A4.wav', 'path_sustain': 'sounds/sustain/A4.wav' },
    'A5': { 'freq': 880.00, 'path_normal': 'sounds/A5.wav', 'path_sustain': 'sounds/sustain/A5.wav' },
    'A6': { 'freq': 1760.00, 'path_normal': 'sounds/A6.wav', 'path_sustain': 'sounds/sustain/A6.wav' },
    'A7': { 'freq': 3520.00, 'path_normal': 'sounds/A7.wav', 'path_sustain': 'sounds/sustain/A7.wav' }
};

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
// Panel modları için cent artışları
const CENT_MODES = {
    '1ses': { steps: 1, increment: 100 / 2 }, // 50c
    '2ses': { steps: 2, increment: 100 / 3 }, // 33.33c
    '3ses': { steps: 3, increment: 100 / 4 }, // 25c
    '4ses': { steps: 4, increment: 100 / 5 }, // 20c
    '5ses': { steps: 5, increment: 100 / 6 }  // 16.67c
};

// --- 3. SES YÜKLEME VE BAĞLAM ---
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
// {YENİ} 16 ses tamponu (normal + sustain)
let baseSoundBuffers = {
    'normal': { 'A0': null, 'A1': null, 'A2': null, 'A3': null, 'A4': null, 'A5': null, 'A6': null, 'A7': null },
    'sustain': { 'A0': null, 'A1': null, 'A2': null, 'A3': null, 'A4': null, 'A5': null, 'A6': null, 'A7': null }
};
const masterGainNode = audioContext.createGain();
masterGainNode.connect(audioContext.destination);

let activeNotes = new Map();

function loadSound(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Ses dosyası yüklenemedi: ${url}`);
            return response.arrayBuffer();
        })
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
}

// {YENİ} 16 temel sesi (8 normal + 8 sustain) aynı anda yükle
function loadBaseSounds() {
    const loadPromises = [];
    
    // Yüklenecek 16 sesi de listeye ekle
    for (const noteKey in BASE_NOTES) {
        const paths = BASE_NOTES[noteKey];
        // Normal sesi yükle
        loadPromises.push(
            loadSound(paths.path_normal)
                .then(buffer => ({ type: 'normal', key: noteKey, buffer: buffer }))
                .catch(err => ({ type: 'normal', key: noteKey, buffer: null, error: err.message }))
        );
        // Sustain sesini yükle
        loadPromises.push(
            loadSound(paths.path_sustain)
                .then(buffer => ({ type: 'sustain', key: noteKey, buffer: buffer }))
                .catch(err => ({ type: 'sustain', key: noteKey, buffer: null, error: err.message }))
        );
    }

    Promise.all(loadPromises)
        .then(results => {
            const missingFiles = [];
            results.forEach(result => {
                if (result.buffer) {
                    baseSoundBuffers[result.type][result.key] = result.buffer;
                } else {
                    // Hata varsa listeye ekle
                    missingFiles.push(`sounds/${result.type === 'sustain' ? 'sustain/' : ''}${result.key}.wav`);
                }
            });
            
            console.log("Tüm temel ses dosyası yüklemesi tamamlandı.");
            if(missingFiles.length > 0) {
                alert(`UYARI: Şu temel ses dosyaları bulunamadı:\n${missingFiles.join('\n')}\nBu sesler bozuk çıkabilir.`);
            }
        });
}

// --- 4. SES ÇALMA (SUSTAIN MANTIKLI) ---
function centToHz(centValue) {
    return A0_HZ * Math.pow(2, centValue / 1200);
}

// O an çalınan bir notayı durdurur
function stopNote(fullNote) {
    // {YENİ} Pedal AÇIK ise, notayı ASLA durdurma.
    if (sustainSwitch.checked) {
        return;
    }
    
    // Pedal KAPALI ise, 0.05 saniyede (hızlıca) sesi kes
    if (activeNotes.has(fullNote)) {
        const noteNodes = activeNotes.get(fullNote);
        const now = audioContext.currentTime;
        const releaseDuration = 0.05; // Beğendiğiniz hızlı kesme süresi

        noteNodes.gain.gain.cancelScheduledValues(now);
        noteNodes.gain.gain.setValueAtTime(noteNodes.gain.gain.value, now);
        noteNodes.gain.gain.linearRampToValueAtTime(0, now + releaseDuration);

        setTimeout(() => {
            noteNodes.source.stop();
            noteNodes.source.disconnect();
            noteNodes.gain.disconnect();
            activeNotes.delete(fullNote);
            if (activeNotes.size === 0) {
                freqDisplay.textContent = '---';
            }
        }, releaseDuration * 1000 + 100);
    }
}

// Frekansı çalan ana fonksiyon
function playFrequency(targetFrequency, fullNote = null) {
    if (targetFrequency <= 0.0) { 
        console.warn(`UYARI: Frekans 0.0'dır. Çalınmıyor.`);
        return;
    }
    if (fullNote && activeNotes.has(fullNote)) {
        stopNote(fullNote); // Yeniden çalma için eski notayı durdur (eğer pedal kapalıysa)
    }

    freqDisplay.textContent = targetFrequency.toFixed(2);

    // {YENİ} Hangi kütüphaneden çalınacağını seç
    const sampleSetKey = sustainSwitch.checked ? 'sustain' : 'normal';
    const sampleSet = baseSoundBuffers[sampleSetKey];

    // En iyi temel sesi (sample) bul
    let bestSampleKey = null;
    let minDiff = Infinity;
    for (const noteKey in sampleSet) {
        if (sampleSet[noteKey]) { // Sadece yüklenmiş olanları dikkate al
            const baseFreq = BASE_NOTES[noteKey].freq;
            const diff = Math.abs(Math.log(targetFrequency) - Math.log(baseFreq));
            if (diff < minDiff) {
                minDiff = diff;
                bestSampleKey = noteKey;
            }
        }
    }
    if (!bestSampleKey) {
        console.error(`Hiç temel ses dosyası ('${sampleSetKey}' setinde) yüklenemedi!`);
        return;
    }
    
    const baseSoundBuffer = sampleSet[bestSampleKey];
    const baseFreq = BASE_NOTES[bestSampleKey].freq;
    const playbackRate = targetFrequency / baseFreq;
    const source = audioContext.createBufferSource();
    const noteGain = audioContext.createGain(); 
    source.buffer = baseSoundBuffer;
    source.playbackRate.value = playbackRate;
    source.connect(noteGain);
    noteGain.connect(masterGainNode);
    source.start(0);
    
    // Panelin geçici seslerini (fullNote=null) takip etme
    if (fullNote) {
        activeNotes.set(fullNote, { source: source, gain: noteGain });
    }
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

// === PANEL AÇMA MANTIĞI (DİNAMİK MODLU) ===
const openOptionsPanel = (noteData) => {
    const fullNote = noteData.fullNote;
    const baseCentValue = noteData.baseCentValue;
    optionsNoteName.textContent = fullNote;
    const mode = CENT_MODES[currentMode];
    const steps = mode.steps; 
    const centIncrement = mode.increment;
    optionKeys.forEach((optKey, index) => {
        if (index < steps) { 
            const centOffset = (index + 1) * centIncrement;
            const finalCentValue = baseCentValue + centOffset;
            const targetHz = centToHz(finalCentValue);
            optKey.dataset.frequency = targetHz;
            optKey.querySelector('span').textContent = `+${centOffset.toFixed(1)}c`;
            optKey.classList.remove('key-hidden');
        } else {
            optKey.classList.add('key-hidden');
        }
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

    // Masaüstü 'mousedown'
    key.addEventListener('mousedown', () => {
        if (clickEvent === 'click') { 
            const noteData = getNoteData();
            if (!noteData) return;
            const targetFrequency = centToHz(noteData.baseCentValue);
            playFrequency(targetFrequency, noteData.fullNote);
            highlightKey(key);
        }
    });

    // Masaüstü 'mouseup'
    key.addEventListener('mouseup', () => {
        if (clickEvent === 'click') { 
            const noteData = getNoteData();
            if (!noteData) return;
            stopNote(noteData.fullNote); // Pedal AÇIK ise bu bir şey yapmayacak
        }
    });
    
    key.addEventListener('mouseleave', () => {
        if (clickEvent === 'click') { 
             const noteData = getNoteData();
            if (!noteData) return;
            stopNote(noteData.fullNote); // Pedal AÇIK ise bu bir şey yapmayacak
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
        
        const targetFrequency = centToHz(noteData.baseCentValue);
        playFrequency(targetFrequency, noteData.fullNote);
        highlightKey(key);
    });

    key.addEventListener('touchend', (e) => {
        e.preventDefault();
        
        if (pressTimer) { 
            clearTimeout(pressTimer); 
            pressTimer = null;
        }
        const noteData = getNoteData();
        if (!noteData) return;
        stopNote(noteData.fullNote); // Pedal AÇIK ise bu bir şey yapmayacak
    });

    key.addEventListener('touchcancel', (e) => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
        const noteData = getNoteData();
        if (!noteData) return;
        stopNote(noteData.fullNote);
    });
});

// --- 7. Diğer Olay Dinleyicileri ---

// MOD SEÇİCİ DİNLEYİCİSİ
modeButtons.forEach(button => {
    button.addEventListener(clickEvent, (e) => {
        modeButtons.forEach(btn => btn.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        currentMode = e.currentTarget.dataset.mode;
        console.log(`Aralık Modu değiştirildi: ${currentMode}`);
    });
});

// SES AYARI DİNLEYİCİSİ
volumeSlider.addEventListener('input', () => {
    masterGainNode.gain.value = volumeSlider.value;
    volumeDisplay.textContent = Math.round(volumeSlider.value * 100);
});

// {YENİ} SUSTAIN PEDALI DİNLEYİCİSİ
sustainSwitch.addEventListener('change', () => {
    // Eğer pedal KAPATILDIYSA
    if (!sustainSwitch.checked) {
        console.log("Sustain Pedalı KAPALI. Çalan tüm notalar durduruluyor.");
        // O an çalan (havada asılı olan) tüm notaları durdur
        activeNotes.forEach((value, key) => {
            stopNote(key);
        });
    } else {
        console.log("Sustain Pedalı AÇIK.");
    }
});


// Oktav Butonları
octaveDownBtn.addEventListener(clickEvent, (e) => { e.preventDefault(); octaveDown(); });
octaveUpBtn.addEventListener(clickEvent, (e) => { e.preventDefault(); octaveUp(); });

// Klavye (Masaüstü)
window.addEventListener('keydown', (e) => {
    if (optionsPanel.style.display === 'block') return;
    if (e.repeat) return; 
    
    const keyChar = e.key.toLowerCase();
    if (keyChar === 'z') octaveDown();
    else if (keyChar === 'x') octaveUp();
    
    const noteBase = keyMap[keyChar];
    if (noteBase) {
        const fullNote = noteBase + currentOctave;
        if (ABSOLUTE_CENT_MAP[fullNote] !== undefined && !activeNotes.has(fullNote)) {
            const baseCentValue = ABSOLUTE_CENT_MAP[fullNote];
            const targetFrequency = centToHz(baseCentValue);
            playFrequency(targetFrequency, fullNote);
            highlightKey(document.querySelector(`.piano .key[data-note="${noteBase}"]`));
        }
    }
});

window.addEventListener('keyup', (e) => {
    const noteBase = keyMap[e.key.toLowerCase()];
    if (noteBase) {
        const fullNote = noteBase + currentOctave;
        if (ABSOLUTE_CENT_MAP[fullNote] !== undefined) { 
            stopNote(fullNote); // Pedal AÇIK ise bu bir şey yapmayacak
        }
    }
});

// Panel Kapatma Düğmesi
closeOptionsButton.addEventListener(clickEvent, (e) => {
    e.preventDefault();
    optionsPanel.style.display = 'none';
});

// Panel Seçenek Tuşları
optionKeys.forEach(key => {
    key.addEventListener(clickEvent, (e) => {
        e.preventDefault();
        const freqToPlay = parseFloat(key.dataset.frequency);
        playFrequency(freqToPlay, null); 
        highlightKey(key);
        console.log(`Panelden çalındı: ${freqToPlay} Hz`);
    });
});

// --- 8. Başlangıç ---
currentMode = document.querySelector('.mode-btn.selected').dataset.mode;
masterGainNode.gain.value = volumeSlider.value;
loadBaseSounds(); // 16 sesi de yükle
updateKeys(); 
console.log(`HTML Piyano (Nihai Cent Motoru + Sustain Kütüphanesi) yüklendi. Varsayılan mod: ${currentMode}`);