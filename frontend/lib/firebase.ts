// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // 👈 ONGEZA HII!
import { getFirestore } from "firebase/firestore";  // 👈 ONGEZA HII!
// import { getAnalytics } from "firebase/analytics"; // COMMENT OUT KWA SASO

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmYUkQXvU6DYsFC16GcPa3KE6Gkoyp3fA",
  authDomain: "musttap-80a7f.firebaseapp.com",
  projectId: "musttap-80a7f",
  storageBucket: "musttap-80a7f.firebasestorage.app",
  messagingSenderId: "579074722006",
  appId: "1:579074722006:web:31b13a6523cbc47878e177",
  measurementId: "G-5PH6CDHWYF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // 👈 ONGEZA HII!
const db = getFirestore(app);  // 👈 ONGEZA HII!
// const analytics = getAnalytics(app); // COMMENT OUT

export { auth, db };  // 👈 EXPORT auth NA db!