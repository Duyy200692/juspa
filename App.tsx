import React, { useState, useMemo, useEffect } from 'react';
import { db } from './firebaseConfig';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ServiceManagement from './components/ServiceManagement';
import LoginScreen from './components/LoginScreen';
import UserManagement from './components/UserManagement';
import LandingPage from './components/LandingPage';
import { User, Promotion, Service, Role } from './types';
import { USERS as DEFAULT_USERS, SERVICES as DEFAULT_SERVICES, PROMOTIONS as DEFAULT_PROMOTIONS } from './constants';

type View = 'dashboard' | 'services' | 'users';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  
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
            const usersSnap = await db.collection('users').get();
            if (usersSnap.empty) {
                console.log("No users found. Seeding default users...");
                const batch = db.batch();
                DEFAULT_USERS.forEach(user => {
                    const docRef = db.collection('users').doc(user.id);
                    batch.set(docRef, user);
                });
                await batch.commit();
            }
            // Check services
            const servicesSnap = await db.collection('services').get();
            if (servicesSnap.empty) {
                console.log("No services found. Seeding default services...");
                const batch = db.batch();
                DEFAULT_SERVICES.forEach(service => {
                    const docRef = db.collection('services').doc(service.id);
                    batch.set(docRef, service);
                });
                await batch.commit();
            }
             // Check promotions
            const promotionsSnap = await db.collection('promotions').get();
            if (promotionsSnap.empty) {
                console.log("No promotions found. Seeding default promotions...");
                const batch = db.batch();
                DEFAULT_PROMOTIONS.forEach(promo => {
                    const docRef = db.collection('promotions').doc(promo.id);
                    batch.set(docRef, promo);
                });
                await batch.commit();
            }
        } catch (err) {
            console.error("Error seeding data:", err);
        }
    };

    const setupListeners = () => {
        const unsubUsers = db.collection("users").onSnapshot((snapshot) => {
            const loadedUsers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
            setUsers(loadedUsers);
        });

        const unsubServices = db.collection("services").onSnapshot((snapshot) => {
            const loadedServices = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Service));
            setServices(loadedServices.sort((a, b) => (a.category || '').localeCompare(b.category || '')));
        });

        const unsubPromotions = db.collection("promotions").onSnapshot((snapshot) => {
            const loadedPromotions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Promotion));
            setPromotions(loadedPromotions);
        });
        
        return () => {
            unsubUsers();
            unsubServices();
            unsubPromotions();
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

  // --- Computed Values ---
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

  // --- Auth Handlers ---
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

  // --- Role Switching Logic ---
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

  // --- User Profile Updates ---
  const handleUpdateUserName = async (newName: string) => {
    if (loggedInUser) {
        await db.collection('users').doc(loggedInUser.id).update({ name: newName });
    }
  };

  // --- Actions: Users (Firebase) ---
  const addUser = async (newUserData: Omit<User, 'id'>) => {
    const newId = `user-${Date.now()}`;
    await db.collection('users').doc(newId).set({ ...newUserData, id: newId });
  };
  
  // NOTE: Removed unused updateUser function to fix build error TS6133

  const deleteUser = async (userId: string) => {
      await db.collection('users').doc(userId).delete();
  };

  // --- Actions: Promotions (Firebase) ---
  const addPromotion = async (newPromotionData: Omit<Promotion, 'id'>) => {
    const newId = `promo-${Date.now()}`;
    await db.collection('promotions').doc(newId).set({ ...newPromotionData, id: newId });
  };
  
  const updatePromotion = async (updatedPromotion: Promotion) => {
    // FIX: Force cast to satisfy TypeScript strict checking
    await db.collection('promotions').doc(updatedPromotion.id).update({ ...updatedPromotion } as any);
  };

  // --- Actions: Services (Firebase) ---
  const addService = async (newServiceData: Omit<Service, 'id'>) => {
    const newId = `service-${Date.now()}`;
    await db.collection('services').doc(newId).set({ ...newServiceData, id: newId });
  };
  
  const updateService = async (updatedService: Service) => {
    // FIX: Force cast to satisfy TypeScript strict checking
    await db.collection('services').doc(updatedService.id).update({ ...updatedService } as any);
  };
  
  const deleteService = async (serviceId: string) => {
    await db.collection('services').doc(serviceId).delete();
  }

  // --- Main Render Flow ---
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