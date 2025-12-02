import React, { useState, useMemo } from 'react';
import { InventoryItem, InventoryTransaction, User, Role } from '../types';
import Button from './shared/Button';
import Modal from './shared/Modal';

interface InventoryManagementProps {
  items: InventoryItem[];
  transactions: InventoryTransaction[];
  currentUser: User;
  onImportItem: (itemId: string, quantity: number, notes?: string) => Promise<void>;
  onExportItem: (itemId: string, quantity: number, reason: string) => Promise<void>;
}

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'in' | 'out';
    item: InventoryItem | null;
    onSubmit: (qty: number, note: string) => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, type, item, onSubmit }) => {
    const [qty, setQty] = useState(1);
    const [note, setNote] = useState('');

    if (!isOpen || !item) return null;

    const handleSubmit = () => {
        if (qty <= 0) return alert("Số lượng phải lớn hơn 0");
        if (type === 'out' && qty > item.quantity) return alert("Số lượng xuất vượt quá tồn kho!");
        onSubmit(qty, note);
        onClose();
        setQty(1);
        setNote('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={type === 'in' ? `Nhập Kho: ${item.name}` : `Xuất Kho: ${item.name}`}>
            <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                    <p>Đơn vị tính: <span className="font-bold">{item.unit}</span></p>
                    <p>Hiện tồn: <span className="font-bold text-[#D97A7D]">{item.quantity}</span></p>
                    <p>Vị trí: <span className="font-medium">{item.location}</span></p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Số lượng {type === 'in' ? 'Nhập' : 'Xuất'}</label>
                    <input type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#E5989B]" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{type === 'in' ? 'Ghi chú (Tùy chọn)' : 'Lý do / Người nhận (Bắt buộc)'}</label>
                    <textarea value={note} onChange={e => setNote(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={2} placeholder={type === 'out' ? "VD: Dùng cho khách, Hư hỏng..." : "VD: Nhập hàng mới"}></textarea>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={onClose}>Hủy</Button>
                    <Button onClick={handleSubmit}>{type === 'in' ? 'Xác nhận Nhập' : 'Xác nhận Xuất'}</Button>
                </div>
            </div>
        </Modal>
    );
};

const InventoryManagement: React.FC<InventoryManagementProps> = ({ items, transactions, currentUser, onImportItem, onExportItem }) => {
  const [tab, setTab] = useState<'stock' | 'history'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [modalState, setModalState] = useState<{isOpen: boolean, type: 'in'|'out', item: InventoryItem | null}>({isOpen: false, type: 'in', item: null});

  const locations = useMemo(() => Array.from(new Set(items.map(i => i.location))).sort(), [items]);

  const filteredItems = useMemo(() => {
      return items.filter(item => {
          const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchLoc = filterLocation === 'all' || item.location === filterLocation;
          return matchSearch && matchLoc;
      });
  }, [items, searchTerm, filterLocation]);

  const getExpiryStatus = (dateString?: string) => {
      if (!dateString) return null;
      const today = new Date();
      const expiry = new Date(dateString);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) return { label: `Sắp hết hạn (${diffDays} ngày)`, color: 'bg-red-100 text-red-700 border-red-200' };
      if (diffDays <= 60) return { label: `Cảnh báo (${diffDays} ngày)`, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      return null;
  };

  const openModal = (type: 'in' | 'out', item: InventoryItem) => {
      setModalState({ isOpen: true, type, item });
  };

  const handleAction = async (qty: number, note: string) => {
      if (!modalState.item) return;
      if (modalState.type === 'in') {
          await onImportItem(modalState.item.id, qty, note);
      } else {
          await onExportItem(modalState.item.id, qty, note);
      }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-serif font-bold text-[#D97A7D]">Quản lý Kho (Inventory)</h2>
            <div className="flex space-x-2 bg-white rounded-lg p-1 border border-gray-200">
                <button onClick={() => setTab('stock')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'stock' ? 'bg-pink-100 text-[#D97A7D]' : 'text-gray-600 hover:bg-gray-50'}`}>Danh sách Tồn kho</button>
                <button onClick={() => setTab('history')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'history' ? 'bg-pink-100 text-[#D97A7D]' : 'text-gray-600 hover:bg-gray-50'}`}>Lịch sử Nhập/Xuất</button>
            </div>
        </div>

        {tab === 'stock' && (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                <div className="p-4 bg-[#FDF7F8] border-b border-pink-100 flex flex-col md:flex-row gap-4">
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm tên sản phẩm..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-[#E5989B] focus:border-[#E5989B]"
                    />
                    <select 
                        value={filterLocation} 
                        onChange={e => setFilterLocation(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-[#E5989B]"
                    >
                        <option value="all">Tất cả vị trí</option>
                        {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto max-h-[70vh]">
                    <table className="min-w-full whitespace-nowrap">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Tên sản phẩm</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Vị trí</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Đơn vị</th>
                                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase">Hạn dùng</th>
                                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase">Tồn kho</th>
                                <th className="py-3 px-4 text-right text-xs font-bold text-gray-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredItems.map(item => {
                                const expiryStatus = getExpiryStatus(item.expiryDate);
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.location}</span></td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{item.unit}</td>
                                        <td className="py-3 px-4 text-sm text-center">
                                            {item.expiryDate ? (
                                                <div className="flex flex-col items-center">
                                                    <span>{item.expiryDate}</span>
                                                    {expiryStatus && <span className={`text-[10px] px-1 rounded border ${expiryStatus.color}`}>{expiryStatus.label}</span>}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`font-bold text-lg ${item.quantity <= (item.minThreshold || 3) ? 'text-red-600' : 'text-[#D97A7D]'}`}>{item.quantity}</span>
                                        </td>
                                        <td className="py-3 px-4 text-right space-x-2">
                                            <button onClick={() => openModal('in', item)} className="text-green-600 hover:bg-green-50 px-2 py-1 rounded border border-green-200 text-xs font-medium">+ Nhập</button>
                                            <button onClick={() => openModal('out', item)} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200 text-xs font-medium">- Xuất</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {tab === 'history' && (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto max-h-[70vh]">
                    <table className="min-w-full whitespace-nowrap">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Thời gian</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Người thực hiện</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Hành động</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Sản phẩm</th>
                                <th className="py-3 px-4 text-right text-xs font-bold text-gray-500 uppercase">Số lượng</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Ghi chú / Lý do</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                                <tr key={tx.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm text-gray-600">{new Date(tx.date).toLocaleString('vi-VN')}</td>
                                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{tx.performedBy}</td>
                                    <td className="py-3 px-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${tx.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {tx.type === 'in' ? 'NHẬP KHO' : 'XUẤT KHO'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-800">{tx.itemName}</td>
                                    <td className="py-3 px-4 text-right text-sm font-bold text-gray-700">{tx.quantity}</td>
                                    <td className="py-3 px-4 text-sm text-gray-500 italic">{tx.reason || '-'}</td>
                                </tr>
                            ))}
                            {transactions.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">Chưa có lịch sử giao dịch.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        <ActionModal 
            isOpen={modalState.isOpen}
            onClose={() => setModalState({...modalState, isOpen: false})}
            type={modalState.type}
            item={modalState.item}
            onSubmit={handleAction}
        />
    </div>
  );
};

export default InventoryManagement;