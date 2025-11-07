// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAR1gO3H2-FF7modsU8WGoH54bcWKqK0oM",
  authDomain: "react--curator.firebaseapp.com",
  projectId: "react--curator",
  storageBucket: "react--curator.firebasestorage.app",
  messagingSenderId: "675065499665",
  appId: "1:675065499665:web:8419f5cb7e359f014a21b0",
  measurementId: "G-72XJQ2B230"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Export 추가 - 이 부분이 중요합니다!
export const auth = getAuth(app);
export const db = getFirestore(app);

