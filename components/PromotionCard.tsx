import React from 'react';
import { PromotionService } from '../types';

interface PromotionCardProps {
  title: string;
  subtitle: string;
  services: PromotionService[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
};

const PromotionCard: React.FC<PromotionCardProps> = ({ title, subtitle, services }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100 transform hover:scale-[1.01] transition-transform duration-300">
      <div className="p-6 bg-gradient-to-br from-[#FDF7F8] to-white">
        <h3 className="font-serif text-2xl font-bold text-[#D97A7D]">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      <div className="px-6 py-4">
        <div className="flex justify-between items-center text-xs font-bold text-gray-500 mb-3 px-4">
          <span className="w-2/5">SERVICE</span>
          <span className="w-1/5 text-right">FULL PRICE</span>
          <span className="w-1/5 text-right">DISCOUNT</span>
        </div>
        <ul className="space-y-2">
          {services.map(service => {
            const discountPercentage = service.fullPrice > 0 ? Math.round(((service.fullPrice - service.discountPrice) / service.fullPrice) * 100) : 0;
            return (
              <li key={service.id} className="border-t border-dashed border-pink-200 py-3 flex items-center px-4">
                <div className="w-2/5">
                  <p className="font-bold text-sm text-[#5C3A3A]">{service.name}</p>
                  <p className="text-xs text-gray-500">{service.description}</p>
                </div>
                <div className="w-1/5 text-right">
                    <span className="text-gray-400 line-through text-sm">{formatCurrency(service.fullPrice)}</span>
                </div>
                <div className="w-1/5 text-right relative flex justify-end items-center">
                   <span className="text-[#E5989B] font-bold text-lg">{formatCurrency(service.discountPrice)}</span>
                   {discountPercentage > 0 && (
                     <span className="absolute -top-3 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                         -{discountPercentage}%
                     </span>
                   )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PromotionCard;