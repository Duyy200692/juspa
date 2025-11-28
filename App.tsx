
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ServiceManagement from './components/ServiceManagement';
import LoginScreen from './components/LoginScreen';
import UserManagement from './components/UserManagement';
import LandingPage from './components/LandingPage';
import { User, Promotion, Service, Role } from './types';
import { USERS as DEFAULT_USERS, SERVICES as DEFAULT_SERVICES, PROMOTIONS as DEFAULT_PROMOTIONS } from './constants';

type View = 'dashboard' | 'services' | 'users';

// --- DATA VERSION CONTROL ---
// Change this string whenever you want to force an update of default data on users' browsers
const DATA_VERSION = 'v2.4_package_3_sessions'; 

// Helper to load from local storage
const loadFromStorage = <T,>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.error(`Error loading ${key} from storage`, e);
    return defaultVal;
  }
};

const App: React.FC = () => {
  // --- State Initialization with LocalStorage ---
  const [showLanding, setShowLanding] = useState(true);
  
  // Initialize state directly from LocalStorage to avoid flash of default content
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', DEFAULT_USERS));
  const [services, setServices] = useState<Service[]>(() => loadFromStorage('services', DEFAULT_SERVICES));
  const [promotions, setPromotions] = useState<Promotion[]>(() => loadFromStorage('promotions', DEFAULT_PROMOTIONS));
  
  // Session state
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');

  // --- Persistence Effects & Data Sync ---
  
  // 1. Check Version and Force Update if needed
  useEffect(() => {
      const currentVersion = localStorage.getItem('app_data_version');
      
      if (currentVersion !== DATA_VERSION) {
          console.log("New data version detected. Syncing defaults...");
          // Force update Services and Users to match the new code
          setServices(DEFAULT_SERVICES);
          setUsers(DEFAULT_USERS);
          // We keep promotions as they might be user-generated data we don't want to lose
          // unless it's a critical breaking change.
          
          localStorage.setItem('app_data_version', DATA_VERSION);
      }
  }, []);

  // 2. Save changes to storage
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('promotions', JSON.stringify(promotions));
  }, [promotions]);


  // --- Computed Values ---
  const activePromotions = useMemo(() => {
    const now = new Date();
    // Show ALL Approved promotions that haven't ended yet (Current + Future)
    return promotions.filter(p => 
      p.status === 'Approved' && 
      new Date(p.endDate) >= now
    ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [promotions]);

  const proposalPromotions = useMemo(() => {
    const now = new Date();
    // Show proposals that are NOT approved, OR approved ones that have already ended (past history)
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
          // Fallback for seed users in case storage is weird
          const seedUser = DEFAULT_USERS.find(u => u.username === username && u.password === password);
          if (seedUser) {
             setLoggedInUser(seedUser);
             setLoginError('');
             // Silently update users list if seed user was missing from storage
             setUsers(prev => {
                 if (!prev.find(u => u.id === seedUser.id)) {
                     return [...prev, seedUser];
                 }
                 return prev;
             });
          } else {
             setLoginError('Tên đăng nhập hoặc mật khẩu không đúng.');
          }
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
      // Find a user with the requested role
      const targetUser = users.find(u => u.role === newRole);
      
      if (targetUser) {
          setLoggedInUser(targetUser);
          // If switching away from Management while in 'users' view, go back to dashboard
          if (newRole !== Role.Management && view === 'users') {
              setView('dashboard');
          }
      } else {
          // Fallback if no user exists for that role (shouldn't happen with default data)
          alert(`Không tìm thấy tài khoản cho vai trò ${newRole}`);
      }
  };

  // --- User Profile Updates ---
  const handleUpdateUserName = (newName: string) => {
    if (loggedInUser) {
        const updatedUser = { ...loggedInUser, name: newName };
        setLoggedInUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === loggedInUser.id ? updatedUser : u));
    }
  };

  // --- Actions: Users ---
  const addUser = async (newUserData: Omit<User, 'id'>) => {
    const newUser = { ...newUserData, id: `user-${Date.now()}` };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = async (updatedUser: User) => {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      if (loggedInUser && loggedInUser.id === updatedUser.id) {
          setLoggedInUser(updatedUser);
      }
  };

  const deleteUser = async (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // --- Actions: Promotions ---
  const addPromotion = async (newPromotionData: Omit<Promotion, 'id'>) => {
    const newPromotion = { ...newPromotionData, id: `promo-${Date.now()}` };
    setPromotions(prev => [...prev, newPromotion]);
  };

  const updatePromotion = async (updatedPromotion: Promotion) => {
    setPromotions(prev => prev.map(p => p.id === updatedPromotion.id ? updatedPromotion : p));
  };

  // --- Actions: Services ---
  const addService = async (newServiceData: Omit<Service, 'id'>) => {
    const newService = { ...newServiceData, id: `service-${Date.now()}` };
    setServices(prev => [...prev, newService]);
  };

  const updateService = async (updatedService: Service) => {
    setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
  };

  const deleteService = async (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
  }

  // --- Main Render Flow ---

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#FEFBFB] text-[#5C3A3A]">
              <p className="font-serif text-xl">Đang tải dữ liệu...</p>
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
                onUpdateUser={updateUser}
                onDeleteUser={deleteUser}
            />
        )}
      </main>
    </div>
  );
};

export default App;
