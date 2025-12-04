import React, { useState, useMemo, useEffect } from 'react';
import { InventoryItem, InventoryTransaction, User, Role, AuditSession } from '../types';
import Button from './shared/Button';
import Modal from './shared/Modal';

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

// ... (ActionModal & EditItemModal remain EXACTLY THE SAME as previous version)
// ... (Bạn giữ nguyên code Modal ở đây)

const InventoryManagement: React.FC<InventoryManagementProps> = ({ 
    items, transactions, currentUser, 
    onImportItem, onExportItem, onSeedData, onUpdateItem,
    auditSessions, onCreateAudit, onUpdateAuditItem, onFinalizeAudit
}) => {
  const [tab, setTab] = useState<'stock' | 'history' | 'audit'>('stock');
  
  // ... (Filters state remains same) ...
  // ... (Audit state) ...
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [newAuditMonth, setNewAuditMonth] = useState(new Date().getMonth() + 1);
  const [newAuditYear, setNewAuditYear] = useState(new Date().getFullYear());

  // ... (Logic Modal state remains same) ...

  // ... (Helpers getExpiryStatus etc. remain same) ...

  // Helper to export Audit CSV
  const exportAuditCSV = (session: AuditSession) => {
      // BOM for UTF-8 support in Excel
      const BOM = "\uFEFF"; 
      const headers = ["Tên sản phẩm", "Tồn Sổ sách", "Tồn Thực tế", "Chênh lệch", "Lý do"];
      const rows = session.items.map(item => [
          `"${item.itemName}"`, // Quote name to handle commas
          item.systemQty, 
          item.actualQty, 
          item.diff, 
          `"${item.reason || ''}"`
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," + BOM + 
          [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `KiemKe_${session.month}_${session.year}.csv`);
      document.body.appendChild(link);
      link.click();
  };

  const currentAudit = auditSessions?.find(s => s.id === selectedAuditId);

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
                <h2 className="text-3xl font-serif font-bold text-[#D97A7D]">Quản lý Kho</h2>
                {/* Seed Button */}
            </div>
            <div className="flex space-x-2 bg-white rounded-lg p-1 border border-gray-200">
                <button onClick={() => setTab('stock')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'stock' ? 'bg-pink-100 text-[#D97A7D]' : 'text-gray-600 hover:bg-gray-50'}`}>Tồn kho</button>
                <button onClick={() => setTab('history')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'history' ? 'bg-pink-100 text-[#D97A7D]' : 'text-gray-600 hover:bg-gray-50'}`}>Lịch sử</button>
                <button onClick={() => setTab('audit')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'audit' ? 'bg-pink-100 text-[#D97A7D]' : 'text-gray-600 hover:bg-gray-50'}`}>Kiểm kê (Audit)</button>
            </div>
        </div>

        {/* ... (Stock & History Tab Content - Keep unchanged) ... */}

        {tab === 'audit' && (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Phiếu Kiểm Kê Kho</h3>
                        <p className="text-xs text-gray-500">Tạo phiếu kiểm kê cuối tháng để đối chiếu và chốt sổ.</p>
                    </div>
                    
                    {(currentUser.role === Role.Management || currentUser.role === Role.Accountant) && (
                        <div className="flex gap-2 items-center bg-gray-50 p-2 rounded border">
                            <span className="text-xs font-medium uppercase text-gray-500">Tạo kỳ mới:</span>
                            <select value={newAuditMonth} onChange={e => setNewAuditMonth(Number(e.target.value))} className="text-sm border rounded p-1 bg-white">
                                {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                            </select>
                            <select value={newAuditYear} onChange={e => setNewAuditYear(Number(e.target.value))} className="text-sm border rounded p-1 bg-white">
                                <option value={2025}>2025</option><option value={2026}>2026</option>
                            </select>
                            <Button onClick={() => onCreateAudit && onCreateAudit(newAuditMonth, newAuditYear)} className="text-xs py-1 px-3"> + Tạo Phiếu</Button>
                        </div>
                    )}
                </div>

                {/* Audit Session List */}
                <div className="flex gap-3 overflow-x-auto pb-4 mb-4 border-b border-gray-100 scrollbar-hide">
                    {auditSessions?.sort((a,b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()).map(session => (
                        <button 
                            key={session.id}
                            onClick={() => setSelectedAuditId(session.id)}
                            className={`px-4 py-3 rounded-lg border text-sm flex flex-col items-start min-w-[160px] transition-all ${
                                selectedAuditId === session.id 
                                ? 'bg-blue-50 border-blue-400 shadow-sm ring-1 ring-blue-200' 
                                : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex justify-between w-full mb-1">
                                <span className="font-bold text-gray-800">{session.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${session.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                    {session.status === 'open' ? 'Mở' : 'Đóng'}
                                </span>
                            </div>
                            <span className="text-xs text-gray-400">{new Date(session.createdDate).toLocaleDateString('vi-VN')}</span>
                        </button>
                    ))}
                    {(!auditSessions || auditSessions.length === 0) && <p className="text-sm text-gray-400 italic">Chưa có phiếu kiểm kê nào.</p>}
                </div>

                {/* Audit Detail View */}
                {currentAudit ? (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h4 className="text-lg font-bold text-[#5C3A3A]">{currentAudit.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    Người tạo: <b>{currentAudit.createdBy}</b> | Ngày tạo: {new Date(currentAudit.createdDate).toLocaleString('vi-VN')}
                                    {currentAudit.closedDate && ` | Ngày chốt: ${new Date(currentAudit.closedDate).toLocaleString('vi-VN')}`}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => exportAuditCSV(currentAudit)} className="text-xs">📥 Xuất Excel (CSV)</Button>
                                {currentAudit.status === 'open' && (currentUser.role === Role.Management || currentUser.role === Role.Accountant) && (
                                    <Button variant="danger" onClick={() => {
                                        if (window.confirm("XÁC NHẬN CHỐT SỔ?\n\n- Hệ thống sẽ cập nhật số lượng tồn kho theo số thực tế bạn nhập.\n- Tạo các giao dịch điều chỉnh kho tự động.\n- Phiếu này sẽ bị khóa và không thể sửa đổi.")) {
                                            if (onFinalizeAudit) onFinalizeAudit(currentAudit.id);
                                        }
                                    }} className="text-xs">🔒 Chốt sổ & Điều chỉnh Kho</Button>
                                )}
                            </div>
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
                                        {currentAudit.items.map(item => (
                                            <tr key={item.itemId} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.itemName}</td>
                                                <td className="px-4 py-3 text-sm text-center text-gray-500 bg-gray-50/50">{item.systemQty}</td>
                                                
                                                {/* Actual Qty Input */}
                                                <td className="px-4 py-2 text-center bg-yellow-50/30 border-l border-r border-yellow-50">
                                                    {currentAudit.status === 'open' ? (
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            value={item.actualQty}
                                                            onChange={(e) => onUpdateAuditItem && onUpdateAuditItem(currentAudit.id, item.itemId, Number(e.target.value), item.reason || '')}
                                                            className={`w-20 text-center border rounded-md p-1.5 font-bold focus:ring-2 focus:ring-blue-400 outline-none transition-all ${item.diff !== 0 ? 'border-blue-400 text-blue-700 bg-white shadow-sm' : 'border-gray-200 text-gray-700 bg-transparent'}`}
                                                        />
                                                    ) : (
                                                        <span className="font-bold text-gray-800">{item.actualQty}</span>
                                                    )}
                                                </td>

                                                {/* Diff Display */}
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                                        item.diff < 0 ? 'bg-red-100 text-red-600' : 
                                                        item.diff > 0 ? 'bg-green-100 text-green-600' : 'text-gray-300'
                                                    }`}>
                                                        {item.diff > 0 ? '+' : ''}{item.diff !== 0 ? item.diff : '-'}
                                                    </span>
                                                </td>

                                                {/* Reason Input */}
                                                <td className="px-4 py-2">
                                                    {currentAudit.status === 'open' ? (
                                                        <input 
                                                            type="text" 
                                                            value={item.reason || ''}
                                                            onChange={(e) => onUpdateAuditItem && onUpdateAuditItem(currentAudit.id, item.itemId, item.actualQty, e.target.value)}
                                                            className="w-full text-xs border-b border-gray-200 focus:border-blue-400 outline-none bg-transparent p-1 placeholder-gray-300"
                                                            placeholder={item.diff !== 0 ? "Nhập lý do lệch..." : ""}
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-gray-500 italic">{item.reason || ''}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        <p>Chọn một kỳ kiểm kê bên trên hoặc tạo mới để bắt đầu.</p>
                    </div>
                )}
            </div>
        )}

        {/* ... (Modals) ... */}
        <ActionModal 
            isOpen={modalState.isOpen}
            onClose={() => setModalState({...modalState, isOpen: false})}
            type={modalState.type}
            item={modalState.item}
            onSubmit={handleActionSubmit}
        />

        <EditItemModal 
            isOpen={editModal.isOpen}
            onClose={() => setEditModal({isOpen: false, item: null})}
            item={editModal.item}
            onSave={onUpdateItem}
        />
    </div>
  );
};

export default InventoryManagement;