# Shared Firebase Workspace — MEP Video Maker

The application uses one shared Firebase project (`mep-video-maker`) rather than separate per-viewer project storage. **Everyone can read** the published project collection; **only the verified engine owner** can write. Authentication uses **Email/Password**, not Google pop-up sign-in.

## First-time setup (Firebase Console)

1. Go to **Authentication → Sign-in method** and leave **Email/Password** enabled.
2. Go to **Authentication → Users → Add user**. Use `movaeriahhistory@gmail.com` as the account email (lowercase). **Choose a new unique, strong password.** Never commit, message, or store the password in project files, GitHub, or Firestore. The password previously shared in chat should not be reused.
3. Open **Firestore → Rules**. Replace the live rules with [`firebase/firestore.rules`](firestore.rules) and click **Publish**. Repository edits do not publish rules on your behalf. The owner must verify their email before writing; the in-app account panel can send the verification link.
4. Confirm the site's hosting domain is listed under **Authentication → Settings → Authorized domains**, if required for email actions.
5. Refresh the editor and click **Owner Account / Log In**. Enter the new password, verify your email, and click **I Verified My Email**.
6. Click **Add Bundled Projects to Firestore** to create three starter libraries without overwriting existing cloud projects: Ready History Shorts, 15 American Stories, and 50 State Flags. Click **Back Up All Local Projects** to migrate every project already saved on your current browser. The latter updates matching cloud project IDs, so export JSON first if you want a second offline copy.

## Shared Cloud Collections

- `mepProjects/{projectId}`: project metadata, category, series settings, list of videos and their cloud document IDs. Remains compatible with older inline Firestore projects.
- `mepVideos/{projectId}__{shortId}`: **full video editing data**—narration, scene timings, captions, character rigs, animations, background selections, score-card settings, voice **settings/references**, and each video's production checklist/history.
- `mepProjectHistory/{eventId}`: immutable record whenever a project is manually saved to Firestore (project, video count, time, owner UID).
- `mepFlagRatings/{stateCode}`: one A–F score, review checkmark, episode and notes for each state. Live-read throughout the site.
- Existing collections `mepLibrary`, `mepCharacters`, `mepAnimations`, and `mepAssets` are preserved.

The metadata + per-video documents are saved atomically in one Firestore write batch, which avoids the 1 MiB limit for a large project as a **single** document. Each video still has its own 1 MiB Firestore limit.

**Critical media limitation:** Firestore stores the full *editable project/video structure*, not the rendered WebM files or arbitrary-size raw microphone/Kokoro audio. Voice recordings stored in the local device's IndexedDB may not be available on another computer. Export them separately; a future managed media-storage backend is needed for large cross-device audio and video.

## Password management

Use **Owner Account / Log In → Forgot Password** for recovery, **Send Verification Email** for initial setup, or **Change Password** when signed in (requires current password and a new password of at least 12 characters). Sign-out does not delete shared data or your local projects. Firebase Authentication manages the password and signed-in session.

## Rules / deployment

- Source-controlled rules: `firebase/firestore.rules`.
- Realtime Database is **not used** to store MEP projects. `firebase/database.rules.json` denies access if published; do not replace RTDB rules if you have other unrelated RTDB applications relying on them.
- Rules also disallow deletion of existing cloud projects, videos and review activity. Existing public-write rules must be replaced promptly to protect your content.
- Site-wide public-readable projects are intentional: do not upload private personal data to these collections.
- Optional CLI deployment after authenticating the Firebase CLI: `firebase deploy --only firestore:rules --project mep-video-maker`.

## Project safety

Automatic local reset and automatic old Firestore cleanup are disabled. Loading the Flags project prefers existing local work instead of silently replacing it with cloud data. Projects in your browser are always locally saved; cloud saves are now explicit so one keystroke doesn't rewrite every long video. Old inline Firestore documents can still be read and rewritten into the sharded format via Save Firestore.
