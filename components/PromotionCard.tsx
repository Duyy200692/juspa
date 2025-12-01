
import React from 'react';
import { PromotionService } from '../types';
import Button from './shared/Button';

interface PromotionCardProps {
  title: string;
  subtitle: string; // "Valid from... to..."
  endDate: string; // Need raw date to calculate expiry
  services: PromotionService[];
  onEdit?: () => void;
  onView?: () => void;
  canEdit?: boolean;
}

const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return '0';
    return new Intl.NumberFormat('vi-VN').format(value);
};

const PromotionCard: React.FC<PromotionCardProps> = ({ title, subtitle, endDate, services, onEdit, onView, canEdit }) => {
  
  // Logic to check expiry
  const getExpiryWarning = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 3) {
          return { isExpiring: true, daysLeft: diffDays };
      }
      return { isExpiring: false, daysLeft: 0 };
  };

  const { isExpiring, daysLeft } = getExpiryWarning();

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden border transition-transform duration-300 relative group flex flex-col h-full ${isExpiring ? 'border-orange-300 ring-1 ring-orange-200' : 'border-pink-100 hover:scale-[1.01]'}`}>
      <div className="p-6 bg-gradient-to-br from-[#FDF7F8] to-white flex justify-between items-start">
        <div>
            <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif text-2xl font-bold text-[#D97A7D]">{title}</h3>
                {isExpiring && (
                    <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full border border-orange-200 animate-pulse">
                        ⚠️ Sắp hết hạn: Còn {daysLeft === 0 ? 'hôm nay' : `${daysLeft} ngày`}
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex gap-2">
            {onView && (
                <Button variant="secondary" onClick={onView} className="text-xs px-3 py-1">
                    Xem chi tiết / Quy trình
                </Button>
            )}
            {canEdit && (
                <Button variant="secondary" onClick={onEdit} className="text-xs px-2 py-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    Edit
                </Button>
            )}
        </div>
      </div>
      <div className="px-6 py-4 flex-grow">
        {/* Header Row - Hidden on mobile */}
        <div className="hidden sm:flex justify-between items-center text-xs font-bold text-gray-500 mb-3 px-4">
          <span className="w-2/5">SERVICE</span>
          <span className="w-1/5 text-right">FULL PRICE</span>
          <span className="w-1/5 text-right">DISCOUNT PRICE</span>
        </div>
        
        <ul className="space-y-4 sm:space-y-2">
          {services.map(service => {
            // Logic change: If fullPrice is 0 (unlikely but safe), avoid NaN
            const discountPercentage = (service.fullPrice || 0) > 0 ? Math.round((((service.fullPrice || 0) - (service.discountPrice || 0)) / (service.fullPrice || 0)) * 100) : 0;
            return (
              <li key={service.id} className="border-t border-dashed border-pink-200 py-3 flex flex-col sm:flex-row sm:items-center px-2 sm:px-4">
                
                {/* Service Name & Desc */}
                <div className="w-full sm:w-2/5 mb-2 sm:mb-0">
                  <p className="font-bold text-sm text-[#5C3A3A] flex items-center">
                      {service.name}
                      {service.isCombo && <span className="ml-2 text-[10px] bg-purple-100 text-purple-600 px-1 rounded shrink-0">COMBO</span>}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1">{service.description}</p>
                </div>

                {/* Prices Container - Flex row on mobile to split space */}
                <div className="flex w-full sm:w-3/5 justify-between sm:justify-end items-center">
                    {/* Full Price */}
                    <div className="w-1/2 sm:w-1/3 text-left sm:text-right">
                        <span className="text-xs text-gray-400 font-medium">Gốc: </span>
                        <span className="text-gray-400 line-through text-sm">{formatCurrency(service.fullPrice)}</span>
                    </div>

                    {/* Discount Price */}
                    <div className="w-1/2 sm:w-1/3 text-right relative flex justify-end items-center">
                       <span className="text-[#E5989B] font-bold text-lg">{formatCurrency(service.discountPrice)}</span>
                       {discountPercentage > 0 && (
                         <span className="ml-2 sm:absolute sm:-top-3 sm:-right-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0">
                             -{discountPercentage}%
                         </span>
                       )}
                    </div>
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
