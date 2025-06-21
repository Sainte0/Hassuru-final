import { useState } from 'react';

export default function TestEmail() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Test de Email</h1>
        
        <form onSubmit={testEmail} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email para probar:
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
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors"
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
          <p><strong>Instrucciones:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Ingresa tu email real</li>
            <li>Haz clic en "Enviar Email de Prueba"</li>
            <li>Revisa tu bandeja de entrada</li>
            <li>Si no llega, revisa la carpeta de spam</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 