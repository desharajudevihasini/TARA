FINAL DEPLOY NOTES
- Microphone/camera testing should be done from the local server URL opened by START_MAC.command (localhost), not from a file:// page.
- The featured tribute music is M. S. Subbulakshmi only, controlled from the top-right button; there is no large popup or visible video.

# TĀRA — The Universe Inside a Note

**A cinematic, interactive exploration of the mathematics, physics, voice science, and cultural history of Carnatic music.**

This edition retains the galaxy → Sun → Earth → Carnatic story → singing observatory → mathematical reveal → famous-song atlas. The math section is based on estimated pitch values from *your* voice, not a randomly generated “song equation.”

## Open on your Mac

1. Unzip the download.
2. Open the **TARA-Showcase-Polished** folder.
3. Right-click `START_MAC.command` → **Open**.
4. The launcher opens an isolated URL beginning `http://127.0.0.1:55870/`, choosing the next free port if busy. **Use the new tab**; older `localhost:5173` tabs may show outdated builds.
5. In the galaxy, choose **Play M. S. Subbulakshmi** to open the *official* Saregama YouTube rendition of “Bhagyada Lakshmi Baramma.” You may need to press ▶ inside YouTube's video and have internet access.
6. Reach the singing observatory, then use **Try Sa Ri Ga** as a working offline demo before testing microphone input.

Alternative from the extracted folder:

```bash
python3 serve_tara.py
```

Windows: use `START_WINDOWS.bat` (Python 3 required). No npm or paid APIs.

## The improved singing workflow

- **Set your tonic Sa** by singing a sustained Sa using **Calibrate by singing Sa**, or explicitly check “My phrase starts on Sa” if it really does. Otherwise uncheck and set the reference slider.
- **Select a swara reference**: Mayamalavagowla, Shankarabharanam, or Kharaharapriya. The same frequency may be interpreted differently in different ragas. These options use equal-tempered comparison targets, **not** a universal Carnatic tuning standard.
- **Record a solo phrase** or **upload an audio file**. The estimator filters unclear sections and groups stable frequencies into note events. It analyzes *pitch*, not whether you pronounced the syllables “Sa Ri Ga.”
- Inspect **Signal Check**: voiced-frame coverage, proximity to the chosen scale, tonic, and suggested next steps when the results are uncertain.
- Click any note on the enlarged graph or in the note strip: the equation, ratio in cents, vibration period, wavelength, and three science insight panels update. **Hear This Note** plays the selected measured pitch as a synthesized tone.
- Change the scale directly in the results and see the same recorded pitches reinterpreted. Guided examples retain their own demonstration scale.
- **Taala**: camera preview or uploaded video and **manual** beat marking; manually adjust the sync offset so beat markers appear over the pitch graph. This build **does not automatically recognize taala gestures**.
- Export JSON containing frames, tonic, selected scale and signal quality for reproducibility.

## Musical tribute / rights

The sole featured track is **“Bhagyada Lakshmi Baramma” performed by M. S. Subbulakshmi and Radha Viswanathan**, streamed from the official Saregama YouTube recording: <https://www.youtube.com/watch?v=zmHsP1CN_aA>. Their copyrighted master audio is **not redistributed** in the repository. The player stays compact at the top right and closes before on-site microphone or imported-audio analysis. An independently opened YouTube tab cannot be controlled by the website.

There is **no narration**, generic ambient soundtrack, or alternate automatic soundtrack. Browsers and YouTube may block third-party autoplay or embeds.

## Equations: where they come from

- **Measured/estimated** from audio: fundamental frequency `f₀`, pitch contour, note event durations, and, when a real buffer is available, spectral energy near harmonic frequencies.
- **Calculated** from frequency: relative ratio `r = f_note / f_Sa`; interval `cents = 1200 log₂(r)`; vibration period `T = 1 / f₀`; approximate wavelength in air `λ ≈ 343 / f₀` meters at about 20°C.
- **Schematic**: slowed-down sine waves and orbit visuals, not direct measurements of vocal fold shape or a physical representation of the entire universe.
- **Musical theory**: Adi Taala in the common 4 + 2 + 2 form, subdivisions and modular arithmetic; no claim that one equation explains an entire composition.

There is **no single known inventor of Carnatic music**. Purandara Dasa is traditionally associated with systematizing graded teaching exercises, not inventing the musical tradition. The famous-song atlas uses illustrative raga scales and history rather than pretending it measures the linked commercial song recording.

## Verification

Run core tests (requires Node.js for tests only):

```bash
node tests/pitch-core.test.cjs
node tests/recorded-sample.test.cjs
```

Both tests passed on the included synthesized reference tone sequences and supplied test WAV; see `QA_NOTES.md`. **Not yet verified:** a physical microphone with the user's actual Carnatic singing and gamakas, real YouTube playback on the user's Mac, and live camera gesture tracking. The browser automation environment blocked page navigation, so a full visual end-to-end signoff is not claimed.

## GitHub

From the extracted folder:

```bash
git init
git add .
git commit -m "Build TARA: Carnatic music, pitch science, taala and stellar journey"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Create an empty repository first and replace the placeholder URL with your actual repository URL. If that remote already exists, use `git remote set-url origin <url>` instead of `git remote add origin`.

See `DEMO_GUIDE.md` for a concise application-showcase recording sequence.


### Famous Songs (checked)
The Song Atlas supports Bhagyada Lakshmi Baramma, Vatapi Ganapatim, Nagumomu Ganaleni and Endaro Mahanubhavulu, with interactive swaras, pitch-ratio equations, tonic settings, tala cycles and cultural context. It plays short **synthesized raga-scale sketches**, not the complete copyrighted song performances. The Purandara Dasa artwork in `assets/purandara-dasa.png` is the image provided by the project owner.
