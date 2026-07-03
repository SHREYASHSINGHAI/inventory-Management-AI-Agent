import { db } from './firebase';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  lastUpdated: string;
}

const COLLECTION = 'inventory';

export async function getInventory(): Promise<InventoryItem[]> {
  const snapshot = await db.collection(COLLECTION).get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as InventoryItem[];
}

export async function checkStock(itemName: string): Promise<InventoryItem | null> {
  const snapshot = await db
    .collection(COLLECTION)
    .where('name', '==', itemName)
    .limit(1)
    .get();

  if (snapshot.empty) {
    // Try case-insensitive search by getting all and filtering
    const allSnapshot = await db.collection(COLLECTION).get();
    const match = allSnapshot.docs.find(
      (doc) => (doc.data().name as string).toLowerCase() === itemName.toLowerCase()
    );
    if (!match) return null;
    return { id: match.id, ...match.data() } as InventoryItem;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as InventoryItem;
}

export async function updateStock(
  itemName: string,
  quantityChange: number,
  unit?: string
): Promise<InventoryItem> {
  // Find existing item (case-insensitive)
  const allSnapshot = await db.collection(COLLECTION).get();
  const existingDoc = allSnapshot.docs.find(
    (doc) => (doc.data().name as string).toLowerCase() === itemName.toLowerCase()
  );

  if (existingDoc) {
    const currentData = existingDoc.data();
    const newQuantity = (currentData.quantity as number) + quantityChange;
    const updatedData = {
      quantity: newQuantity,
      lastUpdated: new Date().toISOString(),
    };
    await db.collection(COLLECTION).doc(existingDoc.id).update(updatedData);
    return {
      id: existingDoc.id,
      ...currentData,
      ...updatedData,
    } as InventoryItem;
  } else {
    // Create new item
    const newItem = {
      name: itemName,
      quantity: quantityChange > 0 ? quantityChange : 0,
      unit: unit || 'units',
      lastUpdated: new Date().toISOString(),
    };
    const docRef = await db.collection(COLLECTION).add(newItem);
    return { id: docRef.id, ...newItem };
  }
}
