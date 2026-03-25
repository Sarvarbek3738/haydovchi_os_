import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCtCq6if4xaSxXRj0WOjlaptpHeL3Qt3vo",
  authDomain: "my-drive-bd982.firebaseapp.com",
  projectId: "my-drive-bd982",
  storageBucket: "my-drive-bd982.firebasestorage.app",
  messagingSenderId: "23651219239",
  appId: "1:23651219239:web:a88f5cbd57bb85a2e3db02",
  measurementId: "G-B8QM69H98R"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
