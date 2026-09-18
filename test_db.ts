import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp({
  projectId: firebaseConfig.projectId,
  credential: applicationDefault()
});

const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
db.collection("test").add({a: 1}).then(console.log).catch(console.error);
