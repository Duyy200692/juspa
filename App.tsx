import React, { useState, useMemo, useEffect } from 'react';
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
        // ... (Logic seed cũ giữ nguyên)
        try {
            const usersSnap = await getDocs(collection(db, 'users'));
            if (usersSnap.empty) {
                const batch = writeBatch(db);
                DEFAULT_USERS.forEach(user => batch.set(doc(db, 'users', user.id), user));
                await batch.commit();
            }
            const servicesSnap = await getDocs(collection(db, 'services'));
            if (servicesSnap.empty) {
                const batch = writeBatch(db);
                DEFAULT_SERVICES.forEach(service => batch.set(doc(db, 'services', service.id), service));
                await batch.commit();
            }
            // ...
        } catch (err) { console.error(err); }
    };

    const setupListeners = () => {
        const unsubUsers = onSnapshot(query(collection(db, "users")), (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User)));
        });
        const unsubServices = onSnapshot(query(collection(db, "services")), (snapshot) => {
            setServices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Service)).sort((a, b) => (a.category || '').localeCompare(b.category || '')));
        });
        const unsubPromotions = onSnapshot(query(collection(db, "promotions")), (snapshot) => {
            setPromotions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Promotion)));
        });
        const unsubInventory = onSnapshot(query(collection(db, "inventory")), (snapshot) => {
            setInventoryItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InventoryItem)));
        });
        const unsubTransactions = onSnapshot(query(collection(db, "inventory_transactions")), (snapshot) => {
            setInventoryTransactions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InventoryTransaction)));
        });
        
        // NEW: Audit Listener
        const unsubAudits = onSnapshot(query(collection(db, "audit_sessions")), (snapshot) => {
            setAuditSessions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AuditSession)));
        });
        
        return () => {
            unsubUsers(); unsubServices(); unsubPromotions(); unsubInventory(); unsubTransactions(); unsubAudits();
        };
    };

    seedInitialData().then(() => {
        const unsubscribe = setupListeners();
        setIsLoading(false);
        return unsubscribe;
    });
  }, []);

  // ... (Keep existing auth/view logic) ...
  // (Tôi lược bớt phần này để tập trung vào code mới, bạn giữ nguyên code cũ nhé)
  const activePromotions = useMemo(() => promotions.filter(p => p.status === 'Approved' && new Date(p.endDate) >= new Date()), [promotions]);
  const proposalPromotions = useMemo(() => promotions.filter(p => p.status !== 'Approved' || new Date(p.endDate) < new Date()), [promotions]);
  const handleLogin = (u: string, p: string) => {
      const user = users.find(usr => usr.username === u && usr.password === p);
      if (user) { setLoggedInUser(user); setLoginError(''); } else { setLoginError('Sai thông tin'); }
  };
  const handleLogout = () => { setLoggedInUser(null); setView('dashboard'); setShowLanding(true); };
  const handleEnterSystem = () => setShowLanding(false);
  const handleSwitchRole = (role: Role) => { 
      const u = users.find(user => user.role === role);
      if(u) setLoggedInUser(u);
  };
  const handleUpdateUserName = async (name: string) => { if(loggedInUser) await updateDoc(doc(db, 'users', loggedInUser.id), {name}); };

  // ... (Keep existing CRUD actions for User/Service/Promotion) ...
  const addUser = async (data: any) => await setDoc(doc(db, 'users', `user-${Date.now()}`), data);
  const deleteUser = async (id: string) => await deleteDoc(doc(db, 'users', id));
  const addService = async (data: any) => await setDoc(doc(db, 'services', `service-${Date.now()}`), data);
  const updateService = async (data: any) => await updateDoc(doc(db, 'services', data.id), data);
  const deleteService = async (id: string) => await deleteDoc(doc(db, 'services', id));
  const addPromotion = async (data: any) => await setDoc(doc(db, 'promotions', `promo-${Date.now()}`), data);
  const updatePromotion = async (data: any) => await updateDoc(doc(db, 'promotions', data.id), data);
  const deletePromotion = async (id: string) => await deleteDoc(doc(db, 'promotions', id));

  // ... (Inventory Import/Export/Update Logic - Keep unchanged) ...
  const importInventoryItem = async (itemId: string, quantity: number, notes?: string, expiryDate?: string) => {
      if (!loggedInUser) return;
      const item = inventoryItems.find(i => i.id === itemId);
      if (!item) return;
      
      // ... (Logic batch update - giữ nguyên như bản trước)
      // Tạm viết tắt để code gọn, bạn giữ nguyên code cũ nhé
      const newQty = item.quantity + quantity;
      const itemRef = doc(db, 'inventory', itemId);
      
      // Simple update for brevity in this snippet, please use full logic from previous step
      await updateDoc(itemRef, { quantity: newQty } as any); 

      await addDoc(collection(db, 'inventory_transactions'), {
          itemId, itemName: item.name, type: 'in', quantity, date: new Date().toISOString(),
          performedBy: loggedInUser.name, performedById: loggedInUser.id, reason: notes || 'Nhập hàng', remainingStock: newQty
      });
  };

  const exportInventoryItem = async (itemId: string, quantity: number, reason: string) => {
      if (!loggedInUser) return;
      const item = inventoryItems.find(i => i.id === itemId);
      if (!item) return;
      
      const newQty = Math.max(0, item.quantity - quantity);
      // ... (Logic FIFO batch update - giữ nguyên như bản trước)
      await updateDoc(doc(db, 'inventory', itemId), { quantity: newQty } as any);

      await addDoc(collection(db, 'inventory_transactions'), {
          itemId, itemName: item.name, type: 'out', quantity, date: new Date().toISOString(),
          performedBy: loggedInUser.name, performedById: loggedInUser.id, reason, remainingStock: newQty
      });
  };

  const updateInventoryItem = async (item: InventoryItem) => {
      await updateDoc(doc(db, 'inventory', item.id), { ...item } as any);
  };

  const handleForceSeedInventory = async () => {
      try {
          const batch = writeBatch(db);
          DEFAULT_INVENTORY.forEach(item => {
              const docRef = doc(db, 'inventory', item.id);
              if (item.expiryDate) item.batches = [{ expiryDate: item.expiryDate, quantity: item.quantity }];
              batch.set(docRef, item);
          });
          await batch.commit();
          alert("Đã nạp dữ liệu thành công!");
      } catch(e) { alert("Lỗi: " + e); }
  };

  // --- NEW: AUDIT LOGIC (CORE) ---
  
  const createAuditSession = async (month: number, year: number) => {
      if (!loggedInUser) return;
      const newId = `audit-${year}-${month}-${Date.now()}`;
      
      // 1. Snapshot current stock state
      const items: AuditItem[] = inventoryItems.map(inv => ({
          itemId: inv.id,
          itemName: inv.name,
          systemQty: inv.quantity, // Current system stock
          actualQty: inv.quantity, // Default actual to system (user will edit this)
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
              return { 
                  ...item, 
                  actualQty, 
                  diff: actualQty - item.systemQty, // Recalculate diff
                  reason 
              };
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

      // 1. Close the audit session
      const auditRef = doc(db, 'audit_sessions', auditId);
      batch.update(auditRef, { status: 'closed', closedDate: today });

      // 2. Create Adjustments
      for (const item of session.items) {
          if (item.diff !== 0) {
              // A. Update Inventory Qty
              const invRef = doc(db, 'inventory', item.itemId);
              batch.update(invRef, { quantity: item.actualQty }); // Set to actual count

              // B. Create Transaction Record
              const transRef = doc(collection(db, 'inventory_transactions'));
              batch.set(transRef, {
                  itemId: item.itemId,
                  itemName: item.itemName,
                  type: 'audit_adjustment',
                  quantity: Math.abs(item.diff),
                  date: today,
                  performedBy: loggedInUser?.name || 'System',
                  performedById: loggedInUser?.id || 'system',
                  reason: `Điều chỉnh kiểm kê (${session.name}): ${item.diff > 0 ? '+' : ''}${item.diff}. ${item.reason || ''}`,
                  remainingStock: item.actualQty
              });
          }
      }

      await batch.commit();
      alert("Đã chốt sổ thành công! Tồn kho đã được cập nhật theo số liệu thực tế.");
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  if (showLanding) return <LandingPage onEnter={handleEnterSystem} />;
  if (!loggedInUser) return <LoginScreen onLogin={handleLogin} error={loginError} />;

  return (
    <div className="min-h-screen bg-[#FDF7F8] text-[#5C3A3A]">
      <Header currentUser={loggedInUser} onSwitchRole={handleSwitchRole} onUpdateUserName={handleUpdateUserName} currentView={view} onViewChange={setView} onLogout={handleLogout} />
      <main className="p-4 sm:p-6 lg:p-8">
        {view === 'dashboard' && <Dashboard loggedInUser={loggedInUser} services={services} activePromotions={activePromotions} proposalPromotions={proposalPromotions} onAddPromotion={addPromotion} onUpdatePromotion={updatePromotion} onDeletePromotion={deletePromotion} />}
        {view === 'services' && <ServiceManagement services={services} onAddService={addService} onUpdateService={updateService} onDeleteService={deleteService} />}
        {view === 'users' && loggedInUser.role === Role.Management && <UserManagement users={users} onAddUser={addUser} onDeleteUser={deleteUser} />}
        
        {view === 'inventory' && (
            <InventoryManagement 
                items={inventoryItems}
                transactions={inventoryTransactions}
                currentUser={loggedInUser}
                onImportItem={importInventoryItem}
                onExportItem={exportInventoryItem}
                onSeedData={handleForceSeedInventory}
                onUpdateItem={updateInventoryItem}
                // Pass new Audit props
                auditSessions={auditSessions}
                onCreateAudit={createAuditSession}
                onUpdateAuditItem={updateAuditItem}
                onFinalizeAudit={finalizeAuditSession}
            />
        )}
      </main>
    </div>
  );
};

export default App;