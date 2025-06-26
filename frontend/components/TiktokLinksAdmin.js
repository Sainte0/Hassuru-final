import React, { useEffect, useState } from 'react';

const URL = process.env.NEXT_PUBLIC_URL;

const TiktokLinksAdmin = () => {
  const [tiktoks, setTiktoks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editIndex, setEditIndex] = useState(null);
  const [newLink, setNewLink] = useState('');
  const [error, setError] = useState(null);

  const fetchTiktokLinks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${URL}/api/tiktoks`);
      if (!response.ok) {
        throw new Error("Error al obtener los enlaces de TikTok");
      }
      const data = await response.json();
      setTiktoks(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiktokLinks();
  }, []);

  const handleEdit = (index) => {
    setEditIndex(index);
    setNewLink(tiktoks[index].link);
  };

  const handleCancel = () => {
    setEditIndex(null);
    setNewLink('');
  };

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${URL}/api/tiktoks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ link: newLink }),
      });
      if (!response.ok) {
        throw new Error("Error al actualizar el enlace de TikTok");
      }
      const updatedTiktok = await response.json();
      const updatedTiktoks = tiktoks.map((tiktok) =>
        tiktok._id === id ? updatedTiktok : tiktok
      );
      setTiktoks(updatedTiktoks);
      setEditIndex(null);
      setNewLink('');
    } catch (error) {
      console.error("Error al actualizar el enlace", error);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-dark-card rounded-lg shadow-md border border-gray-200 dark:border-dark-border">
      <h2 className="mb-6 text-xl font-semibold text-black dark:text-dark-text">Enlaces de TikTok</h2>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Cargando enlaces...</p>
      ) : error ? (
        <p className="text-red-500 dark:text-red-400">{error}</p>
      ) : (
        <ul className="space-y-4">
          {tiktoks.map((tiktok, index) => (
            <li key={tiktok._id} className="flex flex-col items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors sm:flex-row">
              {editIndex === index ? (
                <input
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 sm:w-60"
                  placeholder="Nuevo enlace"
                />
              ) : (
                <span className="w-full max-w-xs truncate text-gray-900 dark:text-gray-100 sm:w-auto" title={tiktok.link}>
                  {tiktok.link}
                </span>
              )}
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                {editIndex === index ? (
                  <>
                    <button
                      onClick={() => handleUpdate(tiktok._id)}
                      className="px-3 py-1 text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
                      aria-label="Guardar enlace de TikTok"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                      aria-label="Cancelar edición de enlace"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEdit(index)}
                    className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                    aria-label="Editar enlace de TikTok"
                  >
                    Editar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TiktokLinksAdmin;
