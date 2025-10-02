import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CreditSimulation, PaymentSchedule, Client, PropertyUnit } from '../../types/database';
import { X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface SimulationDetailProps {
  simulationId: string;
  onClose: () => void;
}

export function SimulationDetail({ simulationId, onClose }: SimulationDetailProps) {
  const [simulation, setSimulation] = useState<CreditSimulation | null>(null);
  const [schedule, setSchedule] = useState<PaymentSchedule[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [property, setProperty] = useState<PropertyUnit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSimulationData();
  }, [simulationId]);

  const loadSimulationData = async () => {
    try {
      const { data: simData, error: simError } = await supabase
        .from('credit_simulations')
        .select('*')
        .eq('id', simulationId)
        .single();

      if (simError) throw simError;
      setSimulation(simData);

      const [scheduleResult, clientResult, propertyResult] = await Promise.all([
        supabase
          .from('payment_schedules')
          .select('*')
          .eq('simulation_id', simulationId)
          .order('period_number'),
        supabase.from('clients').select('*').eq('id', simData.client_id).single(),
        supabase.from('property_units').select('*').eq('id', simData.property_id).single(),
      ]);

      if (scheduleResult.error) throw scheduleResult.error;
      if (clientResult.error) throw clientResult.error;
      if (propertyResult.error) throw propertyResult.error;

      setSchedule(scheduleResult.data || []);
      setClient(clientResult.data);
      setProperty(propertyResult.data);
    } catch (error) {
      console.error('Error loading simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!simulation || !client || !property) {
    return null;
  }

  const currencySymbol = simulation.currency === 'PEN' ? 'S/' : '$';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Detalle de Simulación</h2>
            <p className="text-gray-600 text-sm mt-1">
              Cliente: {client.full_name} - Propiedad: {property.property_name}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-gray-600">Préstamo</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {currencySymbol}{' '}
                {simulation.loan_amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <p className="text-sm text-gray-600">TEA</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {((simulation.tea || 0) * 100).toFixed(2)}%
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <p className="text-sm text-gray-600">TCEA</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {((simulation.tcea || 0) * 100).toFixed(2)}%
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-gray-600">TIR</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {((simulation.tir || 0) * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Información del Crédito</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Precio Propiedad</p>
                <p className="font-semibold">
                  {currencySymbol}{' '}
                  {simulation.property_price.toLocaleString('es-PE', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Cuota Inicial</p>
                <p className="font-semibold">
                  {currencySymbol}{' '}
                  {simulation.initial_payment.toLocaleString('es-PE', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Bono Techo Propio</p>
                <p className="font-semibold">
                  {currencySymbol}{' '}
                  {simulation.techo_propio_bonus.toLocaleString('es-PE', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Tasa de Interés</p>
                <p className="font-semibold">
                  {(simulation.annual_interest_rate * 100).toFixed(2)}%{' '}
                  {simulation.interest_rate_type === 'nominal' ? 'Nominal' : 'Efectiva'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Plazo</p>
                <p className="font-semibold">{simulation.loan_term_years} años</p>
              </div>
              <div>
                <p className="text-gray-600">Periodo de Gracia</p>
                <p className="font-semibold">
                  {simulation.grace_period_type === 'none'
                    ? 'Sin gracia'
                    : `${simulation.grace_period_months} meses (${
                        simulation.grace_period_type === 'total' ? 'Total' : 'Parcial'
                      })`}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Cronograma de Pagos</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                      Saldo Inicial
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Capital</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Interés</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Seguro</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                      Cuota Total
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                      Saldo Final
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {schedule.map((payment) => (
                    <tr
                      key={payment.id}
                      className={payment.grace_period ? 'bg-yellow-50' : 'hover:bg-gray-50'}
                    >
                      <td className="px-4 py-3">{payment.period_number}</td>
                      <td className="px-4 py-3">
                        {new Date(payment.payment_date).toLocaleDateString('es-PE')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {payment.beginning_balance.toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {payment.principal_payment.toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {payment.interest_payment.toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {payment.insurance_payment.toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {payment.total_payment.toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {payment.ending_balance.toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
