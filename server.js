const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const LINKS_FILE = './links.json';

app.use(cors());
app.use(express.json());

// Chargement ou création du fichier links.json
if (!fs.existsSync(LINKS_FILE)) {
  fs.writeFileSync(LINKS_FILE, '{}');
}

// Fonction pour lire tous les liens
function readLinks() {
  const data = fs.readFileSync(LINKS_FILE);
  return JSON.parse(data);
}

// Fonction pour sauvegarder tous les liens
function saveLinks(links) {
  fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));
}

// Route POST pour créer un shortlink
app.post('/shorten', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL manquante.' });
  }

  const code = crypto.randomBytes(3).toString('hex'); // Exemple : 6 caractères
  const links = readLinks();
  links[code] = url;
  saveLinks(links);

  const baseUrl = process.env.BASE_URL || `https://ton-shortlink.onrender.com`;
  const shortUrl = `${baseUrl}/${code}`;

  res.json({ shortUrl });
});
// Route GET pour rediriger vers l'URL originale
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const links = readLinks();

  const originalUrl = links[code];
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).send('Lien introuvable.');
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur ShortLink en ligne sur le port ${PORT}`);
});
