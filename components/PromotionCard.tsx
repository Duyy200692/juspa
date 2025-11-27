
import React from 'react';
import { PromotionService } from '../types';
import Button from './shared/Button';

interface PromotionCardProps {
  title: string;
  subtitle: string;
  services: PromotionService[];
  onEdit?: () => void;
  canEdit?: boolean;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
};

const PromotionCard: React.FC<PromotionCardProps> = ({ title, subtitle, services, onEdit, canEdit }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100 transform hover:scale-[1.01] transition-transform duration-300 relative group">
      <div className="p-6 bg-gradient-to-br from-[#FDF7F8] to-white flex justify-between items-start">
        <div>
            <h3 className="font-serif text-2xl font-bold text-[#D97A7D]">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        {canEdit && (
            <Button variant="secondary" onClick={onEdit} className="text-xs px-2 py-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                Edit
            </Button>
        )}
      </div>
      <div className="px-6 py-4">
        {/* Header Row - Hidden on mobile */}
        <div className="hidden sm:flex justify-between items-center text-xs font-bold text-gray-500 mb-3 px-4">
          <span className="w-2/5">SERVICE</span>
          <span className="w-1/5 text-right">FULL PRICE</span>
          <span className="w-1/5 text-right">DISCOUNT PRICE</span>
        </div>
        
        <ul className="space-y-4 sm:space-y-2">
          {services.map(service => {
            // Logic change: If fullPrice is 0 (unlikely but safe), avoid NaN
            const discountPercentage = service.fullPrice > 0 ? Math.round(((service.fullPrice - service.discountPrice) / service.fullPrice) * 100) : 0;
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
