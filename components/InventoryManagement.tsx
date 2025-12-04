import React, { useState, useMemo, useEffect } from 'react';
// FIX: Removed unused 'AuditItem' import to fix TS6133 build error
import { InventoryItem, InventoryTransaction, User, Role, AuditSession } from '../types';
import Button from './shared/Button';
import Modal from './shared/Modal';

// ... (Giữ nguyên InventoryManagementProps, ActionModalProps, ActionModal, EditItemModalProps, EditItemModal)
// ... (Bạn hãy copy lại phần Modal từ file cũ, tôi chỉ paste phần component chính có thay đổi bên dưới)

interface InventoryManagementProps {
  items: InventoryItem[];
  transactions: InventoryTransaction[];
  currentUser: User;
  onImportItem: (itemId: string, quantity: number, notes?: string, expiryDate?: string) => Promise<void>;
  onExportItem: (itemId: string, quantity: number, reason: string) => Promise<void>;
  onSeedData: () => Promise<void>;
  onUpdateItem: (item: InventoryItem) => Promise<void>;
  
  auditSessions?: AuditSession[];
  onCreateAudit?: (month: number, year: number) => Promise<void>;
  onUpdateAuditItem?: (auditId: string, itemId: string, actualQty: number, reason: string) => Promise<void>;
  onFinalizeAudit?: (auditId: string) => Promise<void>;
}

// ... (Interface & Components ActionModal, EditItemModal giống hệt phiên bản trước) ...
// ... (Bạn vui lòng giữ nguyên phần đó) ...

// COPY ĐOẠN NÀY THAY THẾ COMPONENT InventoryManagement CHÍNH:
const InventoryManagement: React.FC<InventoryManagementProps> = ({ 
    items, transactions, currentUser, 
    onImportItem, onExportItem, onSeedData, onUpdateItem,
    auditSessions, onCreateAudit, onUpdateAuditItem, onFinalizeAudit
}) => {
  const [tab, setTab] = useState<'stock' | 'history' | 'audit'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  
  const [historyMonth, setHistoryMonth] = useState<string>('all');
  const [historyYear, setHistoryYear] = useState<string>('all');

  // NEW: Audit Filter Location
  const [auditFilterLocation, setAuditFilterLocation] = useState('all');

  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [newAuditMonth, setNewAuditMonth] = useState(new Date().getMonth() + 1);
  const [newAuditYear, setNewAuditYear] = useState(new Date().getFullYear());

  const [modalState, setModalState] = useState<{isOpen: boolean, type: 'in'|'out', item: InventoryItem | null}>({isOpen: false, type: 'in', item: null});
  const [editModal, setEditModal] = useState<{isOpen: boolean, item: InventoryItem | null}>({isOpen: false, item: null});
  
  const [isSeeding, setIsSeeding] = useState(false);

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

  // ... (getExpiryStatus, openActionModal, handleActionSubmit, handleSeedClick, handleCreateAudit, exportAuditCSV... GIỮ NGUYÊN) ...
  // (Tôi không paste lại để tiết kiệm chỗ, bạn giữ nguyên logic cũ)

  const currentAudit = auditSessions?.find(s => s.id === selectedAuditId);

  // NEW: Filter Audit Items based on Location
  const filteredAuditItems = useMemo(() => {
      if (!currentAudit) return [];
      if (auditFilterLocation === 'all') return currentAudit.items;
      
      // Need to find the location of the item from the main items list
      return currentAudit.items.filter(auditItem => {
          const originalItem = items.find(i => i.id === auditItem.itemId);
          return originalItem?.location === auditFilterLocation;
      });
  }, [currentAudit, auditFilterLocation, items]);


  return (
    <div className="space-y-6">
        {/* ... (Header & Tabs - GIỮ NGUYÊN) ... */}

        {/* ... (Tab Stock - GIỮ NGUYÊN) ... */}

        {/* ... (Tab History - GIỮ NGUYÊN) ... */}

        {/* AUDIT TAB */}
        {tab === 'audit' && (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Phiếu Kiểm Kê Kho</h3>
                        <p className="text-xs text-gray-500">Tạo phiếu kiểm kê cuối tháng để đối chiếu và chốt sổ.</p>
                    </div>
                    
                    {/* ... (Create Audit Form - GIỮ NGUYÊN) ... */}
                </div>

                {/* ... (Audit Session List - GIỮ NGUYÊN) ... */}

                {/* Audit Detail View */}
                {currentAudit ? (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-end mb-4">
                            {/* ... (Audit Info & Buttons - GIỮ NGUYÊN) ... */}
                        </div>

                        {/* NEW: Audit Location Filter */}
                        <div className="mb-4 flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200 w-fit">
                            <span className="text-xs font-bold text-gray-600 uppercase">Lọc theo vị trí kiểm kê:</span>
                            <select 
                                value={auditFilterLocation} 
                                onChange={(e) => setAuditFilterLocation(e.target.value)}
                                className="text-sm border border-gray-300 rounded p-1 bg-white focus:ring-blue-500"
                            >
                                <option value="all">Tất cả vị trí</option>
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>

                        <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                            <div className="max-h-[60vh] overflow-y-auto">
                                <table className="min-w-full whitespace-nowrap">
                                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Sản phẩm</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100">Tồn Sổ Sách</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider bg-yellow-50 border-l border-r border-yellow-100">Tồn Thực Tế</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Chênh lệch</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Lý do / Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {/* Map over FILTERED items */}
                                        {filteredAuditItems.map(item => (
                                            <tr key={item.itemId} className="hover:bg-gray-50">
                                                {/* ... (Row content - GIỮ NGUYÊN) ... */}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p>Chọn một kỳ kiểm kê bên trên hoặc tạo mới để bắt đầu.</p>
                    </div>
                )}
            </div>
        )}
        
        {/* ... (Modals - GIỮ NGUYÊN) ... */}
    </div>
  );
};

export default InventoryManagement;