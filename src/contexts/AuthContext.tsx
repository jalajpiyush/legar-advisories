import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, setDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db, onAuthStateChanged } from '../lib/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged automatically triggers for BOTH Email and Google logins
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        
        // Detect login method
        const providerId = user.providerData[0]?.providerId || "password";
        let loginMethod = "password";
        if (providerId.includes("google")) {
          loginMethod = "google";
        } else if (providerId.includes("apple")) {
          loginMethod = "apple";
        } else if (providerId.includes("github")) {
          loginMethod = "github";
        } else if (providerId.includes("password")) {
          loginMethod = "password";
        } else {
          loginMethod = providerId.replace(".com", "");
        }

        // These fields are refreshed on every login
        const updateData: any = {
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          provider: providerId,
          loginMethod: loginMethod,
          emailVerified: user.emailVerified,
          sessionId: crypto.randomUUID(),
          lastLoginAt: serverTimestamp(),
          lastSeenAt: serverTimestamp(),
          appVersion: (import.meta as any).env?.VITE_APP_VERSION ?? "1.0.0",
        };

          // Use runTransaction() ONLY for first-time user initialization (createdAt, role, plan, status)
          try {
            await runTransaction(db, async (transaction) => {
              const userSnap = await transaction.get(userRef);
              if (!userSnap.exists()) {
                transaction.set(userRef, {
                  createdAt: serverTimestamp(),
                  role: 'user',
                  plan: 'Free',
                  status: 'active',
                });
              }
            });
          } catch (transactionError) {
            console.error("Transaction error during first-time user initialization:", transactionError);
          }

        // ALWAYS execute setDoc to refresh login & profile fields safely without duplicating logic or overwriting initial fields
        try {
          await setDoc(userRef, updateData, { merge: true });
        } catch (writeError) {
          console.error("Failed to update user document in Firestore:", writeError);
        }

      } catch (error) {
        console.error("Unhandled error during Auth synchronization:", error);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
