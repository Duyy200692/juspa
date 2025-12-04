import React, { useState, useMemo, useEffect } from 'react';
// FIX: Import directly from firebase SDK for real connection
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDocs, writeBatch, query, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ServiceManagement from './components/ServiceManagement';
import LoginScreen from './components/LoginScreen';
import UserManagement from './components/UserManagement';
import LandingPage from './components/LandingPage';
import InventoryManagement from './components/InventoryManagement';
import { User, Promotion, Service, Role, InventoryItem, InventoryTransaction, AuditSession, AuditItem } from './types';
// FIX: Ensure DEFAULT_PROMOTIONS is used
import { USERS as DEFAULT_USERS, SERVICES as DEFAULT_SERVICES, PROMOTIONS as DEFAULT_PROMOTIONS, INVENTORY_ITEMS as DEFAULT_INVENTORY } from './constants';

type View = 'dashboard' | 'services' | 'users' | 'inventory';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  
  // Audit State
  const [auditSessions, setAuditSessions] = useState<AuditSession[]>([]);
  
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string>('');
  
  // --- Firebase Real-time Listener ---
  useEffect(() => {
    const seedInitialData = async () => {
        console.log("Checking for initial data...");
        try {
            // 1. Check & Seed Users
            const usersSnap = await getDocs(collection(db, 'users'));
            if (usersSnap.empty) {
                console.log("Seeding users...");
                const batch = writeBatch(db);
                DEFAULT_USERS.forEach(user => {
                    const docRef = doc(db, 'users', user.id);
                    batch.set(docRef, user);
                });
                await batch.commit();
            }

            // 2. Check & Seed Services
            const servicesSnap = await getDocs(collection(db, 'services'));
            if (servicesSnap.empty) {
                console.log("Seeding services...");
                const batch = writeBatch(db);
                DEFAULT_SERVICES.forEach(service => {
                    const docRef = doc(db, 'services', service.id);
                    batch.set(docRef, service);
                });
                await batch.commit();
            }

             // 3. Check & Seed Promotions (FIX: Using DEFAULT_PROMOTIONS here to avoid TS6133)
            const promotionsSnap = await getDocs(collection(db, 'promotions'));
            if (promotionsSnap.empty) {
                console.log("Seeding promotions...");
                const batch = writeBatch(db);
                DEFAULT_PROMOTIONS.forEach(promo => {
                    const docRef = doc(db, 'promotions', promo.id);
                    batch.set(docRef, promo);
                });
                await batch.commit();
            }

            // 4. Check & Seed Inventory
            const inventorySnap = await getDocs(collection(db, 'inventory'));
            if (inventorySnap.empty) {
                console.log("Seeding inventory...");
                const batch = writeBatch(db);
                DEFAULT_INVENTORY.forEach(item => {
                    const docRef = doc(db, 'inventory', item.id);
                    // Init batch for seeded items if expiry exists
                    if (item.expiryDate) {
                        item.batches = [{ expiryDate: item.expiryDate, quantity: item.quantity }];
                    }
                    batch.set(docRef, item);
                });
                await batch.commit();
            }

        } catch (err) {
            console.error("Error seeding data:", err);
        }
    };

    const setupListeners = () => {
        // Listeners for all collections
        const unsubUsers = onSnapshot(query(collection(db, "users")), (snapshot) => {
            const loadedUsers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
            setUsers(loadedUsers);
        });

        const unsubServices = onSnapshot(query(collection(db, "services")), (snapshot) => {
            const loadedServices = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Service));
            setServices(loadedServices.sort((a, b) => (a.category || '').localeCompare(b.category || '')));
        });

        const unsubPromotions = onSnapshot(query(collection(db, "promotions")), (snapshot) => {
            const loadedPromotions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Promotion));
            setPromotions(loadedPromotions);
        });

        const unsubInventory = onSnapshot(query(collection(db, "inventory")), (snapshot) => {
            const loadedItems = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InventoryItem));
            setInventoryItems(loadedItems);
        });

        const unsubTransactions = onSnapshot(query(collection(db, "inventory_transactions")), (snapshot) => {
            const loadedTrans = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InventoryTransaction));
            setInventoryTransactions(loadedTrans);
        });

        // Audit Listener
        const unsubAudits = onSnapshot(query(collection(db, "audit_sessions")), (snapshot) => {
            const loadedAudits = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AuditSession));
            setAuditSessions(loadedAudits);
        });
        
        return () => {
            unsubUsers();
            unsubServices();
            unsubPromotions();
            unsubInventory();
            unsubTransactions();
            unsubAudits();
        };
    };

    seedInitialData().then(() => {
        const unsubscribe = setupListeners();
        setIsLoading(false);
        return unsubscribe;
    }).catch(error => {
        console.error("Firebase initialization error:", error);
        alert("Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra lại cấu hình Firebase và kết nối mạng.");
        setIsLoading(false);
    });

  }, []);

  // ... (Keep existing computed values and auth handlers) ...
  const activePromotions = useMemo(() => {
    const now = new Date();
    return promotions.filter(p => 
      p.status === 'Approved' && 
      new Date(p.endDate) >= now
    ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [promotions]);

  const proposalPromotions = useMemo(() => {
    const now = new Date();
    return promotions.filter(p => 
        p.status !== 'Approved' || 
        new Date(p.endDate) < now
    );
  }, [promotions]);

  const handleLogin = (username: string, password: string) => {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
          setLoggedInUser(user);
          setLoginError('');
      } else {
         setLoginError('Tên đăng nhập hoặc mật khẩu không đúng.');
      }
  };

  const handleLogout = () => {
      setLoggedInUser(null);
      setView('dashboard');
      setShowLanding(true);
  };
  
  const handleEnterSystem = () => {
      setShowLanding(false);
  };

    const handleSwitchRole = (newRole: Role) => {
      const targetUser = users.find(u => u.role === newRole);
      if (targetUser) {
          setLoggedInUser(targetUser);
          if (newRole !== Role.Management && view === 'users') {
              setView('dashboard');
          }
      } else {
          alert(`Không tìm thấy tài khoản cho vai trò ${newRole}`);
      }
  };

  const handleUpdateUserName = async (newName: string) => {
    if (loggedInUser) {
        const userRef = doc(db, 'users', loggedInUser.id);
        await updateDoc(userRef, { name: newName } as { [key: string]: any });
    }
  };

  // --- Actions ---
  const addUser = async (newUserData: Omit<User, 'id'>) => {
    const newId = `user-${Date.now()}`;
    const userRef = doc(db, 'users', newId);
    await setDoc(userRef, { ...newUserData, id: newId });
  };
  
  const deleteUser = async (userId: string) => {
      await deleteDoc(doc(db, 'users', userId));
  };

  const addPromotion = async (newPromotionData: Omit<Promotion, 'id'>) => {
    const newId = `promo-${Date.now()}`;
    const promoRef = doc(db, 'promotions', newId);
    await setDoc(promoRef, { ...newPromotionData, id: newId });
  };
  
  const updatePromotion = async (updatedPromotion: Promotion) => {
    const promoRef = doc(db, 'promotions', updatedPromotion.id);
    await updateDoc(promoRef, { ...updatedPromotion } as { [key: string]: any });
  };

  const deletePromotion = async (promotionId: string) => {
    await deleteDoc(doc(db, 'promotions', promotionId));
  };

  const addService = async (newServiceData: Omit<Service, 'id'>) => {
    const newId = `service-${Date.now()}`;
    const serviceRef = doc(db, 'services', newId);
    await setDoc(serviceRef, { ...newServiceData, id: newId });
  };
  
  const updateService = async (updatedService: Service) => {
    const serviceRef = doc(db, 'services', updatedService.id);
    await updateDoc(serviceRef, { ...updatedService } as { [key: string]: any });
  };
  
  const deleteService = async (serviceId: string) => {
    await deleteDoc(doc(db, 'services', serviceId));
  }

  // --- Inventory Actions ---
  const importInventoryItem = async (itemId: string, quantity: number, notes?: string, expiryDate?: string) => {
      if (!loggedInUser) return;
      const item = inventoryItems.find(i => i.id === itemId);
      if (!item) return;

      const newQty = item.quantity + quantity;
      const itemRef = doc(db, 'inventory', itemId);
      
      const updateData: any = { quantity: newQty };
      
      // Batch Logic
      let updatedBatches = item.batches ? [...item.batches] : [];
      
      if (item.expiryDate && updatedBatches.length === 0) {
          updatedBatches.push({ expiryDate: item.expiryDate, quantity: item.quantity });
      }

      // FIX: Use expiryDate if provided
      if (expiryDate) {
          const existingBatchIndex = updatedBatches.findIndex(b => b.expiryDate === expiryDate);
          if (existingBatchIndex >= 0) {
              updatedBatches[existingBatchIndex].quantity += quantity;
          } else {
              updatedBatches.push({ expiryDate, quantity });
          }
          updatedBatches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
          
          updateData.batches = updatedBatches;
          if (updatedBatches.length > 0) {
              updateData.expiryDate = updatedBatches[0].expiryDate;
          }
      } else {
          // If no expiry provided, we might still want to update total quantity but not touch batches
          // unless we force a 'no-date' batch strategy. For now, we just update qty.
      }
      
      await updateDoc(itemRef, updateData);

      await addDoc(collection(db, 'inventory_transactions