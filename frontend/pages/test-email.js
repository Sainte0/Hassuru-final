import { useState } from 'react';

export default function TestEmail() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resendStatus, setResendStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const checkResendStatus = async () => {
    setStatusLoading(true);
    setResendStatus(null);
    
    try {
      const response = await fetch('https://web-production-ffe2.up.railway.app/api/orders/resend-status');
      const data = await response.json();
      setResendStatus(data);
    } catch (error) {
      setResendStatus({ error: error.message });
    } finally {
      setStatusLoading(false);
    }
  };

  const testEmail = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('https://web-production-ffe2.up.railway.app/api/orders/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testWithHassuruEmail = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('https://web-production-ffe2.up.railway.app/api/orders/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: 'hassuru.ar@gmail.com' })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Test de Email</h1>
        
        {/* Verificar estado de Resend */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Estado de Resend</h2>
          <button
            onClick={checkResendStatus}
            disabled={statusLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors mb-2"
          >
            {statusLoading ? 'Verificando...' : 'Verificar Estado de Resend'}
          </button>
          
          {resendStatus && (
            <div className={`p-3 rounded text-sm ${resendStatus.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              <pre className="whitespace-pre-wrap">{JSON.stringify(resendStatus, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Test con email verificado */}
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Test con Email Verificado</h2>
          <p className="text-sm text-gray-600 mb-3">
            Resend solo permite enviar emails de prueba a tu email verificado (hassuru.ar@gmail.com)
          </p>
          <button
            onClick={testWithHassuruEmail}
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            {loading ? 'Enviando...' : 'Probar con hassuru.ar@gmail.com'}
          </button>
        </div>
        
        <form onSubmit={testEmail} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email para probar (solo funcionará con dominio verificado):
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar Email de Prueba'}
          </button>
        </form>
        
        {result && (
          <div className={`mt-4 p-4 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <h3 className="font-semibold mb-2">
              {result.success ? '✅ Éxito' : '❌ Error'}
            </h3>
            <p>{result.message || result.error}</p>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Problema identificado:</strong></p>
          <p className="text-red-600 font-semibold">
            Resend solo permite enviar emails de prueba a tu email verificado (hassuru.ar@gmail.com)
          </p>
          <p><strong>Solución:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Verifica un dominio en <a href="https://resend.com/domains" target="_blank" className="text-blue-600 underline">resend.com/domains</a></li>
            <li>O usa tu email verificado para pruebas</li>
            <li>Una vez verificado el dominio, podrás enviar a cualquier email</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 