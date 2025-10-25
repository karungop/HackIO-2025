// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCH05_KS_g_4p6eNT3n0bzB176_fD1rdeg",
  authDomain: "billfinder-28004.firebaseapp.com",
  projectId: "billfinder-28004",
  storageBucket: "billfinder-28004.firebasestorage.app",
  messagingSenderId: "886002295987",
  appId: "1:886002295987:web:955738c317f4cff169fcc6",
  measurementId: "G-TSQYV7DHWE"
}; 

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { auth, analytics };
export default app;
