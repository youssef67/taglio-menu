// server.js
import express from 'express'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const app = express()
app.use(cors())
app.use(express.json())

// 1️⃣ Servir le dossier 'public' (contenant index.html, login.html, admin.html, logo.svg, etc.)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
app.use(express.static(join(__dirname, 'public')))

// Initialise lowdb sur le fichier menus.json
const adapter = new JSONFile(join(__dirname, 'menus.json'))
const defaultData = { midi: [], boissons: [], cocktails: [] }
const db = new Low(adapter, defaultData)
await db.read()

// Route pour récupérer tous les menus
app.get('/api/menus', async (req, res) => {
  await db.read()
  res.json(db.data)
})

// Route pour mettre à jour une section de menu
app.put('/api/menus/:section', async (req, res) => {
  const section = req.params.section;
  if (section === 'vin_moment') {
    db.data.vin_moment = req.body.vin_moment || '';
    await db.write();
    return res.sendStatus(204);
  }
  if (section === 'cocktails') {
    const { cocktails = [], mocktails = [] } = req.body;
    db.data.cocktails = { cocktails, mocktails };
    await db.write();
    return res.sendStatus(204);
  }
  const newItems = req.body; // [{ label, prix }, ...]
  if (!db.data[section]) return res.status(404).send('Section inconnue');
  db.data[section] = newItems;
  await db.write();
  res.sendStatus(204);
});

app.listen(3000, () =>
  console.log('Serveur démarré sur http://localhost:3000')
)