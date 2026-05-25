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

    const demoCalls = [
      {
        id: 'call-demo-1',
        lead_id: 'lead-1',
        agent_id: 'agent-1',
        call_sid: 'CA-demo-1',
        status: 'completed',
        duration: 45,
        recording_url: 'https://example.com/recording.mp3',
        started_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        outcome: 'connected',
      },
    ];

    let calls = demoCalls;

    if (!useDemoData) {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('organization_id', user.organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      calls = data ?? [];
    }

    if (format === 'json') {
      return NextResponse.json(calls);
    }

    if (!calls || calls.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 400 });
    }

    const headers = ['ID', 'Lead ID', 'Agent ID', 'Call SID', 'Status', 'Duration', 'Recording URL', 'Started', 'Outcome'];
    const rows = (calls as any[]).map((call) => [
      call.id,
      call.lead_id || '',
      call.agent_id || '',
      call.call_sid || '',
      call.status || '',
      call.duration || '0',
      call.recording_url || '',
      new Date(call.started_at).toLocaleString(),
      call.outcome || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Disposition': `attachment; filename="calls-export-${new Date().toISOString().split('T')[0]}.csv"`,
        'Content-Type': 'text/csv;charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Export calls error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
