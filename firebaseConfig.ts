import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// TODO: Thay thế các giá trị bên dưới bằng thông tin từ Firebase Console của bạn
const firebaseConfig = {
  apiKey: "API_KEY_CUA_BAN",
  authDomain: "juspa-manager.firebaseapp.com",
  projectId: "juspa-manager",
  storageBucket: "juspa-manager.appspot.com",
  messagingSenderId: "SENDER_ID_CUA_BAN",
  appId: "APP_ID_CUA_BAN"
};

// Khởi tạo Firebase
// Initialize using compat API which is more robust against environment type resolution issues
const app = firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore(app);