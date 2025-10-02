import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Building2, Calculator, TrendingUp } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    clients: 0,
    properties: 0,
    simulations: 0,
    availableProperties: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const [clientsResult, propertiesResult, simulationsResult, availableResult] =
        await Promise.all([
          supabase
            .from('clients')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user?.id),
          supabase
            .from('property_units')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user?.id),
          supabase
            .from('credit_simulations')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user?.id),
          supabase
            .from('property_units')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user?.id)
            .eq('status', 'available'),
        ]);

      setStats({
        clients: clientsResult.count || 0,
        properties: propertiesResult.count || 0,
        simulations: simulationsResult.count || 0,
        availableProperties: availableResult.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Clientes',
      value: stats.clients,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Propiedades',
      value: stats.properties,
      icon: Building2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Simulaciones',
      value: stats.simulations,
      icon: Calculator,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Propiedades Disponibles',
      value: stats.availableProperties,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Bienvenido a HomeCredit - Sistema de Gestión de Créditos MiVivienda
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${card.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 text-${card.color.replace('bg-', '')}`} />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Acerca de HomeCredit
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                HomeCredit es una plataforma integral diseñada para gestionar y simular créditos
                hipotecarios del Fondo MiVivienda en Perú.
              </p>

              <div>
                <h3 className="font-semibold mb-2">Características principales:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Gestión completa de clientes y propiedades inmobiliarias</li>
                  <li>
                    Simulación detallada de créditos con método francés de amortización
                  </li>
                  <li>Cálculo de indicadores financieros: VAN, TIR, TEA y TCEA</li>
                  <li>Soporte para Bono de Techo Propio</li>
                  <li>Periodos de gracia total y parcial</li>
                  <li>Múltiples monedas (Soles y Dólares)</li>
                  <li>Cumplimiento normativo con SBS y Fondo MiVivienda</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600 pt-4 border-t">
                Sistema conforme a la Ley N° 26702 y regulaciones del Fondo MiVivienda
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
