import { db } from './auth';
import { collection, doc, setDoc, getDocs, getDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

export interface GeneratedDocument {
  id: string;
  schemaId: string;
  title: string;
  formData: any;
  content: string;
  version: number;
  status: string;
  createdAt: any;
  updatedAt: any;
}

export const saveGeneratedDocument = async (userId: string, data: Partial<GeneratedDocument>) => {
  if (!userId) throw new Error('User not authenticated');
  const docsRef = collection(db, 'generated_documents');
  
  let docId = data.id;
  let version = 1;

  if (docId) {
    const existingDoc = await getDoc(doc(docsRef, docId));
    if (existingDoc.exists()) {
      version = (existingDoc.data().version || 1) + 1;
    }
  } else {
    docId = doc(docsRef).id;
  }

  const documentRef = doc(docsRef, docId);
  
  const payload = {
    ...data,
    userId,
    id: docId,
    version,
    updatedAt: serverTimestamp(),
  };

  if (version === 1) {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(documentRef, payload, { merge: true });
  return docId;
};

export const getUserDocuments = async (userId: string): Promise<GeneratedDocument[]> => {
  if (!userId) return [];
  const q = query(
    collection(db, 'generated_documents'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as GeneratedDocument));
};

export const getDocumentById = async (userId: string, docId: string): Promise<GeneratedDocument | null> => {
  if (!userId || !docId) return null;
  const docRef = doc(db, 'generated_documents', docId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { ...snapshot.data(), id: snapshot.id } as GeneratedDocument;
  }
  return null;
};
