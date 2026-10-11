# MEP Video Maker — shared Firebase projects and 50-state flags

**Project:** `mep-video-maker` (Spark). Firestore is the shared database; Realtime Database is not required for this feature.

## One shared site, not per-account projects

- `mepProjects/{projectId}`: existing and new projects shared by all viewers.
- `mepProjects/flags-50-states-series`: the separately named 18-episode state flag series.
- `mepFlagRatings/{STATE_CODE}`: one A–F rating document per state, shared between all episodes and browsers.
- `mepLibrary`, `mepCharacters`, `mepAnimations`, and `mepAssets`: old collections preserved.

Public visitors can **read** projects and ratings without login. Only an authorized editor Google account can **write**. Content is still shared globally; Google sign-in protects editing and is NOT used to isolate each person's content.

## One-time configuration you must do in Firebase Console

1. Enable **Authentication → Sign-in method → Google** in project `mep-video-maker`. Configure the site's domain under **Authorized domains**.
2. Edit `firebase/firestore.rules`: replace `REPLACE_WITH_EDITOR_EMAIL@example.com` with the Google email **you** will use to edit. Keep `email_verified` required.
3. In **Firestore → Rules**, paste and **Publish** `firebase/firestore.rules`, OR deploy with Firebase CLI from the repository root: `firebase deploy --only firestore:rules`.
4. Optional: Realtime Database is unused here. The safe `firebase/database.rules.json` file denies all reads and writes. If you want that protection, deploy those rules separately after reviewing any other RTDB consumers.
5. Open the site, click **Sign In to Edit Cloud**. Click **Open / Create 50 State Flags**; this preserves the existing American history project. Click **Save Firestore** to publish it as the site's shared flag-series project.
6. To save a grade, select the state in the Flags panel, pick A/B/C/D/F, optionally mark it reviewed, enter notes, then click **Save Rating to Firestore**. This updates `mepFlagRatings/{STATE_CODE}`; the ranking appears in every episode using that state and the summary tier board.

**Important:** Committing this repository DOES NOT itself publish rules in your Firebase console or seed Firestore. Until you deploy the secure rules, the open rules previously pasted may still allow unauthorized writes. Do not publish an editor with unrestricted public writes.

## Video output

The `flags/flags-series.mep.json` project has:
- Intro (episode 0), explaining national and state flags and the A–F rules.
- 17 ranking episodes, 3 states per episode except the last, which contains 2.
- 30 visual beats per episode × 3.3 s = 99 seconds (1:39) per Short.
- Real current-state SVG files in `flags/current/`, not invented approximations.
- Motion-based flag visual shots, country/state comparisons, historical timeline cards where verified, tier-list overlays, and narration-synced captions.
- Same `renderScene` code path for editor preview and WebM capture.

YouTube allows Shorts up to **180 seconds**; project validation now warns only above 180. Exporting 99-second WebMs on older phones may take significant CPU and memory.

## Flag history integrity

The catalog in `flags/manifest.json` includes all 50 **current** flags. Historical revision records are **partial**, not an exhaustive 50-state chronology. We have documented older designs for Minnesota, Mississippi, Utah, and Georgia; these use third-party archival SVG URLs and can be unavailable offline, so check images in preview before exporting. Their dates and citations are in the manifest.

Do not treat a current flag as an image for an earlier period. Do not invent a historic seal; historical artwork must be sourced and visually verified before publishing.

Artwork source: [Invoxio/us-state-flags](https://github.com/Invoxio/us-state-flags), which includes 2024 Minnesota and Utah and 2021 Mississippi SVGs. Historical imagery references Wikimedia Commons; check reuse terms for each file.

## Protecting your old work

Old local projects remain in Local / Recent. Old Firestore project documents are not deleted by project switching or app startup. Automatic legacy deletion and local reset routines were disabled. The flag project is always stored under its **own** stable ID.

## Firestore limits

Large images/audio are not embedded into project docs. Firestore's document limit is 1 MiB; monitor the combined flag project as you add longer videos. The initial project is under the limit, but future expansion may require splitting individual episode data into separate documents.
