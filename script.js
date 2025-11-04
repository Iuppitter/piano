// --- 1. Değişkenler ve Ayarlar ---
const clickEvent = 'ontouchstart' in window ? 'touchstart' : 'click';

// {YENİ} MIDI ÖZEL ATAMA (PANEL) MANTIĞI
let customMidiMapping = new Map(); // MIDI Notası (örn: 61) -> { freq: 445.44, name: "C4 +20c" }
let reverseCustomMidiMapping = new Map(); // Frekans (örn: 445.44) -> MIDI Notası (örn: 61)
let isMidiLearning = false;
let soundToMap = null; // { freq: 445.44, name: "C4 +20c" }

// {YENİ} Yeni Panel DOM Elementleri
const midiPanel = document.getElementById('midi-mapping-panel');
const midiLearnBtn = document.getElementById('midi-learn-btn');
const midiLearnStatus = document.getElementById('midi-learn-status');
const midiMappingList = document.getElementById('midi-mapping-list');
const midiClearBtn = document.getElementById('midi-clear-mappings-btn');


// {YENİ} Basılı tutma (long-press) için zamanlayıcı
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

// {YENİ} Yeni klavye haritası
const keyMap = {
    'q': 'C',  'w': 'C#', 'e': 'D',  'r': 'D#', 't': 'E', 'y': 'F', 
    'u': 'F#', 'ı': 'G',  'o': 'G#', 'p': 'A', 'ğ': 'A#', 'ü': 'B'
};

let currentOctave = 4;
const minOctave = 0;
const maxOctave = 8;
const optionsPanel = document.getElementById('options-panel');
const optionsNoteName = document.getElementById('options-note-name');
const closeOptionsButton = document.getElementById('close-options-panel');
const optionKeys = document.querySelectorAll('.option-key'); // 5 tuş

// 'C' tuşuyla paneli açmak için son çalınan notayı sakla
let lastPlayedNoteData = null;

// --- 2. BEYİN: CENT HARİTASI (A0 = 0 cent) ---
const A0_HZ = 27.50;
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
const CENT_MODES = {
    '1ses': { steps: 1, increment: 100 / 2 }, // 50c
    '2ses': { steps: 2, increment: 100 / 3 }, // 33.33c
    '3ses': { steps: 3, increment: 100 / 4 }, // 25c
    '4ses': { steps: 4, increment: 100 / 5 }, // 20c
    '5ses': { steps: 5, increment: 100 / 6 }  // 16.67c
};

// {YENİ} MIDI NOTA HARİTASI (MIDI No -> Nota Adı)
const midiNoteMap = {};
(function createMidiMap() {
    const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    midiNoteMap[21] = 'A0'; midiNoteMap[22] = 'A#0'; midiNoteMap[23] = 'B0';
    for (let octave = 1; octave <= 7; octave++) {
        for (let i = 0; i < noteOrder.length; i++) {
            midiNoteMap[24 + (octave - 1) * 12 + i] = noteOrder[i] + octave;
        }
    }
    midiNoteMap[108] = 'C8';
})();

// --- 3. SES YÜKLEME VE BAĞLAM ---
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
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

