// src/ChordData/guitarChords.js

// Cấu trúc chuẩn: [Dây 6, Dây 5, Dây 4, Dây 3, Dây 2, Dây 1]
// -1: X (Câm), 0: Buông, Số: Ngăn bấm
export const guitarChords = {
    // --- C CHORDS ---
    "C": {
        "name": "C Major",
        "frets": [-1, 3, 2, 0, 1, 0],
        "fingers": [0, 3, 2, 0, 1, 0],
        "baseFret": 1
    },
    "Cm": {
        "name": "C Minor",
        "frets": [-1, 3, 5, 5, 4, 3],
        "fingers": [0, 1, 3, 4, 2, 1],
        "baseFret": 3
    },
    "C7": {
        "name": "C Dominant 7",
        "frets": [-1, 3, 2, 3, 1, 0],
        "fingers": [0, 3, 2, 4, 1, 0],
        "baseFret": 1
    },
    "C5": {
        "name": "C Power Chord",
        "frets": [-1, 3, 5, 5, -1, -1],
        "fingers": [0, 1, 3, 4, 0, 0],
        "baseFret": 3
    },
    "Cadd9": {
        "name": "C Add 9",
        "frets": [-1, 3, 2, 0, 3, 0],
        "fingers": [0, 2, 1, 0, 3, 0],
        "baseFret": 1
    },
    "Cmaj7": {
        "name": "C Major 7",
        "frets": [-1, 3, 2, 0, 0, 0],
        "fingers": [0, 3, 2, 0, 0, 0],
        "baseFret": 1
    },
    "Cdim": {
        "name": "C Diminished 7 (Common voicing)",
        "frets": [-1, 3, 4, 2, 4, -1],
        "fingers": [0, 2, 3, 1, 4, 0],
        "baseFret": 2
    },
    "Csus2": {
        "name": "C Suspended 2",
        "frets": [-1, 3, 0, 0, 1, -1],
        "fingers": [0, 3, 0, 0, 1, 0],
        "baseFret": 1
    },
    "Csus4": {
        "name": "C Suspended 4",
        "frets": [-1, 3, 3, 0, 1, 1],
        "fingers": [0, 3, 4, 0, 1, 1],
        "baseFret": 1
    },

    // --- D CHORDS ---
    "D": {
    "name": "D Major",
    "frets": [-1, -1, 0, 2, 3, 2],
    "fingers": [0, 0, 0, 1, 3, 2],
    "baseFret": 1
    },
    "Dm": {
        "name": "D Minor",
        "frets": [-1, -1, 0, 2, 3, 1],
        "fingers": [0, 0, 0, 2, 3, 1],
        "baseFret": 1
    },
    "D7": {
        "name": "D Dominant 7",
        "frets": [-1, -1, 0, 2, 1, 2],
        "fingers": [0, 0, 0, 2, 1, 3],
        "baseFret": 1
    },
    "D5": {
        "name": "D Power Chord",
        "frets": [-1, 5, 7, 7, -1, -1],
        "fingers": [0, 1, 3, 4, 0, 0],
        "baseFret": 5
    },
    "Dadd9": {
        "name": "D Add 9",
        "frets": [-1, -1, 0, 2, 5, 2],
        "fingers": [0, 0, 0, 1, 4, 1],
        "baseFret": 1
    },
    "Dmaj7": {
        "name": "D Major 7",
        "frets": [-1, -1, 0, 2, 2, 2],
        "fingers": [0, 0, 0, 1, 1, 1],
        "baseFret": 1
    },
    "Ddim": {
        "name": "D Diminished 7",
        "frets": [-1, -1, 0, 1, 0, 1],
        "fingers": [0, 0, 0, 1, 0, 2],
        "baseFret": 1
    },
    "Dsus2": {
        "name": "D Suspended 2",
        "frets": [-1, -1, 0, 2, 3, 0],
        "fingers": [0, 0, 0, 1, 3, 0],
        "baseFret": 1
    },
    "Dsus4": {
        "name": "D Suspended 4",
        "frets": [-1, -1, 0, 2, 3, 3],
        "fingers": [0, 0, 0, 1, 3, 4],
        "baseFret": 1
    },

    // --- E CHORDS ---
    "E": {
    "name": "E Major",
    "frets": [0, 2, 2, 1, 0, 0],
    "fingers": [0, 2, 3, 1, 0, 0],
    "baseFret": 1
    },
    "Em": {
        "name": "E Minor",
        "frets": [0, 2, 2, 0, 0, 0],
        "fingers": [0, 2, 3, 0, 0, 0],
        "baseFret": 1
    },
    "E7": {
        "name": "E Dominant 7",
        "frets": [0, 2, 0, 1, 0, 0],
        "fingers": [0, 2, 0, 1, 0, 0],
        "baseFret": 1
    },
    "E5": {
        "name": "E Power Chord",
        "frets": [0, 2, 2, -1, -1, -1],
        "fingers": [0, 1, 3, 0, 0, 0],
        "baseFret": 1
    },
    "Eadd9": {
        "name": "E Add 9",
        "frets": [0, 2, 2, 1, 0, 2],
        "fingers": [0, 2, 3, 1, 0, 4],
        "baseFret": 1
    },
    "Emaj7": {
        "name": "E Major 7",
        "frets": [0, 2, 1, 1, 0, 0],
        "fingers": [0, 3, 1, 2, 0, 0],
        "baseFret": 1
    },
    "Edim": {
        "name": "E Diminished 7 (Open)",
        "frets": [0, 1, 2, 0, 2, 0],
        "fingers": [0, 1, 2, 0, 3, 0],
        "baseFret": 1
    },
    "Esus2": {
        "name": "E Suspended 2",
        "frets": [0, 2, 4, 4, 0, 0],
        "fingers": [0, 1, 3, 4, 0, 0],
        "baseFret": 1
    },
    "Esus4": {
        "name": "E Suspended 4",
        "frets": [0, 2, 2, 2, 0, 0],
        "fingers": [0, 2, 3, 4, 0, 0],
        "baseFret": 1
    },

    // --- F CHORDS ---
    "F": {
    "name": "F Major (Barre)",
    "frets": [1, 3, 3, 2, 1, 1],
    "fingers": [1, 3, 4, 2, 1, 1],
    "baseFret": 1
    },
    "Fm": {
        "name": "F Minor",
        "frets": [1, 3, 3, 1, 1, 1],
        "fingers": [1, 3, 4, 1, 1, 1],
        "baseFret": 1
    },
    "F7": {
        "name": "F Dominant 7",
        "frets": [1, 3, 1, 2, 1, 1],
        "fingers": [1, 3, 1, 2, 1, 1],
        "baseFret": 1
    },
    "F5": {
        "name": "F Power Chord",
        "frets": [1, 3, 3, -1, -1, -1],
        "fingers": [1, 3, 4, 0, 0, 0],
        "baseFret": 1
    },
    "Fadd9": {
        "name": "F Add 9",
        "frets": [-1, -1, 3, 2, 1, 3],
        "fingers": [0, 0, 3, 2, 1, 4],
        "baseFret": 1
    },
    "Fmaj7": {
        "name": "F Major 7",
        "frets": [-1, -1, 3, 2, 1, 0],
        "fingers": [0, 0, 3, 2, 1, 0],
        "baseFret": 1
    },
    "Fdim": {
        "name": "F Diminished 7",
        "frets": [-1, -1, 3, 4, 3, 4],
        "fingers": [0, 0, 1, 3, 2, 4],
        "baseFret": 3
    },
    "Fsus2": {
        "name": "F Suspended 2",
        "frets": [-1, -1, 3, 0, 1, 1],
        "fingers": [0, 0, 3, 0, 1, 1],
        "baseFret": 1
    },
    "Fsus4": {
        "name": "F Suspended 4",
        "frets": [-1, -1, 3, 3, 1, 1],
        "fingers": [0, 0, 3, 4, 1, 1],
        "baseFret": 1
    },

    // --- G CHORDS ---
    "G": {
    "name": "G Major",
    "frets": [3, 2, 0, 0, 0, 3],
    "fingers": [3, 2, 0, 0, 0, 4],
    "baseFret": 1
    },
    "Gm": {
        "name": "G Minor (Barre)",
        "frets": [3, 5, 5, 3, 3, 3],
        "fingers": [1, 3, 4, 1, 1, 1],
        "baseFret": 3
    },
    "G7": {
        "name": "G Dominant 7",
        "frets": [3, 2, 0, 0, 0, 1],
        "fingers": [3, 2, 0, 0, 0, 1],
        "baseFret": 1
    },
    "G5": {
        "name": "G Power Chord",
        "frets": [3, 5, 5, -1, -1, -1],
        "fingers": [1, 3, 4, 0, 0, 0],
        "baseFret": 3
    },
    "Gadd9": {
        "name": "G Add 9",
        "frets": [3, 2, 0, 2, 0, 3],
        "fingers": [2, 1, 0, 3, 0, 4],
        "baseFret": 1
    },
    "Gmaj7": {
        "name": "G Major 7",
        "frets": [3, 2, 0, 0, 0, 2],
        "fingers": [3, 2, 0, 0, 0, 1],
        "baseFret": 1
    },
    "Gdim": {
        "name": "G Diminished 7",
        "frets": [-1, -1, 2, 3, 2, 3],
        "fingers": [0, 0, 1, 3, 2, 4],
        "baseFret": 1
    },
    "Gsus2": {
        "name": "G Suspended 2",
        "frets": [3, 0, 0, 0, 3, 3],
        "fingers": [1, 0, 0, 0, 3, 4],
        "baseFret": 1
    },
    "Gsus4": {
        "name": "G Suspended 4",
        "frets": [3, -1, 0, 0, 1, 3],
        "fingers": [3, 0, 0, 0, 1, 4],
        "baseFret": 1
    },

    // --- A CHORDS ---
    "A": {
    "name": "A Major",
    "frets": [-1, 0, 2, 2, 2, 0],
    "fingers": [0, 0, 1, 2, 3, 0],
    "baseFret": 1
    },
    "Am": {
        "name": "A Minor",
        "frets": [-1, 0, 2, 2, 1, 0],
        "fingers": [0, 0, 2, 3, 1, 0],
        "baseFret": 1
    },
    "A7": {
        "name": "A Dominant 7",
        "frets": [-1, 0, 2, 0, 2, 0],
        "fingers": [0, 0, 2, 0, 3, 0],
        "baseFret": 1
    },
    "A5": {
        "name": "A Power Chord",
        "frets": [-1, 0, 2, 2, -1, -1],
        "fingers": [0, 0, 1, 2, 0, 0],
        "baseFret": 1
    },
    "Aadd9": {
        "name": "A Add 9",
        "frets": [-1, 0, 2, 4, 2, 0],
        "fingers": [0, 0, 1, 3, 2, 0],
        "baseFret": 1
    },
    "Amaj7": {
        "name": "A Major 7",
        "frets": [-1, 0, 2, 1, 2, 0],
        "fingers": [0, 0, 2, 1, 3, 0],
        "baseFret": 1
    },
    "Adim": {
        "name": "A Diminished 7",
        "frets": [-1, 0, 1, 2, 1, 2],
        "fingers": [0, 0, 1, 3, 2, 4],
        "baseFret": 1
    },
    "Asus2": {
        "name": "A Suspended 2",
        "frets": [-1, 0, 2, 2, 0, 0],
        "fingers": [0, 0, 1, 2, 0, 0],
        "baseFret": 1
    },
    "Asus4": {
        "name": "A Suspended 4",
        "frets": [-1, 0, 2, 2, 3, 0],
        "fingers": [0, 0, 1, 2, 3, 0],
        "baseFret": 1
    },

    // --- B CHORDS ---
    "B": {
    "name": "B Major (Barre)",
    "frets": [-1, 2, 4, 4, 4, 2],
    "fingers": [0, 1, 2, 3, 4, 1],
    "baseFret": 1
    },
    "Bm": {
        "name": "B Minor (Barre)",
        "frets": [-1, 2, 4, 4, 3, 2],
        "fingers": [0, 1, 3, 4, 2, 1],
        "baseFret": 1
    },
    "B7": {
        "name": "B Dominant 7 (Open)",
        "frets": [-1, 2, 1, 2, 0, 2],
        "fingers": [0, 2, 1, 3, 0, 4],
        "baseFret": 1
    },
    "B5": {
        "name": "B Power Chord",
        "frets": [-1, 2, 4, 4, -1, -1],
        "fingers": [0, 1, 3, 4, 0, 0],
        "baseFret": 1
    },
    "Badd9": {
        "name": "B Add 9",
        "frets": [-1, -1, 9, 8, 7, 9],
        "fingers": [0, 0, 3, 2, 1, 4],
        "baseFret": 7
    },
    "Bmaj7": {
        "name": "B Major 7",
        "frets": [-1, 2, 4, 3, 4, 2],
        "fingers": [0, 1, 3, 2, 4, 1],
        "baseFret": 1
    },
    "Bdim": {
        "name": "B Diminished 7",
        "frets": [-1, 2, 3, 1, 3, 1],
        "fingers": [0, 2, 3, 1, 4, 1],
        "baseFret": 1
    },
    "Bsus2": {
        "name": "B Suspended 2",
        "frets": [-1, 2, 4, 4, 2, 2],
        "fingers": [0, 1, 3, 4, 1, 1],
        "baseFret": 1
    },
    "Bsus4": {
        "name": "B Suspended 4",
        "frets": [-1, 2, 4, 4, 5, 2],
        "fingers": [0, 1, 3, 3, 4, 1],
        "baseFret": 1
    },

    // --- C# / Db CHORDS ---
    "C#": {
    "name": "C# Major",
    "frets": [-1, 4, 6, 6, 6, 4],
    "fingers": [0, 1, 2, 3, 4, 1],
    "baseFret": 4
    },
    "C#m": {
        "name": "C# Minor",
        "frets": [-1, 4, 6, 6, 5, 4],
        "fingers": [0, 1, 3, 4, 2, 1],
        "baseFret": 4
    },
    "C#7": {
        "name": "C# Dominant 7",
        "frets": [-1, 4, 6, 4, 6, 4],
        "fingers": [0, 1, 3, 1, 4, 1],
        "baseFret": 4
    },
    "C#5": {
        "name": "C# Power Chord",
        "frets": [-1, 4, 6, 6, -1, -1],
        "fingers": [0, 1, 3, 4, 0, 0],
        "baseFret": 4
    },
    "C#add9": {
        "name": "C# Add 9",
        "frets": [-1, 4, 6, 8, 6, 4],
        "fingers": [0, 1, 2, 4, 2, 1],
        "baseFret": 4
    },
    "C#maj7": {
        "name": "C# Major 7",
        "frets": [-1, 4, 6, 5, 6, 4],
        "fingers": [0, 1, 3, 2, 4, 1],
        "baseFret": 4
    },
    "C#dim": {
        "name": "C# Diminished 7",
        "frets": [-1, 4, 5, 3, 5, -1],
        "fingers": [0, 2, 3, 1, 4, 0],
        "baseFret": 3
    },
    "C#sus2": {
        "name": "C# Suspended 2",
        "frets": [-1, 4, 6, 6, 4, 4],
        "fingers": [0, 1, 3, 4, 1, 1],
        "baseFret": 4
    },
    "C#sus4": {
        "name": "C# Suspended 4",
        "frets": [-1, 4, 6, 6, 7, 4],
        "fingers": [0, 1, 2, 3, 4, 1],
        "baseFret": 4
    },

    // --- D# / Eb CHORDS ---
    "D#": {
    "name": "D# Major",
    "frets": [-1, 6, 8, 8, 8, 6],
    "fingers": [0, 1, 2, 3, 4, 1],
    "baseFret": 6
    },
    "D#m": {
        "name": "D# Minor",
        "frets": [-1, 6, 8, 8, 7, 6],
        "fingers": [0, 1, 3, 4, 2, 1],
        "baseFret": 6
    },
    "D#7": {
        "name": "D# Dominant 7",
        "frets": [-1, 6, 8, 6, 8, 6],
        "fingers": [0, 1, 3, 1, 4, 1],
        "baseFret": 6
    },
    "D#5": {
        "name": "D# Power Chord",
        "frets": [-1, 6, 8, 8, -1, -1],
        "fingers": [0, 1, 3, 4, 0, 0],
        "baseFret": 6
    },
    "D#add9": {
        "name": "D# Add 9",
        "frets": [-1, 6, 8, 10, 8, 6],
        "fingers": [0, 1, 2, 4, 2, 1],
        "baseFret": 6
    },
    "D#maj7": {
        "name": "D# Major 7",
        "frets": [-1, 6, 8, 7, 8, 6],
        "fingers": [0, 1, 3, 2, 4, 1],
        "baseFret": 6
    },
    "D#dim": {
        "name": "D# Diminished 7",
        "frets": [-1, 6, 7, 5, 7, -1],
        "fingers": [0, 2, 3, 1, 4, 0],
        "baseFret": 5
    },
    "D#sus2": {
        "name": "D# Suspended 2",
        "frets": [-1, 6, 8, 8, 6, 6],
        "fingers": [0, 1, 3, 4, 1, 1],
        "baseFret": 6
    },
    "D#sus4": {
        "name": "D# Suspended 4",
        "frets": [-1, 6, 8, 8, 9, 6],
        "fingers": [0, 1, 2, 3, 4, 1],
        "baseFret": 6
    },

    // --- F# / Gb CHORDS ---
    "F#": {
    "name": "F# Major",
    "frets": [2, 4, 4, 3, 2, 2],
    "fingers": [1, 3, 4, 2, 1, 1],
    "baseFret": 2
    },
    "F#m": {
        "name": "F# Minor",
        "frets": [2, 4, 4, 2, 2, 2],
        "fingers": [1, 3, 4, 1, 1, 1],
        "baseFret": 2
    },
    "F#7": {
        "name": "F# Dominant 7",
        "frets": [2, 4, 2, 3, 2, 2],
        "fingers": [1, 3, 1, 2, 1, 1],
        "baseFret": 2
    },
    "F#5": {
        "name": "F# Power Chord",
        "frets": [2, 4, 4, -1, -1, -1],
        "fingers": [1, 3, 4, 0, 0, 0],
        "baseFret": 2
    },
    "F#add9": {
        "name": "F# Add 9",
        "frets": [2, 4, 4, 3, 2, 4],
        "fingers": [1, 3, 4, 2, 1, 4],
        "baseFret": 2
    },
    "F#maj7": {
        "name": "F# Major 7",
        "frets": [2, 4, 3, 3, 2, 2],
        "fingers": [1, 4, 2, 3, 1, 1],
        "baseFret": 2
    },
    "F#dim": {
        "name": "F# Diminished 7",
        "frets": [2, 3, 4, 2, 4, 2],
        "fingers": [1, 2, 3, 1, 4, 1],
        "baseFret": 2
    },
    "F#sus2": {
        "name": "F# Suspended 2",
        "frets": [2, 4, 4, 1, 2, 2],
        "fingers": [2, 3, 4, 1, 2, 2],
        "baseFret": 1
    },
    "F#sus4": {
        "name": "F# Suspended 4",
        "frets": [2, 4, 4, 4, 2, 2],
        "fingers": [1, 3, 4, 4, 1, 1],
        "baseFret": 2
    },

    // --- G# / Ab CHORDS ---
    "G#": {
    "name": "G# Major",
    "frets": [4, 6, 6, 5, 4, 4],
    "fingers": [1, 3, 4, 2, 1, 1],
    "baseFret": 4
    },
    "G#m": {
        "name": "G# Minor",
        "frets": [4, 6, 6, 4, 4, 4],
        "fingers": [1, 3, 4, 1, 1, 1],
        "baseFret": 4
    },
    "G#7": {
        "name": "G# Dominant 7",
        "frets": [4, 6, 4, 5, 4, 4],
        "fingers": [1, 3, 1, 2, 1, 1],
        "baseFret": 4
    },
    "G#5": {
        "name": "G# Power Chord",
        "frets": [4, 6, 6, -1, -1, -1],
        "fingers": [1, 3, 4, 0, 0, 0],
        "baseFret": 4
    },
    "G#add9": {
        "name": "G# Add 9",
        "frets": [4, 6, 6, 5, 4, 6],
        "fingers": [1, 3, 4, 2, 1, 4],
        "baseFret": 4
    },
    "G#maj7": {
        "name": "G# Major 7",
        "frets": [4, 6, 5, 5, 4, 4],
        "fingers": [1, 4, 2, 3, 1, 1],
        "baseFret": 4
    },
    "G#dim": {
        "name": "G# Diminished 7",
        "frets": [4, 5, 6, 4, 6, 4],
        "fingers": [1, 2, 3, 1, 4, 1],
        "baseFret": 4
    },
    "G#sus2": {
        "name": "G# Suspended 2",
        "frets": [4, 6, 6, 3, 4, 4],
        "fingers": [2, 3, 4, 1, 2, 2],
        "baseFret": 3
    },
    "G#sus4": {
        "name": "G# Suspended 4",
        "frets": [4, 6, 6, 6, 4, 4],
        "fingers": [1, 3, 4, 4, 1, 1],
        "baseFret": 4
    },

    // --- A# / Bb CHORDS ---
    "A#": {
    "name": "A# Major",
    "frets": [-1, 1, 3, 3, 3, 1],
    "fingers": [0, 1, 2, 3, 4, 1],
    "baseFret": 1
    },
    "A#m": {
        "name": "A# Minor",
        "frets": [-1, 1, 3, 3, 2, 1],
        "fingers": [0, 1, 3, 4, 2, 1],
        "baseFret": 1
    },
    "A#7": {
        "name": "A# Dominant 7",
        "frets": [-1, 1, 3, 1, 3, 1],
        "fingers": [0, 1, 3, 1, 4, 1],
        "baseFret": 1
    },
    "A#5": {
        "name": "A# Power Chord",
        "frets": [-1, 1, 3, 3, -1, -1],
        "fingers": [0, 1, 3, 4, 0, 0],
        "baseFret": 1
    },
    "A#add9": {
        "name": "A# Add 9",
        "frets": [-1, 1, 3, 5, 3, 1],
        "fingers": [0, 1, 2, 4, 2, 1],
        "baseFret": 1
    },
    "A#maj7": {
        "name": "A# Major 7",
        "frets": [-1, 1, 3, 2, 3, 1],
        "fingers": [0, 1, 3, 2, 4, 1],
        "baseFret": 1
    },
    "A#dim": {
        "name": "A# Diminished 7",
        "frets": [-1, 1, 2, 0, 2, -1],
        "fingers": [0, 1, 2, 0, 3, 0],
        "baseFret": 1
    },
    "A#sus2": {
        "name": "A# Suspended 2",
        "frets": [-1, 1, 3, 3, 1, 1],
        "fingers": [0, 1, 3, 4, 1, 1],
        "baseFret": 1
    },
    "A#sus4": {
        "name": "A# Suspended 4",
        "frets": [-1, 1, 3, 3, 4, 1],
        "fingers": [0, 1, 2, 3, 4, 1],
        "baseFret": 1
    },

    // minor7th chords
    "Cm7": {
    "name": "C Minor 7",
    "frets": [-1, 3, 5, 3, 4, 3],
    "fingers": [0, 1, 3, 1, 2, 1],
    "baseFret": 3
  },
  "C#m7": {
    "name": "C# Minor 7",
    "frets": [-1, 4, 6, 4, 5, 4],
    "fingers": [0, 1, 3, 1, 2, 1],
    "baseFret": 4
  },
  "Dm7": {
    "name": "D Minor 7",
    "frets": [-1, -1, 0, 2, 1, 1],
    "fingers": [0, 0, 0, 2, 1, 1],
    "baseFret": 1
  },
  "D#m7": {
    "name": "D# Minor 7",
    "frets": [-1, 6, 8, 6, 7, 6],
    "fingers": [0, 1, 3, 1, 2, 1],
    "baseFret": 6
  },
  "Em7": {
    "name": "E Minor 7",
    "frets": [0, 2, 2, 0, 3, 0],
    "fingers": [0, 1, 2, 0, 3, 0],
    "baseFret": 1
  },
  "Fm7": {
    "name": "F Minor 7",
    "frets": [1, 3, 1, 1, 1, 1],
    "fingers": [1, 3, 1, 1, 1, 1],
    "baseFret": 1
  },
  "F#m7": {
    "name": "F# Minor 7",
    "frets": [2, 4, 2, 2, 2, 2],
    "fingers": [1, 3, 1, 1, 1, 1],
    "baseFret": 2
  },
  "Gm7": {
    "name": "G Minor 7",
    "frets": [3, 5, 3, 3, 3, 3],
    "fingers": [1, 3, 1, 1, 1, 1],
    "baseFret": 3
  },
  "G#m7": {
    "name": "G# Minor 7",
    "frets": [4, 6, 4, 4, 4, 4],
    "fingers": [1, 3, 1, 1, 1, 1],
    "baseFret": 4
  },
  "Am7": {
    "name": "A Minor 7",
    "frets": [-1, 0, 2, 0, 1, 0],
    "fingers": [0, 0, 2, 0, 1, 0],
    "baseFret": 1
  },
  "A#m7": {
    "name": "A# Minor 7",
    "frets": [-1, 1, 3, 1, 2, 1],
    "fingers": [0, 1, 3, 1, 2, 1],
    "baseFret": 1
  },
  "Bm7": {
    "name": "B Minor 7",
    "frets": [-1, 2, 4, 2, 3, 2],
    "fingers": [0, 1, 3, 1, 2, 1],
    "baseFret": 1
  },
};