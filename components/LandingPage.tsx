
import React from 'react';
import Button from './shared/Button';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-[#FEFBFB] flex flex-col font-sans text-[#5C3A3A]">
      {/* Navigation / Header */}
      <nav className="w-full py-6 px-8 flex justify-between items-center bg-white/80 backdrop-blur-md fixed top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#E5989B]">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2C14 4 15 7 14 9C13 11 11 12 10 11C9 10 8.5 7.5 9.5 5.5C10.5 3.5 12 2 12 2Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="font-serif font-bold text-2xl tracking-wider text-[#E5989B]">JUSpa</span>
        </div>
        <Button onClick={onEnter} className="hidden md:block">Đăng nhập ngay</Button>
      </nav>

      {/* Hero Section */}
      <div className="flex-grow flex items-center justify-center relative mt-16">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
             <img 
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop" 
                alt="Spa Background" 
                className="w-full h-full object-cover opacity-90"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 max-w-xl">
                <span className="inline-block py-1 px-3 rounded-full bg-pink-100 text-[#D97A7D] text-sm font-bold tracking-wider uppercase mb-2">
                    Internal Management System
                </span>
                <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight text-[#5C3A3A]">
                    Quản lý Vận hành <br/> 
                    <span className="text-[#E5989B]">Hiệu quả & Tinh tế</span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                    Hệ thống quản lý nội bộ dành riêng cho đội ngũ JUSpa. Tối ưu hóa quy trình từ đề xuất khuyến mãi, quản lý dịch vụ đến phê duyệt, giúp bạn tập trung vào điều quan trọng nhất: Chăm sóc khách hàng.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button onClick={onEnter} className="px-8 py-4 text-lg shadow-xl hover:translate-y-[-2px] transition-transform">
                        Truy cập Hệ thống
                    </Button>
                    <button onClick={onEnter} className="px-8 py-4 text-lg font-medium text-[#5C3A3A] hover:text-[#E5989B] transition-colors flex items-center gap-2">
                        Tìm hiểu thêm <span>&rarr;</span>
                    </button>
                </div>
            </div>
            
            {/* Decorative Image/Element (Hidden on mobile) */}
            <div className="hidden md:block relative">
                 <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <img 
                        src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop" 
                        alt="Spa Treatment" 
                        className="w-full h-auto object-cover"
                    />
                 </div>
                 {/* Floating Card */}
                 <div className="absolute -bottom-10 -left-10 bg-white p-4 rounded-xl shadow-xl border border-pink-50 max-w-xs animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">Đề xuất mới</p>
                            <p className="text-xs text-gray-500">Flash Sale T12 đã được duyệt</p>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-6 border-t border-gray-100 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} JUSpa Internal System. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
