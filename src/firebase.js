// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVY9BYOA-0JdNa-XLRkLFFdoDjXE3B634",
  authDomain: "onlinecodeeditor-1f7e5.firebaseapp.com",
  projectId: "onlinecodeeditor-1f7e5",
  storageBucket: "onlinecodeeditor-1f7e5.firebasestorage.app",
  messagingSenderId: "366966795066",
  appId: "1:366966795066:web:c656e0efc57a89b06afe03",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
