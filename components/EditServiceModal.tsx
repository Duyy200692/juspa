
import React, { useState, useEffect } from 'react';
import Modal from './shared/Modal';
import Button from './shared/Button';
import { Service } from '../types';

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onUpdateService: (updatedService: Service) => void;
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({ isOpen, onClose, service, onUpdateService }) => {
  const [formData, setFormData] = useState<Partial<Service>>({});

  useEffect(() => {
    if (service) {
      setFormData(service);
    }
  }, [service]);

  if (!service) return null;

  const handleChange = (field: keyof Service, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdateService(formData as Service);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chỉnh sửa: ${service.name}`}>
      <div className="space-y-4">
        {/* Name & Category */}
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Tên Dịch vụ</label>
              <input type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Danh mục (Category)</label>
              <input 
                type="text" 
                list="edit-categories-list"
                value={formData.category || ''} 
                onChange={e => handleChange('category', e.target.value)} 
                className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" 
                placeholder="VD: RF, Triệt lông..."
              />
              {/* Note: This datalist is static here, but in a real app could be passed down as prop */}
              <datalist id="edit-categories-list">
                  <option value="Công nghệ RF" />
                  <option value="Hydrafacial" />
                  <option value="GeneoX Pro" />
                  <option value="Triệt Lông" />
                  <option value="Chăm sóc da" />
                  <option value="Thư giãn" />
                  <option value="Combo Đặc Biệt" />
              </datalist>
            </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Mô tả</label>
          <textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" rows={2}></textarea>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Quy trình (Note tư vấn)</label>
          <textarea value={formData.consultationNote || ''} onChange={e => handleChange('consultationNote', e.target.value)} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" rows={3}></textarea>
        </div>
        
        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
                <label className="text-sm font-medium text-gray-600">Giá bán gốc</label>
                <input type="number" value={formData.priceOriginal || 0} onChange={e => handleChange('priceOriginal', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-600">Giá KM/Trial</label>
                <input type="number" value={formData.pricePromo || 0} onChange={e => handleChange('pricePromo', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-600">Giảm 5 Tặng 5</label>
                <input type="number" value={formData.pricePackage5 || 0} onChange={e => handleChange('pricePackage5', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-600">10 Tặng 15</label>
                <input type="number" value={formData.pricePackage15 || 0} onChange={e => handleChange('pricePackage15', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" />
            </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4">
            <Button variant="secondary" onClick={onClose} className="mr-2">Hủy</Button>
            <Button onClick={handleSave}>Lưu thay đổi</Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditServiceModal;
