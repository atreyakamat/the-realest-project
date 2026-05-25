import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();
    const format = request.nextUrl.searchParams.get('format') || 'csv';
    const useDemoData = process.env.NODE_ENV !== 'production';

    const demoFollowups = [
      {
        id: 'followup-demo-1',
        lead_id: 'lead-1',
        created_by: 'admin-1',
        due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        note: 'Check in about Golf View 3BHK',
        status: 'pending',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];

    let followups = demoFollowups;

    if (!useDemoData) {
      const { data, error } = await supabase
        .from('followups')
        .select('*')
        .eq('organization_id', user.organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      followups = data ?? [];
    }

    if (format === 'json') {
      return NextResponse.json(followups);
    }

    if (!followups || followups.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 400 });
    }

    const headers = ['ID', 'Lead ID', 'Created By', 'Due At', 'Note', 'Status', 'Created At'];
    type FollowupRow = {
      id?: string;
      lead_id?: string;
      created_by?: string;
      due_at?: string;
      note?: string;
      status?: string;
      created_at?: string;
    };

    const rows = (followups as FollowupRow[]).map((fu) => [
      fu.id,
      fu.lead_id || '',
      fu.created_by || '',
      fu.due_at ? new Date(fu.due_at).toLocaleString() : '',
      fu.note || '',
      fu.status || '',
      fu.created_at ? new Date(fu.created_at).toLocaleString() : '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Disposition': `attachment; filename="followups-export-${new Date().toISOString().split('T')[0]}.csv"`,
        'Content-Type': 'text/csv;charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Export followups error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
