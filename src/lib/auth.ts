
export type User = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
};

let currentUser: User | null = null;
const listeners: ((user: User | null) => void)[] = [];

export const auth = {} as any;
export const analytics = null;

export const onAuthStateChanged = (authObj: any, callback: (user: User | null) => void) => {
  listeners.push(callback);
  callback(currentUser);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
};

export const googleSignIn = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    currentUser = {
      uid: 'mock-12345',
      email: 'demo@legal-advisories.com',
      displayName: 'Demo User',
      photoURL: ''
    };
    listeners.forEach(l => l(currentUser));
    return currentUser;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const logout = async () => {
  currentUser = null;
  listeners.forEach(l => l(currentUser));
};
