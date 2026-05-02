import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBMWmjf01xuiU3bZ2ITYwew4VC4o2o6BIQ",
  authDomain: "wingotool.xyz",
  projectId: "ffgarena-rewards",
  storageBucket: "ffgarena-rewards.firebasestorage.app",
  messagingSenderId: "775884468566",
  appId: "1:775884468566:web:8a91c3d3598546bf1166f7",
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
