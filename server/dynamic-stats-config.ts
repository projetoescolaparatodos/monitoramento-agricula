
import { db } from './firebase-config';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export async function getDynamicStatsConfig() {
  try {
    const q = query(
      collection(db, 'estatisticas_dinamicas'),
      where('ativo', '==', true),
      orderBy('ordem', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const configs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to ISO string if needed
      createdAt: doc.data().createdAt?.toDate().toISOString()
    }));
    
    return configs;
  } catch (error) {
    console.error('Error fetching dynamic stats config:', error);
    throw error;
  }
}
