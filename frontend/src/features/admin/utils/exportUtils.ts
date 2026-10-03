import * as XLSX from 'xlsx';

export function exportToExcel(
  data: any[],
  filename: string,
  columns?: { key: string; label: string }[],
  sheetName: string = 'Sheet1'
) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Format data according to specified columns or auto-detect
  let formattedData: Record<string, any>[] = [];

  if (columns && columns.length > 0) {
    formattedData = data.map((item) => {
      const row: Record<string, any> = {};
      columns.forEach((col) => {
        let val = item[col.key];
        if (val === null || val === undefined) {
          val = '';
        } else if (Array.isArray(val)) {
          val = val.join(', ');
        } else if (typeof val === 'object') {
          val = JSON.stringify(val);
        }
        row[col.label] = val;
      });
      return row;
    });
  } else {
    formattedData = data.map((item) => {
      const row: Record<string, any> = {};
      Object.keys(item).forEach((k) => {
        if (k.startsWith('avatar') && typeof item[k] === 'string' && item[k].length > 100) return;
        let val = item[k];
        if (val === null || val === undefined) {
          val = '';
        } else if (Array.isArray(val)) {
          val = val.join(', ');
        } else if (typeof val === 'object') {
          val = JSON.stringify(val);
        }
        const label = k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1');
        row[label] = val;
      });
      return row;
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Auto-calculate column widths
  const colWidths = Object.keys(formattedData[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...formattedData.map((row) =>
        row[key] !== undefined && row[key] !== null ? String(row[key]).length : 0
      )
    );
    return { wch: Math.min(Math.max(maxLen + 3, 10), 60) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToCSV(data: any[], filename: string, columns?: { key: string; label: string }[]) {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // If no columns specified, use all keys from the first object
  if (!columns) {
    const keys = Object.keys(data[0]);
    columns = keys.map(key => ({ key, label: key.charAt(0).toUpperCase() + key.slice(1) }));
  }

  // Create header row
  const header = columns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(',');

  // Create data rows
  const rows = data.map(item => {
    return columns!.map(col => {
      let val = item[col.key];
      
      // Handle null/undefined
      if (val === null || val === undefined) {
        val = '';
      }
      // Handle arrays (e.g. roles or categories)
      else if (Array.isArray(val)) {
        val = val.join('; ');
      }
      // Handle objects
      else if (typeof val === 'object') {
        val = JSON.stringify(val);
      }
      // Convert everything else to string
      else {
        val = String(val);
      }
      
      // Escape quotes and wrap in quotes
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = [header, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link and trigger download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
