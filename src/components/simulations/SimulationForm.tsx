import { useState, useEffect } from 'react';
import { mockApi } from '../../lib/mockApi';
import { useAuth } from '../../contexts/AuthContext';
import { Client, PropertyUnit } from '../../types/database';
import { X } from 'lucide-react';
import { calculateCreditSchedule } from '../../utils/creditCalculations';

interface SimulationFormProps {
  onClose: () => void;
  onSuccess: (simulationId: string) => void;
}

export function SimulationForm({ onClose, onSuccess }: SimulationFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<PropertyUnit[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyUnit | null>(null);

  const [formData, setFormData] = useState({
    client_id: '',
    property_id: '',
    initial_payment: 0,
    techo_propio_bonus: 0,
    interest_rate_type: 'effective' as 'nominal' | 'effective',
    annual_interest_rate: 0.08,
    capitalization: 'monthly',
    loan_term_years: 20,
    grace_period_type: 'none' as 'none' | 'total' | 'partial',
    grace_period_months: 0,
    insurance_rate: 0.0005,
  });

  useEffect(() => {
    loadClientsAndProperties();
  }, [user]);

  const loadClientsAndProperties = async () => {
    try {
      const [clientsData, propertiesData] = await Promise.all([
        mockApi.getClients(user?.id),
        mockApi.getProperties(user?.id),
      ]);

      setClients(clientsData);
      setProperties(propertiesData.filter((property) => property.status === 'available'));
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handlePropertyChange = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    setSelectedProperty(property || null);
    setFormData((prev) => ({ ...prev, property_id: propertyId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!selectedProperty) throw new Error('Selecciona una propiedad');
      if (!user?.id) throw new Error('No se encontró un usuario activo');

      const property_price = selectedProperty.price;
      const loan_amount =
        property_price - formData.initial_payment - formData.techo_propio_bonus;

      if (loan_amount <= 0) {
        throw new Error('El monto del préstamo debe ser mayor a 0');
      }

      const calculationResult = calculateCreditSchedule({
        loan_amount,
        annual_interest_rate: formData.annual_interest_rate,
        interest_rate_type: formData.interest_rate_type,
        capitalization:
          formData.interest_rate_type === 'nominal'
            ? (formData.capitalization as any)
            : undefined,
        loan_term_years: formData.loan_term_years,
        grace_period_type: formData.grace_period_type,
        grace_period_months: formData.grace_period_months,
        insurance_rate: formData.insurance_rate,
      });

      const simulation = await mockApi.createSimulation({
        user_id: user.id,
        client_id: formData.client_id,
        property_id: formData.property_id,
        property_price,
        initial_payment: formData.initial_payment,
        loan_amount,
        techo_propio_bonus: formData.techo_propio_bonus,
        currency: selectedProperty.currency,
        interest_rate_type: formData.interest_rate_type,
        annual_interest_rate: formData.annual_interest_rate,
        capitalization:
          formData.interest_rate_type === 'nominal' ? formData.capitalization : undefined,
        loan_term_years: formData.loan_term_years,
        grace_period_type: formData.grace_period_type,
        grace_period_months: formData.grace_period_months,
        insurance_rate: formData.insurance_rate,
        van: calculationResult.van,
        tir: calculationResult.tir,
        tea: calculationResult.tea,
        tcea: calculationResult.tcea,
      });

      await mockApi.createPaymentSchedules(
        simulation.id,
        calculationResult.payment_schedule.map((item) => ({
          period_number: item.period_number,
          payment_date: item.payment_date,
          beginning_balance: item.beginning_balance,
          principal_payment: item.principal_payment,
          interest_payment: item.interest_payment,
          insurance_payment: item.insurance_payment,
          total_payment: item.total_payment,
          ending_balance: item.ending_balance,
          grace_period: item.grace_period,
        })),
      );

      onSuccess(simulation.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear simulación');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: [
        'initial_payment',
        'techo_propio_bonus',
        'annual_interest_rate',
        'loan_term_years',
        'grace_period_months',
        'insurance_rate',
      ].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const loanAmount = selectedProperty
    ? selectedProperty.price - formData.initial_payment - formData.techo_propio_bonus
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Nueva Simulación de Crédito</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.full_name} - {client.document_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Propiedad</label>
              <select
                name="property_id"
                value={formData.property_id}
                onChange={(e) => handlePropertyChange(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar propiedad</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.property_name} - {property.unit_number} (
                    {property.currency === 'PEN' ? 'S/' : '$'}{' '}
                    {property.price.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedProperty && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Resumen de Financiamiento</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Precio de Propiedad</p>
                  <p className="font-semibold">
                    {selectedProperty.currency === 'PEN' ? 'S/' : '$'}{' '}
                    {selectedProperty.price.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Monto del Préstamo</p>
                  <p className="font-semibold text-blue-600">
                    {selectedProperty.currency === 'PEN' ? 'S/' : '$'}{' '}
                    {loanAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuota Inicial</label>
              <input
                type="number"
                name="initial_payment"
                value={formData.initial_payment}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bono Techo Propio
              </label>
              <input
                type="number"
                name="techo_propio_bonus"
                value={formData.techo_propio_bonus}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Tasa</label>
              <select
                name="interest_rate_type"
                value={formData.interest_rate_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="effective">Efectiva</option>
                <option value="nominal">Nominal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tasa Anual (%)
              </label>
              <input
                type="number"
                name="annual_interest_rate"
                value={formData.annual_interest_rate * 100}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    annual_interest_rate: Number(e.target.value) / 100,
                  }))
                }
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {formData.interest_rate_type === 'nominal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capitalización
                </label>
                <select
                  name="capitalization"
                  value={formData.capitalization}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="monthly">Mensual</option>
                  <option value="bimonthly">Bimestral</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="semiannual">Semestral</option>
                  <option value="annual">Anual</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plazo (años)</label>
              <input
                type="number"
                name="loan_term_years"
                value={formData.loan_term_years}
                onChange={handleChange}
                min="1"
                max="30"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Periodo de Gracia
              </label>
              <select
                name="grace_period_type"
                value={formData.grace_period_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="none">Sin periodo de gracia</option>
                <option value="total">Gracia Total</option>
                <option value="partial">Gracia Parcial</option>
              </select>
            </div>

            {formData.grace_period_type !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meses de Gracia
                </label>
                <input
                  type="number"
                  name="grace_period_months"
                  value={formData.grace_period_months}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Simulación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
