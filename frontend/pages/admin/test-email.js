import { useState } from 'react';
import Layout from '../../components/Layout';

export default function TestEmail() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [envInfo, setEnvInfo] = useState(null);
  const [envLoading, setEnvLoading] = useState(false);

  const testEmail = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('https://web-production-ffe2.up.railway.app/api/orders/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkEnvironment = async () => {
    setEnvLoading(true);
    setEnvInfo(null);
    
    try {
      const response = await fetch('https://web-production-ffe2.up.railway.app/api/orders/env-check');
      const data = await response.json();
      setEnvInfo(data);
    } catch (error) {
      setEnvInfo({ success: false, error: error.message });
    } finally {
      setEnvLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Test de Configuración de Email</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Verificación de Variables de Entorno */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Variables de Entorno</h2>
            <p className="text-gray-600 mb-4">
              Verifica que las variables de entorno estén configuradas correctamente en Railway.
            </p>
            
            <button
              onClick={checkEnvironment}
              disabled={envLoading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors mb-4"
            >
              {envLoading ? 'Verificando...' : 'Verificar Variables de Entorno'}
            </button>
            
            {envInfo && (
              <div className={`p-4 rounded ${envInfo.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <h3 className="font-semibold mb-2">
                  {envInfo.success ? '✅ Variables de Entorno' : '❌ Error'}
                </h3>
                {envInfo.success && envInfo.environment && (
                  <div className="space-y-2 text-sm">
                    {Object.entries(envInfo.environment).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium">{key}:</span>
                        <span className={value.includes('✅') ? 'text-green-700' : value.includes('❌') ? 'text-red-700' : 'text-gray-700'}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {envInfo.error && <p className="text-red-700">{envInfo.error}</p>}
              </div>
            )}
          </div>

          {/* Test de Email */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test de Email</h2>
            <p className="text-gray-600 mb-4">
              Prueba si la configuración de email está funcionando correctamente.
            </p>
            
            <button
              onClick={testEmail}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors mb-4"
            >
              {loading ? 'Probando...' : 'Probar Configuración de Email'}
            </button>
            
            {result && (
              <div className={`p-4 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <h3 className="font-semibold mb-2">
                  {result.success ? '✅ Éxito' : '❌ Error'}
                </h3>
                <p>{result.message || result.error}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Información Importante:</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Verifica que la variable RESEND_API_KEY esté configurada en Railway</li>
            <li>• Verifica que la variable HASSURU_EMAIL esté configurada (opcional)</li>
            <li>• Los emails se envían desde onboarding@resend.dev (dominio de prueba)</li>
            <li>• Para usar tu propio dominio, debes verificarlo en Resend</li>
            <li>• Si el test falla, revisa los logs del servidor en Railway</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
} 