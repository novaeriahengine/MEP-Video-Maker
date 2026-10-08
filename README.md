# MEP Video Maker

Browser-first 2D animation workspace for illustrated history and educational videos.

## Current editor
- Multi-scene project format (schema v2)
- History era metadata: Ancient through Modern
- Tagged background presets: parchment/map, battlefield, palace, city, countryside and archive
- Per-scene tags and per-character tags
- Multiple articulated humanoid characters
- Character Maker rig metadata and appearance colors
- Joint pose editor
- Reusable pose library: idle, attention, point, talk, victory and march poses
- One-click 2-second March animation generator
- Position/scale/facing animation
- Timestamped keyframes with interpolation and timeline playback
- Local autosave plus JSON import/export
- Optional Firestore save/load with one document per project
- Automatic migration of the original v1 project format

## Project data
A project stores scenes. Each scene stores its background preset/tags and characters. Each character stores its tags, rig/appearance, current pose and animation keyframes. Keyframes store transform + joint state, not rendered frames.

## Firestore
MEP remains fully usable without Firebase. To enable cloud projects:

1. Create a Firebase web app and Firestore database.
2. Open `js/firebase-config.js`.
3. Replace `window.MEP_FIREBASE_CONFIG = null` with the public Firebase **web app configuration** shown in Firebase Console.
4. Do not put Firebase Admin SDK/service-account credentials in this repository.
5. Configure Firestore security rules appropriate for your authentication model before using this with other users.

Cloud projects are stored in the `mepProjects` collection with the MEP project ID as the document ID. The current cloud MVP does not yet implement Firebase Authentication; add Auth before treating this as a multi-user production service.

## Basic animation test
1. Select the default character.
2. Apply a pose and add a keyframe at 0s.
3. Scrub to 2s, move the character/change the pose, and add another keyframe.
4. Press Play to see interpolation.
5. Or select **marchA** and press **Generate 2s March** to automatically create a short motion sequence.

## Next
Direct joint-handle dragging, richer character body/face/hair/clothing construction, reusable named character templates, walk/talk gesture clips, scene duplication/reordering, props and images, text/captions, camera keyframes, audio/narration tracks, Firebase Auth, asset storage, undo/redo and video export.

## AI Director
MEP now exposes a provider-neutral `mep-director-v1` protocol. The AI Director knows the editor canvas, backgrounds, history eras, character rig, joints, poses, animation/keyframe format and timing constraints. A model can return structured scenes containing narration, captions, characters and timed actions; MEP validates the response and converts it into native scenes and keyframes.

Use the **AI Director** button to generate through a configured backend, inspect the full engine-context package, or paste Director JSON for offline testing. Configure the backend URL in `js/ai-config.js`. Keep OpenAI/model API keys on that backend and never in the browser repository. See `docs/AI-DIRECTOR.md` for the contract.

For factual history videos, the intended production pipeline is: user topic → research/fact-check → script/narration → Director scene plan → MEP validation → animation project. This keeps historical claims separate from visual animation commands.

## Animator / Character Studio upgrade
The main renderer now uses original illustrated history-cartoon characters rather than bare stick figures. Built-in presets include Civilian, Monarch, Infantry Soldier, Military Officer, Revolutionary and Modern Presenter, with clothes, hair, hats/accessories, hands, shoes, faces and articulated joints.

Character Studio provides its own 800×600 drawing canvas with brush, eraser, image import and a freeform lasso. Closing a lasso masks pixels outside the selected polygon and creates a transparent PNG sticker cutout. A cutout can be assigned to head, torso, arm and leg custom-rig slots and is stored with the character project data. Full rendering/deformation of those custom sprite slots is a following renderer milestone; the cutout creation and rig-slot data pipeline are already present.

Background presets now include World, Europe, Americas, Asia and Africa map modes. The current maps are intentionally schematic visual presets; accurate country borders and country-level map presets should use geographic vector/GeoJSON assets in the next map-system pass rather than fabricated boundaries.


## MEP v5 all-in-one history workflow
MEP now boots with a visible Union square country-layout character and is centered around an era/year-first workflow. Character looks are Square, Circle, Triangle, Humanoid, and Country Layout. Country Layout resolves a period flag from the project year when historical data is available and falls back to the modern country flag otherwise. The built-in country selector covers the ISO country list plus historical entities such as the Union, Confederate States (historical context), Prussia, the Holy Roman Empire, Ottoman Empire, and Gran Colombia.

The editor includes eye-based expressions, a line/dot mouth that can open/close through keyframes, props/accessories, narration scripts, scene scripts, a floating MEP Navigator, mobile Android/Chrome controls, rich procedural history backgrounds, uploaded image backgrounds, background keyframes, project/video playback, WebM recording, and no-login Firestore JSON persistence. Large uploaded background images are compressed and stored as separate `mepAssets` Firestore documents while project JSON references the asset IDs.

The bundled `presets/mep-starter-pack-v5.mep.json` demonstrates multiple eras, country layouts, all primary body looks, scripts, backgrounds, keyframes and captions. The Haiti / Vertières preset is also migrated to the v5 country-square workflow.
