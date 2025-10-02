import { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Home } from 'lucide-react';

export function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Home className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">HomeCredit</h1>
          </div>

          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Gestión de Créditos Hipotecarios
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Sistema integral para simular y gestionar créditos hipotecarios del Fondo MiVivienda con Bono de Techo Propio.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p className="text-gray-700">Simulación detallada de planes de pago</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p className="text-gray-700">Cálculo de indicadores financieros (VAN, TIR, TEA, TCEA)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p className="text-gray-700">Gestión de clientes y propiedades</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p className="text-gray-700">Cumplimiento normativo SBS y Fondo MiVivienda</p>
            </div>
          </div>
        </div>

        <div>
          {showLogin ? (
            <LoginForm onToggleForm={() => setShowLogin(false)} />
          ) : (
            <RegisterForm onToggleForm={() => setShowLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
