import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import firebaseConfigJson from "../../firebase-applet-config.json";

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
  measurementId: firebaseConfigJson.measurementId,
};

let app: FirebaseApp;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.warn("Firebase app init warning:", e);
  app = getApps()[0] || initializeApp(firebaseConfig);
}

let auth: Auth;
try {
  auth = getAuth(app);
  // Ensure long-term local persistence across browser sessions and tabs
  if (typeof window !== "undefined") {
    setPersistence(auth, browserLocalPersistence).catch((e) => {
      console.warn("Firebase setPersistence warning:", e);
    });
  }
} catch (e) {
  console.warn("Firebase auth init warning:", e);
  auth = getAuth(app);
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

let db: Firestore;
try {
  const customDbId = (firebaseConfigJson as any).firestoreDatabaseId;
  if (customDbId && customDbId !== "(default)") {
    db = getFirestore(app, customDbId);
  } else {
    db = getFirestore(app);
  }
} catch (e) {
  console.warn("Firestore specific DB init fallback to default:", e);
  db = getFirestore(app);
}

export { app, auth, db };
