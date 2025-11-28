
import React, { useState, useEffect, useMemo } from 'react';
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
  
  // Custom consultation note state
  const [customConsultationNote, setCustomConsultationNote] = useState('');
  const [isManualEditSteps, setIsManualEditSteps] = useState(false);
  
  // State for bulk discount calculation
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState<string>('');
  
  // Error state
  const [error, setError] = useState<string>('');

  const isEditMode = !!promotionToEdit;
  const isEditingActive = isEditMode && promotionToEdit?.status === PromotionStatus.Approved && currentUser.role === Role.Management;

  // Calculate bulk summary
  const bulkSummary = useMemo(() => {
    const selectedItems = selectedServices.filter(s => comboSelectionIds.includes(s.id));
    const totalOriginal = selectedItems.reduce((acc, s) => acc + Number(s.fullPrice), 0);
    const totalDiscounted = selectedItems.reduce((acc, s) => acc + Number(s.discountPrice), 0);
    return { count: selectedItems.length, totalOriginal, totalDiscounted };
  }, [selectedServices, comboSelectionIds]);
  
  // Helper to generate default steps from services
  const generateDefaultSteps = (servicesList: PromotionService[]) => {
    return servicesList
      .filter(s => s.consultationNote)
      .map(s => `• ${s.name}:\n${s.consultationNote}`)
      .join('\n\n');
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (isEditMode && promotionToEdit) {
        setName(promotionToEdit.name);
        setStartDate(promotionToEdit.startDate);
        setEndDate(promotionToEdit.endDate);
        setSelectedServices(promotionToEdit.services);
        setSalesNotes(promotionToEdit.salesNotes || '');
        // Load existing custom note or generate
        setCustomConsultationNote(promotionToEdit.consultationNote || generateDefaultSteps(promotionToEdit.services));
        setIsManualEditSteps(!!promotionToEdit.consultationNote);
      } else {
        // Reset form for create mode
        setName('');
        setStartDate('');
        setEndDate('');
        setSelectedServices([]);
        setSalesNotes('');
        setCustomConsultationNote('');
        setIsManualEditSteps(false);
      }
      setComboSelectionIds([]); // Always reset combo selection on open
      setBulkDiscountPercent('');
    }
  }, [promotionToEdit, isOpen, isEditMode]);

  // Auto-update steps when services change (unless manually edited)
  useEffect(() => {
    if (!isManualEditSteps && !isEditMode) {
        setCustomConsultationNote(generateDefaultSteps(selectedServices));
    }
  }, [selectedServices, isManualEditSteps, isEditMode]);

  const handleServiceToggle = (service: Service) => {
    const isSelected = selectedServices.some(s => s.id === service.id && !s.isCombo);
    if (isSelected) {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    } else {
      // Use priceOriginal as the base fullPrice for the promotion
      // Ensure prices are numbers to avoid undefined errors
      setSelectedServices(prev => [...prev, { 
          ...service, 
          fullPrice: Number(service.priceOriginal) || 0, 
          discountPrice: Number(service.priceOriginal) || 0 
      }]);
    }
  };

  const handleSelectedServiceChange = (id: string, field: keyof PromotionService, value: string | number) => {
      setSelectedServices(prev => prev.map(s => 
          s.id === id ? { ...s, [field]: value } : s
      ));
  };

  // Helper to handle percentage change for a single row
  const handlePercentChange = (id: string, fullPrice: number, percentStr: string) => {
      const percent = parseFloat(percentStr);
      if (!isNaN(percent) && fullPrice > 0) {
          const discountAmt = fullPrice * (percent / 100);
          const newPrice = Math.round((fullPrice - discountAmt) / 1000) * 1000; // Round to nearest 1000
          handleSelectedServiceChange(id, 'discountPrice', newPrice);
      } else if (percentStr === '') {
          // If empty, reset to full price optional, currently does nothing to keep flexibility
      }
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
        type: 'single',
        priceOriginal: 0,
        pricePromo: 0,
        pricePackage5: 0,
        pricePackage15: 0,
        pricePackage2: 0,
        pricePackage5Sessions: 0,
        pricePackage10: 0,
        pricePackage20: 0,
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

  const handleSelectAll = () => {
    if (comboSelectionIds.length === selectedServices.length) {
        setComboSelectionIds([]); // Deselect all
    } else {
        setComboSelectionIds(selectedServices.map(s => s.id)); // Select all
    }
  };

  const handleCreateCombo = () => {
    if (comboSelectionIds.length < 2) return;

    const servicesToCombine = selectedServices.filter(s => comboSelectionIds.includes(s.id));
    const remainingServices = selectedServices.filter(s => !comboSelectionIds.includes(s.id));

    const comboName = `Gói Combo Mới`;
    const comboDescription = `Bao gồm: ${servicesToCombine.map(s => s.name).join(', ')}.`;
    const comboFullPrice = servicesToCombine.reduce((total, s) => total + Number(s.fullPrice), 0);
    
    // Combine consultation notes
    const comboNotes = servicesToCombine
        .map(s => s.consultationNote ? `${s.name}: ${s.consultationNote}` : '')
        .filter(Boolean)
        .join('\n');

    const newCombo: PromotionService = {
        id: `combo-${Date.now()}`,
        name: comboName,
        description: comboDescription,
        type: 'combo',
        consultationNote: comboNotes,
        priceOriginal: comboFullPrice,
        pricePromo: 0,
        pricePackage5: 0,
        pricePackage15: 0,
        pricePackage2: 0,
        pricePackage5Sessions: 0,
        pricePackage10: 0,
        pricePackage20: 0,
        fullPrice: comboFullPrice,
        discountPrice: comboFullPrice,
        isCombo: true,
    };

    setSelectedServices([...remainingServices, newCombo]);
    setComboSelectionIds([]);
  };

  const handleApplyBulkDiscount = () => {
      if (comboSelectionIds.length === 0) {
          alert("Vui lòng chọn ít nhất 1 dịch vụ bên dưới để áp dụng giảm giá.");
          return;
      }
      
      const percent = parseFloat(bulkDiscountPercent);
      if (isNaN(percent) || percent < 0 || percent > 100) {
          alert("Vui lòng nhập số phần trăm hợp lệ (0-100)");
          return;
      }

      setSelectedServices(prev => prev.map(s => {
          if (comboSelectionIds.includes(s.id)) {
              // Calculate discount
              const discountAmount = s.fullPrice * (percent / 100);
              // Round to nearest 1000 for cleaner prices
              const newPrice = Math.round((s.fullPrice - discountAmount) / 1000) * 1000;
              return { ...s, discountPrice: newPrice };
          }
          return s;
      }));
      
      // Reset input
      setBulkDiscountPercent('');
  };

  const handleApplyPriceType = (type: 'promo' | 'package5' | 'package15') => {
      if (comboSelectionIds.length === 0) {
          alert("Vui lòng chọn ít nhất 1 dịch vụ để áp dụng giá.");
          return;
      }

      setSelectedServices(prev => prev.map(s => {
          if (comboSelectionIds.includes(s.id)) {
              let newPrice = 0;
              if (type === 'promo') newPrice = Number(s.pricePromo);
              if (type === 'package5') newPrice = Number(s.pricePackage5);
              if (type === 'package15') newPrice = Number(s.pricePackage15);

              // Only apply if the price is valid (> 0)
              if (newPrice > 0) {
                  return { ...s, discountPrice: newPrice };
              }
          }
          return s;
      }));
  };

  const handleResetConsultationSteps = () => {
      const defaultSteps = generateDefaultSteps(selectedServices);
      setCustomConsultationNote(defaultSteps);
      setIsManualEditSteps(false);
  };

  const handleSubmit = () => {
    // Basic validation
    if (!name || !startDate || !endDate || selectedServices.length === 0) {
      setError("Vui lòng điền tên, ngày và chọn ít nhất một dịch vụ.");
      return;
    }

    const finalServices = selectedServices.map(({ ...service }) => {
        service.fullPrice = Number(service.fullPrice) || 0;
        service.discountPrice = Number(service.discountPrice) || 0;
        return service;
    });

    const commonData = {
        name,
        startDate,
        endDate,
        services: finalServices,
        salesNotes,
        consultationNote: customConsultationNote, // Save the edited steps
    };

    if (isEditMode) {
      const updatedProposal: Promotion = {
        ...promotionToEdit,
        ...commonData,
      };
      onSubmit(updatedProposal);
    } else {
      const newProposal: Omit<Promotion, 'id'> = {
        ...commonData,
        status: PromotionStatus.PendingDesign,
        proposerId: currentUser.id,
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
                            <label htmlFor={`service-${service.id}`} className="ml-2 text-sm text-gray-600">
                                {service.name} <span className="text-xs text-gray-400">({service.type === 'combo' ? 'Combo' : 'Lẻ'})</span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-md font-medium text-gray-800 mb-2">2. Tùy chỉnh chương trình</h3>
                
                {/* Bulk Actions Toolbar */}
                <div className="bg-pink-50 p-4 rounded-lg border border-[#E5989B] mb-4 flex flex-col gap-3 shadow-sm">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-[#D97A7D] flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            Công cụ tính giá & Combo
                        </span>
                        <button onClick={handleSelectAll} className="text-xs underline text-gray-500 hover:text-[#D97A7D]">
                            {comboSelectionIds.length === selectedServices.length && selectedServices.length > 0 ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                         {/* Discount Input */}
                         <div className="flex-1 w-full">
                            <label className="text-xs text-gray-500 block mb-1">
                                Giảm nhanh theo %
                            </label>
                            <div className="flex">
                                <input 
                                    type="number" 
                                    placeholder="VD: 10" 
                                    value={bulkDiscountPercent}
                                    onChange={(e) => setBulkDiscountPercent(e.target.value)}
                                    className="w-full border border-gray-300 rounded-l-md p-2 text-sm focus:ring-[#D97A7D] focus:border-[#D97A7D] bg-white"
                                />
                                <button 
                                    onClick={handleApplyBulkDiscount}
                                    className="bg-[#E5989B] text-white px-4 rounded-r-md text-sm font-medium hover:bg-[#D97A7D] disabled:opacity-50 whitespace-nowrap shadow-sm"
                                    disabled={comboSelectionIds.length === 0}
                                >
                                    Áp dụng
                                </button>
                            </div>
                         </div>
                         
                         {/* Combo Button */}
                         <div className="w-full sm:w-auto">
                            <label className="text-xs text-gray-500 block mb-1 opacity-0 hidden sm:block">Action</label>
                            <button 
                                onClick={handleCreateCombo}
                                disabled={comboSelectionIds.length < 2}
                                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                Gom thành Combo
                            </button>
                         </div>
                    </div>

                    {/* NEW: Recurring Price Buttons */}
                    <div className="border-t border-pink-200 pt-2 mt-1">
                        <label className="text-xs text-gray-500 block mb-2">Áp dụng giá từ Bảng giá (Chương trình định kỳ):</label>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => handleApplyPriceType('promo')}
                                disabled={comboSelectionIds.length === 0}
                                className="px-3 py-1.5 bg-white border border-[#E5989B] text-[#D97A7D] text-xs rounded hover:bg-pink-100 disabled:opacity-50 transition-colors"
                            >
                                Áp dụng Giá KM/Trial
                            </button>
                            <button 
                                onClick={() => handleApplyPriceType('package5')}
                                disabled={comboSelectionIds.length === 0}
                                className="px-3 py-1.5 bg-white border border-[#E5989B] text-[#D97A7D] text-xs rounded hover:bg-pink-100 disabled:opacity-50 transition-colors"
                            >
                                Áp dụng Giá Gói 5
                            </button>
                            <button 
                                onClick={() => handleApplyPriceType('package15')}
                                disabled={comboSelectionIds.length === 0}
                                className="px-3 py-1.5 bg-white border border-[#E5989B] text-[#D97A7D] text-xs rounded hover:bg-pink-100 disabled:opacity-50 transition-colors"
                            >
                                Áp dụng Giá Gói 15
                            </button>
                        </div>
                    </div>
                    
                    {/* Bulk Summary Info */}
                    {bulkSummary.count > 0 && (
                        <div className="text-xs text-gray-600 bg-white p-2 rounded border border-pink-100 flex gap-4 mt-2">
                            <span>Đã chọn: <b className="text-[#D97A7D]">{bulkSummary.count}</b></span>
                            <span>Tổng gốc: <b>{formatCurrency(bulkSummary.totalOriginal)}</b></span>
                            <span>&rarr;</span>
                            <span>Sau giảm: <b className="text-[#D97A7D]">{formatCurrency(bulkSummary.totalDiscounted)}</b></span>
                        </div>
                    )}

                    {comboSelectionIds.length === 0 && selectedServices.length > 0 && (
                        <p className="text-[10px] text-red-500 italic font-medium">* Vui lòng tick chọn vào các ô vuông ở góc mỗi dịch vụ bên dưới để sử dụng công cụ này.</p>
                    )}
                </div>

                <div className="mt-2 space-y-3">
                    {selectedServices.map(service => {
                        const calculatedPercent = service.fullPrice > 0 
                            ? Math.round(((service.fullPrice - service.discountPrice) / service.fullPrice) * 100) 
                            : 0;

                        return (
                        <div key={service.id} className={`bg-gray-50 p-4 pt-8 border rounded-lg relative transition-colors ${comboSelectionIds.includes(service.id) ? 'border-pink-300 bg-pink-50/50' : ''}`}>
                             {!service.isCombo && (
                                <input
                                    type="checkbox"
                                    checked={comboSelectionIds.includes(service.id)}
                                    onChange={() => handleComboSelectionToggle(service.id)}
                                    className="absolute top-2 left-2 h-5 w-5 rounded border-gray-400 text-[#E5989B] focus:ring-[#D97A7D] cursor-pointer"
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
                                    <label className="text-xs font-medium text-gray-500">Giá gốc (niêm yết)</label>
                                    <input type="number" value={service.fullPrice} onChange={e => handleSelectedServiceChange(service.id, 'fullPrice', e.target.value)} className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm p-1.5 disabled:bg-gray-200" disabled={!service.id.startsWith('custom-') && !service.isCombo} />
                                </div>
                                
                                {/* Discount Pricing Row with % Calculation */}
                                <div className="flex gap-2">
                                    <div className="w-1/3 relative">
                                        <label className="text-xs font-medium text-gray-500">% Giảm</label>
                                        <input 
                                            type="number" 
                                            placeholder="0"
                                            value={calculatedPercent}
                                            onChange={(e) => handlePercentChange(service.id, service.fullPrice, e.target.value)}
                                            className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm p-1.5 pl-2 pr-6 text-center focus:ring-[#E5989B] focus:border-[#E5989B] text-gray-500"
                                        />
                                        <span className="absolute right-2 top-7 text-xs text-gray-500 pointer-events-none font-bold">%</span>
                                    </div>
                                    <div className="w-2/3">
                                        <label className="text-xs font-medium text-gray-500">Giá khuyến mãi</label>
                                        <input 
                                            type="number" 
                                            value={service.discountPrice} 
                                            onChange={e => handleSelectedServiceChange(service.id, 'discountPrice', e.target.value)} 
                                            className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm p-1.5 bg-pink-50 font-bold text-[#D97A7D]" 
                                        />
                                    </div>
                                </div>
                             </div>
                        </div>
                    )})}
                     {selectedServices.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Chưa có dịch vụ nào được chọn. Hãy chọn một dịch vụ có sẵn hoặc thêm dịch vụ tùy chỉnh.</p>}
                </div>
                
                 <Button variant="secondary" onClick={handleAddCustomService} className="mt-3 w-full text-center" type="button">
                    + Thêm dịch vụ tùy chỉnh
                </Button>
            </div>
        </div>
        
        {/* NEW: Editable Consultation Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold text-blue-800">Quy trình thực hiện (Sale Note)</label>
                <button 
                    type="button"
                    onClick={handleResetConsultationSteps} 
                    className="text-[10px] bg-white border border-blue-200 px-2 py-1 rounded text-blue-600 hover:bg-blue-100"
                    title="Khôi phục lại quy trình chuẩn từ các dịch vụ đã chọn"
                >
                    🔄 Lấy lại nội dung gốc
                </button>
            </div>
            
            <textarea 
                value={customConsultationNote}
                onChange={(e) => {
                    setCustomConsultationNote(e.target.value);
                    setIsManualEditSteps(true);
                }}
                rows={5}
                className="w-full text-xs text-blue-800 whitespace-pre-wrap bg-white p-2 rounded border border-blue-200 focus:ring-blue-300 focus:border-blue-300"
                placeholder="Quy trình thực hiện sẽ tự động hiện ở đây. Bạn có thể chỉnh sửa lại cho phù hợp..."
            />
            <p className="text-[10px] text-blue-400 mt-1 italic">Sale có thể chỉnh sửa các bước thực hiện tại đây. Thông tin này sẽ được Lễ tân và Marketing sử dụng.</p>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Ghi chú cho Marketing</label>
            <textarea value={salesNotes} onChange={e => setSalesNotes(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="VD: Tone màu chủ đạo, thông điệp chính..."></textarea>
        </div>
        
        {/* Error Message Display */}
        {error && (
            <div className="bg-red-50 text-red-600 p-2 rounded text-sm text-center border border-red-200">
                {error}
            </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="secondary" onClick={onClose} className="mr-2" type="button">Hủy bỏ</Button>
          <Button onClick={handleSubmit} type="button">{submitButtonText}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProposalForm;
