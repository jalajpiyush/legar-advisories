import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDT-npISPYSQk6ixhYK-HKW44_0QxNLgIA",
  authDomain: "legal-advisories.firebaseapp.com",
  projectId: "legal-advisories",
  storageBucket: "legal-advisories.firebasestorage.app",
  messagingSenderId: "983471528964",
  appId: "1:983471528964:web:5a50ea52189b7ff7926951",
  measurementId: "G-DSLC3WLVTW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const snap = await getDocs(collection(db, "plans"));
    snap.docs.forEach(doc => {
      console.log(`Plan ID: ${doc.id}`);
      console.log(JSON.stringify(doc.data(), null, 2));
    });
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
