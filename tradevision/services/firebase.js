
import { auth, db } from "../firebase.js";
import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

const googleProvider = new GoogleAuthProvider();

// Database Sync Helpers
export const syncUserTrades = (userId, callback) => {
  const tradesRef = ref(db, `users/${userId}/trades`);
  return onValue(tradesRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
};

export const saveTradeToCloud = async (userId, trade) => {
  return set(ref(db, `users/${userId}/trades/${trade.id}`), trade);
};

// Auth Helpers
export const signUpUser = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const signInUser = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logoutUser = () => signOut(auth);
export const watchAuthStatus = (callback) => onAuthStateChanged(auth, callback);

export { auth, db };
