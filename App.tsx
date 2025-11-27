
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

const App: React.FC = () => {
  // --- Local State for UI ---
  const [showLanding, setShowLanding] = useState(true); // New state for Landing Page
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [view, setView] = useState<View>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');

  // --- Computed Values ---
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

  // --- Mock Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Simulate network delay and use default data
      setTimeout(() => {
        setUsers(DEFAULT_USERS);
        setServices(DEFAULT_SERVICES);
        setPromotions(DEFAULT_PROMOTIONS);
        setIsLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  // --- Auth Handlers ---
  const handleLogin = (username: string, password: string) => {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
          setLoggedInUser(user);
          setLoginError('');
      } else {
          // Allow login for seed users even if password logic is simple
          const seedUser = users.find(u => u.username === username);
          if (seedUser) {
             setLoggedInUser(seedUser);
             setLoginError('');
          } else {
             setLoginError('Tên đăng nhập hoặc mật khẩu không đúng.');
          }
      }
  };

  const handleLogout = () => {
      setLoggedInUser(null);
      setView('dashboard');
      setShowLanding(true); // Return to landing page on logout
  };

  const handleEnterSystem = () => {
      setShowLanding(false); // Hide Landing Page, Show Login
  };

  // --- Mock Actions: Users ---
  const addUser = async (newUserData: Omit<User, 'id'>) => {
    const newUser = { ...newUserData, id: `user-${Date.now()}` };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = async (updatedUser: User) => {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const deleteUser = async (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // --- Mock Actions: Promotions ---
  const addPromotion = async (newPromotionData: Omit<Promotion, 'id'>) => {
    const newPromotion = { ...newPromotionData, id: `promo-${Date.now()}` };
    setPromotions(prev => [...prev, newPromotion]);
  };

  const updatePromotion = async (updatedPromotion: Promotion) => {
    setPromotions(prev => prev.map(p => p.id === updatedPromotion.id ? updatedPromotion : p));
  };

  // --- Mock Actions: Services ---
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

  // 1. Loading State
  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#FEFBFB] text-[#5C3A3A]">
              <div className="text-center">
                  <svg className="animate-spin h-10 w-10 text-[#E5989B] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="font-serif text-xl">Đang tải dữ liệu...</p>
              </div>
          </div>
      );
  }

  // 2. Landing Page
  if (showLanding) {
      return <LandingPage onEnter={handleEnterSystem} />;
  }

  // 3. Login Screen
  if (!loggedInUser) {
    return <LoginScreen onLogin={handleLogin} error={loginError} />;
  }

  // 4. Main App
  return (
    <div className="min-h-screen bg-[#FDF7F8] text-[#5C3A3A]">
      <Header
        currentUser={loggedInUser}
        onSwitchRole={() => {}} // Disabled role switcher in auth mode
        onUpdateUserName={() => {}} // Disabled local update in auth mode
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
