# Noveria History — MEP Short Maker

Browser-first vertical history animation editor for 30–60 second YouTube Shorts.

## Current workflow
- One project can contain multiple independent Shorts.
- 9:16 / 720×1280 canvas optimized for Android Chrome and lower-end laptops.
- The most recent local project resumes automatically; **New Project** creates a clean blank Shorts project.
- **Open / Recent** lists saved local projects and Firestore projects.
- The bundled **YouTube Short Maker** project contains 10 finished history Shorts with titles, descriptions, hashtags, narration, scenes, country flags, map graphics, and timing.
- Character bodies are flag-filled Square, Circle, or Triangle shapes only.
- Noveria Host is a small American-flag circle intended to sit near the bottom while maps and graphics do most of the explaining.
- No Haiti-specific character/video preset is bundled.

## Explainer tools
Scenes support drawn history backgrounds, uploaded historical photos, background keyframes, front lines, arrows, movement routes, plane routes, highlighted zones, impact markers, labels, captions, bubbles, and simple flag-character movement.

Built-in thematic backgrounds include WWI Western Front, WWI Eastern Front, Pearl Harbor/Pacific, Normandy, Cold War Europe, American Revolution, Napoleonic Europe, and general world/continent maps.

## Video export
**Export This Short** records the active Short on an offscreen canvas so the editor does not have to visibly play the video. The export is the same scene renderer used by Preview mode. **Export All** processes every Short in the current project sequentially. Browser MediaRecorder still encodes in real time, so a 42-second Short takes roughly 42 seconds to render, but the visible editor can remain on the current screen.

Exports are WebM because that is the broadly available browser MediaRecorder format. MP4 would require WebCodecs/ffmpeg or a backend transcoder.

## Project data
Schema v7 is:
Project → Shorts → Scenes → characters / graphics / background / narration.

Each Short stores its own title, description, hashtags, year, 9:16 settings, scene list, and timing. Each scene stores background state, narration, captions, flag characters, graphic overlays, bubbles, and keyframes.

## Local projects + Firestore
Local projects use a small project index plus one localStorage document per project. The latest project resumes on page load. Older v3/v5/v6 local saves are migrated once into the v7 project library.

Firestore remains no-login for the current personal-development setup. Projects save to `mepProjects`, assets to `mepAssets`, characters to `mepCharacters`, and the reusable engine library to `mepLibrary/default`. Publish the matching rules in `firebase/firestore.rules`.


## Final AI narration
Chrome speech is used as a fast editing preview. For final narration the repo now includes two Kokoro-82M workflows:

- **`desktop-server/`** — Flask/Waitress local server with British Kokoro voices, local dashboard, QR code, offline editor cache, historical-map cache, WAV generation, and a direct API for the editor.
- **`Google Colab/`** — interactive Colab notebook for batch-generating narration for all Shorts. The editor exports a narration-batch JSON and imports the resulting `mep_voice_pack.json`.

Generated AI voice tracks are stored in browser IndexedDB instead of localStorage so 45–90 second WAV files do not overflow normal project storage. The project keeps only lightweight audio metadata.

The Colab workflow can optionally mount the user's Google Drive from inside Colab. No Google password or OAuth secret is stored in this repository.

## AI Director
AI Director protocol v3 is Shorts-first. It asks a backend model for one 30–60 second vertical history Short using 4–6 scenes, concise narration, country-flag shapes, maps, arrows, front lines, routes, labels, and other explainer graphics. API keys stay on the backend; the browser only receives structured scene JSON.

## Bundled Shorts
The `presets/youtube-short-maker.mep.json` project includes:
1. Why the Western Front Froze Into Trenches
2. Why the Eastern Front Kept Moving
3. Pearl Harbor in Under a Minute: Why Japan Attacked
4. Midway: The Battle That Broke Japan’s Carrier Force
5. D-Day in 45 Seconds: How Normandy Was Breached
6. Why the American Revolution Started
7. French Revolution in Under a Minute
8. Waterloo: How Napoleon Lost His Final Battle
9. Cuban Missile Crisis: 13 Days Near Nuclear War
10. Why the Berlin Wall Fell
