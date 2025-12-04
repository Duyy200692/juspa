import React from 'react';
import { PromotionService } from '../types';
import Button from './shared/Button';

interface PromotionCardProps {
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  services: PromotionService[];
  onEdit?: () => void;
  onView?: () => void;
  // NEW: Add onDelete prop
  onDelete?: () => void;
  canEdit?: boolean;
}

const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return '0';
    return new Intl.NumberFormat('vi-VN').format(value);
};

const PromotionCard: React.FC<PromotionCardProps> = ({ title, subtitle, startDate, endDate, services, onEdit, onView, onDelete, canEdit }) => {
  
  const getTimeStatus = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      
      if (start > today) {
          const diffTime = start.getTime() - today.getTime();
          const daysToStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return { label: `📅 Sắp chạy (còn ${daysToStart} ngày)`, colorClass: 'bg-blue-100 text-blue-700 border-blue-200', borderColor: 'border-blue-200 ring-1 ring-blue-100' };
      }
      const diffTime = end.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysLeft >= 0 && daysLeft <= 3) {
          return { label: `⚠️ Sắp hết hạn: Còn ${daysLeft === 0 ? 'hôm nay' : `${daysLeft} ngày`}`, colorClass: 'bg-orange-100 text-orange-700 border-orange-200 animate-pulse', borderColor: 'border-orange-300 ring-1 ring-orange-200' };
      }
      return { label: '🔥 Đang chạy', colorClass: 'bg-green-100 text-green-700 border-green-200', borderColor: 'border-pink-100 hover:scale-[1.01]' };
  };

  const statusInfo = getTimeStatus();

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden border transition-transform duration-300 relative group flex flex-col h-full ${statusInfo.borderColor}`}>
      <div className="p-6 bg-gradient-to-br from-[#FDF7F8] to-white flex justify-between items-start">
        <div>
            <div className="flex flex-col gap-2 items-start">
                <h3 className="font-serif text-2xl font-bold text-[#D97A7D] leading-tight">{title}</h3>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusInfo.colorClass}`}>
                    {statusInfo.label}
                </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
        </div>
        <div className="flex gap-1 flex-col sm:flex-row items-end sm:items-start">
            {onView && (
                <Button variant="secondary" onClick={onView} className="text-xs px-3 py-1 whitespace-nowrap">
                    Xem chi tiết
                </Button>
            )}
            <div className="flex gap-1">
                {canEdit && (
                    <Button variant="secondary" onClick={onEdit} className="text-xs px-2 py-1">
                        Edit
                    </Button>
                )}
                {/* NEW: Render Delete Button if onDelete is provided */}
                {onDelete && (
                    <Button variant="danger" onClick={onDelete} className="text-xs px-2 py-1">
                        Xóa
                    </Button>
                )}
            </div>
        </div>
      </div>
      <div className="px-6 py-4 flex-grow">
        <div className="hidden sm:flex justify-between items-center text-xs font-bold text-gray-500 mb-3 px-4">
          <span className="w-2/5">SERVICE</span>
          <span className="w-1/5 text-right">FULL PRICE</span>
          <span className="w-1/5 text-right">DISCOUNT PRICE</span>
        </div>
        <ul className="space-y-4 sm:space-y-2">
          {services.map(service => {
            const discountPercentage = (service.fullPrice || 0) > 0 ? Math.round((((service.fullPrice || 0) - (service.discountPrice || 0)) / (service.fullPrice || 0)) * 100) : 0;
            return (
              <li key={service.id} className="border-t border-dashed border-pink-200 py-3 flex flex-col sm:flex-row sm:items-center px-2 sm:px-4">
                <div className="w-full sm:w-2/5 mb-2 sm:mb-0">
                  <p className="font-bold text-sm text-[#5C3A3A] flex items-center">
                      {service.name}
                      {service.isCombo && <span className="ml-2 text-[10px] bg-purple-100 text-purple-600 px-1 rounded shrink-0">COMBO</span>}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1">{service.description}</p>
                </div>
                <div className="flex w-full sm:w-3/5 justify-between sm:justify-end items-center">
                    <div className="w-1/2 sm:w-1/3 text-left sm:text-right">
                        <span className="text-xs text-gray-400 font-medium">Gốc: </span>
                        <span className="text-gray-400 line-through text-sm">{formatCurrency(service.fullPrice)}</span>
                    </div>
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