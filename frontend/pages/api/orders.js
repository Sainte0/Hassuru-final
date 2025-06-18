import axios from 'axios';

// Permite que BACKEND_URL sea solo la base, sin /api/orders
const BACKEND_BASE = process.env.BACKEND_URL || 'http://localhost:3001/api';

export default async function handler(req, res) {
  // Determina la ruta final según el método
  let backendUrl = BACKEND_BASE;
  if (req.method === 'POST' || req.method === 'GET') {
    backendUrl += '/orders';
  } else if (req.method === 'PUT') {
    const { id } = req.query;
    backendUrl += `/orders/${id}/estado`;
  }
  try {
    if (req.method === 'POST') {
      console.log('URL DEL BACKEND:', backendUrl);
      console.log('BODY ENVIADO AL BACKEND:', req.body);
      const response = await axios.post(backendUrl, req.body, {
        headers: { 'Content-Type': 'application/json' }
      });
      return res.status(response.status).json(response.data);
    }
    if (req.method === 'GET') {
      const token = req.headers.authorization;
      const response = await axios.get(backendUrl, { headers: { Authorization: token } });
      return res.status(response.status).json(response.data);
    }
    if (req.method === 'PUT') {
      const token = req.headers.authorization;
      const response = await axios.put(backendUrl, req.body, { headers: { Authorization: token } });
      return res.status(response.status).json(response.data);
    }
    res.setHeader('Allow', ['POST', 'GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
} 