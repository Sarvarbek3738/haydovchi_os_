import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyA6n8gtbiTa0NXehiemqlJZXAxkFLcCGHM",
  authDomain: "haydovchi-4a271.firebaseapp.com",
  projectId: "haydovchi-4a271",
  storageBucket: "haydovchi-4a271.firebasestorage.app",
  messagingSenderId: "193279848933",
  appId: "1:193279848933:web:17602e79a089bcd867bf0c"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
