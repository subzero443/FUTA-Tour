import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, 'data', 'landmarks.json');
const PORT = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(s => s.trim()).filter(Boolean);
const app = express();
const allowedOrigin = (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin));
app.disable('x-powered-by');
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '12kb' }));
app.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.set('X-Content-Type-Options', 'nosniff');
  next();
});

async function getLandmarks() { return JSON.parse(await readFile(DATA_PATH, 'utf8')); }
async function saveLandmarks(data) {
  const temporary = `${DATA_PATH}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(data, null, 2) + '\n', 'utf8');
  await rename(temporary, DATA_PATH);
}
const validCoordinate = (lat, lng) => typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
// Tight pilot-campus bounding box: reject coordinates outside FUTA's vicinity.
const nearFuta = (lat, lng) => lat >= 7.27 && lat <= 7.33 && lng >= 5.11 && lng <= 5.18;
const cleanName = v => typeof v === 'string' ? v.trim().slice(0, 45) : '';
const adminGuard = (req, res, next) => {
  const expected = process.env.LANDMARK_ADMIN_TOKEN;
  const provided = req.get('x-admin-token') || '';
  if (!expected || !provided) return res.status(403).json({ error: 'Admin access is disabled or unauthorized' });
  const a = Buffer.from(expected), b = Buffer.from(provided);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return res.status(403).json({ error: 'Unauthorized' });
  next();
};
app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'FUTA Tour API' }));
app.get('/api/landmarks', async (_req, res) => {
  try { res.json(await getLandmarks()); } catch { res.status(500).json({ error: 'Cannot load landmarks' }); }
});
app.post('/api/admin/landmarks', adminGuard, async (req, res) => {
  const { name, category, lat, lng, description = '' } = req.body || {};
  if (!cleanName(name) || !['Academic', 'Gate', 'Hostel', 'Services'].includes(category) || !validCoordinate(lat, lng) || !nearFuta(lat, lng) || typeof description !== 'string') {
    return res.status(400).json({ error: 'Invalid landmark data' });
  }
  try {
    const landmarks = await getLandmarks();
    const item = { id: randomUUID(), name: cleanName(name), category, lat, lng, description: description.trim().slice(0, 220), featured: false };
    landmarks.push(item);
    await saveLandmarks(landmarks);
    res.status(201).json(item);
  } catch { res.status(500).json({ error: 'Cannot save landmark' }); }
});
app.delete('/api/admin/landmarks/:id', adminGuard, async (req, res) => {
  try {
    const landmarks = await getLandmarks();
    const remaining = landmarks.filter(item => item.id !== req.params.id);
    if (remaining.length === landmarks.length) return res.status(404).json({ error: 'Not found' });
    await saveLandmarks(remaining);
    res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Cannot delete landmark' }); }
});

app.listen(PORT, '0.0.0.0', () => console.log(`FUTA Tour API listening at http://localhost:${PORT}`));
