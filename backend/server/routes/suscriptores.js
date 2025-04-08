const express = require('express');
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.post("/", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ mensaje: "Email es requerido" });
  }
  const filePath = path.join(__dirname, "suscriptores.json");
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error al leer el archivo sd:", err);
      return res.status(500).json({ mensaje: "Error al leer el archivo" });
    }
    let suscriptores = [];
    try {
      suscriptores = JSON.parse(data || "[]");
    } catch (parseError) {
      console.error("Error al parsear el archivo:", parseError);
      return res.status(500).json({ mensaje: "Error al procesar el archivo" });
    }
    if (!suscriptores.includes(email)) {
      suscriptores.push(email);
      fs.writeFile(filePath, JSON.stringify(suscriptores), (err) => {
        if (err) {
          console.error("Error al guardar el archivo:", err);
          return res.status(500).json({ mensaje: "Error al guardar el email" });
        }
        res.status(200).json({ mensaje: "Suscripción exitosa" });
      });
    } else {
      res.status(400).json({ mensaje: "Este email ya está suscrito" });
    }
  });
});

router.get("/", (req, res) => {
  const filePath = path.join(__dirname, "suscriptores.json");
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error al leer el archivo:", err);
      return res.status(500).json({ mensaje: "Error al leer el archivo" });
    }
    let suscriptores = [];
    try {
      suscriptores = JSON.parse(data || "[]");
    } catch (parseError) {
      console.error("Error al parsear el archivo:", parseError);
      return res.status(500).json({ mensaje: "Error al procesar el archivo" });
    }
    res.status(200).json(suscriptores);
  });
});

router.all("/", (req, res) => {
  res.setHeader("Allow", ["POST"]);
  res.status(405).send(`Método ${req.method} no permitido`);
});

module.exports = router;
