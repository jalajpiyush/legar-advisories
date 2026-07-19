import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

export const googleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user') {
      console.log('Sign in cancelled by user.');
      alert('Login cancelled or blocked. Since you are in a preview environment, popups may be blocked. Please OPEN THE APP IN A NEW TAB (using the arrow icon in the top right of the preview) to log in successfully.');
      return null;
    }
    if (error?.code === 'auth/unauthorized-domain') {
      console.error('Unauthorized domain:', error);
      alert(`Please add this app URL to your Firebase Authorized Domains list. Go to Firebase Console -> Authentication -> Settings -> Authorized domains and add: ${window.location.hostname}`);
      return null;
    }
    console.error('Sign in error:', error);
    alert(`Login failed: ${error?.message || error}`);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};

export { onAuthStateChanged, type User };
