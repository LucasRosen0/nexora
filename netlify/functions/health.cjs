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

exports.handler = async () => {
  try {
    const cache = loadMockData();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: true,
        source: 'netlify-mock',
        generatedAt: cache.generatedAt,
        machines: cache.machines.length,
        software: cache.software.length
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: error.message
      })
    };
  }
};