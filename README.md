# FIT5032 Assessed Lab 8 — Mastering Firestore

**Name:** _<your name>_ &nbsp;&nbsp; **Student ID:** _<your student id>_ &nbsp;&nbsp; **Tutorial:** _<your tutorial>_
**Repository:** https://github.com/rikey123123/rwang-library-lab5 &nbsp;&nbsp; **Branch:** `lab8-firestore` &nbsp;&nbsp; **Final commit:** _<sha>_
**Submission Date:** _<date>_

---

## 1. Overview

I connected the existing NoMash Library Vue 3 project to **Cloud Firestore** and built a small book management feature: add, query, update and delete books. The work targets the D/HD level (Task 8.2), which also covers the Task 8.1 requirements.

The data flow is:

```text
AddBookView.vue  → addDoc()  → Firestore / books
BookList.vue     → getDocs(query())  → query books
                 → updateDoc()        → modify a book
                 → deleteDoc()        → delete a book
```

Key choices:

- Firebase is installed via npm and initialised once in `src/firebase/init.js`, which exports a shared `db`. No component calls `getFirestore()` again.
- ISBN is stored as a **number** (both `v-model.number` and `Number(isbn.value)`), not a string.
- `addDoc()` lets Firestore auto-generate the document id.
- The query uses `where('isbn', '>', 1000)`, `orderBy('isbn', 'desc')` and `limit(5)` together.
- Update and delete keep the document id returned by the query snapshot, so `doc(db, 'books', id)` targets the right document. Delete is guarded by a `window.confirm`.

### `src/firebase/init.js`

```js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBiVE-yf2NUeODSSyL7LFDByhq6UuqHK9c',
  authDomain: 'nomash-library-lab7.firebaseapp.com',
  projectId: 'nomash-library-lab7',
  storageBucket: 'nomash-library-lab7.firebasestorage.app',
  messagingSenderId: '1021775219448',
  appId: '1:1021775219448:web:ce0f07b8af67a30dbdc90d'
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export default db
```

