
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ServiceManagement from './components/ServiceManagement';
import { USERS as INITIAL_USERS, SERVICES as INITIAL_SERVICES, PROMOTIONS } from './constants';
import { User, Promotion, Service, Role } from './types';

type View = 'dashboard' | 'services';

const App: React.FC = () => {
  // We maintain a list of 4 users (one for each role)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  // Current active role determines the "logged in" user
  const [currentRole, setCurrentRole] = useState<Role>(Role.Sales); // Default to Sales view
  
  const [promotions, setPromotions] = useState<Promotion[]>(PROMOTIONS);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [view, setView] = useState<View>('dashboard');
  
  // Computed current user based on selected role
  const currentUser = useMemo(() => {
    return users.find(u => u.role === currentRole) || users[0];
  }, [users, currentRole]);

  // --- Auth & User Logic ---
  const handleSwitchRole = (role: Role) => {
    setCurrentRole(role);
    setView('dashboard'); // Optional: Reset to dashboard when switching roles
  };

  const handleUpdateUserName = (newName: string) => {
    setUsers(prev => prev.map(u => u.role === currentRole ? { ...u, name: newName } : u));
  };

  // --- Promotion Management ---
  const addPromotion = (newPromotion: Omit<Promotion, 'id'>) => {
    setPromotions(prev => [
      ...prev,
      {
        ...newPromotion,
        id: `promo-${Date.now()}`,
      }
    ]);
  };

  const updatePromotion = (updatedPromotion: Promotion) => {
    setPromotions(prev => 
      prev.map(p => p.id === updatedPromotion.id ? updatedPromotion : p)
    );
  };

  // --- Service Management ---
  const addService = (newService: Omit<Service, 'id'>) => {
    setServices(prev => [
        ...prev,
        {
            ...newService,
            id: `service-${Date.now()}`,
        }
    ]);
  };

  const updateService = (updatedService: Service) => {
    setServices(prev => 
        prev.map(s => s.id === updatedService.id ? updatedService : s)
    );
  };

  const deleteService = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
  }

  const activePromotions = useMemo(() => {
    const now = new Date();
    return promotions.filter(p => 
      p.status === 'Approved' && 
      new Date(p.startDate) <= now && 
      new Date(p.endDate) >= now
    );
  }, [promotions]);

  const proposalPromotions = useMemo(() => {
    return promotions.filter(p => p.status !== 'Approved' || new Date(p.startDate) > new Date());
  }, [promotions]);

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
