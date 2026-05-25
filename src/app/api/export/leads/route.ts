import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { demoLeads } from '@/lib/fallback-data';

/**
 * GET /api/export/leads?format=csv&dateFrom=2024-01-01&dateTo=2024-12-31
 * Export leads as CSV or JSON
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();
    const format = request.nextUrl.searchParams.get('format') || 'csv';
    const dateFrom = request.nextUrl.searchParams.get('dateFrom');
    const dateTo = request.nextUrl.searchParams.get('dateTo');
    const status = request.nextUrl.searchParams.get('status');
    const source = request.nextUrl.searchParams.get('source');
    const useDemoData = process.env.NODE_ENV !== 'production';

    // Build query
    let leads = demoLeads;

    if (!useDemoData) {
      let query = supabase
        .from('leads')
        .select('*')
        .eq('organization_id', user.organizationId)
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);
      if (source) query = query.eq('source', source);
      if (dateFrom) query = query.gte('created_at', dateFrom);
      if (dateTo) query = query.lte('created_at', dateTo);

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      leads = data ?? [];
    } else {
      leads = demoLeads.filter((lead) => {
        if (status && lead.status !== status) return false;
        if (source && lead.source !== source) return false;
        if (dateFrom && new Date(lead.created_at) < new Date(dateFrom)) return false;
        if (dateTo && new Date(lead.created_at) > new Date(dateTo)) return false;
        return true;
      });
    }

    if (format === 'json') {
      return NextResponse.json(leads);
    }

    // Convert to CSV
    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 400 });
    }

    const headers = ['ID', 'Name', 'Phone', 'Email', 'Source', 'Status', 'Temperature', 'Budget Min', 'Budget Max', 'Location', 'Created'];
    const rows = leads.map((lead) => [
      lead.id,
      lead.full_name || '',
      lead.phone || '',
      lead.email || '',
      lead.source || '',
      lead.status || '',
      lead.temperature || '',
      lead.budget_min || '',
      lead.budget_max || '',
      lead.preferred_location || '',
      new Date(lead.created_at).toLocaleDateString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`,
        'Content-Type': 'text/csv;charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Export leads error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
