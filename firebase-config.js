// =========================================================
// VCAJ-CLUB FIREBASE CONFIG
// =========================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";


const firebaseConfig = {
    apiKey: "AIzaSyCzNtGBG3n1mALvoyKIMteJzl_IePz3gsk",
    authDomain: "vcaj-club.firebaseapp.com",
    projectId: "vcaj-club",
    storageBucket: "vcaj-club.firebasestorage.app",
    messagingSenderId: "808073355092",
    appId: "1:808073355092:web:3d82af52505fc848feb2c1",
    measurementId: "G-DCPCS43W7B"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const storage = getStorage(app);


export {
    app,
    db,
    auth,
    storage
};