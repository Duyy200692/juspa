
import React, { useState, useMemo } from 'react';
import { User, Service, Promotion, Role, PromotionStatus } from '../types';
import Button from './shared/Button';
import PromotionCard from './PromotionCard';
import ProposalForm from './ProposalForm';
import ProposalDetailView from './ProposalDetailView';

interface DashboardProps {
  loggedInUser: User;
  services: Service[];
  activePromotions: Promotion[];
  proposalPromotions: Promotion[];
  onAddPromotion: (promotion: Omit<Promotion, 'id'>) => Promise<void>;
  onUpdatePromotion: (promotion: Promotion) => Promise<void>;
  onDeletePromotion: (promotionId: string) => Promise<void>;
}

const getStatusColor = (status: PromotionStatus) => {
    switch (status) {
        case PromotionStatus.Approved: return 'bg-green-100 text-green-800';
        case PromotionStatus.PendingApproval: return 'bg-yellow-100 text-yellow-800';
        case PromotionStatus.PendingDesign: return 'bg-blue-100 text-blue-800';
        case PromotionStatus.Rejected: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const Dashboard: React.FC<DashboardProps> = ({ loggedInUser, services, activePromotions, proposalPromotions, onAddPromotion, onUpdatePromotion, onDeletePromotion }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Promotion | null>(null);
  const [editingProposal, setEditingProposal] = useState<Promotion | null>(null);

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const canViewProposals = [Role.Product, Role.Marketing, Role.Management].includes(loggedInUser.role);
  const isManagement = loggedInUser.role === Role.Management;

  // Generate Year Options dynamically from data
  const availableYears = useMemo(() => {
      // FIX: Explicitly type Set<number> to ensure sort comparison works with numbers
      const years = new Set<number>(proposalPromotions.map(p => new Date(p.startDate).getFullYear()));
      const currentYear = new Date().getFullYear();
      years.add(currentYear);
      years.add(currentYear + 1); // Add next year for planning
      return Array.from(years).sort((a, b) => b - a);
  }, [proposalPromotions]);

  // Filter Logic
  const filteredProposals = useMemo(() => {
      return proposalPromotions.filter(p => {
          const date = new Date(p.startDate);
          const monthMatch = selectedMonth === 'all' || date.getMonth() + 1 === parseInt(selectedMonth);
          const yearMatch = selectedYear === 'all' || date.getFullYear() === parseInt(selectedYear);
          return monthMatch && yearMatch;
      }).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [proposalPromotions, selectedMonth, selectedYear]);

  const handleOpenCreateForm = () => {
    setEditingProposal(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (proposal: Promotion) => {
    setEditingProposal(proposal);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProposal(null);
  };

  const handleFormSubmit = async (promotionData: Omit<Promotion, 'id'> | Promotion) => {
    if ('id' in promotionData) {
      await onUpdatePromotion(promotionData as Promotion);
    } else {
      await onAddPromotion(promotionData as Omit<Promotion, 'id'>);
    }
    handleFormClose();
  };

  const handleDelete = async (id: string, name: string) => {
      if (window.confirm(`Bạn có chắc chắn muốn xóa chương trình "${name}" không?`)) {
          await onDeletePromotion(id);
      }
  };

  const getMonthFromDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `Tháng ${date.getMonth() + 1}`;
  }

  const getTimeBadge = (startDate: string, endDate: string, status: PromotionStatus) => {
      if (status !== PromotionStatus.Approved) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);

      if (start > today) {
          const diffTime = start.getTime() - today.getTime();
          const daysToStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200" title={`Bắt đầu sau ${daysToStart} ngày`}>📅 Sắp chạy</span>;
      }

      const diffTime = end.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysLeft >= 0 && daysLeft <= 3) {
          return <span className="ml-2 text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded border border-orange-200 animate-pulse" title={`Còn ${daysLeft} ngày`}>⚠️ Sắp hết hạn</span>;
      }
      
      if (daysLeft >= 0) {
           return <span className="ml-2 text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded border border-green-200">🔥 Đang chạy</span>;
      }

      return <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">Đã kết thúc</span>;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-serif font-bold text-[#D97A7D] mb-4">Active & Approved Promotions</h2>
        {activePromotions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activePromotions.map(promo => (
              <PromotionCard
                key={promo.id}
                title={promo.name}
                subtitle={`Valid from ${promo.startDate} to ${promo.endDate}`}
                startDate={promo.startDate}
                endDate={promo.endDate}
                services={promo.services}
                canEdit={isManagement}
                onEdit={() => handleOpenEditForm(promo)}
                onView={() => setSelectedProposal(promo)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">Chưa có chương trình nào được duyệt hoặc sắp diễn ra.</p>
          </div>
        )}
      </div>

      {canViewProposals && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4 sm:gap-0">
            <div>
                <h2 className="text-3xl font-serif font-bold text-[#D97A7D]">Promotion Proposals History</h2>
                <p className="text-sm text-gray-500 mt-1">Danh sách tất cả các đề xuất khuyến mãi</p>
            </div>
            {loggedInUser.role === Role.Product && (
              <Button onClick={handleOpenCreateForm} className="w-full sm:w-auto">
                + Propose New Promotion
              </Button>
            )}
          </div>
          
          {/* Month/Year Filter Bar */}
          <div className="bg-white p-3 rounded-lg border border-pink-100 shadow-sm mb-4 flex flex-wrap items-center gap-3">
              <span className="text-sm font-bold text-[#D97A7D] flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  Lọc theo thời gian:
              </span>
              
              <div className="flex items-center gap-2">
                  <select 
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="border border-gray-300 rounded-md text-sm p-1.5 focus:ring-[#E5989B] focus:border-[#E5989B] bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                  >
                      <option value="all">Tất cả các tháng</option>
                      {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                      ))}
                  </select>

                  <select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="border border-gray-300 rounded-md text-sm p-1.5 focus:ring-[#E5989B] focus:border-[#E5989B] bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                  >
                      <option value="all">Tất cả các năm</option>
                      {availableYears.map(year => (
                          <option key={year} value={year}>Năm {year}</option>
                      ))}
                  </select>
              </div>

              {(selectedMonth !== 'all' || selectedYear !== 'all') && (
                  <button 
                      onClick={() => { setSelectedMonth('all'); setSelectedYear('all'); }}
                      className="text-xs text-gray-500 hover:text-red-500 underline ml-auto"
                  >
                      Xóa lọc
                  </button>
              )}
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full whitespace-nowrap">
                <thead className="bg-[#FDF7F8]">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tháng</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProposals.map(promo => {
                    const isOwner = promo.proposerId === loggedInUser.id;
                    const canEdit = loggedInUser.role === Role.Product && isOwner && promo.status === PromotionStatus.PendingDesign;
                    const canDelete = loggedInUser.role === Role.Management || (loggedInUser.role === Role.Product && isOwner && promo.status === PromotionStatus.PendingDesign);
                    
                    return (
                      <tr key={promo.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6 font-medium text-gray-900 flex items-center">
                            {promo.name}
                            {getTimeBadge(promo.startDate, promo.endDate, promo.status)}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">{getMonthFromDate(promo.startDate)}</td>
                        <td className="py-4 px-6 text-sm text-gray-500">{promo.startDate} - {promo.endDate}</td>
                        <td className="py-4 px-6 text-center">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(promo.status)}`}>
                                {promo.status}
                            </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          {canEdit && (
                            <Button variant="secondary" onClick={() => handleOpenEditForm(promo)}>Edit</Button>
                          )}
                          <Button variant="secondary" onClick={() => setSelectedProposal(promo)}>View</Button>
                          {canDelete && (
                            <Button variant="danger" onClick={() => handleDelete(promo.id, promo.name)}>Xóa</Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredProposals.length === 0 && (
                <div className="text-center py-8 text-gray-500">Không tìm thấy chương trình nào phù hợp.</div>
            )}
          </div>
        </div>
      )}

      <ProposalForm 
        isOpen={isFormOpen}
        onClose={handleFormClose}
        services={services}
        currentUser={loggedInUser}
        onSubmit={handleFormSubmit}
        promotionToEdit={editingProposal}
      />
      
      {selectedProposal && (
        <ProposalDetailView
          isOpen={!!selectedProposal}
          onClose={() => setSelectedProposal(null)}
          proposal={selectedProposal}
          currentUser={loggedInUser}
          onUpdate={onUpdatePromotion}
        />
      )}
    </div>
  );
};

export default Dashboard;
