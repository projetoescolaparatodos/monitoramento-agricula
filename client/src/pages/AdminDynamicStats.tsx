
import React from 'react';
import { DynamicStatsManager } from '@/components/dashboard/DynamicStatsManager';
import { useAuthProtection } from '@/hooks/useAuthProtection';

const AdminDynamicStats: React.FC = () => {
  const { user, loading } = useAuthProtection();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <DynamicStatsManager />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDynamicStats;
