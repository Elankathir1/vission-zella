
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

/**
 * VISIONZELLA CORE SYSTEM CONFIGURATION
 * Project: tradetrack-pro-35138
 */
const firebaseConfig = {
  apiKey: "AIzaSyByVOLrI4dsBWXkm1S_QL0CPtwCaPBsvzI",
  authDomain: "tradetrack-pro-35138.firebaseapp.com",
  databaseURL: "https://tradetrack-pro-35138-default-rtdb.firebaseio.com",
  projectId: "tradetrack-pro-35138",
  storageBucket: "tradetrack-pro-35138.appspot.com",
  messagingSenderId: "774349428106",
  appId: "1:774349428106:web:b505c6ce477805297e2473"
};

// Initialize Firebase App strictly as requested
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth strictly as requested
const auth = getAuth(app);

// Initialize Realtime Database
const db = getDatabase(app);

console.log("VisionZella [System]: Terminal linked to Project tradetrack-pro-35138 ✔️");

export { app, auth, db };
