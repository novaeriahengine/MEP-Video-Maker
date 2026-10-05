# Firebase setup for MEP Video Maker

MEP currently uses **Cloud Firestore without a login screen** as a JSON-style cloud database.

## Collections
- `mepProjects/{projectId}` — complete project documents: scenes, characters, rigs, poses, bubbles, keyframes and metadata.
- `mepCharacters/{characterId}` — reusable selected-character JSON.
- `mepAnimations/{animationId}` — reusable keyframe animation JSON.

## Setup
1. Create Cloud Firestore in production mode.
2. Open Firestore > Rules.
3. Paste the contents of `firebase/firestore.rules`.
4. Publish the rules.
5. Refresh the MEP site. The Project panel should show **Firestore ready**.

No Firebase Authentication is required by the current web editor.

## Important security note
Because there is no authentication, these three MEP collections are intentionally readable/writable from the public web app. Anyone who knows the Firebase project configuration could potentially read or modify them. Use this only for development/testing. Before storing private or valuable work, add Auth or another access layer.

Large images are not stored inside Firestore project documents. Local image backgrounds remain local until a separate asset-storage workflow is enabled.
