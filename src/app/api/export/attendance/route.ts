import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

interface AttendanceExportRecord {
  profiles?: {
    full_name?: string | null;
  } | null;
  check_in_time: string;
  check_out_time?: string | null;
  status?: string | null;
  notes?: string | null;
}

/**
 * GET /api/export/attendance?format=csv&dateFrom=2024-01-01&dateTo=2024-12-31
 * Export attendance records as CSV or JSON
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
    const useDemoData = process.env.NODE_ENV !== 'production';

    const demoAttendance: AttendanceExportRecord[] = [
      {
        profiles: { full_name: 'Agent One' },
        check_in_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        check_out_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'present',
        notes: 'On site visit',
      },
    ];

    let attendanceRecords = demoAttendance;

    if (!useDemoData) {
      let query = supabase
        .from('attendance')
        .select('*, profiles(full_name)')
        .eq('organization_id', user.organizationId)
        .order('check_in_time', { ascending: false });

      if (dateFrom) query = query.gte('check_in_time', dateFrom);
      if (dateTo) query = query.lte('check_in_time', dateTo);

      const { data: records, error } = await query;
      attendanceRecords = (records ?? []) as AttendanceExportRecord[];

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    } else {
      attendanceRecords = demoAttendance.filter((record) => {
        if (dateFrom && new Date(record.check_in_time) < new Date(dateFrom)) return false;
        if (dateTo && new Date(record.check_in_time) > new Date(dateTo)) return false;
        return true;
      });
    }

    if (format === 'json') {
      return NextResponse.json(attendanceRecords);
    }

    if (attendanceRecords.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 400 });
    }

    const headers = ['Employee', 'Check In', 'Check Out', 'Status', 'Notes'];
    const rows = attendanceRecords.map((record) => [
      record.profiles?.full_name || 'Unknown',
      new Date(record.check_in_time).toLocaleString(),
      record.check_out_time ? new Date(record.check_out_time).toLocaleString() : 'N/A',
      record.status || '',
      record.notes || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Disposition': `attachment; filename="attendance-export-${new Date().toISOString().split('T')[0]}.csv"`,
        'Content-Type': 'text/csv;charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Export attendance error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
