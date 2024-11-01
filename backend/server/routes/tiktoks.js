const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const TiktokLink = require('../models/TiktokLink');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tiktokLinks = await TiktokLink.find();
    res.status(200).json(tiktokLinks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

router.put('/:id', authMiddleware, async (req, res) => {
  const { link } = req.body;
  if (!link || !isValidUrl(link)) {
    return res.status(400).json({ error: 'El enlace de TikTok no es válido.' });
  }
  try {
    const tiktokActualizado = await TiktokLink.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tiktokActualizado) {
      return res.status(404).json({ error: 'Enlace de TikTok no encontrado.' });
    }
    res.status(200).json(tiktokActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const tiktokCount = await TiktokLink.countDocuments();
    if (tiktokCount >= 3) {
      return res.status(400).json({ error: 'Ya hay 3 enlaces de TikTok, no puedes agregar más.' });
    }
    const nuevoTiktok = new TiktokLink(req.body);
    const tiktokGuardado = await nuevoTiktok.save();
    res.status(201).json(tiktokGuardado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const tiktokEliminado = await TiktokLink.findByIdAndDelete(req.params.id);
    if (!tiktokEliminado) {
      return res.status(404).json({ error: 'Enlace de TikTok no encontrado.' });
    }
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
