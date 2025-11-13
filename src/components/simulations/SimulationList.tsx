import { useEffect, useState } from 'react';
import { mockApi } from '../../lib/mockApi';
import { useAuth } from '../../contexts/AuthContext';
import { Client, CreditSimulation, PropertyUnit } from '../../types/database';
import { Calculator, Eye } from 'lucide-react';

interface SimulationListProps {
  onViewDetails: (simulationId: string) => void;
}

export function SimulationList({ onViewDetails }: SimulationListProps) {
  const { user } = useAuth();
  const [simulations, setSimulations] = useState<
    (CreditSimulation & { clients: Client | null; property_units: PropertyUnit | null })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSimulations();
  }, [user]);

  const loadSimulations = async () => {
    try {
      const data = await mockApi.getSimulationsWithRelations(user?.id);
      setSimulations(data);
    } catch (error) {
      console.error('Error loading simulations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (simulations.length === 0) {
    return (
      <div className="text-center py-12">
        <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay simulaciones</h3>
        <p className="text-gray-500">Crea tu primera simulación de crédito</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {simulations.map((sim) => {
        const currencySymbol = sim.currency === 'PEN' ? 'S/' : '$';

        return (
          <div
            key={sim.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    {sim.clients?.full_name || 'Cliente no disponible'}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  {sim.property_units?.property_name || 'Propiedad no disponible'} -{' '}
                  {sim.property_units?.unit_number || ''}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Creado: {new Date(sim.created_at).toLocaleDateString('es-PE')}
                </p>
              </div>

              <button
                onClick={() => onViewDetails(sim.id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Ver Detalle
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Monto del Préstamo</p>
                <p className="font-semibold text-gray-900">
                  {currencySymbol}{' '}
                  {sim.loan_amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Plazo</p>
                <p className="font-semibold text-gray-900">{sim.loan_term_years} años</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">TEA</p>
                <p className="font-semibold text-green-600">
                  {((sim.tea || 0) * 100).toFixed(2)}%
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">TCEA</p>
                <p className="font-semibold text-orange-600">
                  {((sim.tcea || 0) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
