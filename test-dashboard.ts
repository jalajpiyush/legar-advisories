import { adminDb } from './src/lib/firebase-admin';

async function run() {
  const usersRef = adminDb.collection('users');
  const snap = await usersRef.limit(1).get();
  if (snap.empty) {
    console.log("No users found");
    return;
  }
  const user = snap.docs[0];
  console.log("User:", user.id);
  console.log("Data:", user.data());
  process.exit(0);
}
run();
