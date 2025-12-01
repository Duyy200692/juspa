
import React, { useState } from 'react';
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

  const canViewProposals = [Role.Product, Role.Marketing, Role.Management].includes(loggedInUser.role);
  const isManagement = loggedInUser.role === Role.Management;

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
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  }

  // Helper to check expiry for table row
  const getDaysLeft = (endDate: string) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      const diffTime = end.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
            <h2 className="text-3xl font-serif font-bold text-[#D97A7D]">Promotion Proposals History</h2>
            {loggedInUser.role === Role.Product && (
              <Button onClick={handleOpenCreateForm} className="w-full sm:w-auto">
                + Propose New Promotion
              </Button>
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
                  {proposalPromotions.map(promo => {
                    const isOwner = promo.proposerId === loggedInUser.id;
                    const canEdit = loggedInUser.role === Role.Product && isOwner && promo.status === PromotionStatus.PendingDesign;
                    // Logic: Management can delete anything. Product can delete only their own Pending Design proposals.
                    const canDelete = loggedInUser.role === Role.Management || (loggedInUser.role === Role.Product && isOwner && promo.status === PromotionStatus.PendingDesign);
                    
                    const daysLeft = getDaysLeft(promo.endDate);
                    const isExpiring = daysLeft >= 0 && daysLeft <= 3 && promo.status === PromotionStatus.Approved;

                    return (
                      <tr key={promo.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6 font-medium text-gray-900">
                            {promo.name}
                            {isExpiring && <span className="ml-2 text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded border border-orange-200" title="Sắp hết hạn">⚠️</span>}
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
            {proposalPromotions.length === 0 && (
                <div className="text-center py-8 text-gray-500">Chưa có đề xuất cũ.</div>
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
