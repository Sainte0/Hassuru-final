import axios from 'axios';

export default async function handler(req, res) {
  const backendUrl = process.env.BACKEND_URL ;
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
      const { id } = req.query;
      const token = req.headers.authorization;
      const response = await axios.put(`${backendUrl}/${id}/estado`, req.body, { headers: { Authorization: token } });
      return res.status(response.status).json(response.data);
    }
    res.setHeader('Allow', ['POST', 'GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
} 