import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { demoProperties } from '@/lib/fallback-data';

/**
 * GET /api/export/properties?format=csv
 * Export properties as CSV or JSON
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();
    const format = request.nextUrl.searchParams.get('format') || 'csv';
    const status = request.nextUrl.searchParams.get('status');
    const type = request.nextUrl.searchParams.get('type');
    const useDemoData = process.env.NODE_ENV !== 'production';

    let properties = demoProperties;

    if (!useDemoData) {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('organization_id', user.organizationId)
        .order('created_at', { ascending: false });

      if (status) query = query.eq('availability_status', status);
      if (type) query = query.eq('property_type', type);

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      properties = data ?? [];
    } else {
      properties = demoProperties.filter((property) => {
        if (status && property.availability_status !== status) return false;
        if (type && property.property_type !== type) return false;
        return true;
      });
    }

    if (format === 'json') {
      return NextResponse.json(properties);
    }

    if (!properties || properties.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 400 });
    }

    const headers = ['ID', 'Title', 'Location', 'Address', 'Price', 'Type', 'Bedrooms', 'Bathrooms', 'Status', 'Created'];
    const rows = properties.map((prop) => [
      prop.id,
      prop.title || '',
      prop.location || '',
      prop.address || '',
      prop.price || '',
      prop.property_type || '',
      prop.bedrooms || '',
      prop.bathrooms || '',
      prop.availability_status || '',
      new Date(prop.created_at).toLocaleDateString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Disposition': `attachment; filename="properties-export-${new Date().toISOString().split('T')[0]}.csv"`,
        'Content-Type': 'text/csv;charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Export properties error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
