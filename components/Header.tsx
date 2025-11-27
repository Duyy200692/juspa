import React from 'react';
import { User, Role } from '../types';

interface HeaderProps {
  currentUser: User;
  onRoleChange: (role: Role) => void;
  currentView: 'dashboard' | 'services';
  onViewChange: (view: 'dashboard' | 'services') => void;
}

const JuSpaLogo: React.FC = () => (
    <div className="flex flex-col items-center text-[#E5989B]">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#D97A7D]">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 2C14 4 15 7 14 9C13 11 11 12 10 11C9 10 8.5 7.5 9.5 5.5C10.5 3.5 12 2 12 2Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <span className="font-serif font-bold text-xl tracking-wider mt-1">JUSpa</span>
    </div>
);


const Header: React.FC<HeaderProps> = ({ currentUser, onRoleChange, currentView, onViewChange }) => {
  const navButtonStyle = "px-3 py-1 rounded-md text-sm font-medium transition-colors";
  const activeStyle = "bg-[#E5989B] text-white shadow-sm";
  const inactiveStyle = "text-gray-600 hover:bg-pink-100";

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <JuSpaLogo />
        <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-light text-[#5C3A3A]">Promotion Management</h1>
            <div className="mt-2 flex items-center space-x-2 border border-gray-200 p-1 rounded-lg bg-gray-50">
                <button 
                    onClick={() => onViewChange('dashboard')} 
                    className={`${navButtonStyle} ${currentView === 'dashboard' ? activeStyle : inactiveStyle}`}
                    aria-current={currentView === 'dashboard' ? 'page' : undefined}
                >
                    Promotions
                </button>
                <button 
                    onClick={() => onViewChange('services')}
                    className={`${navButtonStyle} ${currentView === 'services' ? activeStyle : inactiveStyle}`}
                    aria-current={currentView === 'services' ? 'page' : undefined}
                >
                    Service Pricelist
                </button>
            </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className="hidden sm:inline text-sm text-gray-600">Logged in as: <span className="font-bold text-[#D97A7D]">{currentUser.name}</span></span>
        <select
          value={currentUser.role}
          onChange={(e) => onRoleChange(e.target.value as Role)}
          className="bg-white border border-[#E5989B] text-[#5C3A3A] text-sm rounded-lg focus:ring-[#D97A7D] focus:border-[#D97A7D] block p-2"
        >
          {Object.values(Role).map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
    </header>
  );
};

export default Header;