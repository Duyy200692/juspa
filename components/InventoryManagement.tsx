import React, { useState, useMemo } from 'react';
import { InventoryItem, InventoryTransaction, User, Role } from '../types';
import Button from './shared/Button';
import Modal from './shared/Modal';

interface InventoryManagementProps {
  items: InventoryItem[];
  transactions: InventoryTransaction[];
  currentUser: User;
  onImportItem: (itemId: string, quantity: number, notes?: string, expiryDate?: string) => Promise<void>;
  onExportItem: (itemId: string, quantity: number, reason: string) => Promise<void>;
  onSeedData: () => Promise<void>;
}

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'in' | 'out';
    item: InventoryItem | null;
    onSubmit: (qty: number, note: string, expiry?: string) => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, type, item, onSubmit }) => {
    const [qty, setQty] = useState(1);
    const [note, setNote] = useState('');
    const [newExpiry, setNewExpiry] = useState('');

    // Reset date whenever modal opens
    React.useEffect(() => {
        if (isOpen) setNewExpiry('');
    }, [isOpen]);

    if (!isOpen || !item) return null;

    const handleSubmit = () => {
        if (qty <= 0) return alert("Số lượng phải lớn hơn 0");
        if (type === 'out' && qty > item.quantity) return alert("Số lượng xuất vượt quá tồn kho!");
        onSubmit(qty, note, newExpiry);
        onClose();
        setQty(1);
        setNote('');
        setNewExpiry('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={type === 'in' ? `Nhập Kho: ${item.name}` : `Xuất Kho: ${item.name}`}>
            <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                    <p>Đơn vị tính: <span className="font-bold">{item.unit}</span></p>
                    <p>Hiện tồn: <span className="font-bold text-[#D97A7D]">{item.quantity}</span></p>
                    <p>Vị trí: <span className="font-medium">{item.location}</span></p>
                    {item.expiryDate && <p>Hạn dùng hiện tại: <span className="text-blue-600 font-mono">{item.expiryDate}</span></p>}
                </div>
                
                {/* NEW: Expiry Date Input for Import */}
                {type === 'in' && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <label className="block text-xs font-bold text-blue-800 mb-1">Cập nhật Hạn dùng mới (Tùy chọn)</label>
                        <input 
                            type="date" 
                            value={newExpiry} 
                            onChange={e => setNewExpiry(e.target.value)} 
                            className="w-full border border-blue-300 rounded p-2 text-sm focus:ring-blue-500 bg-white"
                        />
                        <p className="text-[10px] text-blue-500 mt-1 italic">Chọn ngày nếu lô hàng mới có hạn sử dụng khác.</p>
                    </div>
                )}

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

const InventoryManagement: React.FC<InventoryManagementProps> = ({ items, transactions, currentUser, onImportItem, onExportItem, onSeedData }) => {
  const [tab, setTab] = useState<'stock' | 'history'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  
  // History Filters
  const [historyMonth, setHistoryMonth] = useState<string>('all');
  const [historyYear, setHistoryYear] = useState<string>('all');

  const [modalState, setModalState] = useState<{isOpen: boolean, type: 'in'|'out', item: InventoryItem | null}>({isOpen: false, type: 'in', item: null});
  const [isSeeding, setIsSeeding] = useState(false);

  // FIX: Sort locations alphabetically (A -> Z)
  const locations = useMemo(() => Array.from(new Set(items.map(i => i.location))).sort((a, b) => a.localeCompare(b)), [items]);

  const filteredItems = useMemo(() => {
      return items.filter(item => {
          const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchLoc = filterLocation === 'all' || item.location === filterLocation;
          return matchSearch && matchLoc;
      });
  }, [items, searchTerm, filterLocation]);

  const availableYears = useMemo(() => {
      const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
      years.add(new Date().getFullYear());
      return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
      return transactions.filter(t => {
          const date = new Date(t.date);
          const matchMonth = historyMonth === 'all' || (date.getMonth() + 1).toString() === historyMonth;
          const matchYear = historyYear === 'all' || date.getFullYear().toString() === historyYear;
          return matchMonth && matchYear;
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, historyMonth, historyYear]);

  const getExpiryStatus = (dateString?: string) => {
      if (!dateString) return null;
      const today = new Date();
      today.setHours(0,0,0,0);
      const expiry = new Date(dateString);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return { label: `Đã hết hạn (${Math.abs(diffDays)} ngày)`, color: 'bg-gray-800 text-white border-gray-600' };
      if (diffDays <= 30) return { label: `Nguy hiểm (${diffDays} ngày)`, color: 'bg-red-100 text-red-700 border-red-200 animate-pulse' };
      if (diffDays <= 60) return { label: `Cảnh báo (${diffDays} ngày)`, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      return { label: `An toàn (${diffDays} ngày)`, color: 'bg-green-50 text-green-600 border-green-100' };
  };

  const openModal = (type: 'in' | 'out', item: InventoryItem) => {
      setModalState({ isOpen: true, type, item });
  };

  const handleAction = async (qty: number, note: string, expiry?: string) => {
      if (!modalState.item) return;
      if (modalState.type === 'in') {
          await onImportItem(modalState.item.id, qty, note, expiry);
      } else {
          await onExportItem(modalState.item.id, qty, note);
      }
  };

  const handleSeedClick = async () => {
      if (window.confirm("Bạn có chắc chắn muốn nạp lại dữ liệu gốc? Hành động này sẽ thêm hơn 100 sản phẩm mẫu vào kho.")) {
          setIsSeeding(true);
          await onSeedData();
          setIsSeeding(false);
      }
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
                <h2 className="text-3xl font-serif font-bold text-[#D97A7D]">Quản lý Kho (Inventory)</h2>
                {(currentUser.role === Role.Management || currentUser.role === Role.Accountant) && (
                    <button 
                        onClick={handleSeedClick} 
                        disabled={isSeeding}
                        className="text-xs bg-white hover:bg-gray-50 text-gray-600 px-3 py-1.5 rounded border border-gray-300 flex items-center gap-1 shadow-sm transition-colors"
                        title="Nạp lại danh sách hàng hóa mẫu từ hệ thống"
                    >
                        {isSeeding ? 'Đang xử lý...' : '🔄 Nạp dữ liệu gốc'}
                    </button>
                )}
            </div>
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
                                {/* NEW: Separate Expiry Date Column */}
                                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase">Hạn dùng</th>
                                {/* NEW: Separate Status Column */}
                                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase">Trạng thái Date</th>
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
                                        <td className="py-3 px-4 text-sm text-center text-gray-600 font-mono">
                                            {item.expiryDate || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-center">
                                            {expiryStatus ? (
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${expiryStatus.color}`}>
                                                    {expiryStatus.label}
                                                </span>
                                            ) : <span className="text-gray-400 text-xs">-</span>}
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
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-400">
                                        {items.length === 0 ? "Kho đang trống." : "Không tìm thấy sản phẩm phù hợp."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {tab === 'history' && (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                <div className="p-4 bg-[#FDF7F8] border-b border-pink-100 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-bold text-[#D97A7D] flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                        Lọc theo thời gian:
                    </span>
                    <select 
                        value={historyMonth} 
                        onChange={(e) => setHistoryMonth(e.target.value)}
                        className="border border-gray-300 rounded-md text-sm p-1.5 focus:ring-[#E5989B] bg-white cursor-pointer"
                    >
                        <option value="all">Tất cả các tháng</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                        ))}
                    </select>
                    <select 
                        value={historyYear} 
                        onChange={(e) => setHistoryYear(e.target.value)}
                        className="border border-gray-300 rounded-md text-sm p-1.5 focus:ring-[#E5989B] bg-white cursor-pointer"
                    >
                        <option value="all">Tất cả các năm</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>Năm {year}</option>
                        ))}
                    </select>
                    {(historyMonth !== 'all' || historyYear !== 'all') && (
                        <button onClick={() => { setHistoryMonth('all'); setHistoryYear('all'); }} className="text-xs text-red-500 hover:underline ml-2">Xóa lọc</button>
                    )}
                </div>

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
                            {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
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
                            )) : (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Không tìm thấy giao dịch nào trong khoảng thời gian này.</td></tr>
                            )}
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