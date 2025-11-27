
import React, { useState, useEffect } from 'react';
import Modal from './shared/Modal';
import Button from './shared/Button';
import { Service, Promotion, PromotionService, PromotionStatus, User, Role } from '../types';

interface ProposalFormProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  currentUser: User;
  onSubmit: (promotion: Omit<Promotion, 'id'> | Promotion) => void;
  promotionToEdit?: Promotion | null;
}

const ProposalForm: React.FC<ProposalFormProps> = ({ isOpen, onClose, services, currentUser, onSubmit, promotionToEdit }) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedServices, setSelectedServices] = useState<PromotionService[]>([]);
  const [salesNotes, setSalesNotes] = useState('');
  const [comboSelectionIds, setComboSelectionIds] = useState<string[]>([]);

  const isEditMode = !!promotionToEdit;
  const isEditingActive = isEditMode && promotionToEdit?.status === PromotionStatus.Approved && currentUser.role === Role.Management;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && promotionToEdit) {
        setName(promotionToEdit.name);
        setStartDate(promotionToEdit.startDate);
        setEndDate(promotionToEdit.endDate);
        setSelectedServices(promotionToEdit.services);
        setSalesNotes(promotionToEdit.salesNotes || '');
      } else {
        // Reset form for create mode
        setName('');
        setStartDate('');
        setEndDate('');
        setSelectedServices([]);
        setSalesNotes('');
      }
      setComboSelectionIds([]); // Always reset combo selection on open
    }
  }, [promotionToEdit, isOpen, isEditMode]);

  const handleServiceToggle = (service: Service) => {
    const isSelected = selectedServices.some(s => s.id === service.id && !s.isCombo);
    if (isSelected) {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    } else {
      setSelectedServices(prev => [...prev, { ...service, fullPrice: service.pricePerSession, discountPrice: service.pricePerSession }]);
    }
  };

  const handleSelectedServiceChange = (id: string, field: keyof PromotionService, value: string | number) => {
      setSelectedServices(prev => prev.map(s => 
          s.id === id ? { ...s, [field]: value } : s
      ));
  };
  
  const handleRemoveSelectedService = (id: string) => {
      setSelectedServices(prev => prev.filter(s => s.id !== id));
      setComboSelectionIds(prev => prev.filter(comboId => comboId !== id));
  };

  const handleAddCustomService = () => {
    const newCustomService: PromotionService = {
        id: `custom-${Date.now()}`,
        name: 'Dịch vụ tùy chỉnh mới',
        description: 'Mô tả ngắn cho dịch vụ.',
        pricePerSession: 0,
        priceFullPackage: 0,
        fullPrice: 0,
        discountPrice: 0,
    };
    setSelectedServices(prev => [...prev, newCustomService]);
  };

  const handleComboSelectionToggle = (serviceId: string) => {
    setComboSelectionIds(prev =>
        prev.includes(serviceId)
            ? prev.filter(id => id !== serviceId)
            : [...prev, serviceId]
    );
  };

  const handleCreateCombo = () => {
    if (comboSelectionIds.length < 2) return;

    const servicesToCombine = selectedServices.filter(s => comboSelectionIds.includes(s.id));
    const remainingServices = selectedServices.filter(s => !comboSelectionIds.includes(s.id));

    const comboName = `Gói Combo Mới`;
    const comboDescription = `Bao gồm: ${servicesToCombine.map(s => s.name).join(', ')}.`;
    const comboFullPrice = servicesToCombine.reduce((total, s) => total + Number(s.fullPrice), 0);

    const newCombo: PromotionService = {
        id: `combo-${Date.now()}`,
        name: comboName,
        description: comboDescription,
        pricePerSession: 0,
        priceFullPackage: 0,
        fullPrice: comboFullPrice,
        discountPrice: comboFullPrice,
        isCombo: true,
    };

    setSelectedServices([...remainingServices, newCombo]);
    setComboSelectionIds([]);
  };

  const handleSubmit = () => {
    if (!name || !startDate || !endDate || selectedServices.length === 0) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc và chọn ít nhất một dịch vụ.");
      return;
    }

    const finalServices = selectedServices.map(({ ...service }) => {
        // Ensure prices are numbers
        service.fullPrice = Number(service.fullPrice) || 0;
        service.discountPrice = Number(service.discountPrice) || 0;
        service.pricePerSession = Number(service.pricePerSession) || 0;
        service.priceFullPackage = Number(service.priceFullPackage) || 0;
        return service;
    });

    if (isEditMode) {
      const updatedProposal: Promotion = {
        ...promotionToEdit,
        name,
        startDate,
        endDate,
        services: finalServices,
        salesNotes,
      };
      onSubmit(updatedProposal);
    } else {
      const newProposal: Omit<Promotion, 'id'> = {
        name,
        startDate,
        endDate,
        services: finalServices,
        status: PromotionStatus.PendingDesign,
        proposerId: currentUser.id,
        salesNotes,
      };
      onSubmit(newProposal);
    }
  };

  const formTitle = isEditingActive 
    ? "Chỉnh sửa Chương trình Đang chạy" 
    : isEditMode 
        ? "Chỉnh sửa Đề xuất" 
        : "Tạo Đề xuất Khuyến mãi";

  const submitButtonText = isEditingActive
    ? "Lưu thay đổi"
    : isEditMode
        ? "Cập nhật Đề xuất"
        : "Gửi đi Thiết kế";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formTitle}>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên chương trình</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="VD: Flash Sale Tháng 12"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
        </div>
        
        {/* Services Selection & Customization */}
        <div className="space-y-4">
            <div>
                <h3 className="text-md font-medium text-gray-800">1. Chọn dịch vụ có sẵn</h3>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 border rounded-md max-h-40 overflow-y-auto">
                    {services.map(service => (
                        <div key={service.id} className="flex items-center">
                            <input type="checkbox" id={`service-${service.id}`} checked={selectedServices.some(s => s.id === service.id && !s.isCombo)} onChange={() => handleServiceToggle(service)} className="h-4 w-4 rounded border-gray-300 text-[#E5989B] focus:ring-[#D97A7D]" />
                            <label htmlFor={`service-${service.id}`} className="ml-2 text-sm text-gray-600">{service.name}</label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-md font-medium text-gray-800">2. Tùy chỉnh chương trình</h3>
                <div className="mt-2 space-y-3">
                    {selectedServices.map(service => (
                        <div key={service.id} className="bg-gray-50 p-4 pt-8 border rounded-lg relative">
                             {!service.isCombo && (
                                <input
                                    type="checkbox"
                                    checked={comboSelectionIds.includes(service.id)}
                                    onChange={() => handleComboSelectionToggle(service.id)}
                                    className="absolute top-2 left-2 h-5 w-5 rounded border-gray-400 text-[#E5989B] focus:ring-[#D97A7D]"
                                    aria-label={`Select ${service.name} for combo`}
                                />
                             )}
                             <button onClick={() => handleRemoveSelectedService(service.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                             </button>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                <div className="md:col-span-2">
                                    <label className="text-xs font-medium text-gray-500">
                                        Tên dịch vụ / Combo 
                                        {service.isCombo && <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-1 rounded">GÓI COMBO</span>}
                                    </label>
                                    <input type="text" value={service.name} onChange={e => handleSelectedServiceChange(service.id, 'name', e.target.value)} className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm p-1.5" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-medium text-gray-500">Mô tả</label>
                                    <textarea value={service.description} onChange={e => handleSelectedServiceChange(service.id, 'description', e.target.value)} rows={2} className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm p-1.5"></textarea>
                                </div>
                                 <div>
                                    <label className="text-xs font-medium text-gray-500">Giá gốc</label>
                                    <input type="number" value={service.fullPrice} onChange={e => handleSelectedServiceChange(service.id, 'fullPrice', e.target.value)} className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm p-1.5 disabled:bg-gray-200" disabled={!service.id.startsWith('custom-') && !service.isCombo} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Giá khuyến mãi</label>
                                    <input type="number" value={service.discountPrice} onChange={e => handleSelectedServiceChange(service.id, 'discountPrice', e.target.value)} className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm p-1.5 bg-pink-50" />
                                </div>
                             </div>
                        </div>
                    ))}
                     {selectedServices.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Chưa có dịch vụ nào được chọn. Hãy chọn một dịch vụ có sẵn hoặc thêm dịch vụ tùy chỉnh.</p>}
                </div>

                {comboSelectionIds.length >= 2 && (
                    <div className="my-3">
                        <Button onClick={handleCreateCombo} className="w-full bg-purple-500 hover:bg-purple-600 text-white border-none">
                            + Gom thành Combo ({comboSelectionIds.length} dịch vụ đã chọn)
                        </Button>
                    </div>
                )}
                 <Button variant="secondary" onClick={handleAddCustomService} className="mt-3 w-full text-center">
                    + Thêm dịch vụ tùy chỉnh
                </Button>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Ghi chú cho Marketing</label>
            <textarea value={salesNotes} onChange={e => setSalesNotes(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="VD: Tone màu chủ đạo, thông điệp chính..."></textarea>
        </div>
        <div className="flex justify-end pt-4 border-t">
          <Button variant="secondary" onClick={onClose} className="mr-2">Hủy bỏ</Button>
          <Button onClick={handleSubmit}>{submitButtonText}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProposalForm;
