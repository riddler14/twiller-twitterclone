// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCbv44n-2qpvML7K1IDZdYoq4OdRbRVCxE",
  authDomain: "twitter-a3ae9.firebaseapp.com",
  projectId: "twitter-a3ae9",
  storageBucket: "twitter-a3ae9.firebasestorage.app",
  messagingSenderId: "777958851704",
  appId: "1:777958851704:web:adfb7046e045b00520198d",
  measurementId: "G-XHZDZ13PQ0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app)
export default app
//const analytics = getAnalytics(app);