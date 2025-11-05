// --- 1. Değişkenler ve Ayarlar ---
const clickEvent = 'ontouchstart' in window ? 'touchstart' : 'click';
let isMousePlaying = false; // {YENİ} Mouse ile sürükleyerek çalma durumu

let customMidiMapping = new Map(); 
let reverseCustomMidiMapping = new Map(); 
let isMidiLearning = false;
let soundToMap = null; 

// {YENİ} Web piyano tuşları için ayrı haritalama
let webKeyMapping = new Map();
let isWebKeyLearning = false;
let lastSelectedMicroSound = null; // { freq, name, el }

const midiPanel = document.getElementById('midi-mapping-panel');
const midiLearnBtn = document.getElementById('midi-learn-btn');
const midiLearnStatus = document.getElementById('midi-learn-status');
const midiMappingList = document.getElementById('midi-mapping-list');
const midiClearBtn = document.getElementById('midi-clear-mappings-btn');
const toggleMidiPanelBtn = document.getElementById('toggle-midi-panel-btn');
const closeMidiPanelBtn = document.getElementById('close-midi-panel-btn');

const pianoKeyboard = document.getElementById('piano-keyboard'); 
const pianoScrollContainer = pianoKeyboard.parentElement;

const volumeSlider = document.getElementById('volume-slider');
const volumeDisplay = document.getElementById('volume-display');
const freqDisplay = document.getElementById('freq-display');

const modeSelector = document.getElementById('mode-selector');
const modeButtons = document.querySelectorAll('.mode-btn');
let currentMode = '4ses'; 

const sustainSwitch = document.getElementById('sustain-switch');
const showNoteNamesSwitch = document.getElementById('show-note-names-switch');

const keyMap = {
    'q': 'C4',  'w': 'C#4', 'e': 'D4',  'r': 'D#4', 't': 'E4', 'y': 'F4', 
    'u': 'F#4', 'ı': 'G4',  'o': 'G#4', 'p': 'A4', 'ğ': 'A#4', 'ü': 'B4'
};

const optionsPanelContainer = document.getElementById('options-panel-container');
const optionsPanel = document.getElementById('options-panel');
const optionsKeyContainer = document.getElementById('options-key-container');
const optionsPanelTitle = document.getElementById('options-panel-title');
const optionsPanelCloseBtn = document.getElementById('options-panel-close-btn');

// {YENİ} Panel Eylem Düğmeleri
const optionsPanelActions = document.getElementById('options-panel-actions');
const quickMapBtn = document.getElementById('quick-map-btn');
const resetMapBtn = document.getElementById('reset-map-btn');


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

const midiNoteMap = {};
(function createMidiMap() {
    for (const noteName in ABSOLUTE_CENT_MAP) {
        const cent = ABSOLUTE_CENT_MAP[noteName];
        const midiNote = Math.round(cent / 100) + 21;
        midiNoteMap[midiNote] = noteName;
    }
})();

// --- 3. SES YÜKLEME VE BAĞLAM ---
let audioContext = new (window.AudioContext || window.webkitAudioContext)({
    latencyHint: 'interactive'
});
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

// --- 4. SES ÇALMA (SUSTAIN MANTIĞI) ---
function centToHz(centValue) {
    return A0_HZ * Math.pow(2, centValue / 1200);
}

