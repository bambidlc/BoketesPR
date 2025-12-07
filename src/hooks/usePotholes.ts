import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import imageCompression from 'browser-image-compression';
import { db } from '../lib/firebase';
import { Pothole, CreatePotholeWithPhoto, Status, PotholeFilters } from '../types';
import { createGeohash } from '../lib/utils';

interface UsePotholesOptions {
  limitCount?: number;
  filters?: PotholeFilters;
}

export function usePotholes(options: UsePotholesOptions = {}) {
  const { limitCount = 100, filters } = options;
  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time subscription to potholes
  useEffect(() => {
    setLoading(true);
    setError(null);

    let q = query(
      collection(db, 'potholes'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    // Apply filters
    if (filters?.severity && filters.severity.length > 0) {
      q = query(q, where('severity', 'in', filters.severity));
    }
    if (filters?.status && filters.status.length > 0) {
      q = query(q, where('status', 'in', filters.status));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Pothole[];
        
        // Client-side sorting for 'nearest' (requires user location)
        setPotholes(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching potholes:', err);
        setError('Error al cargar los boketes');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [limitCount, filters?.severity, filters?.status]);

  return { potholes, loading, error };
}

// Hook for single pothole
export function usePothole(id: string | undefined) {
  const [pothole, setPothole] = useState<Pothole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const docRef = doc(db, 'potholes', id);
    
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setPothole({ id: snapshot.id, ...snapshot.data() } as Pothole);
        } else {
          setError('Bache no encontrado');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching pothole:', err);
        setError('Error al cargar el bokete');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  return { pothole, loading, error };
}

// Pothole actions hook
export function usePotholeActions() {
  const [submitting, setSubmitting] = useState(false);

  // Convert photo to base64 and compress
  const processPhoto = async (file: File): Promise<string> => {
    try {
      // Compress image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5, // Smaller for Firestore storage
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = () => reject(new Error('Error al procesar la imagen'));
        reader.readAsDataURL(compressedFile);
      });
    } catch (error: any) {
      console.error('Photo processing error:', error);
      throw new Error('Error al procesar la foto. Intenta con una imagen más pequeña.');
    }
  };

  // Create new pothole report
  const createPothole = useCallback(
    async (data: CreatePotholeWithPhoto): Promise<string> => {
      setSubmitting(true);
      try {
        // Process photo to base64
        let photoUrl: string;
        try {
          photoUrl = await processPhoto(data.photo);
        } catch (photoError) {
          console.warn('Photo processing failed, using placeholder:', photoError);
          // Use a placeholder image URL as fallback
          photoUrl = `data:image/svg+xml;base64,${btoa(`
            <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
              <rect width="400" height="300" fill="#1e293b"/>
              <text x="200" y="140" text-anchor="middle" fill="#64748b" font-size="16" font-family="Arial">
                Foto no disponible
              </text>
              <text x="200" y="165" text-anchor="middle" fill="#64748b" font-size="12" font-family="Arial">
                Error al procesar imagen
              </text>
            </svg>
          `)}`;
          // Add note about photo processing failure
          data.description = (data.description || '') +
            '\n\n[Nota: La foto no se pudo procesar debido a un problema técnico]';
        }

        // Create geohash
        const geohash = createGeohash(data.location.latitude, data.location.longitude);

        // Create document
        const docRef = await addDoc(collection(db, 'potholes'), {
          userId: data.userId,
          location: {
            ...data.location,
            geohash,
          },
          address: data.address || null,
          severity: data.severity,
          status: 'reported' as Status,
          photoUrl,
          description: data.description || null,
          upvotes: 0,
          upvotedBy: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Update user's report count
        const userRef = doc(db, 'users', data.userId);
        await updateDoc(userRef, {
          reportsCount: increment(1),
        });

        return docRef.id;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  // Upvote a pothole
  const upvotePothole = useCallback(
    async (potholeId: string, userId: string, hasUpvoted: boolean) => {
      const potholeRef = doc(db, 'potholes', potholeId);
      
      if (hasUpvoted) {
        // Remove upvote
        await updateDoc(potholeRef, {
          upvotes: increment(-1),
          upvotedBy: arrayRemove(userId),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Add upvote
        await updateDoc(potholeRef, {
          upvotes: increment(1),
          upvotedBy: arrayUnion(userId),
          updatedAt: serverTimestamp(),
        });
      }
    },
    []
  );

  // Update pothole status (for future admin features)
  const updateStatus = useCallback(
    async (potholeId: string, status: Status) => {
      const potholeRef = doc(db, 'potholes', potholeId);
      await updateDoc(potholeRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    },
    []
  );

  // Delete pothole
  const deletePothole = useCallback(
    async (potholeId: string, userId: string) => {
      // Delete the document
      await deleteDoc(doc(db, 'potholes', potholeId));

      // Decrement user's report count
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        reportsCount: increment(-1),
      });
    },
    []
  );

  return {
    createPothole,
    upvotePothole,
    updateStatus,
    deletePothole,
    submitting,
  };
}

export default usePotholes;

