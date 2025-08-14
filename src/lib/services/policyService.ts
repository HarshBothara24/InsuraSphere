import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Policy } from '../../types/policy';

export class PolicyService {
  private static COLLECTION_NAME = 'policies';

  static async getAllPolicies(): Promise<Policy[]> {
    try {
      const policiesRef = collection(db, this.COLLECTION_NAME);
      const snapshot = await getDocs(policiesRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Policy[];
    } catch (error) {
      console.error('Error fetching policies:', error);
      throw error;
    }
  }

  static async getPolicyById(id: string): Promise<Policy | null> {
    try {
      const policyRef = doc(db, this.COLLECTION_NAME, id);
      const policyDoc = await getDoc(policyRef);
      
      if (!policyDoc.exists()) {
        return null;
      }

      return {
        id: policyDoc.id,
        ...policyDoc.data()
      } as Policy;
    } catch (error) {
      console.error('Error fetching policy:', error);
      throw error;
    }
  }

  static async getPoliciesByCategory(category: string): Promise<Policy[]> {
    try {
      const policiesRef = collection(db, this.COLLECTION_NAME);
      const q = query(policiesRef, where('category', '==', category));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Policy[];
    } catch (error) {
      console.error('Error fetching policies by category:', error);
      throw error;
    }
  }
} 