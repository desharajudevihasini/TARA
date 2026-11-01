<div align="center">

# ✦ TĀRA
### THE UNIVERSE INSIDE A NOTE

*Explore the mathematics, physics, and beauty of Carnatic music.*

### 🌌 [ENTER THE EXPERIENCE ↗](https://desharajudevihasini.github.io/TARA/)

[Live Website](https://desharajudevihasini.github.io/TARA/) · [Source Code](https://github.com/desharajudevihasini/TARA)

</div>

---
# ✦ TĀRA
### The Universe Inside a Note

**An immersive journey through Carnatic music, mathematics, physics, and the human voice.**

*What if you could see the mathematics hiding inside a melody?*

TĀRA is an interactive web experience that transforms sound into something you can explore.

It begins among billions of stars. You travel through a galaxy, approach the Sun, discover Earth, and arrive at one of the world's richest musical traditions: **Carnatic music**.

Then the experience becomes personal.

You sing. TĀRA listens. Your voice becomes a moving constellation of frequencies, swaras, harmonics, and mathematical relationships.

**One voice. Seven swaras. An entire universe of patterns.**

---

## ✧ Not just a website. A journey.

### 01 — Somewhere in the universe

Your journey begins in a cinematic, interactive galaxy.

Explore the starfield, orbit through space, travel toward the Sun, and find Earth.

The universe isn't just a visual introduction. It sets up the central idea of TĀRA: **the same physics that describes waves throughout nature also helps us understand musical sound.**

### 02 — Where music meets history

Discover the origins and evolution of Carnatic music.

Meet **Purandara Dasa**, traditionally known as the father of Carnatic music for his contributions to structured music education.

Explore how foundational exercises helped generations of students learn pitch, rhythm, and melodic patterns.

Music wasn't invented by one person. It's a living tradition shaped across centuries.

### 03 — Sing into the universe

This is where TĀRA becomes an instrument of discovery.

Turn on your microphone and sing a note or melody.

TĀRA analyzes the incoming audio and visualizes:

- **Fundamental frequency** — the estimated pitch of your voice in hertz.
- **Swaras** — tonic-relative note estimates based on your selected reference.
- **Pitch contours** — how your melody moves over time.
- **Harmonics** — frequency components that help give your voice its character.
- **A reactive sound universe** — cosmic visuals that respond to what you sing.

You can calibrate your own **Sa**, experiment with different swara references, and explore the mathematical structure of a recorded phrase.

### 04 — Your voice is an equation

Every musical note is a physical vibration.

TĀRA connects the sounds you make to the mathematics behind them.

**Frequency and period**

`T = 1 / f`

How much time passes during one complete vibration?

**Wavelength**

`λ = v / f`

How far does a sound wave travel during one cycle?

**Musical intervals**

`r = f₂ / f₁`

Why does doubling a frequency produce a note one octave higher?

**Pitch distance**

`cents = 1200 × log₂(f₂ / f₁)`

How can we measure the distance between two pitches?

Instead of simply displaying formulas, TĀRA lets you investigate these relationships through actual sound.

### 05 — Famous songs, decoded

Explore the musical ideas behind four celebrated Carnatic compositions:

| Composition | Raga |
|---|---|
| Bhagyada Lakshmi Baramma | Madhyamavati / Sri settings |
| Vatapi Ganapatim | Hamsadhwani |
| Nagumomu Ganaleni | Abheri |
| Endaro Mahanubhavulu | Sri |

Each interactive exploration includes musical context, swara relationships, frequency calculations, and synthesized scale examples.

The goal is not just to listen to music, but to understand some of the patterns that make it work.

### 06 — Rhythm is mathematics too

TĀRA also explores **taala**, the rhythmic framework of Carnatic music.

Use your camera or upload a video, mark beats, and investigate how rhythmic cycles relate to timing and melodic movement.

The current prototype uses **manual beat annotation**, rather than automated gesture recognition.

### 07 — A tribute to a legendary voice

The experience pays tribute to **M. S. Subbulakshmi and Radha Viswanathan**, featuring the official Saregama recording of *Bhagyada Lakshmi Baramma* as its musical reference.

The copyrighted recording is not distributed with the source code. External playback depends on YouTube availability and browser restrictions.

---

## ⚙️ Under the hood

TĀRA combines interactive graphics, browser audio processing, and musical mathematics.

| Technology | What it does |
|---|---|
| HTML5, CSS3 | Interface, visual design, transitions, responsive layouts |
| JavaScript | Interactive storytelling and application logic |
| Canvas & WebGL | Cosmic environments and reactive visualizations |
| Web Audio API | Microphone capture and audio analysis |
| Digital Signal Processing | Fundamental pitch estimation and frequency analysis |
| Mathematical Modeling | Pitch ratios, note intervals, periods, wavelengths |
| MediaDevices API | Browser microphone and camera access |
| GitHub Pages | Static website deployment |

### How the voice analysis works

```text
        YOUR VOICE
            │
            ▼
     Microphone Input
            │
            ▼
    Audio Signal Analysis
            │
            ▼
     Pitch Estimation
            │
            ▼
    Sa / Swara Mapping
            │
            ▼
    Mathematical Analysis
            │
            ▼
   Interactive Visualizations
            │
            ▼
     YOUR MUSICAL UNIVERSE
```

The pitch-analysis system estimates fundamental frequency from audio signals, groups stable pitch regions, and maps them relative to a chosen tonic.

Because real Carnatic performances contain gamakas, expressive pitch movement, and variable intonation, the results are estimates rather than definitive musical transcriptions.

---

## 🚀 Explore TĀRA locally

Clone the repository:

```bash
git clone https://github.com/desharajudevihasini/TARA.git
cd TARA
```

Start the local server:

```bash
python3 serve_tara.py
```

Open the localhost address displayed in your terminal.

For the best experience, use a modern browser, headphones, and a quiet room when testing the microphone.

**Note:** Microphone and camera access require HTTPS or a secure localhost context. Browser permission is requested before recording.

---

## ✦ Why I built this

Music is something we usually feel before we try to understand it.

But behind every melody is a world of vibrations, mathematical relationships, carefully learned patterns, and centuries of human creativity.

I wanted to explore that intersection without turning music into a textbook.

**What if learning the science of a note could feel as magical as hearing it?**

That's the idea behind TĀRA.

A place where cultural storytelling meets creative coding, and where something as simple as singing a note can open up an entirely different way of seeing the world.

---

### ✦ TĀRA — The Universe Inside a Note

*Because sometimes, the most interesting discoveries begin with a single sound.*
