# Roll Call — offline QR attendance scanner

## What this does
- Any teacher opens this app on their own phone (installs it to the home screen).
- Scanning a student's QR code marks them present **instantly, fully offline** — it's saved on the phone first.
- Scanning the same student twice (even on different phones) is ignored — only the first scan counts.
- When the phone reconnects to WiFi/4G, it automatically pushes queued scans to a shared database.
- Everyone's data merges together automatically — no manual export/import needed.

---

## Step 1 — Create a free Firebase project (5 min)
1. Go to https://console.firebase.google.com → **Add project** → name it (e.g. "school-attendance") → finish the wizard.
2. In the left sidebar, click **Build → Firestore Database** → **Create database** → choose **Start in test mode** for now (see security note at the bottom) → pick any region → Enable.
3. Click the gear icon → **Project settings** → scroll to "Your apps" → click the **</> (Web)** icon → register an app (nickname anything, no need to set up Hosting yet) → it will show a `firebaseConfig` object like:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "school-attendance.firebaseapp.com",
     projectId: "school-attendance",
     storageBucket: "school-attendance.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcd1234"
   };
   ```
4. Copy that whole object.

## Step 2 — Paste your config into the app
Open `index.html`, find this section near the top of the `<script>` block, and replace it with what you copied:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  ...
};
```

## Step 3 — Host it for free
Pick one:

**Option A: Firebase Hosting (recommended, ties in with what you just made)**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting     # choose your project, public dir = current folder, single-page app = No
firebase deploy
```
You'll get a live URL like `https://school-attendance.web.app`.

**Option B: GitHub Pages (no command line needed)**
1. Create a new GitHub repo, upload all 5 files (`index.html`, `manifest.json`, `service-worker.js`, `icon-192.png`, `icon-512.png`).
2. Repo → Settings → Pages → set source to your main branch → save.
3. You'll get a URL like `https://yourname.github.io/roll-call`.

## Step 4 — Install it on each teacher's phone
1. Open the live URL in Chrome (Android) or Safari (iPhone) **while online**, once — this lets the service worker cache everything it needs to run offline afterward.
2. Tap the browser menu → **"Add to Home Screen"** / **"Install app"**.
3. From now on it opens like a normal app, works with zero signal, and syncs whenever it finds a connection.

## Step 5 — Generate your students' QR codes
Each QR code should contain **just the student's ID as plain text** (e.g. `STU-0451`), not a link. Any bulk QR generator works — if you share your student list (spreadsheet with IDs), I can generate a printable sheet of QR codes for you.

## Step 6 — Test it
1. Turn on airplane mode.
2. Open the app, type your name, tap "Start scanning," scan a couple of test QR codes.
3. Confirm they show up in "Today's scans" as "pending."
4. Turn airplane mode off — they should flip to "synced" within a few seconds.
5. Check Firebase Console → Firestore Database → you should see an `attendance` collection with one document per student per day.

---

## About the "test mode" security note
Test mode Firestore rules expire after 30 days and are open to anyone with your config — fine for trying this out, but before real use, lock it down. A simple rule that still allows the app to work:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /attendance/{docId} {
      allow read, write: if true; // tighten this before going live —
      // e.g. require Firebase Anonymous Auth, or restrict by App Check
    }
  }
}
```
I'm happy to help set up proper auth (e.g. a shared class PIN or teacher login) once you're ready to move past testing.
