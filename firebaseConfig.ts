// Mocking Firestore to fix module resolution errors without needing 'firebase' package
// This allows the app to run in environments where firebase SDK is not installed or configured.

export const db = { type: 'firestore-mock' };

const STORAGE_PREFIX = 'juspa_mock_';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const loadData = (collectionName: string) => {
    try {
        const key = STORAGE_PREFIX + collectionName;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("Error loading mock data", e);
        return {};
    }
};

const saveData = (collectionName: string, data: any) => {
    try {
        const key = STORAGE_PREFIX + collectionName;
        localStorage.setItem(key, JSON.stringify(data));
        triggerSnapshot(collectionName);
    } catch (e) {
        console.error("Error saving mock data", e);
    }
};

const listeners: Record<string, Function[]> = {};

const triggerSnapshot = (collectionName: string) => {
    if (!listeners[collectionName]) return;
    const data = loadData(collectionName);
    const docs = Object.values(data).map((item: any) => ({
        id: item.id,
        data: () => item
    }));
    const snapshot = {
        docs,
        empty: docs.length === 0,
        size: docs.length,
        forEach: (callback: Function) => docs.forEach(callback as any)
    };
    listeners[collectionName].forEach(cb => cb(snapshot));
};

export const collection = (dbInstance: any, collectionName: string) => {
    return { type: 'collection', name: collectionName };
};

export const doc = (dbInstance: any, collectionName: string, id: string) => {
    return { type: 'doc', collection: collectionName, id };
};

export const getDocs = async (queryRef: any) => {
    await delay(50);
    const data = loadData(queryRef.name);
    const docs = Object.values(data).map((item: any) => ({
        id: item.id,
        data: () => item
    }));
    return {
        docs,
        empty: docs.length === 0,
        size: docs.length,
        forEach: (callback: Function) => docs.forEach(callback as any)
    };
};

export const setDoc = async (docRef: any, data: any) => {
    await delay(50);
    const currentData = loadData(docRef.collection);
    currentData[docRef.id] = { ...data, id: docRef.id };
    saveData(docRef.collection, currentData);
};

export const updateDoc = async (docRef: any, data: any) => {
    await delay(50);
    const currentData = loadData(docRef.collection);
    if (currentData[docRef.id]) {
        currentData[docRef.id] = { ...currentData[docRef.id], ...data };
        saveData(docRef.collection, currentData);
    }
};

export const deleteDoc = async (docRef: any) => {
    await delay(50);
    const currentData = loadData(docRef.collection);
    delete currentData[docRef.id];
    saveData(docRef.collection, currentData);
};

export const writeBatch = (dbInstance: any) => {
    const operations: Function[] = [];
    return {
        set: (docRef: any, data: any) => {
            operations.push(() => setDoc(docRef, data));
        },
        update: (docRef: any, data: any) => {
            operations.push(() => updateDoc(docRef, data));
        },
        delete: (docRef: any) => {
            operations.push(() => deleteDoc(docRef));
        },
        commit: async () => {
            for (const op of operations) {
                await op();
            }
        }
    };
};

export const onSnapshot = (queryRef: any, callback: Function) => {
    const collectionName = queryRef.name;
    if (!listeners[collectionName]) listeners[collectionName] = [];
    listeners[collectionName].push(callback);
    
    setTimeout(() => triggerSnapshot(collectionName), 0);

    return () => {
        if(listeners[collectionName]) {
            listeners[collectionName] = listeners[collectionName].filter(cb => cb !== callback);
        }
    };
};

export const query = (collectionRef: any, ...constraints: any[]) => {
    return collectionRef;
};
