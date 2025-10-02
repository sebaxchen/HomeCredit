import { useState } from 'react';
import { ClientList } from '../components/clients/ClientList';
import { ClientForm } from '../components/clients/ClientForm';
import { UserPlus } from 'lucide-react';

export function ClientsPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gestiona tu cartera de clientes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      <div key={refreshKey}>
        <ClientList />
      </div>

      {showForm && (
        <ClientForm onClose={() => setShowForm(false)} onSuccess={handleSuccess} />
      )}
    </div>
  );
}
