const admin = require('firebase-admin');
const fs = require('fs');

if (fs.existsSync('./serviceAccountKey.json')) {
  admin.initializeApp({
    credential: admin.credential.cert(require('./serviceAccountKey.json')),
  });
} else {
  console.log("No service account found, using default");
  admin.initializeApp();
}

async function run() {
  const usersRef = admin.firestore().collection('users');
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
