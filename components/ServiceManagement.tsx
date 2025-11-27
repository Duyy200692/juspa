
import React, { useState } from 'react';
import { Service } from '../types';
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
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [editedService, setEditedService] = useState<Partial<Service>>({});
    
    const [newService, setNewService] = useState({
        name: '',
        description: '',
        pricePerSession: 0,
        priceFullPackage: 0,
    });

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

    const handleInputChange = (field: keyof Service, value: string) => {
        setEditedService(prev => ({ ...prev, [field]: field.startsWith('price') ? Number(value) : value }));
    };
    
    const handleNewServiceChange = (field: keyof Omit<Service, 'id'>, value: string) => {
        setNewService(prev => ({ ...prev, [field]: field.startsWith('price') ? Number(value) : value }));
    };

    const handleAddNewService = (e: React.FormEvent) => {
        e.preventDefault();
        if (newService.name && newService.pricePerSession > 0) {
            onAddService(newService);
            setNewService({ name: '', description: '', pricePerSession: 0, priceFullPackage: 0 });
        } else {
            alert("Vui lòng nhập tên và giá dịch vụ.");
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-serif font-bold text-[#D97A7D] mb-4">Service & Pricelist Management</h2>
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full whitespace-nowrap">
                            <thead className="bg-[#FDF7F8]">
                                <tr>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                                    <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price / Session (VND)</th>
                                    <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price / Full Package (VND)</th>
                                    <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {services.map(service => (
                                    <tr key={service.id}>
                                        {editingServiceId === service.id ? (
                                            <>
                                                <td className="py-4 px-6 min-w-[200px]">
                                                    <input type="text" value={editedService.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-1" />
                                                    <textarea value={editedService.description} onChange={e => handleInputChange('description', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-1 mt-1 text-sm"></textarea>
                                                </td>
                                                <td className="py-4 px-6"><input type="number" value={editedService.pricePerSession} onChange={e => handleInputChange('pricePerSession', e.target.value)} className="w-full text-right border-gray-300 rounded-md shadow-sm p-1" /></td>
                                                <td className="py-4 px-6"><input type="number" value={editedService.priceFullPackage} onChange={e => handleInputChange('priceFullPackage', e.target.value)} className="w-full text-right border-gray-300 rounded-md shadow-sm p-1" /></td>
                                                <td className="py-4 px-6 text-center space-x-2">
                                                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                                        <Button onClick={handleSaveEdit} className="text-xs">Save</Button>
                                                        <Button variant="secondary" onClick={handleCancelEdit} className="text-xs">Cancel</Button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="py-4 px-6 min-w-[200px]">
                                                    <p className="font-medium text-gray-900 whitespace-normal">{service.name}</p>
                                                    <p className="text-sm text-gray-500 whitespace-normal line-clamp-2">{service.description}</p>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-700 text-right">{formatCurrency(service.pricePerSession)}</td>
                                                <td className="py-4 px-6 text-sm text-gray-700 text-right">{formatCurrency(service.priceFullPackage)}</td>
                                                <td className="py-4 px-6 text-center space-x-2">
                                                     <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                                        <Button variant="secondary" onClick={() => handleEditClick(service)} className="text-xs">Edit</Button>
                                                        <Button variant="danger" onClick={() => window.confirm(`Are you sure you want to delete ${service.name}?`) && onDeleteService(service.id)} className="text-xs">Del</Button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-pink-100">
                 <h3 className="text-xl font-serif font-bold text-[#D97A7D] mb-4">Add New Service</h3>
                 <form onSubmit={handleAddNewService} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Service Name</label>
                        <input type="text" value={newService.name} onChange={e => handleNewServiceChange('name', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required placeholder="Nhập tên dịch vụ"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Price / Session</label>
                        <input type="number" value={newService.pricePerSession} onChange={e => handleNewServiceChange('pricePerSession', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Price / Full Package</label>
                        <input type="number" value={newService.priceFullPackage} onChange={e => handleNewServiceChange('priceFullPackage', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required/>
                    </div>
                    <div className="md:col-span-2 lg:col-span-4">
                         <label className="block text-sm font-medium text-gray-700">Description</label>
                         <textarea value={newService.description} onChange={e => handleNewServiceChange('description', e.target.value)} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Mô tả ngắn..."></textarea>
                    </div>
                    <div className="lg:col-span-4">
                        <Button type="submit" className="w-full md:w-auto">Add Service</Button>
                    </div>
                 </form>
            </div>
        </div>
    );
};

export default ServiceManagement;
