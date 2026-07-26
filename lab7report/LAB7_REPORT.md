# FIT5032 Assessed Lab 7 — Mastering User Authentication in Vue.js

**Name:** _<your name>_ &nbsp;&nbsp; **Student ID:** _<your student id>_ &nbsp;&nbsp; **Tutorial:** _<your tutorial>_
**Repository:** https://github.com/rikey123123/rwang-library-lab5 &nbsp;&nbsp; **Branch:** `lab7-firebase-auth` &nbsp;&nbsp; **Final commit:** `bc4d7b9`
**Submission Date:** _<date>_

---

## 1. Overview

I extended the previous NoMash Library Vue 3 project with Firebase Authentication and role-based access control, aiming at the D/HD level of Task 7.2 (which also covers Task 7.1).

The main design choices are:

- **Vue 3** with Composition API (`<script setup>`) and Vue Router 4.
- **Firebase Authentication** with Email/Password for account creation and sign-in.
- **Cloud Firestore** stores each user's `role` (`reader` / `librarian`) under `users/{uid}`.
- A single `src/firebase.js` initialises Firebase once and exports shared `auth` and `db` instances — no other component calls `initializeApp()`.
- The `router.beforeEach` navigation guard waits for `onAuthStateChanged` (so a page refresh does not falsely redirect a signed-in user) and checks the Firestore role against `to.meta.role` before granting access.
- Registration can only create a `reader`; the `librarian` role is promoted manually from the Firebase Console. This is safer than letting visitors pick their own role at signup.
- Logout uses `signOut(auth)` and logs `auth.currentUser` before and after so the console clearly shows the session going to `null`.

### Project structure

```text
src/
├── components/BHeader.vue
├── views/
│   ├── FirebaseRegisterView.vue
│   ├── FirebaseSigninView.vue
│   ├── ReaderDashboardView.vue
│   ├── LibrarianDashboardView.vue
│   ├── LogoutView.vue
│   └── UnauthorizedView.vue
├── router/index.js
├── firebase.js
├── App.vue
└── main.js
```

### `src/firebase.js`

```js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBiVE-yf2NUeODSSyL7LFDByhq6UuqHK9c',
  authDomain: 'nomash-library-lab7.firebaseapp.com',
  projectId: 'nomash-library-lab7',
  storageBucket: 'nomash-library-lab7.firebasestorage.app',
  messagingSenderId: '1021775219448',
  appId: '1:1021775219448:web:ce0f07b8af67a30dbdc90d'
}

const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
```

