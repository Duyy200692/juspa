
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- QUAN TRỌNG: THAY THẾ CÁC GIÁ TRỊ DƯỚI ĐÂY BẰNG THÔNG TIN TỪ FIREBASE CONSOLE CỦA BẠN ---
const firebaseConfig = {
  apiKey: "AIzaSyAS9G31URd2WN3qzOy74IMr8qH0VItjgB0",
  authDomain: "juspa-manager.firebaseapp.com",
  projectId: "juspa-manager",
  storageBucket: "juspa-manager.firebasestorage.app",
  messagingSenderId: "457281875952",
  appId: "1:457281875952:web:504941230227ba7a007735"
};
// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo và export Firestore Database để dùng ở các file khác
export const db = getFirestore(app);
