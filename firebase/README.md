# Firebase setup

MEP uses Firebase Email/Password Authentication, Firestore and Cloud Storage.

## Console switches
1. Authentication > Sign-in method > enable Email/Password.
2. Firestore Database > create database, then paste firebase/firestore.rules.
3. Storage > create the default bucket, then paste firebase/storage.rules.
4. Authentication > Settings > Authorized domains: make sure localhost and novaeriahengine.github.io are allowed.

## Data layout
- Firestore: users/{uid}/projects/{projectId}
- Storage: users/{uid}/projects/{projectId}/assets/*
- The project JSON contains a revision and owner UID so the future Python desktop client can sync the same account/project.

Do not put a Firebase Admin service-account JSON file in this public repository. The web config in js/firebase-config.js is client configuration; security comes from Authentication and Rules.
