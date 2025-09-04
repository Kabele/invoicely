import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

/**
 * A Cloud Function that triggers when a new user is created in Firebase Authentication.
 * It creates a corresponding user document in Firestore to store user profile information.
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const { uid, email } = user;

  const userRef = db.collection("users").doc(uid);

  try {
    await userRef.set({
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Successfully created user document for UID: ${uid}`);
  } catch (error) {
    console.error(`Error creating user document for UID: ${uid}`, error);
  }
});
