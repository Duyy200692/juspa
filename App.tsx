
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ServiceManagement from './components/ServiceManagement';
import { USERS, SERVICES as INITIAL_SERVICES, PROMOTIONS } from './constants';
import { Role, User, Promotion, Service } from './types';

type View = 'dashboard' | 'services';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);
  const [promotions, setPromotions] = useState<Promotion[]>(PROMOTIONS);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [view, setView] = useState<View>('dashboard');
  
  const handleRoleChange = (role: Role) => {
    const newUser = USERS.find(user => user.role === role);
    if (newUser) {
      setCurrentUser(newUser);
    }
  };

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
        onRoleChange={handleRoleChange}
        currentView={view}
        onViewChange={setView}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {view === 'dashboard' ? (
          <Dashboard
            currentUser={currentUser}
            services={services}
            activePromotions={activePromotions}
            proposalPromotions={proposalPromotions}
            onAddPromotion={addPromotion}
            onUpdatePromotion={updatePromotion}
          />
        ) : (
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