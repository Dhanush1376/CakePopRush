export function exportToCSV(data: any[], filename: string, columns?: { key: string, label: string }[]) {
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
