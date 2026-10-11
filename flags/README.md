# Flags Series (50 U.S. States)

- `current/` contains source SVGs for all 50 current U.S. state flags; `us.svg` is the national flag for the introduction.
- `manifest.json` is the catalog of current art, visual descriptions and the **verified subset** of historical timelines. `historyComplete: false` is deliberate. Do not claim the archive contains every former state design.
- `flags-series.mep.json` is a separate standalone `mep-video-project` with 18 Shorts. It is not appended to the earlier American-history project.
- Each video is 99 seconds, with 30 dynamic visual beats; 17 ranking videos cover 50 states three at a time (last covers two).
- Rankings are editable in the Flags panel and synchronized from `mepFlagRatings` across the site, not per account.
- Each grade carries a `done` checkbox, episode number, notes, and updated timestamp.
- Historical image URLs may need an Internet connection and source/licensing verification before publishing.
- Source of current SVG art: https://github.com/Invoxio/us-state-flags; historical references in `manifest.json`.

Don't score flags before the creator chooses the grade. All default ratings are blank; video rating reveals the saved grade after it has been entered.

## Playback and scene-linked narration — October 11 patch

The browser preview advances using the **actual elapsed wall clock**, even when drawing flag SVG art takes too long. Preview FPS has an adaptive setting, and flag vectors are cached as smaller canvas bitmaps for smooth rendering. This does not reduce exported video resolution.

- **Edit This Scene** in Preview opens the exact scene's script and caption controls in Editor.
- **Next video automatically** is optional; individual scenes always advance without a button press.
- **Chrome Preview** now speaks the current scene's narration instead of reading the entire story as one drifting utterance. For final exports use an attached generated/recorded audio track. Audio timing still needs a final listen-through.
- Scene subtitles use the same script text and per-scene duration as the visual shot.
- **Improve Scene Visuals** updates visual headings and shot types without replacing your rewritten scripts.
- **Update Scenes + Scripts** is opt-in, makes an independent local backup first, and retains existing A–F grades, completed flags, and non-template scenes. Re-generate voice recordings for any lines that change.
- Upgrades only modify the Flags project currently open; other projects in Local / Recent and Firestore are left unchanged. The upgraded project stays local until you explicitly use **Save Firestore**.

Open this editor and force-refresh if you previously encountered the `$(...).forEach is not a function` crash. GitHub Pages/CDN may briefly serve an older cached HTML shell after a GitHub commit.
