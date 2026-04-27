import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// Set persistence
setPersistence(auth, browserLocalPersistence);

/**
 * Register new hospital admin
 * @param {string} email - Hospital admin email
 * @param {string} password - Password
 * @param {object} hospitalData - Hospital details
 */
export const registerHospital = async (email, password, hospitalData) => {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store hospital data in Firestore
    await setDoc(doc(db, "hospitals", user.uid), {
      hospitalId: user.uid,
      email,
      ...hospitalData,
      createdAt: new Date().toISOString(),
      status: "active",
      verified: false
    });

    return { success: true, userId: user.uid };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Login hospital admin
 * @param {string} email
 * @param {string} password
 */
export const loginHospital = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, userId: userCredential.user.uid };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get current hospital admin
 */
export const getCurrentAdmin = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, "hospitals", userId));
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: "Hospital not found" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Update hospital details
 * @param {string} userId
 * @param {object} updates
 */
export const updateHospitalProfile = async (userId, updates) => {
  try {
    await updateDoc(doc(db, "hospitals", userId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Listen to auth state changes
 * @param {function} callback
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Logout
 */
export const logoutAdmin = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
