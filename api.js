// api.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  updateDoc,
  arrayUnion,
  setDoc,
  getDoc,
  query,
  where,
  arrayRemove,
  deleteField
} from "firebase/firestore";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAHAAl6zW4THP8x_KZwF0G8uJKqYUyuwFo",
  authDomain: "vanlife-76467.firebaseapp.com",
  projectId: "vanlife-76467",
  storageBucket: "vanlife-76467.appspot.com",
  messagingSenderId: "36165908241",
  appId: "1:36165908241:web:a14a29dd3fe09070227eb0",
  measurementId: "G-K5CC8BBP14"
};

// Initialize Firebase app and services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Collection reference for vans
const vansCollectionRef = collection(db, "vans");

// Function to save a van for the current user
// First checks if the user is authenticated
// Then either, creates a new user doc with van saved or updates existing user doc adding it with arrayUnion which avoid duplicates
export async function saveVanForUser(vanId) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);

  console.log("User doc exists:", userDocSnap.exists());
  if (!userDocSnap.exists()) {
    console.log("Creating new user doc with savedVans:", [vanId]);
    await setDoc(userDocRef, { savedVans: [vanId] });
  } else {
    console.log("Updating user doc, adding vanId:", vanId);
    await updateDoc(userDocRef, {
      savedVans: arrayUnion(vanId)
    });
  }
  const vanDocRef = doc(db, "vans", vanId);
  await updateDoc(vanDocRef, { hostId: user.uid });

  const updatedDoc = await getDoc(userDocRef);
  console.log("Updated user doc data:", updatedDoc.data());

  return { success: true };
}



// Fetches all vans from the "vans" collection
// Converts each firebase document into a plain object
export async function getVans() {
  const snapshot = await getDocs(vansCollectionRef);
  const vans = snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  }));
  return vans;
}

// Fetches a single van by its ID to display on detail pages
export async function getVan(id) {
  const docRef = doc(db, "vans", id);
  const snapshot = await getDoc(docRef);
  return {
    ...snapshot.data(),
    id: snapshot.id
  };
}

// Fetches only vans listed by current user
// using onAuth state to get the current user, and running a query to get vans where hostId is user.uid (for real world use-case, but not as applicable for this demo)
export async function getHostVans() {
  const auth = getAuth();
  const user = auth.currentUser;

  console.log("Current user:", user);

  if (!user) {
    throw new Error("User not authenticated");
  }

  const hostId = user.uid;
  console.log("Fetching vans for hostId:", hostId);

  const q = query(vansCollectionRef, where("hostId", "==", hostId));
  const snapshot = await getDocs(q);

  const vans = snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  }));

  console.log("Fetched vans:", vans);

  return vans;
}

// Function to log in a user with email and password, returning user object and token on success
export async function loginUser({ email, password }) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      user: userCredential.user,
      token: await userCredential.user.getIdToken()
    };
  } catch (err) {
    throw {
      message: err.message,
      code: err.code
    };
  }
}

// remove van from use collection
export async function removeVanForUser(vanId) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const userDocRef = doc(db, "users", user.uid);
  await updateDoc(userDocRef, {
    savedVans: arrayRemove(vanId)
  });

  const vanDocRef = doc(db, "vans", vanId);
  // Remove hostId field from the van document
  await updateDoc(vanDocRef, {
    hostId: deleteField()
  });

  // Optionally, return updated savedVans list
  const updatedDoc = await getDoc(userDocRef);
  return updatedDoc.data().savedVans;
}
