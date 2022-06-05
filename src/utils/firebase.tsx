// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASzHWGVfdwkKS8fBIjTn1OHp8j5c8uKjc",
  authDomain: "farmrpg-mod.firebaseapp.com",
  projectId: "farmrpg-mod",
  storageBucket: "farmrpg-mod.appspot.com",
  messagingSenderId: "207355284349",
  appId: "1:207355284349:web:f95e31cb4d788220ae9a14",
  measurementId: "G-K57C116GF5"
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
