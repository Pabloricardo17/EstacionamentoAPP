// Firebase initialization (modular SDK)
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjxbwhFFh-9SXIBEn3kGZVEuqHOFDNE7k",
  authDomain: "estacionamentoapp-e819a.firebaseapp.com",
  projectId: "estacionamentoapp-e819a",
  storageBucket: "estacionamentoapp-e819a.firebasestorage.app",
  messagingSenderId: "606386759678",
  appId: "1:606386759678:web:70abaf3ed5e0530a20c2af",
  measurementId: "G-8KLMLV5YVY",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Analytics (opcional para React Native)
// const analytics = getAnalytics(app);

// Inicializa Auth com AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Inicializa Firestore
export const db = getFirestore(app);

export default app;
