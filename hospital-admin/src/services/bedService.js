import { db, realtimeDb } from "./firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { ref, onValue, set, update } from "firebase/database";

/**
 * Initialize hospital beds (first time setup)
 * @param {string} hospitalId
 * @param {object} bedsData - { general: 50, icu: 20, oxygen: 30 }
 */
export const initializeBeds = async (hospitalId, bedsData) => {
  try {
    const bedsStructure = {
      general: {
        total: bedsData.general || 50,
        occupied: 0,
        available: bedsData.general || 50,
        beds: initializeBedArray(bedsData.general || 50)
      },
      icu: {
        total: bedsData.icu || 20,
        occupied: 0,
        available: bedsData.icu || 20,
        beds: initializeBedArray(bedsData.icu || 20)
      },
      oxygen: {
        total: bedsData.oxygen || 30,
        occupied: 0,
        available: bedsData.oxygen || 30,
        beds: initializeBedArray(bedsData.oxygen || 30)
      }
    };

    await setDoc(doc(db, "hospitals", hospitalId, "bedsInfo", "data"), bedsStructure);

    // Also set in Realtime DB for live updates
    await set(ref(realtimeDb, `hospitals/${hospitalId}/beds`), bedsStructure);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Helper to create bed array
 */
const initializeBedArray = (count) => {
  const beds = [];
  for (let i = 1; i <= count; i++) {
    beds.push({
      bedNumber: i,
      isOccupied: false,
      patientId: null,
      admittedAt: null
    });
  }
  return beds;
};

/**
 * Get current bed status
 * @param {string} hospitalId
 */
export const getBedStatus = async (hospitalId) => {
  try {
    const docSnap = await getDoc(doc(db, "hospitals", hospitalId, "bedsInfo", "data"));
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: "Beds data not found" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Update bed status (occupied/available)
 * @param {string} hospitalId
 * @param {string} bedType - "general" | "icu" | "oxygen"
 * @param {number} bedNumber
 * @param {boolean} isOccupied
 * @param {string} patientId
 */
export const updateBedStatus = async (hospitalId, bedType, bedNumber, isOccupied, patientId = null) => {
  try {
    const bedPath = `hospitals/${hospitalId}/bedsInfo/data/${bedType}/beds/${bedNumber - 1}`;
    
    // Update in Firestore
    const bedsDocRef = doc(db, "hospitals", hospitalId, "bedsInfo", "data");
    const bedsDoc = await getDoc(bedsDocRef);
    const bedsData = bedsDoc.data();
    
    bedsData[bedType].beds[bedNumber - 1].isOccupied = isOccupied;
    bedsData[bedType].beds[bedNumber - 1].patientId = patientId;
    bedsData[bedType].beds[bedNumber - 1].admittedAt = isOccupied ? new Date().toISOString() : null;
    
    // Update occupancy counts
    bedsData[bedType].occupied = bedsData[bedType].beds.filter(b => b.isOccupied).length;
    bedsData[bedType].available = bedsData[bedType].total - bedsData[bedType].occupied;

    await updateDoc(bedsDocRef, { [bedType]: bedsData[bedType] });

    // Update in Realtime DB for live sync
    await update(ref(realtimeDb, `hospitals/${hospitalId}/beds/${bedType}`), bedsData[bedType]);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Listen to bed changes in real-time
 * @param {string} hospitalId
 * @param {function} callback
 */
export const listenToBedChanges = (hospitalId, callback) => {
  const bedsRef = ref(realtimeDb, `hospitals/${hospitalId}/beds`);
  
  return onValue(bedsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });
};

/**
 * Get pending bed requests
 * @param {string} hospitalId
 */
export const getPendingRequests = async (hospitalId) => {
  try {
    const q = query(
      collection(db, "bedRequests"),
      where("hospitalId", "==", hospitalId),
      where("status", "==", "pending")
    );
    
    const snapshot = await getDocs(q);
    const requests = [];
    
    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: requests };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Approve bed request
 * @param {string} requestId
 * @param {string} hospitalId
 * @param {string} bedType
 * @param {number} bedNumber
 */
export const approveBedRequest = async (requestId, hospitalId, bedType, bedNumber) => {
  try {
    // Update request status
    await updateDoc(doc(db, "bedRequests", requestId), {
      status: "approved",
      approvedAt: serverTimestamp(),
      bedType,
      bedNumber
    });

    // Update bed status
    await updateBedStatus(hospitalId, bedType, bedNumber, true, requestId);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Reject bed request
 * @param {string} requestId
 */
export const rejectBedRequest = async (requestId, reason = "") => {
  try {
    await updateDoc(doc(db, "bedRequests", requestId), {
      status: "rejected",
      rejectionReason: reason,
      rejectedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
