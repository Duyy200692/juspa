
import React, { useState } from 'react';
import { Service, ServiceType } from '../types';
import Button from './shared/Button';

interface ServiceManagementProps {
    services: Service[];
    onAddService: (service: Omit<Service, 'id'>) => void;
    onUpdateService: (service: Service) => void;
    onDeleteService: (serviceId: string) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
};

const ServiceManagement: React.FC<ServiceManagementProps> = ({ services, onAddService, onUpdateService, onDeleteService }) => {
    const [activeTab, setActiveTab] = useState<ServiceType>('single');
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [editedService, setEditedService] = useState<Partial<Service>>({});
    
    const [newService, setNewService] = useState<Omit<Service, 'id'>>({
        name: '',
        description: '',
        type: 'single',
        consultationNote: '',
        priceOriginal: 0,
        pricePromo: 0,
        pricePackage5: 0,
        pricePackage15: 0,
    });

    // Filter services based on active tab
    const displayedServices = services.filter(s => s.type === activeTab);

    const handleEditClick = (service: Service) => {
        setEditingServiceId(service.id);
        setEditedService(service);
    };

    const handleCancelEdit = () => {
        setEditingServiceId(null);
        setEditedService({});
    };

    const handleSaveEdit = () => {
        if (editingServiceId && editedService) {
            onUpdateService(editedService as Service);
            handleCancelEdit();
        }
    };

    const handleInputChange = (field: keyof Service, value: string | number) => {
        setEditedService(prev => ({ ...prev, [field]: value }));
    };
    
    const handleNewServiceChange = (field: keyof Omit<Service, 'id'>, value: string | number) => {
        setNewService(prev => ({ ...prev, [field]: value }));
    };

    const handleAddNewService = (e: React.FormEvent) => {
        e.preventDefault();
        if (newService.name && newService.priceOriginal > 0) {
            onAddService({ ...newService, type: activeTab }); // Ensure type matches current tab
            setNewService({ 
                name: '', 
                description: '', 
                type: activeTab,
                consultationNote: '',
                priceOriginal: 0, 
                pricePromo: 0,
                pricePackage5: 0,
                pricePackage15: 0
            });
        } else {
            alert("Vui lòng nhập tên và giá gốc.");
        }
    };

    const TabButton = ({ type, label }: { type: ServiceType; label: string }) => (
        <button
            onClick={() => { setActiveTab(type); setNewService(prev => ({...prev, type: type})); }}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === type 
                ? 'border-[#E5989B] text-[#D97A7D]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-serif font-bold text-[#D97A7D] mb-4">Service & Pricelist Management</h2>
                
                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <TabButton type="single" label="Gói Lẻ (Single)" />
                    <TabButton type="combo" label="Gói Combo" />
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full whitespace-nowrap">
                            <thead className="bg-[#FDF7F8]">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-[#FDF7F8] z-10">Tên Dịch vụ</th>
                                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Giá bán gốc</th>
                                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Giá KM/Trial</th>
                                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Giảm 5 Tặng 5</th>
                                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">10 Tặng 15</th>
                                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displayedServices.map(service => (
                                    <tr key={service.id}>
                                        {editingServiceId === service.id ? (
                                            <>
                                                <td className="py-4 px-4 sticky left-0 bg-white z-10 shadow-sm md:shadow-none min-w-[200px]">
                                                    <input type="text" value={editedService.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-1 text-sm" />
                                                    <textarea value={editedService.description} onChange={e => handleInputChange('description', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-1 mt-1 text-xs" rows={2} placeholder="Mô tả"></textarea>
                                                    <textarea value={editedService.consultationNote} onChange={e => handleInputChange('consultationNote', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-1 mt-1 text-xs" rows={2} placeholder="Quy trình thực hiện..."></textarea>
                                                </td>
                                                <td className="py-4 px-4"><input type="number" value={editedService.priceOriginal} onChange={e => handleInputChange('priceOriginal', Number(e.target.value))} className="w-24 text-right border-gray-300 rounded-md shadow-sm p-1 text-sm" /></td>
                                                <td className="py-4 px-4"><input type="number" value={editedService.pricePromo} onChange={e => handleInputChange('pricePromo', Number(e.target.value))} className="w-24 text-right border-gray-300 rounded-md shadow-sm p-1 text-sm" /></td>
                                                <td className="py-4 px-4"><input type="number" value={editedService.pricePackage5} onChange={e => handleInputChange('pricePackage5', Number(e.target.value))} className="w-24 text-right border-gray-300 rounded-md shadow-sm p-1 text-sm" /></td>
                                                <td className="py-4 px-4"><input type="number" value={editedService.pricePackage15} onChange={e => handleInputChange('pricePackage15', Number(e.target.value))} className="w-24 text-right border-gray-300 rounded-md shadow-sm p-1 text-sm" /></td>
                                                <td className="py-4 px-4 text-center">
                                                    <div className="flex flex-col gap-1 items-center">
                                                        <Button onClick={handleSaveEdit} className="text-[10px] py-1 px-2 w-full">Lưu</Button>
                                                        <Button variant="secondary" onClick={handleCancelEdit} className="text-[10px] py-1 px-2 w-full">Hủy</Button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="py-4 px-4 sticky left-0 bg-white z-10 shadow-sm md:shadow-none min-w-[200px]">
                                                    <p className="font-medium text-gray-900 whitespace-normal text-sm">{service.name}</p>
                                                    <p className="text-xs text-gray-500 whitespace-normal line-clamp-1">{service.description}</p>
                                                    {service.consultationNote && <p className="text-[10px] text-blue-500 mt-1 truncate">📝 {service.consultationNote}</p>}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-700 text-right">{formatCurrency(service.priceOriginal)}</td>
                                                <td className="py-4 px-4 text-sm text-gray-700 text-right">{formatCurrency(service.pricePromo)}</td>
                                                <td className="py-4 px-4 text-sm text-gray-700 text-right">{formatCurrency(service.pricePackage5)}</td>
                                                <td className="py-4 px-4 text-sm text-gray-700 text-right">{formatCurrency(service.pricePackage15)}</td>
                                                <td className="py-4 px-4 text-center">
                                                     <div className="flex flex-col gap-1 items-center">
                                                        <Button variant="secondary" onClick={() => handleEditClick(service)} className="text-[10px] py-1 px-2 w-full">Sửa</Button>
                                                        <Button variant="danger" onClick={() => window.confirm(`Xóa dịch vụ ${service.name}?`) && onDeleteService(service.id)} className="text-[10px] py-1 px-2 w-full">Xóa</Button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                                {displayedServices.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-400">Chưa có dữ liệu cho mục này.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* Add New Service Form */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-pink-100">
                 <h3 className="text-xl font-serif font-bold text-[#D97A7D] mb-4">
                     Thêm Mới ({activeTab === 'single' ? 'Gói Lẻ' : 'Gói Combo'})
                 </h3>
                 <form onSubmit={handleAddNewService} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-700">Tên Dịch vụ</label>
                        <input type="text" value={newService.name} onChange={e => handleNewServiceChange('name', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" required placeholder="Nhập tên..."/>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-700">Giá bán gốc</label>
                        <input type="number" value={newService.priceOriginal} onChange={e => handleNewServiceChange('priceOriginal', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" required/>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-700">Giá KM/Trial</label>
                        <input type="number" value={newService.pricePromo} onChange={e => handleNewServiceChange('pricePromo', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"/>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-700">Giảm 5 Tặng 5</label>
                        <input type="number" value={newService.pricePackage5} onChange={e => handleNewServiceChange('pricePackage5', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"/>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-700">10 Tặng 15</label>
                        <input type="number" value={newService.pricePackage15} onChange={e => handleNewServiceChange('pricePackage15', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"/>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                         <label className="block text-xs font-medium text-gray-700">Mô tả</label>
                         <textarea value={newService.description} onChange={e => handleNewServiceChange('description', e.target.value)} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" placeholder="Mô tả ngắn..."></textarea>
                    </div>
                     <div className="md:col-span-2 lg:col-span-2">
                         <label className="block text-xs font-medium text-gray-700">Quy trình / Các bước (Dành cho Lễ tân/MKT)</label>
                         <textarea value={newService.consultationNote || ''} onChange={e => handleNewServiceChange('consultationNote', e.target.value)} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" placeholder="VD: Bước 1 tẩy trang..."></textarea>
                    </div>
                    <div className="lg:col-span-1">
                        <Button type="submit" className="w-full text-sm h-[60px]">Thêm Mới</Button>
                    </div>
                 </form>
            </div>
        </div>
    );
};

export default ServiceManagement;