### Firestore security rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow create: if request.auth != null
                    && request.auth.uid == userId
                    && request.resource.data.role == 'reader';
      allow read: if request.auth != null
                  && request.auth.uid == userId;
      allow update: if request.auth != null
                    && request.auth.uid == userId
                    && request.resource.data.role == resource.data.role;
      allow delete: if false;
    }
  }
}
```

Registration is restricted to `role: 'reader'` at the rule level, and a user cannot promote themselves — even if the frontend is bypassed.

### Test accounts

| Role | Email | Purpose |
|------|-------|---------|
| reader | `reader.738746@example.com` | Reader dashboard + cross-role test |
| librarian | `reader.729392@example.com` | Librarian dashboard + cross-role test |

---

## 2. Task 7.1 — Registration

The registration page at `/FireRegister` collects email, password and a password confirmation. On submit, `createUserWithEmailAndPassword` creates the Firebase Auth account and `setDoc(doc(db, 'users', uid), { role: 'reader', ... })` writes the profile document. Right after that the view signs the user out (so the sign-in flow can be demonstrated separately) and redirects to `/FireLogin`.

**Figure 1.** Registration page (empty form).
![Registration page empty](assets/01-register-empty-20260726162803-bltbwsy.png)

**Figure 2.** Registration form filled in with a new reader account.
![Registration form filled](assets/02-register-filled-20260726162803-zjae3f5.png)

**Figure 3.** Success message after Firebase created the account and the Firestore profile was written.
![Registration result](assets/03-register-result-20260726162803-lp10spf.png)

**Figure 4.** `FirebaseRegisterView.vue` in VS Code: `createUserWithEmailAndPassword`, the Firestore `setDoc` write with `role: 'reader'`, and the sign-out + redirect after success.
![Registration source code](assets/image-20260726164236-5655dih.png)

---

## 3. Task 7.1 — Sign In

`FirebaseSigninView.vue` calls `signInWithEmailAndPassword`, reads the role from `users/{uid}` in Firestore, and pushes the router to the correct dashboard. It also prints a `console.table` of `{ uid, email, role }` so a marker can see the authenticated user in the DevTools console.

**Figure 5.** Sign-in page.
![Login page empty](assets/04-login-empty-20260726162803-u3h9ojj.png)

**Figure 6.** Reader credentials filled in (password masked).
![Login form filled](assets/04b-login-filled-20260726162803-wdjzazk.png)

**Figure 7.** After signing in, the Reader Dashboard is shown and the DevTools Console prints the `uid`, `email` and `role: "reader"` of the currently signed-in user — this is the Task 7.1 "current user" evidence.
![Reader dashboard + console](assets/image-20260726162944-kk2md4o.png)

**Figure 8.** `FirebaseSigninView.vue` in VS Code: `signInWithEmailAndPassword`, the Firestore `getDoc` role lookup, the role-based `router.push`, and the `console.table` line.
![Sign-in source code](assets/image-20260726164324-6k7kd15.png)

---

## 4. Task 7.1 — Registered user on Firebase

**Figure 9.** Firebase Console → Authentication → Users, showing the two test accounts registered against project `nomash-library-lab7` (UID, Provider = Password, Created and Signed-in dates).
![Firebase Authentication users](assets/image-20260726164404-yvrikp6.png)

---

## 5. Task 7.2 — Multiple Roles

Two accounts with different Firestore roles land on visually distinct dashboards after sign-in. Each dashboard has a different heading and a different alert style. Access is controlled both at the sign-in redirect and by a route guard, so a signed-in user cannot reach the other role's dashboard by editing the URL.

**Figure 10.** Librarian account signed in — the Librarian Dashboard is shown and the Console prints `role: "librarian"`. Together with Figure 7 (reader), this shows the system supports multiple roles based on real Firestore data.
![Librarian dashboard + console](assets/image-20260726163243-tvbn1tm.png)

**Figure 11.** Role-based redirect in `FirebaseSigninView.vue` — `if (role === 'librarian') router.push(...) else if (role === 'reader') router.push(...) else router.push({ name: 'unauthorized' })`.
![Role redirect code](assets/image-20260726164446-8vn40yx.png)

**Figure 12.** `router/index.js` — routes carry `meta: { requiresAuth: true, role: 'librarian' | 'reader' }`, and the `router.beforeEach` guard waits for `onAuthStateChanged` before reading the Firestore role and comparing it against `to.meta.role`. Any mismatch redirects to `/unauthorized`.
![Navigation guard code](assets/image-20260726164532-05hr2wi.png)

**Figure 13.** A signed-in reader manually navigates to `/librarian` and is redirected to Access Denied, proving the guard actually checks the Firestore role (not just whether the user is signed in).
![Reader denied librarian page](assets/06-reader-access-denied-20260726162803-im83761.png)

**Figure 14.** The librarian navigating to `/reader` is denied in the same way — the guard works both directions.
![Librarian denied reader page](assets/10-librarian-access-denied-20260726162803-mk7z14c.png)

**Figure 15.** Firebase Console → Firestore Database → `users` collection, showing one document with `role: reader` and another with `role: librarian`. Roles are stored per-user in the database, not hard-coded.
![Firestore users collection](assets/image-20260726164608-dtif5tp.png)

---

## 6. Task 7.2 — Logout

The logout view listens with `onAuthStateChanged` so it can display the current user on the page. Clicking **Confirm log out** calls `signOut(auth)` and logs `auth.currentUser` before and after, then routes back to `/FireLogin`.

**Figure 16.** `/logout` page before the button is clicked — the currently signed-in user's email and UID are shown.
![Logout page before](assets/07-logout-before-20260726162803-27gnrxg.png)

**Figure 17.** DevTools Console after clicking **Confirm log out** — `Current user before logout: { uid, email }` followed by `Current user after logout: null`, showing the session is actually cleared (not just a redirect).
![Logout console before and after](assets/image-20260726163351-yqpk7yr.png)

---

## 7. GitHub Evidence

The Lab 7 work sits on branch `lab7-firebase-auth`, split into four commits so the assessor can see the feature grow instead of one giant "final" commit.

**Figure 18.** Commit history on `lab7-firebase-auth`: configure Firebase → registration → sign-in + auth state → role-based routing and logout.
![GitHub commit history](assets/image-20260726164655-uzcab2k.png)

Repository: https://github.com/rikey123123/rwang-library-lab5
Branch: `lab7-firebase-auth`
Final commit SHA: `bc4d7b9`
