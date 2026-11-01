# TĀRA Showcase QA — 1 November 2026

## Verified in this environment

- `node --check` on all six project JS files: **pass**.
- Static integration: unique element IDs, new controls and required local scripts/styles all present: **pass**.
- `node tests/pitch-core.test.cjs`: **pass**. 12 synthesized test tones from 110–740 Hz, including harmonic mixtures and low noise, all measured within 18 cents (actual errors in this sample test were < 1 cent). Silence rejected. Three reference scales available. A constructed 9-note sequence mapped to `Sa Ri Ga` × 3.
- `node tests/recorded-sample.test.cjs`: **pass**. Existing `samples/test-sa-ri-ga.wav` produced tonic about 240 Hz and the exact 9 note labels `Sa Ri Ga Sa Ri Ga Sa Ri Ga`.
- Selection of alternate swara references, confidence gating, note segmentation, updated pitch/physics displays and audio export paths pass code syntax and source checks.

## Cannot honestly claim yet

- Real-person audio accuracy with gamakas, tempo changes, breathiness, background instruments and varying microphone hardware.
- End-to-end browser visual test: automated Chromium navigation was blocked (`ERR_BLOCKED_BY_ADMINISTRATOR`), and inline-page content loading timed out. Thus desktop/mobile screenshots of this exact revision have not been verified.
- Actual third-party YouTube embedding or autoplay in Chrome/Safari on the user's Mac.
- Computer vision recognizing taala movements (not implemented; upload and manual annotation remain supported).

## User-side quick checks

1. Start a fresh local server using `START_MAC.command`. Do not reuse an older `localhost:5173` tab.
2. On the sound button, open the official miniature player, then check that the slideshow Next remains clickable.
3. Try `Sa Ri Ga` sample. Expect 9 notes, a visible signal-check panel, and changing equations when tapping each note.
4. Calibrate Sa and record a clear real phrase; if note labels are wrong, verify Mayamalavagowla vs Shankarabharanam and uncheck “first note is Sa” when not true.
5. Confirm the website player closes when live recording or uploaded-audio analysis starts.
6. Open the taala video, mark beats, and inspect their vertical markers on the pitch graph.

Only after these user-side checks should the demo be presented as tested on actual hardware.


## Final famous-song controls and Purandara image check (2026-11-01)
- All four selectable song entries rendered and switched correctly in an inline Chromium DOM interaction test.
- Bhagyada Lakshmi Baramma switches between Madhyamavati and Sri scale explanations.
- Tapping a note changes its frequency equation; adjusting Sa from 240 to 300 Hz changes the calculated result.
- Taala play/stop button changed states correctly.
- The user-supplied Purandara Dasa artwork loaded with its correct intrinsic dimensions (806 × 1070).
- These are illustrative raga-scale swara examples, not complete performances or audio analysis of famous recordings.
- The browser environment blocked a standalone localhost navigation test; production microphone and third-party music playback still require device checks.
