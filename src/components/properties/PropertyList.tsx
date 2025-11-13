import { useEffect, useState } from 'react';
import { mockApi } from '../../lib/mockApi';
import { useAuth } from '../../contexts/AuthContext';
import { PropertyUnit } from '../../types/database';
import { Home, MapPin, Ruler } from 'lucide-react';

export function PropertyList() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<PropertyUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, [user]);

  const loadProperties = async () => {
    try {
      const data = await mockApi.getProperties(user?.id);
      setProperties(data);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      apartment: 'Departamento',
      house: 'Casa',
      duplex: 'Dúplex',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      available: 'bg-green-100 text-green-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-gray-100 text-gray-800',
    };

    const labels: Record<string, string> = {
      available: 'Disponible',
      reserved: 'Reservado',
      sold: 'Vendido',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay propiedades registradas</h3>
        <p className="text-gray-500">Comienza agregando tu primera propiedad</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <div
          key={property.id}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 h-32 flex items-center justify-center">
            <Home className="w-16 h-16 text-white opacity-50" />
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{property.property_name}</h3>
                <p className="text-sm text-gray-500">{property.unit_number}</p>
              </div>
              {getStatusBadge(property.status)}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">
                  {property.address}, {property.district}, {property.province}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Ruler className="w-4 h-4" />
                <span>{property.total_area} m²</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Precio</p>
                  <p className="text-lg font-bold text-gray-900">
                    {property.currency === 'PEN' ? 'S/' : '$'}{' '}
                    {property.price.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Tipo</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getPropertyTypeLabel(property.property_type)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
