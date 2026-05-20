'use client';

import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui';
import { useState } from 'react';

interface ExportButtonProps {
  dataType: 'leads' | 'properties' | 'attendance' | 'calls' | 'followups';
  filters?: Record<string, string>;
  format?: 'csv' | 'pdf';
}

export function ExportButton({ dataType, filters = {}, format = 'csv' }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);

      // Build query string
      const params = new URLSearchParams();
      params.append('format', format);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const url = `/api/export/${dataType}?${params.toString()}`;

      // For CSV, download directly
      if (format === 'csv') {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Export failed');

        const blob = await response.blob();
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `${dataType}-export.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const label = format === 'csv' ? 'Export CSV' : 'Export PDF';

  return (
    <Button
      onClick={handleExport}
      disabled={loading}
      className="gap-2 text-sm bg-white/10 text-white shadow-none hover:bg-white/15"
    >
      {loading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-white" />
          Exporting...
        </>
      ) : format === 'pdf' ? (
        <>
          <FileText className="h-4 w-4" />
          {label}
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
