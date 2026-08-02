import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket
  });
}

export const adminDb = getFirestore(getApps()[0], firebaseConfig.firestoreDatabaseId);
export const adminStorage = getStorage(getApps()[0]).bucket(firebaseConfig.storageBucket);

// Custom JWT verification using jwks-rsa to maintain existing logic
const client = jwksClient({
  jwksUri: 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, function(err, key) {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export const adminAuth = {
  verifyIdToken: (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, getKey, {
        algorithms: ['RS256'],
        issuer: 'https://securetoken.google.com/' + firebaseConfig.projectId,
        audience: firebaseConfig.projectId
      }, (err, decoded) => {
        if (err) return reject(err);
        resolve({ uid: (decoded as any).sub, ...(decoded as any) });
      });
    });
  },
  getUser: async (uid: string) => {
    // We can use the admin.auth() here if needed, but keeping existing signature
    return { uid };
  }
};
