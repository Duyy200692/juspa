
import React, { useState } from 'react';
import Button from './shared/Button';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => void;
  error?: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  const JuSpaLogoLarge = () => (
    <div className="flex flex-col items-center text-[#E5989B] mb-8">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#D97A7D]">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 2C14 4 15 7 14 9C13 11 11 12 10 11C9 10 8.5 7.5 9.5 5.5C10.5 3.5 12 2 12 2Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <span className="font-serif font-bold text-4xl tracking-wider mt-2">JUSpa</span>
        <span className="text-gray-500 font-light mt-1 text-lg">Promotion Manager</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FEFBFB] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-pink-100">
        <JuSpaLogoLarge />
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#D97A7D] focus:border-[#D97A7D]"
              placeholder="Nhập tên đăng nhập của bạn"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#D97A7D] focus:border-[#D97A7D]"
              placeholder="••••••"
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full py-3 text-lg">
            Đăng nhập
          </Button>
          <div className="text-center text-xs text-gray-400 mt-4">
             Hệ thống quản lý nội bộ JUSpa
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
