// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAlUZOweB_Ob5H3LlekHJD8rP9b17N6pHI",
    authDomain: "bus-flow-tracker.firebaseapp.com",
    projectId: "bus-flow-tracker",
    storageBucket: "bus-flow-tracker.firebasestorage.app",
    messagingSenderId: "689511288475",
    appId: "1:689511288475:web:9fcf892337809cf7a7c03e"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
import { getAuth } from "firebase/auth";
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
import { getFirestore } from "firebase/firestore";
export const db = getFirestore(app);
