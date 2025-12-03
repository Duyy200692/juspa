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
import { USERS as DEFAULT_USERS, SERVICES as DEFAULT_SERVICES, PROMOTIONS as DEFAULT_PROMOTIONS, INVENTORY_ITEMS as DEFAULT_INVENTORY } from './constants';

type View = 'dashboard' | 'services' | 'users' | 'inventory';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  // NEW: Audit State
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
            // Check users
            const usersSnap = await getDocs(collection(db, 'users'));
            if (usersSnap.empty) {
                const batch = writeBatch(db);
                DEFAULT_USERS.forEach(user => {
                    const docRef = doc(db, 'users', user.id);
                    batch.set(docRef, user);
                });
                await batch.commit();
            }
            // Check services
            const servicesSnap = await getDocs(collection(db, 'services'));
            if (servicesSnap.empty) {
                const batch = writeBatch(db);
                DEFAULT_SERVICES.forEach(service => {
                    const docRef = doc(db, 'services', service.id);
                    batch.set(docRef, service);
                });
                await batch.commit();
            }
             // Check promotions
            const promotionsSnap = await getDocs(collection(db, 'promotions'));
            if (promotionsSnap.empty) {
                const batch = writeBatch(db);
                DEFAULT_PROMOTIONS.forEach(promo => {
                    const docRef = doc(db, 'promotions', promo.id);
                    batch.set(docRef, promo);
                });
                await batch.commit();
            }
        } catch (err) {
            console.error("Error seeding data:", err);
        }
    };

    const setupListeners = () => {
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

        // NEW: Audit Listener
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
      }
      
      await updateDoc(itemRef, updateData);

      await addDoc(collection(db, 'inventory_transactions'), {
          itemId,
          itemName: item.name,
          type: 'in',
          quantity,
          date: new Date().toISOString(),
          performedBy: loggedInUser.name,
          performedById: loggedInUser.id,
          reason: notes || 'Nhập hàng',
          remainingStock: newQty
      });
  };

  const exportInventoryItem = async (itemId: string, quantity: number, reason: string) => {
      if (!loggedInUser) return;
      const item = inventoryItems.find(i => i.id === itemId);
      if (!item) return;

      const newQty = Math.max(0, item.quantity - quantity);
      const itemRef = doc(db, 'inventory', itemId);
      
      const updateData: any = { quantity: newQty };

      // FIFO Logic
      if (item.batches && item.batches.length > 0) {
          let remainingToDeduct = quantity;
          const updatedBatches = item.batches.map(b => ({...b}));
          updatedBatches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

          for (let i = 0; i < updatedBatches.length; i++) {
              if (remainingToDeduct <= 0) break;
              if (updatedBatches[i].quantity >= remainingToDeduct) {
                  updatedBatches[i].quantity -= remainingToDeduct;
                  remainingToDeduct = 0;
              } else {
                  remainingToDeduct -= updatedBatches[i].quantity;
                  updatedBatches[i].quantity = 0;
              }
          }
          const finalBatches = updatedBatches.filter(b => b.quantity > 0);
          updateData.batches = finalBatches;
          
          if (finalBatches.length > 0) {
              updateData.expiryDate = finalBatches[0].expiryDate;
          } else {
              updateData.expiryDate = null;
          }
      }

      await updateDoc(itemRef, updateData);

      await addDoc(collection(db, 'inventory_transactions'), {
          itemId,
          itemName: item.name,
          type: 'out',
          quantity,
          date: new Date().toISOString(),
          performedBy: loggedInUser.name,
          performedById: loggedInUser.id,
          reason: reason,
          remainingStock: newQty
      });
  };

  const updateInventoryItem = async (item: InventoryItem) => {
      const itemRef = doc(db, 'inventory', item.id);
      await updateDoc(itemRef, { ...item } as { [key: string]: any });
  };

  const handleForceSeedInventory = async () => {
      try {
          const batch = writeBatch(db);
          DEFAULT_INVENTORY.forEach(item => {
              const docRef = doc(db, 'inventory', item.id);
              if (item.expiryDate) {
                  item.batches = [{ expiryDate: item.expiryDate, quantity: item.quantity }];
              }
              batch.set(docRef, item);
          });
          await batch.commit();
          alert(`Đã nạp thành công ${DEFAULT_INVENTORY.length} mặt hàng vào kho!`);
      } catch (e) {
          console.error(e);
          alert("Lỗi khi nạp dữ liệu: " + e);
      }
  };

  // --- NEW: AUDIT ACTIONS ---
  
  const createAuditSession = async (month: number, year: number) => {
      if (!loggedInUser) return;
      const newId = `audit-${year}-${month}-${Date.now()}`;
      
      // Snapshot current stock
      const items: AuditItem[] = inventoryItems.map(inv => ({
          itemId: inv.id,
          itemName: inv.name,
          systemQty: inv.quantity,
          actualQty: inv.quantity, // Default to system qty
          diff: 0
      }));

      const newAudit: AuditSession = {
          id: newId,
          name: `Kiểm kê Tháng ${month}/${year}`,
          month,
          year,
          status: 'open',
          createdBy: loggedInUser.name,
          createdDate: new Date().toISOString(),
          items
      };

      await setDoc(doc(db, 'audit_sessions', newId), newAudit);
  };

  const updateAuditItem = async (auditId: string, itemId: string, actualQty: number, reason: string) => {
      const session = auditSessions.find(s => s.id === auditId);
      if (!session) return;

      const updatedItems = session.items.map(item => {
          if (item.itemId === itemId) {
              return { ...item, actualQty, diff: actualQty - item.systemQty, reason };
          }
          return item;
      });

      await updateDoc(doc(db, 'audit_sessions', auditId), { items: updatedItems } as any);
  };

  const finalizeAuditSession = async (auditId: string) => {
      const session = auditSessions.find(s => s.id === auditId);
      if (!session) return;

      const batch = writeBatch(db);
      const today = new Date().toISOString();

      // 1. Close session
      const auditRef = doc(db, 'audit_sessions', auditId);
      batch.update(auditRef, { status: 'closed', closedDate: today });

      // 2. Adjust Inventory & Create Transactions
      for (const item of session.items) {
          if (item.diff !== 0) {
              // Update Inventory
              const invRef = doc(db, 'inventory', item.itemId);
              batch.update(invRef, { quantity: item.actualQty });

              // Create Transaction Record (Adjustment)
              const transRef = doc(collection(db, 'inventory_transactions')); // Auto ID
              batch.set(transRef, {
                  itemId: item.itemId,
                  itemName: item.itemName,
                  type: 'audit_adjustment', // Special type
                  quantity: Math.abs(item.diff),
                  date: today,
                  performedBy: loggedInUser?.name || 'System',
                  performedById: loggedInUser?.id || 'system',
                  reason: `Điều chỉnh kiểm kê: ${item.diff > 0 ? '+' : ''}${item.diff}. ${item.reason || ''}`,
                  remainingStock: item.actualQty
              });
          }
      }

      await batch.commit();
      alert("Đã chốt sổ kiểm kê thành công! Kho đã được cập nhật.");
  };

  // ... (Render Logic) ...
  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#FEFBFB] text-[#5C3A3A]">
              <p className="font-serif text-xl animate-pulse">Đang kết nối tới cơ sở dữ liệu...</p>
          </div>
      );
  }

  if (showLanding) {
      return <LandingPage onEnter={handleEnterSystem} />;
  }

  if (!loggedInUser) {
    return <LoginScreen onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="min-h-screen bg-[#FDF7F8] text-[#5C3A3A]">
      <Header
        currentUser={loggedInUser}
        onSwitchRole={handleSwitchRole} 
        onUpdateUserName={handleUpdateUserName}
        currentView={view}
        onViewChange={setView}
        onLogout={handleLogout}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {view === 'dashboard' && (
          <Dashboard
            loggedInUser={loggedInUser}
            services={services}
            activePromotions={activePromotions}
            proposalPromotions={proposalPromotions}
            onAddPromotion={addPromotion}
            onUpdatePromotion={updatePromotion}
            onDeletePromotion={deletePromotion}
          />
        )}
        
        {view === 'services' && (
          <ServiceManagement
            services={services}
            onAddService={addService}
            onUpdateService={updateService}
            onDeleteService={deleteService}
          />
        )}

        {view === 'inventory' && (
            <InventoryManagement 
                items={inventoryItems}
                transactions={inventoryTransactions}
                currentUser={loggedInUser}
                onImportItem={importInventoryItem}
                onExportItem={exportInventoryItem}
                onSeedData={handleForceSeedInventory}
                onUpdateItem={updateInventoryItem}
                // Pass Audit props
                auditSessions={auditSessions}
                onCreateAudit={createAuditSession}
                onUpdateAuditItem={updateAuditItem}
                onFinalizeAudit={finalizeAuditSession}
            />
        )}

        {view === 'users' && loggedInUser.role === Role.Management && (
            <UserManagement 
                users={users}
                onAddUser={addUser}
                onDeleteUser={deleteUser}
            />
        )}
      </main>
    </div>
  );
};

export default App;