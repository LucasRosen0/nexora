/**
 * Nexora — Local API
 * Serves synthetic device data and the built SPA.
 * Source of truth: data/mock-data.json
 */
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'mock-data.json');
const DIST_DIR = path.join(ROOT, 'dist');

const cache = {
  generatedAt: null,
  machines: [],
  software: []
};

function loadMockData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      console.warn(`[nexora] mock-data.json not found at ${DATA_FILE}`);
      return;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    cache.generatedAt = parsed.generated_at || new Date().toISOString();
    cache.machines = Array.isArray(parsed.machines) ? parsed.machines : [];
    cache.software = Array.isArray(parsed.software) ? parsed.software : [];
    console.log(`[nexora] loaded ${cache.machines.length} machines / ${cache.software.length} software entries`);
  } catch (err) {
    console.error('[nexora] failed to load mock-data.json:', err.message);
  }
}

function paginate(items, page = 1, limit = 50) {
  const safeLimit = Math.min(5000, Math.max(1, Number.parseInt(limit, 10) || 50));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const safePage = Math.min(Math.max(1, Number.parseInt(page, 10) || 1), totalPages);
  const start = (safePage - 1) * safeLimit;
  return {
    data: items.slice(start, start + safeLimit),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages
  };
}

// ---------- API ----------

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    source: 'local-mock',
    generatedAt: cache.generatedAt,
    machines: cache.machines.length,
    software: cache.software.length
  });
});

app.get('/api/machines', (req, res) => {
  const { search = '', unit = '', os = '', limit, page } = req.query;
  let rows = cache.machines;

  const term = String(search).trim().toLowerCase();
  if (term) {
    rows = rows.filter((m) => {
      const blob = [
        m.computador, m.usuario_principal, m.unidade, m.setor,
        m.fabricante, m.modelo, m.sistema_operacional, m.ip
      ].filter(Boolean).join(' ').toLowerCase();
      return blob.includes(term);
    });
  }

  if (unit && unit !== 'all') {
    rows = rows.filter((m) => String(m.unidade || '').toUpperCase() === String(unit).toUpperCase());
  }

  if (os && os !== 'all') {
    const wanted = String(os).toLowerCase();
    rows = rows.filter((m) => String(m.sistema_operacional || '').toLowerCase().includes(wanted));
  }

  const result = paginate(rows, page, limit || 5000);
  res.json(result);
});

app.get('/api/software', (req, res) => {
  const { search = '', limit, page } = req.query;
  let rows = cache.software;
  const term = String(search).trim().toLowerCase();
  if (term) {
    rows = rows.filter((s) => {
      const blob = [s.nome_software, s.fabricante, s.categoria].filter(Boolean).join(' ').toLowerCase();
      return blob.includes(term);
    });
  }
  res.json(paginate(rows, page, limit || 1000));
});

// ---------- Static SPA ----------

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  }));
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`<!doctype html><meta charset="utf-8"><title>Nexora API</title>
      <style>body{font:14px ui-sans-serif,system-ui;background:#070812;color:#f5f7ff;padding:40px;line-height:1.6}
      code{background:#1a1f3a;padding:2px 6px;border-radius:4px}</style>
      <h1>Nexora API</h1>
      <p>Backend ativo. Para a interface, rode <code>npm run dev</code> e acesse <a style="color:#7aa2ff" href="http://localhost:5173">http://localhost:5173</a>.</p>
      <p>Para produção, rode <code>npm run build</code> e reinicie este servidor.</p>
      <ul>
        <li><a style="color:#7aa2ff" href="/api/health">/api/health</a></li>
        <li><a style="color:#7aa2ff" href="/api/machines?limit=5">/api/machines</a></li>
        <li><a style="color:#7aa2ff" href="/api/software?limit=5">/api/software</a></li>
      </ul>`);
  });
}

// ---------- Boot ----------

loadMockData();
fs.watchFile(DATA_FILE, { interval: 2000 }, () => loadMockData());

const PORT = Number.parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, () => {
  console.log(`[nexora] API running on http://localhost:${PORT}`);
});
