// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCGpbX-KAGYBadIG67FD0P19rHTR1wniMc",
  authDomain: "tripappfirebase-39fae.firebaseapp.com",
  projectId: "tripappfirebase-39fae",
  storageBucket: "tripappfirebase-39fae.appspot.com",
  messagingSenderId: "979748499450",
  appId: "1:979748499450:web:10bab0d3b78989e0eefe43",
  measurementId: "G-PCSL13V5WN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth()
export const database = getFirestore()