function stopNote(fullNote) {
    if (activeNotes.has(fullNote)) {
        const noteNodes = activeNotes.get(fullNote);
        const now = audioContext.currentTime;
        const sustainDuration = 7.0;
        const releaseDuration = 0.6; 

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
function playFrequency(targetFrequency, fullNote = null, velocity = 127) {
    if (targetFrequency <= 0.0) { return; }
    if (fullNote && activeNotes.has(fullNote)) {
        return; // Zaten çalıyorsa tekrar çalma
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

// --- BÖLÜM 5: 88-TUŞ PİYANO OLUŞTURMA ---
function generatePianoKeys() {
    pianoKeyboard.innerHTML = ''; 
    
    const whiteKeyWidth = 32; 
    const blackKeyWidth = 22;
    const blackKeyHeight = "120px";
    
    let whiteKeyIndex = 0;
    
    for (const noteName in ABSOLUTE_CENT_MAP) {
        const key = document.createElement('div');
        const span = document.createElement('span');
        span.textContent = noteName;
        key.appendChild(span);
        
        key.dataset.note = noteName;
        const isBlack = noteName.includes('#');
        
        if (isBlack) {
            key.className = 'key black';
            key.style.height = blackKeyHeight;
            key.style.left = `${(whiteKeyIndex * whiteKeyWidth) - (blackKeyWidth / 2)}px`;
        } else {
            key.className = 'key white';
            key.style.left = `${whiteKeyIndex * whiteKeyWidth}px`;
            whiteKeyIndex++; 
        }
        
        if (webKeyMapping.has(noteName)) {
            key.classList.add('mapped-web');
        }
        
        pianoKeyboard.appendChild(key);
    }
    pianoKeyboard.style.width = `${whiteKeyIndex * whiteKeyWidth}px`;
}


// === {GÜNCELLENDİ} MİKROTONAL PANEL MANTIĞI ===
let currentOpenPanelNote = null; 

function closeOptionsPanel() {
    optionsPanelContainer.style.display = 'none'; 
    optionsPanelActions.style.display = 'none';
    currentOpenPanelNote = null;
    isWebKeyLearning = false;
    if (lastSelectedMicroSound) {
        lastSelectedMicroSound.el.classList.remove('selected');
        lastSelectedMicroSound = null;
    }
}

function openOptionsPanel(noteData) {
    if (optionsPanelContainer.style.display === 'block' && currentOpenPanelNote === noteData.fullNote) {
        closeOptionsPanel();
        return;
    }
    
    isWebKeyLearning = false;
    if (lastSelectedMicroSound) {
        lastSelectedMicroSound.el.classList.remove('selected');
        lastSelectedMicroSound = null;
    }
    
    optionsKeyContainer.innerHTML = ''; 
    
    const fullNote = noteData.fullNote;
    const baseCentValue = noteData.baseCentValue;
    currentOpenPanelNote = fullNote; 
    
    optionsPanelTitle.textContent = `${fullNote} Özel Sesleri`;
    
    const mode = CENT_MODES[currentMode];
    const steps = mode.steps; 
    const centIncrement = mode.increment;
    const whiteKeyWidth = 32;

    for (let i = 0; i < steps; i++) {
        const centOffset = (i + 1) * centIncrement;
        const finalCentValue = baseCentValue + centOffset;
        const targetHz = centToHz(finalCentValue);
        
        const key = document.createElement('div');
        key.className = 'key white'; 
        key.dataset.optionIndex = i;
        key.dataset.frequency = targetHz;
        key.dataset.name = `${fullNote} +${i+1}`;
        
        const span = document.createElement('span');
        span.textContent = (i + 1).toString();
        key.appendChild(span);
        
        optionsKeyContainer.appendChild(key);
    }
    
    optionsKeyContainer.style.width = `${steps * whiteKeyWidth}px`;
    optionsPanelContainer.style.display = 'block';
    
    optionsPanelActions.style.display = 'flex';
    quickMapBtn.textContent = `Assign Micro-Sound to ${fullNote}`;
    quickMapBtn.classList.remove('learning');
    resetMapBtn.textContent = `Reset ${fullNote} to Default`;
    resetMapBtn.disabled = !webKeyMapping.has(fullNote);
};

// --- {GÜNCELLENDİ} BÖLÜM 6: Olay Dinleyicileri (Polifoni + Hızlı Haritalama) ---
const activePresses = new Map(); 

const getNoteDataFromElement = (el) => {
    const keyElement = el.closest('.key');
    if (!keyElement) return null; 

    if (keyElement.dataset.optionIndex !== undefined) {
        return {
            isOptionKey: true,
            noteEl: keyElement,
            frequency: parseFloat(keyElement.dataset.frequency),
            name: keyElement.dataset.name,
            index: parseInt(keyElement.dataset.optionIndex)
        };
    }

    const fullNote = keyElement.dataset.note;
    if (!fullNote || ABSOLUTE_CENT_MAP[fullNote] === undefined) return null;
    
    const baseCentValue = ABSOLUTE_CENT_MAP[fullNote];
    return {
        isOptionKey: false,
        noteEl: keyElement, 
        fullNote, 
        baseCentValue
    };
};

const handlePianoPress = (e, isContextMenu = false) => {
    e.preventDefault();
    const noteData = getNoteDataFromElement(e.target);
    if (!noteData) return;

    // {GÜNCELLENDİ} Mouse ile basılan tuşlara 'mouse-' ön eki ekle
    const pressId = e.touches ? e.changedTouches[0].identifier : (noteData.isOptionKey ? `mouse-opt-${noteData.index}` : `mouse-${noteData.fullNote}`);

    // --- Panel Tuşuna Basıldı ---
    if (noteData.isOptionKey) {
        if (isWebKeyLearning) {
            addWebKeyMapping(currentOpenPanelNote, { freq: noteData.frequency, name: noteData.name });
            closeOptionsPanel();
            return;
        }
        
        if (isMidiLearning) {
            selectSoundForMidiLearn(noteData.frequency, noteData.name);
            return;
        }
        
        if (isContextMenu) return; 
        if (activePresses.has(pressId)) return;

        if (lastSelectedMicroSound) {
            lastSelectedMicroSound.el.classList.remove('selected');
        }
        noteData.noteEl.classList.add('selected');
        lastSelectedMicroSound = { freq: noteData.frequency, name: noteData.name, el: noteData.noteEl };

        playFrequency(noteData.frequency, `panel-${noteData.index}`, 127);
        activePresses.set(pressId, { ...noteData, fullNote: `panel-${noteData.index}`, pressTimer: null });
        return;
    }
    
    // --- Ana Piyano Tuşuna Basıldı ---
    lastPlayedNoteData = noteData; 

    if (isMidiLearning) {
        const freq = centToHz(noteData.baseCentValue);
        selectSoundForMidiLearn(freq, noteData.fullNote);
        return;
    }
    
    if (isContextMenu) {
        openOptionsPanel(noteData);
        return;
    }
    
    // Sol Tık veya Dokunma
    if (activePresses.has(pressId) && !isMousePlaying) return; 
    if (activeNotes.has(noteData.fullNote)) return; 

    const mappedSound = webKeyMapping.get(noteData.fullNote);
    
    if (mappedSound) {
        playFrequency(mappedSound.freq, noteData.fullNote, 127);
    } else {
        playFrequency(centToHz(noteData.baseCentValue), noteData.fullNote, 127);
    }
    highlightKey(noteData.noteEl);

    // Uzun basma
    const timer = setTimeout(() => {
        openOptionsPanel(noteData);
        if (activePresses.has(pressId)) {
            activePresses.get(pressId).pressTimer = null;
        }
    }, 400); 
    
    activePresses.set(pressId, { ...noteData, pressTimer: timer });
};

const handlePianoRelease = (e) => {
    e.preventDefault();
    
    const targetEl = e.target;
    const noteData = getNoteDataFromElement(targetEl);
    if (!noteData) {
        return;
    }
    
    // {GÜNCELLENDİ} Mouse ile basılan tuşlara 'mouse-' ön eki ekle
    const pressId = e.touches ? e.changedTouches[0].identifier : (noteData.isOptionKey ? `mouse-opt-${noteData.index}` : `mouse-${noteData.fullNote}`);
    const pressData = activePresses.get(pressId);
    
    if (!pressData) return;

    if (pressData.pressTimer) {
        clearTimeout(pressData.pressTimer);
    }
    
    stopNote(pressData.fullNote);
    activePresses.delete(pressId);
};


// Olayları ana piyano konteynerine devret (SÜRÜKLEME MANTIĞI EKLENDİ)
pianoKeyboard.addEventListener('mousedown', (e) => {
    if (clickEvent === 'click' && e.button === 0) {
        isMousePlaying = true; // Sürüklemeyi başlat
        handlePianoPress(e);
    }
});

// {YENİ} Mouse ile sürükleyerek çalma (mouseover)
pianoKeyboard.addEventListener('mouseover', (e) => {
    if (clickEvent === 'click' && isMousePlaying && e.buttons === 1) {
        handlePianoPress(e);
    }
});

// {YENİ} Mouse ile sürüklerken tuştan çıkma (mouseout)
pianoKeyboard.addEventListener('mouseout', (e) => {
    if (clickEvent === 'click' && isMousePlaying && e.buttons === 1) {
        handlePianoRelease(e);
    }
});

pianoKeyboard.addEventListener('mouseup', (e) => {
    if (clickEvent === 'click' && e.button === 0) {
        isMousePlaying = false; // Sürüklemeyi durdur
    }
});

// --- DOKUNMATİK DİNLEYİCİLERİ (Aynı kaldı) ---
pianoKeyboard.addEventListener('touchstart', (e) => handlePianoPress(e));
pianoKeyboard.addEventListener('touchend', (e) => handlePianoRelease(e));
pianoKeyboard.addEventListener('touchcancel', (e) => handlePianoRelease(e));
pianoKeyboard.addEventListener('contextmenu', (e) => handlePianoPress(e, true)); 

// Olayları mikrotonal panel konteynerine devret
optionsKeyContainer.addEventListener('mousedown', (e) => {
    if (clickEvent === 'click' && e.button === 0) handlePianoPress(e);
});
optionsKeyContainer.addEventListener('mouseup', (e) => {
    if (clickEvent === 'click' && e.button === 0) handlePianoRelease(e);
});
optionsKeyContainer.addEventListener('mouseleave', (e) => {
    if (clickEvent === 'click' && e.buttons === 1) handlePianoRelease(e);
});
optionsKeyContainer.addEventListener('touchstart', (e) => handlePianoPress(e));
optionsKeyContainer.addEventListener('touchend', (e) => handlePianoRelease(e));
optionsKeyContainer.addEventListener('touchcancel', (e) => handlePianoRelease(e));
optionsKeyContainer.addEventListener('contextmenu', (e) => e.preventDefault()); 


// --- 7. Diğer Olay Dinleyicileri ---

// {GÜNCELLENDİ} Mouse tuşu pencerenin herhangi bir yerinde bırakılırsa
window.addEventListener('mouseup', (e) => {
    if (clickEvent === 'click' && e.button === 0 && isMousePlaying) {
        isMousePlaying = false;
        
        activePresses.forEach((pressData, pressId) => {
            // {GÜNCELLENDİ} Sadece 'mouse-' ön ekine sahip notaları durdur
            if (typeof pressId === 'string' && pressId.startsWith('mouse-')) { 
                stopNote(pressData.fullNote); 
                activePresses.delete(pressId);
            }
        });
    }
});

// MOD SEÇİCİ DİNLEYİCİSİ
modeButtons.forEach(button => {
    button.addEventListener(clickEvent, (e) => {
        modeButtons.forEach(btn => btn.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        currentMode = e.currentTarget.dataset.mode;
        console.log(`Aralık Modu değiştirildi: ${currentMode}`);
        if (currentOpenPanelNote && lastPlayedNoteData) {
            openOptionsPanel(lastPlayedNoteData);
        }
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

// NOTA İSMİ GÖSTER DİNLEYİCİSİ
showNoteNamesSwitch.addEventListener('change', () => {
    if (showNoteNamesSwitch.checked) {
        document.body.classList.remove('hide-note-names');
    } else {
        document.body.classList.add('hide-note-names');
    }
});

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
    
    const fullNote = keyMap[keyChar];
    if (fullNote) {
        // {GÜNCELLENDİ} baseCentValue'yu burada tanımla
        const baseCentValue = ABSOLUTE_CENT_MAP[fullNote];
        if (baseCentValue !== undefined && !activeNotes.has(fullNote)) { 
            
            const mappedSound = webKeyMapping.get(fullNote);
            if (mappedSound) {
                playFrequency(mappedSound.freq, fullNote, 127);
            } else {
                playFrequency(centToHz(baseCentValue), fullNote, 127);
            }
            
            const keyElement = document.querySelector(`.piano .key[data-note="${fullNote}"]`);
            highlightKey(keyElement);
            lastPlayedNoteData = { noteBase: fullNote.replace(/\d/g, ''), fullNote, baseCentValue };
            
            // {GÜNCELLENDİ} Klavye için activePresses'e 'key-' ön eki ile ekleme
            activePresses.set(`key-${fullNote}`, { fullNote, baseCentValue, pressTimer: null });
        }
    }
});

window.addEventListener('keyup', (e) => {
    const keyChar = e.key.toLowerCase();
    if (keyChar === 'c') return; 
    const fullNote = keyMap[keyChar];
    if (fullNote) {
        if (ABSOLUTE_CENT_MAP[fullNote] !== undefined) { 
            stopNote(fullNote);
            // {GÜNCELLENDİ} Klavye için activePresses'ten 'key-' ön eki ile silme
            activePresses.delete(`key-${fullNote}`);
        }
    }
});

// {YENİ} Özel Panel Kapatma Düğmesi
optionsPanelCloseBtn.addEventListener('click', closeOptionsPanel);


// {YENİ} WEB TUŞU HARİTALAMA YARDIMCILARI
function addWebKeyMapping(noteName, soundData) {
    if (!noteName || !soundData) return;
    
    webKeyMapping.set(noteName, soundData);
    const keyElement = document.querySelector(`.piano .key[data-note="${noteName}"]`);
    if (keyElement) {
        keyElement.classList.add('mapped-web');
    }
    console.log(`WEB KEY MAP: ${noteName} -> ${soundData.name}`);
    closeOptionsPanel();
}

function removeWebKeyMapping(noteName) {
    if (!noteName) return;
    
    if (webKeyMapping.has(noteName)) {
        webKeyMapping.delete(noteName);
        const keyElement = document.querySelector(`.piano .key[data-note="${noteName}"]`);
        if (keyElement) {
            keyElement.classList.remove('mapped-web');
        }
        console.log(`WEB KEY MAP: ${noteName} -> reset to default`);
    }
    closeOptionsPanel();
}


// --- WEB MIDI API & MAP PANEL MANTIĞI ---
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
function handleMIDIMessage(message) {
    const [command, note, velocity] = message.data;
    const commandType = command & 0xF0;
    if (isMidiLearning && soundToMap && commandType === 0x90 && velocity > 0) {
        addMapping(note, soundToMap);
        return; 
    }
    const customSound = customMidiMapping.get(note);
    if (commandType === 0x90 && velocity > 0) {
        if (customSound) {
            playFrequency(customSound.freq, `midi-${note}`, velocity);
        } else {
            const noteName = midiNoteMap[note];
            if (noteName && ABSOLUTE_CENT_MAP[noteName] !== undefined) {
                const webMappedSound = webKeyMapping.get(noteName);
                const baseCentValue = ABSOLUTE_CENT_MAP[noteName];

                if (webMappedSound) {
                    playFrequency(webMappedSound.freq, noteName, velocity);
                } else {
                    playFrequency(centToHz(baseCentValue), noteName, velocity);
                }
                 
                lastPlayedNoteData = { 
                    noteBase: noteName.replace(/\d/, ''),
                    fullNote: noteName, 
                    baseCentValue: baseCentValue 
                };
                const keyElement = document.querySelector(`.piano .key[data-note="${noteName}"]`);
                highlightKey(keyElement);
            }
        }
    } 
    else if (commandType === 0x80 || (commandType === 0x90 && velocity === 0)) {
        if (customSound) {
            stopNote(`midi-${note}`);
        } else {
            const noteName = midiNoteMap[note];
            if (noteName) stopNote(noteName);
        }
    }
}
function startMidiLearn() {
    if (isMidiLearning) {
        cancelMidiLearn();
    } else {
        isMidiLearning = true;
        soundToMap = null;
        midiLearnBtn.textContent = 'CANCEL LEARN';
        midiLearnBtn.classList.add('learning');
        midiLearnStatus.textContent = 'STEP 1: Click any sound...';
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
    soundToMap = { freq, name };
    midiLearnStatus.textContent = `STEP 2: Press a key on your MIDI keyboard...`;
}
function addMapping(midiNote, soundData) {
    if (customMidiMapping.has(midiNote)) {
        removeMapping(midiNote, false); 
    }
    if (reverseCustomMidiMapping.has(soundData.freq)) {
        const oldMidiNote = reverseCustomMidiMapping.get(soundData.freq);
        removeMapping(oldMidiNote, false);
    }
    customMidiMapping.set(midiNote, soundData);
    reverseCustomMidiMapping.set(soundData.freq, midiNote);
    console.log(`BAŞARILI ATAMA: MIDI ${midiNote} -> ${soundData.name} (${soundData.freq.toFixed(2)} Hz)`);
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
    midiMappingList.innerHTML = ''; 
    if (customMidiMapping.size === 0) {
        midiMappingList.innerHTML = '<li>No mappings yet.</li>';
        return;
    }
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
loadBaseSounds(); 

generatePianoKeys(); // Piyanoyu oluştur

if (!showNoteNamesSwitch.checked) {
    document.body.classList.add('hide-note-names');
}

// {YENİ} Kaydırma Düğmeleri Olay Dinleyicileri
const scrollLeftBtn = document.getElementById('scroll-left-btn');
const scrollRightBtn = document.getElementById('scroll-right-btn');
const SCROLL_AMOUNT = 300; // Piksel cinsinden kaydırma miktarı

scrollLeftBtn.addEventListener('click', () => {
    pianoScrollContainer.scrollBy({
        left: -SCROLL_AMOUNT,
        behavior: 'smooth'
    });
});

scrollRightBtn.addEventListener('click', () => {
    pianoScrollContainer.scrollBy({
        left: SCROLL_AMOUNT,
        behavior: 'smooth'
    });
});

setupMIDI(); 
midiLearnBtn.addEventListener('click', startMidiLearn);
midiClearBtn.addEventListener('click', clearAllMappings);
updateMappingListUI();

// MIDI Panel Aç/Kapat mantığı
toggleMidiPanelBtn.addEventListener('click', () => {
    document.body.classList.add('midi-panel-open');
});
closeMidiPanelBtn.addEventListener('click', () => {
    document.body.classList.remove('midi-panel-open');
    cancelMidiLearn(); 
});

// {YENİ} Sürükleyerek Kaydırma
let isDragging = false;
let startX;
let scrollLeft;

pianoScrollContainer.addEventListener('mousedown', (e) => {
    // Sadece tuşların dışındaki alana tıklandığında sürüklemeyi başlat
    if (e.target !== pianoScrollContainer && e.target !== pianoKeyboard) return;
    isDragging = true;
    pianoScrollContainer.classList.add('dragging');
    startX = e.pageX - pianoScrollContainer.offsetLeft;
    scrollLeft = pianoScrollContainer.scrollLeft;
});
pianoScrollContainer.addEventListener('mouseleave', () => {
    isDragging = false;
    pianoScrollContainer.classList.remove('dragging');
});
pianoScrollContainer.addEventListener('mouseup', () => {
    isDragging = false;
    pianoScrollContainer.classList.remove('dragging');
});
pianoScrollContainer.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - pianoScrollContainer.offsetLeft;
    const walk = (x - startX) * 2; // Sürükleme hızını artır
    pianoScrollContainer.scrollLeft = scrollLeft - walk;
});

// {YENİ} Hızlı Atama Düğme Olayları
quickMapBtn.addEventListener('click', () => {
    isWebKeyLearning = true;
    quickMapBtn.textContent = 'Select a micro-key above to assign...';
    quickMapBtn.classList.add('learning');
});

resetMapBtn.addEventListener('click', () => {
    if (currentOpenPanelNote) {
        removeWebKeyMapping(currentOpenPanelNote);
    }
});


console.log(`HTML Piyano (Polifoni + Hızlı Map) yüklendi. Varsayılan mod: ${currentMode}`);