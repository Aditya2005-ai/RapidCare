import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

/**
 * Generate unique QR code for hospital
 * @param {string} hospitalId
 */
export const generateHospitalQRCode = async (hospitalId) => {
  try {
    const qrData = {
      hospitalId,
      timestamp: new Date().toISOString(),
      type: "hospital_verification"
    };

    // Store QR code mapping in Firestore
    await setDoc(doc(db, "hospitals", hospitalId, "qrCode", "data"), {
      qrData: JSON.stringify(qrData),
      generatedAt: new Date().toISOString(),
      isActive: true
    });

    return { success: true, qrData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Verify hospital QR code
 * @param {string} hospitalId
 */
export const verifyHospitalQRCode = async (hospitalId) => {
  try {
    const docSnap = await getDoc(doc(db, "hospitals", hospitalId, "qrCode", "data"));
    if (docSnap.exists() && docSnap.data().isActive) {
      return { success: true, qrData: docSnap.data() };
    }
    return { success: false, error: "QR Code not found or invalid" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get hospital details
 * @param {string} hospitalId
 */
export const getHospitalDetails = async (hospitalId) => {
  try {
    const docSnap = await getDoc(doc(db, "hospitals", hospitalId));
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: "Hospital not found" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Update hospital profile
 * @param {string} hospitalId
 * @param {object} updates
 */
export const updateHospitalDetails = async (hospitalId, updates) => {
  try {
    await updateDoc(doc(db, "hospitals", hospitalId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
