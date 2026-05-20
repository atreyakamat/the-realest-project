/**
 * CSV Export Utilities
 * Converts data arrays to CSV format for download
 */

export function convertToCSV(data: Record<string, unknown>[], headers?: string[]): string {
  if (data.length === 0) return '';

  // Use provided headers or extract from first object
  const cols = headers || Object.keys(data[0]);

  // Create CSV header row
  const csvHeader = cols.map((col) => `"${col}"`).join(',');

  // Create CSV data rows
  const csvRows = data.map((row) =>
    cols
      .map((col) => {
        const value = row[col] ?? '';
        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        const escapedValue = String(value).replace(/"/g, '""');
        return `"${escapedValue}"`;
      })
      .join(','),
  );

  return [csvHeader, ...csvRows].join('\n');
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportLeadsToCSV(
  leads: Array<{
    id: string;
    full_name: string;
    phone: string;
    email: string;
    source: string;
    status: string;
    temperature: string;
    budget_min?: number;
    budget_max?: number;
    preferred_location: string;
    created_at: string;
  }>,
  filename = 'leads-export.csv',
) {
  const headers = [
    'ID',
    'Name',
    'Phone',
    'Email',
    'Source',
    'Status',
    'Temperature',
    'Budget Min',
    'Budget Max',
    'Location',
    'Created Date',
  ];

  const data = leads.map((lead) => ({
    ID: lead.id,
    Name: lead.full_name,
    Phone: lead.phone,
    Email: lead.email,
    Source: lead.source,
    Status: lead.status,
    Temperature: lead.temperature,
    'Budget Min': lead.budget_min || '',
    'Budget Max': lead.budget_max || '',
    Location: lead.preferred_location,
    'Created Date': new Date(lead.created_at).toLocaleDateString(),
  }));

  const csv = convertToCSV(data, headers);
  downloadCSV(csv, filename);
}

export function exportPropertiesToCSV(
  properties: Array<{
    id: string;
    title: string;
    location: string;
    price: number;
    property_type: string;
    bedrooms: number;
    bathrooms: number;
    availability_status: string;
    created_at: string;
  }>,
  filename = 'properties-export.csv',
) {
  const headers = ['ID', 'Title', 'Location', 'Price', 'Type', 'Bedrooms', 'Bathrooms', 'Status', 'Created Date'];

  const data = properties.map((prop) => ({
    ID: prop.id,
    Title: prop.title,
    Location: prop.location,
    Price: prop.price,
    Type: prop.property_type,
    Bedrooms: prop.bedrooms,
    Bathrooms: prop.bathrooms,
    Status: prop.availability_status,
    'Created Date': new Date(prop.created_at).toLocaleDateString(),
  }));

  const csv = convertToCSV(data, headers);
  downloadCSV(csv, filename);
}

export function exportAttendanceToCSV(
  attendance: Array<{
    id: string;
    user_id: string;
    full_name: string;
    check_in_time: string;
    check_out_time?: string;
    status: string;
    notes: string;
  }>,
  filename = 'attendance-export.csv',
) {
  const headers = ['ID', 'Employee', 'Check In', 'Check Out', 'Status', 'Notes'];

  const data = attendance.map((record) => ({
    ID: record.id,
    Employee: record.full_name,
    'Check In': new Date(record.check_in_time).toLocaleString(),
    'Check Out': record.check_out_time ? new Date(record.check_out_time).toLocaleString() : 'N/A',
    Status: record.status,
    Notes: record.notes,
  }));

  const csv = convertToCSV(data, headers);
  downloadCSV(csv, filename);
}

export function exportCallsToCSV(
  calls: Array<{
    id: string;
    lead_name: string;
    agent_name: string;
    duration: number;
    status: string;
    outcome: string;
    started_at: string;
  }>,
  filename = 'calls-export.csv',
) {
  const headers = ['ID', 'Lead', 'Agent', 'Duration (s)', 'Status', 'Outcome', 'Date'];

  const data = calls.map((call) => ({
    ID: call.id,
    Lead: call.lead_name,
    Agent: call.agent_name,
    'Duration (s)': call.duration,
    Status: call.status,
    Outcome: call.outcome,
    Date: new Date(call.started_at).toLocaleString(),
  }));

  const csv = convertToCSV(data, headers);
  downloadCSV(csv, filename);
}
