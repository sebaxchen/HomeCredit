import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Client } from '../../types/database';
import { User, Mail, Phone, DollarSign } from 'lucide-react';

export function ClientList() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, [user]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaritalStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      single: 'Soltero(a)',
      married: 'Casado(a)',
      divorced: 'Divorciado(a)',
      widowed: 'Viudo(a)',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes registrados</h3>
        <p className="text-gray-500">Comienza agregando tu primer cliente</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => (
        <div
          key={client.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{client.full_name}</h3>
                <p className="text-sm text-gray-500">
                  {client.document_type}: {client.document_number}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{client.email}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{client.phone}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>S/ {client.monthly_income.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Estado Civil</p>
              <p className="font-medium text-gray-900">{getMaritalStatusLabel(client.marital_status)}</p>
            </div>
            <div>
              <p className="text-gray-500">Dependientes</p>
              <p className="font-medium text-gray-900">{client.dependents}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
