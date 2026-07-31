const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const config = require('./firebase-applet-config.json');

process.env.GOOGLE_CLOUD_QUOTA_PROJECT = config.projectId;

const app = initializeApp({
  credential: applicationDefault(),
  projectId: config.projectId
});

const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    const s = await db.collection('test').get();
    console.log('Docs:', s.size);
    const users = await getAuth(app).listUsers(1);
    console.log('Users:', users.users.length);
  } catch (e) {
    console.error(e);
  }
}
run();
