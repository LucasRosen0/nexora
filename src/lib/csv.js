import Papa from 'papaparse';

export function exportToCsv(filename, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return false;
  }
  const csv = Papa.unparse(rows, {
    quotes: true,
    delimiter: ',',
    newline: '\r\n'
  });
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
  return true;
}

export function importFromCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors && results.errors.length) {
          reject(new Error(results.errors[0].message));
          return;
        }
        resolve(results.data);
      },
      error: (err) => reject(err)
    });
  });
}
