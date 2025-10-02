import { useState } from 'react';
import { PropertyList } from '../components/properties/PropertyList';
import { PropertyForm } from '../components/properties/PropertyForm';
import { Home } from 'lucide-react';

export function PropertiesPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Propiedades</h1>
          <p className="text-gray-600 mt-1">Gestiona tu cartera inmobiliaria</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Nueva Propiedad
        </button>
      </div>

      <div key={refreshKey}>
        <PropertyList />
      </div>

      {showForm && (
        <PropertyForm onClose={() => setShowForm(false)} onSuccess={handleSuccess} />
      )}
    </div>
  );
}
