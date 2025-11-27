
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ServiceManagement from './components/ServiceManagement';
import { USERS as INITIAL_USERS, SERVICES as INITIAL_SERVICES, PROMOTIONS as INITIAL_PROMOTIONS } from './constants';
import { User, Promotion, Service, Role } from './types';
import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, query, orderBy } from 'firebase/firestore';

type View = 'dashboard' | 'services';

const App: React.FC = () => {
  // --- Local State for UI ---
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentRole, setCurrentRole] = useState<Role>(Role.Sales); 
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [view, setView] = useState<View>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // --- Computed Values ---
  const currentUser = useMemo(() => {
    return users.find(u => u.role === currentRole) || users[0];
  }, [users, currentRole]);

  const activePromotions = useMemo(() => {
    const now = new Date();
    return promotions.filter(p => 
      p.status === 'Approved' && 
      new Date(p.startDate) <= now && 
      new Date(p.endDate) >= now
    );
  }, [promotions]);

  const proposalPromotions = useMemo(() => {
    // Show promotions that are NOT active (Pending, Rejected, or Future Approved)
    const now = new Date();
    return promotions.filter(p => 
        p.status !== 'Approved' || 
        new Date(p.startDate) > now ||
        new Date(p.endDate) < now
    );
  }, [promotions]);

  // --- Firebase Data Fetching & Seeding ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Services
        const servicesCol = collection(db, 'services');
        const servicesSnapshot = await getDocs(servicesCol);
        
        let fetchedServices: Service[] = [];
        if (servicesSnapshot.empty) {
             // Seed Initial Services if DB is empty
             console.log("Seeding initial services...");
             const seedPromises = INITIAL_SERVICES.map(s => setDoc(doc(db, 'services', s.id), s));
             await Promise.all(seedPromises);
             fetchedServices = INITIAL_SERVICES;
        } else {
             fetchedServices = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
        }
        setServices(fetchedServices);

        // 2. Fetch Promotions
        const promotionsCol = collection(db, 'promotions');
        const promotionsSnapshot = await getDocs(promotionsCol);
        
        let fetchedPromotions: Promotion[] = [];
        if (promotionsSnapshot.empty) {
            // Seed Initial Promotions if DB is empty
            console.log("Seeding initial promotions...");
            const seedPromises = INITIAL_PROMOTIONS.map(p => setDoc(doc(db, 'promotions', p.id), p));
            await Promise.all(seedPromises);
            fetchedPromotions = INITIAL_PROMOTIONS;
        } else {
            fetchedPromotions = promotionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Promotion));
        }
        setPromotions(fetchedPromotions);

      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        // Fallback to local constants if offline or config error
        setServices(INITIAL_SERVICES);
        setPromotions(INITIAL_PROMOTIONS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Handlers ---
  const handleSwitchRole = (role: Role) => {
    setCurrentRole(role);
    setView('dashboard');
  };

  const handleUpdateUserName = (newName: string) => {
    setUsers(prev => prev.map(u => u.role === currentRole ? { ...u, name: newName } : u));
    // Note: We are keeping user names local for this session as requested (simple role switcher)
    // If you want to persist user names, we would need a 'users' collection in Firebase.
  };

  // --- Firestore Actions: Promotions ---
  const addPromotion = async (newPromotionData: Omit<Promotion, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, 'promotions'), newPromotionData);
        const newPromotion = { ...newPromotionData, id: docRef.id };
        setPromotions(prev => [...prev, newPromotion]);
    } catch (e) {
        console.error("Error adding promotion: ", e);
        alert("Lỗi khi lưu vào Database. Kiểm tra console.");
    }
  };

  const updatePromotion = async (updatedPromotion: Promotion) => {
    try {
        const promoRef = doc(db, 'promotions', updatedPromotion.id);
        // Destructure id out to avoid saving it as a field inside the doc
        const { id, ...data } = updatedPromotion;
        await updateDoc(promoRef, data);
        
        setPromotions(prev => 
          prev.map(p => p.id === updatedPromotion.id ? updatedPromotion : p)
        );
    } catch (e) {
        console.error("Error updating promotion: ", e);
    }
  };

  // --- Firestore Actions: Services ---
  const addService = async (newServiceData: Omit<Service, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, 'services'), newServiceData);
        const newService = { ...newServiceData, id: docRef.id };
        setServices(prev => [...prev, newService]);
    } catch (e) {
        console.error("Error adding service: ", e);
    }
  };

  const updateService = async (updatedService: Service) => {
    try {
        const serviceRef = doc(db, 'services', updatedService.id);
        const { id, ...data } = updatedService;
        await updateDoc(serviceRef, data);

        setServices(prev => 
            prev.map(s => s.id === updatedService.id ? updatedService : s)
        );
    } catch (e) {
        console.error("Error updating service: ", e);
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
        await deleteDoc(doc(db, 'services', serviceId));
        setServices(prev => prev.filter(s => s.id !== serviceId));
    } catch (e) {
        console.error("Error deleting service: ", e);
    }
  }

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#FEFBFB] text-[#5C3A3A]">
              <div className="text-center">
                  <svg className="animate-spin h-10 w-10 text-[#E5989B] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="font-serif text-xl">Đang kết nối dữ liệu...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#FDF7F8] text-[#5C3A3A]">
      <Header
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onUpdateUserName={handleUpdateUserName}
        currentView={view}
        onViewChange={setView}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {view === 'dashboard' && (
          <Dashboard
            loggedInUser={currentUser}
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
      </main>
    </div>
  );
};

export default App;
