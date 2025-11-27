
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
  onAddPromotion: (promotion: Omit<Promotion, 'id'>) => void;
  onUpdatePromotion: (promotion: Promotion) => void;
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

const Dashboard: React.FC<DashboardProps> = ({ loggedInUser, services, activePromotions, proposalPromotions, onAddPromotion, onUpdatePromotion }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Promotion | null>(null);
  const [editingProposal, setEditingProposal] = useState<Promotion | null>(null);

  const canViewProposals = [Role.Sales, Role.Marketing, Role.Management].includes(loggedInUser.role);
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

  const handleFormSubmit = (promotionData: Omit<Promotion, 'id'> | Promotion) => {
    if ('id' in promotionData) {
      onUpdatePromotion(promotionData as Promotion);
    } else {
      onAddPromotion(promotionData as Omit<Promotion, 'id'>);
    }
    handleFormClose();
  };

  const getMonthFromDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-serif font-bold text-[#D97A7D] mb-4">Active Promotions</h2>
        {activePromotions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activePromotions.map(promo => (
              <PromotionCard
                key={promo.id}
                title={promo.name}
                subtitle={`Valid from ${promo.startDate} to ${promo.endDate}`}
                services={promo.services}
                canEdit={isManagement}
                onEdit={() => handleOpenEditForm(promo)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No active promotions at the moment.</p>
          </div>
        )}
      </div>

      {canViewProposals && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-serif font-bold text-[#D97A7D]">Promotion Proposals</h2>
            {loggedInUser.role === Role.Sales && (
              <Button onClick={handleOpenCreateForm}>
                + Propose New Promotion
              </Button>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full">
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
                  const canEdit = loggedInUser.role === Role.Sales && promo.proposerId === loggedInUser.id && promo.status === PromotionStatus.PendingDesign;
                  return (
                    <tr key={promo.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 whitespace-nowrap font-medium text-gray-900">{promo.name}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{getMonthFromDate(promo.startDate)}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{promo.startDate} - {promo.endDate}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(promo.status)}`}>
                              {promo.status}
                          </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-right space-x-2">
                        {canEdit && (
                          <Button variant="secondary" onClick={() => handleOpenEditForm(promo)}>Edit</Button>
                        )}
                        <Button variant="secondary" onClick={() => setSelectedProposal(promo)}>View Details</Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
