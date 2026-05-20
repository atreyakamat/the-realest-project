/**
 * PDF Export Utilities
 * Generates PDF reports using HTML conversion
 */

export interface DashboardMetrics {
  newLeadsToday: number;
  callsToday: number;
  followUpsDueToday: number;
  hotLeads: number;
  availableInventory: number;
  teamAttendance: number;
}

export interface ReportData {
  title: string;
  generatedAt: string;
  metrics?: DashboardMetrics;
  leads?: Array<Record<string, unknown>>;
  properties?: Array<Record<string, unknown>>;
  calls?: Array<Record<string, unknown>>;
  attendance?: Array<Record<string, unknown>>;
}

/**
 * Generate HTML for PDF content
 */
export function generateDashboardHTML(data: ReportData): string {
  const metrics = data.metrics;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${data.title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #1e293b;
          }
          .header {
            margin-bottom: 30px;
            border-bottom: 2px solid #10b981;
            padding-bottom: 20px;
          }
          h1 {
            margin: 0;
            font-size: 28px;
            color: #0f172a;
          }
          .timestamp {
            color: #64748b;
            font-size: 12px;
            margin-top: 5px;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .metric-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            background: #f8fafc;
          }
          .metric-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 8px;
            letter-spacing: 0.05em;
          }
          .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #10b981;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            padding: 10px;
            text-align: left;
            font-weight: 600;
            color: #0f172a;
          }
          td {
            border: 1px solid #e2e8f0;
            padding: 10px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            color: #64748b;
            text-align: center;
          }
          @media print {
            body { margin: 0; padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>EstateFlow CRM - ${data.title}</h1>
          <div class="timestamp">Generated on ${data.generatedAt}</div>
        </div>

        ${
          metrics
            ? `
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-label">New Leads Today</div>
              <div class="metric-value">${metrics.newLeadsToday}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Calls Made</div>
              <div class="metric-value">${metrics.callsToday}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Follow-ups Due</div>
              <div class="metric-value">${metrics.followUpsDueToday}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Hot Leads</div>
              <div class="metric-value">${metrics.hotLeads}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Available Inventory</div>
              <div class="metric-value">${metrics.availableInventory}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Team Checked In</div>
              <div class="metric-value">${metrics.teamAttendance}</div>
            </div>
          </div>
        `
            : ''
        }

        <div class="footer">
          <p>This is an automated report from EstateFlow CRM. For support, contact your administrator.</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Download HTML as PDF using print dialog
 * (In production, consider using a library like html2pdf or pdfkit)
 */
export function downloadPDF(htmlContent: string) {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.contentWindow?.print();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }
}

/**
 * Generate and download dashboard report as PDF
 */
export function exportDashboardToPDF(metrics: DashboardMetrics) {
  const html = generateDashboardHTML({
    title: 'Dashboard Report',
    generatedAt: new Date().toLocaleString(),
    metrics,
  });

  downloadPDF(html);
}
