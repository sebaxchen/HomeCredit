import { useState } from 'react';
import { SimulationList } from '../components/simulations/SimulationList';
import { SimulationForm } from '../components/simulations/SimulationForm';
import { SimulationDetail } from '../components/simulations/SimulationDetail';
import { Calculator } from 'lucide-react';

export function SimulationsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedSimulationId, setSelectedSimulationId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = (simulationId: string) => {
    setRefreshKey((prev) => prev + 1);
    setSelectedSimulationId(simulationId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulaciones de Crédito</h1>
          <p className="text-gray-600 mt-1">Gestiona y analiza tus simulaciones hipotecarias</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Calculator className="w-5 h-5" />
          Nueva Simulación
        </button>
      </div>

      <div key={refreshKey}>
        <SimulationList onViewDetails={(id) => setSelectedSimulationId(id)} />
      </div>

      {showForm && (
        <SimulationForm onClose={() => setShowForm(false)} onSuccess={handleSuccess} />
      )}

      {selectedSimulationId && (
        <SimulationDetail
          simulationId={selectedSimulationId}
          onClose={() => setSelectedSimulationId(null)}
        />
      )}
    </div>
  );
}
