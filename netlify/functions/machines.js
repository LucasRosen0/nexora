const fs = require('fs');
const path = require('path');

function findDataFile() {
  const possiblePaths = [
    path.join(process.cwd(), 'data', 'mock-data.json'),
    path.join(__dirname, '..', '..', 'data', 'mock-data.json'),
    path.join(__dirname, '..', '..', '..', 'data', 'mock-data.json')
  ];

  return possiblePaths.find((filePath) => fs.existsSync(filePath));
}

function loadMockData() {
  const dataFile = findDataFile();

  if (!dataFile) {
    return {
      generatedAt: null,
      machines: [],
      software: []
    };
  }

  const raw = fs.readFileSync(dataFile, 'utf8');
  const parsed = JSON.parse(raw);

  return {
    generatedAt: parsed.generated_at || new Date().toISOString(),
    machines: Array.isArray(parsed.machines) ? parsed.machines : [],
    software: Array.isArray(parsed.software) ? parsed.software : []
  };
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

exports.handler = async (event) => {
  try {
    const cache = loadMockData();

    let { search = '', unit = '', os = '', limit, page } = (event.queryStringParameters || {});

    search = String(search).trim().toLowerCase();
    unit = String(unit).trim();
    os = String(os).trim();

    let rows = cache.machines;

    if (search) {
      rows = rows.filter((m) => {
        const blob = [
          m.computador, m.usuario_principal, m.unidade, m.setor,
          m.fabricante, m.modelo, m.sistema_operacional, m.ip
        ].filter(Boolean).join(' ').toLowerCase();
        return blob.includes(search);
      });
    }

    if (unit && unit.toLowerCase() !== 'all') {
      rows = rows.filter(m => String(m.unidade || '').toUpperCase() === unit.toUpperCase());
    }

    if (os && os.toLowerCase() !== 'all') {
      rows = rows.filter(m => String(m.sistema_operacional || '').toLowerCase().includes(os.toLowerCase()));
    }

    const result = paginate(rows, Number(page), Number(limit));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ ok: false, error: error.message })
    };
  }
};