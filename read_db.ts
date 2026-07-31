import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId
  });
}
const adminDb = getFirestore(getApps()[0], firebaseConfig.firestoreDatabaseId);

async function run() {
  const snap = await adminDb.collection("plans").get();
  console.log(`plans length: ${snap.docs.length}`);
  snap.docs.forEach(d => console.log(d.id, d.data()));
}
run();