### Firestore security rules (test mode for the `books` collection)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // ... lab 7 user rules unchanged ...
    }
    match /books/{bookId} {
      allow read, write: if true;
    }
  }
}
```

---

## 2. Task 8.1 — Add books

`AddBookView.vue` collects ISBN (number) and book name, then writes a new document to the `books` collection with `addDoc()`. After a successful add it bumps a `refreshKey` so the `BookList` below reloads and the new book is visible immediately. `@submit.prevent` stops the form from refreshing the page.

**Figure 1.** AddBook page with the empty form (ISBN + Book name + Add Book button).
![AddBook empty](lab8report/assets/01-addbook-empty.png)

**Figure 2.** Form filled in with a new book.
![AddBook filled](lab8report/assets/02-addbook-filled.png)

**Figure 3.** Success message after `addDoc` wrote the document and the list reloaded.
![AddBook success](lab8report/assets/03-addbook-success.png)

**Figure 4.** `AddBookView.vue` in VS Code — `addDoc(collection(db, 'books'), { isbn, name })`, the `refreshKey` bump, and the `@submit.prevent` on the form.
> **Manual screenshot — instructions:** open `src/views/AddBookView.vue` in VS Code; make sure the `addDoc(...)` call, `v-model.number="isbn"` and the form's `@submit.prevent="addBook"` are visible. Keep the filename `AddBookView.vue` in the tab/header.

```
[ PLACEHOLDER: VS Code screenshot of AddBookView.vue ]
```

**Figure 5.** Newly added document in Firebase Console → Firestore Database → `books`, showing the auto-generated document id, `isbn` as a number and `name` as a string.
> **Manual screenshot — instructions:** open Firebase Console → Firestore Database → Data → `books` collection (project `nomash-library-lab7`). Click into a document so the id, `isbn` (number) and `name` (string) fields are all visible.

```
[ PLACEHOLDER: Firebase Console Firestore → books screenshot ]
```

---

## 3. Task 8.2 — Query with where, orderBy and limit

`BookList.vue` runs a single `query()` against the `books` collection:

```js
const booksQuery = query(
  collection(db, 'books'),
  where('isbn', '>', 1000),
  orderBy('isbn', 'desc'),
  limit(5)
)
const querySnapshot = await getDocs(booksQuery)
```

With the test data (ISBN 900, 1001, 1012, 1018, 1200, 1300, 1500, 1600), the list:

- does **not** show the ISBN 900 book → `where` works;
- is sorted `1600 → 1500 → 1300 → 1200 → 1018` → `orderBy('desc')` works;
- shows at most 5 rows → `limit(5)` works.

**Figure 6.** The BookList query result. The caption states the active query (ISBN > 1000, descending, limit 5); the rows prove all three clauses.
![BookList query](lab8report/assets/04-booklist-query.png)

**Figure 7.** The query code in VS Code — `where('isbn', '>', 1000)`, `orderBy('isbn', 'desc')`, `limit(5)` inside `query()`.
> **Manual screenshot — instructions:** open `src/components/BookList.vue` in VS Code; make sure the `query(collection(db, 'books'), where(...), orderBy(...), limit(...))` block and the `getDocs(booksQuery)` call are visible.

```
[ PLACEHOLDER: VS Code screenshot of the query block in BookList.vue ]
```

---

## 4. Task 8.2 — Update and delete

Update and delete reuse the document id stored on each row:

```js
// update
await updateDoc(doc(db, 'books', bookId), { name: bookName, isbn: isbnNumber })
// delete
await deleteDoc(doc(db, 'books', bookId))
```

Both reload the list after the operation so the change is visible immediately.

**Figure 8.** Edit mode on a row — the Edit button reveals name + ISBN inputs and Save / Cancel buttons.
![Edit mode](lab8report/assets/05-booklist-edit-mode.png)

**Figure 9.** Update proven by data change — edit `Audrey Book — ISBN 1012` into `Updated Audrey Book — ISBN 2020`; after Save the row jumps to the top of the list (highest ISBN) and the Firestore Console shows the new field values.
> **Manual screenshot — instructions:** in the browser, click **Edit** on `Audrey Book`, change the name to `Updated Audrey Book` and ISBN to `2020`, click **Save**. Then open Firebase Console → Firestore → `books` and find that document showing the updated `name` and `isbn: 2020`. Take one browser shot (updated list) and one Firestore Console shot (updated document).

```
[ PLACEHOLDER: browser — list after update + Firestore Console updated document ]
```

**Figure 10.** Delete proven by data change — delete `Yiwei Book — ISBN 1018`; after confirm the row disappears from the list and the document is gone from the Firestore Console.
> **Manual screenshot — instructions:** in the browser click **Delete** on `Yiwei Book`, confirm the dialog. Take a browser shot (row gone) and a Firestore Console shot (`books` no longer has that document).

```
[ PLACEHOLDER: browser — list after delete + Firestore Console document gone ]
```

**Figure 11.** Update and delete code in VS Code — `updateDoc(doc(db, 'books', bookId), {...})` and `deleteDoc(doc(db, 'books', bookId))`.
> **Manual screenshot — instructions:** open `src/components/BookList.vue`; make sure the `saveEdit` (with `updateDoc`) and `removeBook` (with `deleteDoc`) functions are visible.

```
[ PLACEHOLDER: VS Code screenshot of updateDoc / deleteDoc in BookList.vue ]
```

---

## 5. GitHub evidence

The lab is on branch `lab8-firestore`, split into four commits so the feature grows in reviewable steps.

**Figure 12.** Commit history on `lab8-firestore`: configure Firebase and Firestore → add books → query with where/orderBy/limit → update and delete.
> **Manual screenshot — instructions:** visit https://github.com/rikey123123/rwang-library-lab5/commits/lab8-firestore and screenshot the four `feat:` commits.

```
[ PLACEHOLDER: GitHub commit history screenshot ]
```

Repository: https://github.com/rikey123123/rwang-library-lab5
Branch: `lab8-firestore`

---

## 6. Pre-submission checklist

- [x] `npm install firebase` succeeded.
- [x] Firestore Database created.
- [x] `src/firebase/init.js` uses my own Firebase config.
- [x] Books can be added from the browser.
- [x] `books` collection appears in Firestore.
- [x] ISBN is stored as a number, not a string.
- [x] Books can be read and displayed.
- [x] Books can be updated.
- [x] Books can be deleted.
- [x] Query uses `where`, `orderBy` and `limit`.
- [x] Multiple meaningful commits on GitHub.
- [ ] All screenshots are legible.
- [ ] Everything merged into a single PDF.
- [ ] PDF uploaded to the correct Moodle assignment before the deadline.
