import { NextResponse } from 'next/server';
import { getAdminPB, pb } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';

/**
 * GET: Fetch paginated history data
 */
export async function GET(request: Request) {
    try {
        const adminPb = await getAdminPB();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const perPage = parseInt(searchParams.get('perPage') || '10', 10);

        const historyDocs = await adminPb.collection('daily_history').getList(page, perPage, {
            sort: '-date',
        });

        return NextResponse.json({
            items: historyDocs.items.map((h) => ({
                date: h.date,
                count: h.count,
                id: h.id
            })),
            totalPages: historyDocs.totalPages,
            totalItems: historyDocs.totalItems,
            page: historyDocs.page,
            perPage: historyDocs.perPage,
        });
    } catch (error) {
        console.error('API Error (GET /api/spf/history):', error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}
