
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- QUAN TRỌNG: THAY THẾ CÁC GIÁ TRỊ DƯỚI ĐÂY BẰNG THÔNG TIN TỪ FIREBASE CONSOLE CỦA BẠN ---
const firebaseConfig = {
  apiKey: "AIzaSyAS9G31URd2WN3qzOy74IMr8qH0VItjgB0", 
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.firebasestorage.app",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo và export Firestore Database để dùng ở các file khác
export const db = getFirestore(app);
