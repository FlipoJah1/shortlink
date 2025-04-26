const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const LINKS_FILE = './links.json';

app.use(cors());
app.use(express.json());

// Initialisation
if (!fs.existsSync(LINKS_FILE)) {
  fs.writeFileSync(LINKS_FILE, '{}');
}

// Fonctions utilitaires
function readLinks() {
  return JSON.parse(fs.readFileSync(LINKS_FILE));
}

function saveLinks(links) {
  fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));
}

// Endpoint pour créer un shortlink
app.post('/shorten', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL manquante.' });

  const code = crypto.randomBytes(3).toString('hex');
  const links = readLinks();
  links[code] = url;  // On sauvegarde l'URL EXACTE (avec paramètres si besoin)
  saveLinks(links);

  const baseUrl = process.env.BASE_URL || 'https://instantmedia-share.onrender.com';
  res.json({ shortUrl: `${baseUrl}/${code}` });
});

// Endpoint pour rediriger en gardant tous les paramètres
app.get('/:code', (req, res) => {
  const code = req.params.code;
  const links = readLinks();
  const target = links[code];

  if (target) {
    console.log(`🔗 Redirection vers : ${target}`);
    return res.redirect(target);
  }

  res.status(404).send('Lien introuvable.');
});

// Lancement serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur Shortlink instantmedia-share actif sur port ${PORT}`);
});