function loadBaseSounds() {
    const loadPromises = [];
    for (const noteKey in BASE_NOTES) {
        const paths = BASE_NOTES[noteKey];
        loadPromises.push(
            loadSound(paths.path_normal)
                .then(buffer => ({ type: 'normal', key: noteKey, buffer: buffer }))
                .catch(err => ({ type: 'normal', key: noteKey, buffer: null, error: err.message }))
        );
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

function stopNote(fullNote) {
    if (activeNotes.has(fullNote)) {
        const noteNodes = activeNotes.get(fullNote);
        const now = audioContext.currentTime;
        
        const sustainDuration = 7.0;
        const releaseDuration = 1.0; 

        const duration = sustainSwitch.checked ? sustainDuration : releaseDuration;
        
        noteNodes.gain.gain.cancelScheduledValues(now);
        noteNodes.gain.gain.setValueAtTime(noteNodes.gain.gain.value, now);
        noteNodes.gain.gain.linearRampToValueAtTime(0, now + duration);

        setTimeout(() => {
            noteNodes.source.stop();
            noteNodes.source.disconnect();
            noteNodes.gain.disconnect();
            activeNotes.delete(fullNote);
        }, duration * 1000 + 100);
    }
}

// {GÜNCELLENDİ} MIDI velocity (hız) desteği eklendi
function playFrequency(targetFrequency, fullNote = null, velocity = 127) {
    if (targetFrequency <= 0.0) { return; }
    if (fullNote && activeNotes.has(fullNote)) {
        stopNote(fullNote);
    }

    freqDisplay.textContent = targetFrequency.toFixed(2);

    const sampleSetKey = sustainSwitch.checked ? 'sustain' : 'normal';
    const sampleSet = baseSoundBuffers[sampleSetKey];

    let bestSampleKey = null;
    let minDiff = Infinity;
    for (const noteKey in sampleSet) {
        if (sampleSet[noteKey]) {
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
    
    // {YENİ} Velocity (hız) ayarı
    const noteVolume = velocity / 127.0;
    noteGain.gain.setValueAtTime(noteVolume, audioContext.currentTime);

    source.buffer = baseSoundBuffer;
    source.playbackRate.value = playbackRate;
    source.connect(noteGain);
    noteGain.connect(masterGainNode);
    source.start(0);
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

// === {YENİ} PANEL AÇMA MANTIĞI (BASİT ETİKETLİ + 'C' TUŞU DÜZELTMESİ) ===
function closeOptionsPanel() {
    optionsPanel.style.display = 'none';
}

const openOptionsPanel = (noteData) => {
    if (optionsPanel.style.display === 'block' && optionsNoteName.textContent === noteData.fullNote) {
        return;
    }
    
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
            optKey.querySelector('span').textContent = (index + 1).toString();
            optKey.classList.remove('key-hidden');
        } else {
            optKey.classList.add('key-hidden');
        }
    });
    
    optionsPanel.style.display = 'block';
};

// --- 6. Olay Dinleyicileri (Piyano Tuşları) ---
keys.forEach(key => {
    
    let pressTimer = null; 
    let noteData = null; 

    const getNoteData = (keyElement) => {
        const fullNote = keyElement.dataset.fullNote;
        if (!fullNote || ABSOLUTE_CENT_MAP[fullNote] === undefined) return null;
        const noteBase = keyElement.dataset.note;
        const baseCentValue = ABSOLUTE_CENT_MAP[fullNote];
        return { noteBase, fullNote, baseCentValue };
    };

    // DOKUNMA BAŞLANGICI
    const handleNotePress = (e) => {
        e.preventDefault(); 
        noteData = getNoteData(e.currentTarget);
        if (!noteData) return;

        // {YENİ} MIDI ÖĞRENME MODU KONTROLÜ
        if (isMidiLearning) {
            const freq = centToHz(noteData.baseCentValue);
            selectSoundForMidiLearn(freq, noteData.fullNote); // Ana notayı öğrenmek için seç
            return; // Sesi çalma, sadece seç
        }

        lastPlayedNoteData = noteData; 

        // Sesi HEMEN çal
        const targetFrequency = centToHz(noteData.baseCentValue);
        playFrequency(targetFrequency, noteData.fullNote, 127); // Tuşla basmayı max velocity (127) say
        highlightKey(e.currentTarget);

        // Paneli açmak için zamanlayıcıyı başlat
        pressTimer = setTimeout(() => {
            openOptionsPanel(noteData);
            pressTimer = null; 
        }, 400); 
    };

    // DOKUNMA BİTİŞİ
    const handleNoteRelease = (e) => {
        e.preventDefault();
        
        if (pressTimer) { 
            clearTimeout(pressTimer); 
            pressTimer = null;
        }
        
        if (noteData) {
            stopNote(noteData.fullNote);
            noteData = null; 
        }
    };

    // Masaüstü
    key.addEventListener('mousedown', (e) => {
        if (clickEvent === 'click' && e.button === 0) { 
            handleNotePress(e);
        }
    });
    key.addEventListener('mouseup', (e) => {
        if (clickEvent === 'click' && e.button === 0) { 
            handleNoteRelease(e);
        }
    });
    key.addEventListener('mouseleave', (e) => {
        if (clickEvent === 'click') { 
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
            if (noteData) {
                stopNote(noteData.fullNote);
                noteData = null;
            }
        }
    });

    // Masaüstü 'contextmenu' (Sağ Tık)
    key.addEventListener('contextmenu', (e) => {
        e.preventDefault(); 
        if (isMidiLearning) return; // Öğrenme modundayken sağ tıkla panel açma
        const noteData = getNoteData(e.currentTarget);
        if (!noteData) return;
        openOptionsPanel(noteData);
    });

    // Mobil (Dokunmatik)
    key.addEventListener('touchstart', handleNotePress);
    key.addEventListener('touchend', handleNoteRelease);
    key.addEventListener('touchcancel', handleNoteRelease);
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

// SUSTAIN PEDALI DİNLEYİCİSİ
sustainSwitch.addEventListener('change', () => {
    if (!sustainSwitch.checked) {
        console.log("Sustain Pedalı KAPALI. Çalan tüm notalar durduruluyor.");
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
    if (e.repeat) return; 
    
    const keyChar = e.key.toLowerCase();
    
    if (keyChar === 'c') {
        if (lastPlayedNoteData) {
            openOptionsPanel(lastPlayedNoteData);
        }
        return; 
    }

    if (keyChar === 'z') {
        octaveDown();
        return; 
    }
    else if (keyChar === 'x') {
        octaveUp();
        return; 
    }
    
    const noteBase = keyMap[keyChar];
    if (noteBase) {
        const fullNote = noteBase + currentOctave;
        if (ABSOLUTE_CENT_MAP[fullNote] !== undefined && !activeNotes.has(fullNote)) { 
            const baseCentValue = ABSOLUTE_CENT_MAP[fullNote];
            const targetFrequency = centToHz(baseCentValue);
            
            // {GÜNCELLENDİ} Klavye de max velocity (127) ile çalar
            playFrequency(targetFrequency, fullNote, 127); 
            highlightKey(document.querySelector(`.piano .key[data-note="${noteBase}"]`));
            
            lastPlayedNoteData = { noteBase, fullNote, baseCentValue };
        }
    }
});

window.addEventListener('keyup', (e) => {
    const keyChar = e.key.toLowerCase();
    if (keyChar === 'c' || keyChar === 'z' || keyChar === 'x') return; 

    const noteBase = keyMap[keyChar];
    if (noteBase) {
        const fullNote = noteBase + currentOctave;
        if (ABSOLUTE_CENT_MAP[fullNote] !== undefined) { 
            stopNote(fullNote);
        }
    }
});

// Panel Kapatma Düğmesi
closeOptionsButton.addEventListener(clickEvent, (e) => {
    e.preventDefault();
    closeOptionsPanel();
});

// Panel Seçenek Tuşları
optionKeys.forEach((key, index) => { // {GÜNCELLENDİ} index eklendi
    let panelNoteId = null; 
    
    const handlePanelPress = (e) => {
        e.preventDefault();
        const freqToPlay = parseFloat(key.dataset.frequency);

        // {YENİ} MIDI ÖĞRENME MODU KONTROLÜ
        if (isMidiLearning) {
            const baseNoteName = optionsNoteName.textContent;
            const soundName = `${baseNoteName} +${index + 1}`; // örn: "C4 +1"
            selectSoundForMidiLearn(freqToPlay, soundName);
            return; // Sesi çalma, sadece seç
        }

        panelNoteId = `panel-${e.currentTarget.dataset.optionIndex}`; 
        
        playFrequency(freqToPlay, panelNoteId, 127); // max velocity
        highlightKey(key);
        
        lastPlayedNoteData = { 
            fullNote: optionsNoteName.textContent, 
            baseCentValue: ABSOLUTE_CENT_MAP[optionsNoteName.textContent] 
        };
    };
    
    const handlePanelRelease = (e) => {
        e.preventDefault();
        if (panelNoteId) {
            stopNote(panelNoteId);
            panelNoteId = null;
        }
    };
    
    key.addEventListener('mousedown', (e) => {
        if (clickEvent === 'click' && e.button === 0) handlePanelPress(e);
    });
    key.addEventListener('mouseup', (e) => {
        if (clickEvent === 'click' && e.button === 0) handlePanelRelease(e);
    });
    key.addEventListener('mouseleave', (e) => {
        if (clickEvent === 'click') handlePanelRelease(e);
    });
    
    key.addEventListener('touchstart', handlePanelPress);
    key.addEventListener('touchend', handlePanelRelease);
    key.addEventListener('touchcancel', handlePanelRelease);

    // {SİLİNDİ} Sağ tıkla öğrenme mantığı kaldırıldı
});


// --- {YENİ VE TAM GÜNCELLEME} WEB MIDI API & MAP PANEL MANTIĞI ---

// 1. MIDI Kurulum
function setupMIDI() {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({ sysex: false })
            .then(onMIDISuccess, onMIDIFailure);
    } else {
        console.warn("Tarayıcınız Web MIDI API'sini desteklemiyor.");
    }
}

function onMIDISuccess(midiAccess) {
    console.log("Web MIDI API başarıyla yüklendi. (Panel Modu Aktif)");
    const inputs = midiAccess.inputs.values();
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        console.log(`Bulunan MIDI cihazı: ${input.value.name}`);
        input.value.onmidimessage = handleMIDIMessage;
    }
    midiAccess.onstatechange = (e) => {
        const portName = e.port.name;
        if (e.port.state === "connected") {
            console.log(`Yeni MIDI cihazı bağlandı: ${portName}`);
            e.port.onmidimessage = handleMIDIMessage;
        } else if (e.port.state === "disconnected") {
            console.log(`MIDI cihazı çıkarıldı: ${portName}`);
        }
    };
}

function onMIDIFailure() {
    console.error('MIDI erişimi reddedildi.');
    midiLearnStatus.textContent = 'MIDI erişimi reddedildi!';
    midiLearnStatus.style.color = '#e74c3c';
}

// 2. Ana MIDI Mesaj İşleyici
function handleMIDIMessage(message) {
    const [command, note, velocity] = message.data;
    const commandType = command & 0xF0;

    // --- DURUM 1: MIDI ÖĞRENME MODU AKTİF ---
    if (isMidiLearning && soundToMap && commandType === 0x90 && velocity > 0) {
        // STEP 2: Kullanıcı bir MIDI tuşuna bastı
        addMapping(note, soundToMap);
        return; 
    }

    // --- DURUM 2: STANDART ÇALMA MODU ---
    const customSound = customMidiMapping.get(note);

    if (commandType === 0x90 && velocity > 0) { // Note On
        if (customSound) {
            // ÖZEL ATANMIŞ SESİ ÇAL
            playFrequency(customSound.freq, `midi-${note}`, velocity);
        } else {
            // STANDART SESİ ÇAL (Fallback)
            const noteName = midiNoteMap[note];
            if (noteName && ABSOLUTE_CENT_MAP[noteName] !== undefined) {
                const baseCentValue = ABSOLUTE_CENT_MAP[noteName];
                const targetFrequency = centToHz(baseCentValue);
                playFrequency(targetFrequency, noteName, velocity); 
                
                lastPlayedNoteData = { 
                    noteBase: noteName.replace(/\d/, ''),
                    fullNote: noteName, 
                    baseCentValue: baseCentValue 
                };
                
                const noteBase = noteName.replace(/\d/, '');
                const keyElement = document.querySelector(`.piano .key[data-note="${noteBase}"]`);
                if (keyElement) highlightKey(keyElement);
            }
        }
    } 
    else if (commandType === 0x80 || (commandType === 0x90 && velocity === 0)) { // Note Off
        if (customSound) {
            stopNote(`midi-${note}`);
        } else {
            const noteName = midiNoteMap[note];
            if (noteName) stopNote(noteName);
        }
    }
}

// 3. MIDI Panel Kontrol Fonksiyonları
function startMidiLearn() {
    if (isMidiLearning) {
        // Zaten açıksa, iptal et
        cancelMidiLearn();
    } else {
        // Öğrenmeyi başlat (STEP 1)
        isMidiLearning = true;
        soundToMap = null;
        midiLearnBtn.textContent = 'CANCEL LEARN';
        midiLearnBtn.classList.add('learning');
        midiLearnStatus.textContent = 'STEP 1: Click any sound on the web piano...';
    }
}

function cancelMidiLearn() {
    isMidiLearning = false;
    soundToMap = null;
    midiLearnBtn.textContent = 'Start MIDI Learn';
    midiLearnBtn.classList.remove('learning');
    midiLearnStatus.textContent = 'Click \'Start\' to map a sound.';
}

function selectSoundForMidiLearn(freq, name) {
    if (!isMidiLearning) return;
    
    // STEP 1 tamamlandı
    soundToMap = { freq, name };
    midiLearnStatus.textContent = `STEP 2: Press a key on your MIDI keyboard to map "${name}"...`;
    // 'isMidiLearning' hala true, şimdi 'handleMIDIMessage' bir tuş bekliyor
}

function addMapping(midiNote, soundData) {
    // Bu MIDI tuşu veya bu frekans zaten atanmışsa, eski atamaları temizle
    if (customMidiMapping.has(midiNote)) {
        removeMapping(midiNote, false); // UI güncellemesi yapma
    }
    if (reverseCustomMidiMapping.has(soundData.freq)) {
        const oldMidiNote = reverseCustomMidiMapping.get(soundData.freq);
        removeMapping(oldMidiNote, false); // UI güncellemesi yapma
    }

    // Yeni atamayı yap
    customMidiMapping.set(midiNote, soundData);
    reverseCustomMidiMapping.set(soundData.freq, midiNote);
    
    console.log(`BAŞARILI ATAMA: MIDI ${midiNote} -> ${soundData.name} (${soundData.freq.toFixed(2)} Hz)`);

    // Modu sıfırla ve UI'ı güncelle
    cancelMidiLearn();
    updateMappingListUI();
}

function removeMapping(midiNote, doUpdateUI = true) {
    if (customMidiMapping.has(midiNote)) {
        const soundData = customMidiMapping.get(midiNote);
        customMidiMapping.delete(midiNote);
        reverseCustomMidiMapping.delete(soundData.freq);
        console.log(`Atama kaldırıldı: MIDI ${midiNote}`);
        
        if (doUpdateUI) {
            updateMappingListUI();
        }
    }
}

function clearAllMappings() {
    if (confirm('Are you sure you want to delete all MIDI mappings?')) {
        customMidiMapping.clear();
        reverseCustomMidiMapping.clear();
        updateMappingListUI();
        console.log('Tüm MIDI atamaları temizlendi.');
    }
}

function updateMappingListUI() {
    midiMappingList.innerHTML = ''; // Listeyi temizle
    
    if (customMidiMapping.size === 0) {
        midiMappingList.innerHTML = '<li>No mappings yet.</li>';
        return;
    }

    // Sıralı göstermek için MIDI notasına göre sırala
    const sortedMappings = [...customMidiMapping.entries()].sort((a, b) => a[0] - b[0]);

    for (const [midiNote, soundData] of sortedMappings) {
        const li = document.createElement('li');
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'midi-map-name';
        nameSpan.textContent = `MIDI ${midiNote} → ${soundData.name}`;
        nameSpan.title = `${soundData.name} (${soundData.freq.toFixed(2)} Hz)`;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'midi-map-remove-btn';
        removeBtn.textContent = 'X';
        removeBtn.dataset.midiNote = midiNote;
        
        removeBtn.addEventListener('click', (e) => {
            const noteToRemove = parseInt(e.currentTarget.dataset.midiNote);
            removeMapping(noteToRemove);
        });
        
        li.appendChild(nameSpan);
        li.appendChild(removeBtn);
        midiMappingList.appendChild(li);
    }
}


// --- 8. Başlangıç ---
currentMode = document.querySelector('.mode-btn.selected').dataset.mode;
masterGainNode.gain.value = volumeSlider.value;
loadBaseSounds(); // 16 sesi de yükle
updateKeys(); 

// {YENİ} MIDI MAP MANTIĞI BAŞLANGIÇ
setupMIDI(); 
midiLearnBtn.addEventListener('click', startMidiLearn);
midiClearBtn.addEventListener('click', clearAllMappings);
updateMappingListUI();

console.log(`HTML Piyano (Özel MIDI Panel Modu) yüklendi. Varsayılan mod: ${currentMode}`);